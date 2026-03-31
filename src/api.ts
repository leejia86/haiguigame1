import { type TStory } from './stories'

// 为了满足外部函数签名约定，这里暴露一个 `Story` 名称。
export type Story = TStory



function normalizeAnswer(text: string): string | null {
  // 严格合规：只有当最终内容“等于”三值之一（允许首尾少量引号/括号/空白/句号）才算合规。
  let s = text.trim()
  if (!s) return null

  // 兼容模型可能包裹的引号/括号，同时移除首尾全角空格
  s = s.replace(/\u3000/g, ' ').trim()

  // 去掉首尾可能的引号或括号（不删除中间内容）
  s = s.replace(/^[“"‘'「『(（\[]\s*/u, '').replace(/\s*[”"’'」』)）\]]$/u, '').trim()

  // 只允许尾部出现一个常见句号/逗号等标点
  s = s.replace(/[。.!！?？,，、]+$/u, '').trim()

  if (s === '是') return '是'
  if (s === '否') return '否'
  if (s === '无关') return '无关'
  return null
}

function withRetries<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let attempt = 0
  const run = async (): Promise<T> => {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= maxRetries) throw err
      attempt += 1
      return run()
    }
  }
  return run()
}

/**
 * 发起一次 AI 问答请求。
 * @returns 仅返回 `是` / `否` / `无关`；如果 AI 返回非标准内容则提示“请重新提问”。
 */
export async function askAI(question: string, story: Story): Promise<string> {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion) throw new Error('请输入有效问题')

  // 调用后端接口（使用Vite代理）
  const url = '/api/chat'

  const payload = {
    question: trimmedQuestion,
    story: {
      title: story.title,
      description: story.surface,
      bottom: story.bottom
    }
  }

  const INVALID_AI_OUTPUT = '__INVALID_AI_OUTPUT__'
  const fallbackMessage =
    '你的提问可能不够封闭或不符合规则，请换个可以回答「是/否/无关」的问题再试。'

  try {
    return await withRetries(async () => {
      let res: Response
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } catch {
        throw new Error('网络异常，请重试')
      }

      if (!res.ok) {
        // 不把服务端返回内容直接暴露给用户，避免泄露错误细节
        throw new Error('AI 请求失败，请重试')
      }

      let json: { answer?: string }
      try {
        json = (await res.json()) as { answer?: string }
      } catch {
        throw new Error('AI 返回异常，请重试')
      }

      const content = json.answer ?? ''
      const answer = normalizeAnswer(content)
      if (answer) return answer

      // 触发重试：模型输出不合规（包含多余文字/标点等）
      throw new Error(INVALID_AI_OUTPUT)
    }, 2)
  } catch (err) {
    if (err instanceof Error && err.message === INVALID_AI_OUTPUT) {
      // 最终仍不合规：提示用户重新提问
      return fallbackMessage
    }
    throw err
  }
}

