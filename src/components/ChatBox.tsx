import { useEffect, useMemo, useRef, useState } from 'react'
import Message, { type TMessage } from './Message'

export type TChatBoxProps = {
  initialMessages?: TMessage[]
  /**
   * 可选：当消息变化时回调，方便将历史展示在其他页面。
   * （Result 页展示玩家对话历史属于这种用法）
   */
  onMessagesChange?: (messages: TMessage[]) => void
  /**
   * 用户发送后触发。
   * - 返回 `string`：作为 assistant 的 content
   * - 返回 `{ role, content }`：作为 assistant 消息
   * - 返回 `void/undefined`：不追加 assistant 回复
   */
  onSend?: (
    userContent: string,
  ) =>
    | Promise<string | TMessage | void | undefined>
    | string
    | TMessage
    | void
    | undefined
  placeholder?: string
  className?: string
}

function normalizeAssistantMessage(
  result: string | TMessage | void | undefined,
): TMessage | null {
  if (typeof result === 'string') {
    return { role: 'assistant', content: result }
  }
  if (result && typeof result === 'object' && 'content' in result && 'role' in result) {
    // 这里不强制覆盖 role，但确保 role 存在即可。
    return result as TMessage
  }
  return null
}

export default function ChatBox({
  initialMessages = [],
  onMessagesChange,
  onSend,
  placeholder = '输入你的问题...（按回车发送）',
  className = '',
}: TChatBoxProps) {
  const [messages, setMessages] = useState<TMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const LOADING_CONTENT = '思考中...'

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const trimmedInput = useMemo(() => input.trim(), [input])

  useEffect(() => {
    // 自动滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    onMessagesChange?.(messages)
  }, [messages, onMessagesChange])

  const handleSend = async () => {
    const content = trimmedInput
    if (!content || isSending) return

    // 先追加用户消息，立刻反馈
    setMessages((prev) => [...prev, { role: 'user', content }])
    setInput('')
    setIsSending(Boolean(onSend))

    if (!onSend) return

    // 等待 AI 的同时，先给用户一个可见的“思考中...”占位消息
    setMessages((prev) => [...prev, { role: 'assistant', content: LOADING_CONTENT }])

    try {
      const result = await onSend(content)
      const assistantMessage = normalizeAssistantMessage(result)
        setMessages((prev) => {
          const loadingIndex = (() => {
            for (let i = prev.length - 1; i >= 0; i -= 1) {
              const m = prev[i]
              if (m.role === 'assistant' && m.content === LOADING_CONTENT) return i
            }
            return -1
          })()

          if (!assistantMessage) {
            if (loadingIndex >= 0) return [...prev.slice(0, loadingIndex), ...prev.slice(loadingIndex + 1)]
            return prev
          }

          if (loadingIndex >= 0) {
            const next = [...prev]
            next[loadingIndex] = assistantMessage
            
            // 检查是否为正确回答，如果是，添加庆祝动画
            if (assistantMessage.content.includes('恭喜你，答对了')) {
              // 触发庆祝动画
              setTimeout(() => {
                const messageElement = document.querySelector('.message-enter:last-child')
                if (messageElement) {
                  messageElement.classList.add('celebration-animation')
                }
              }, 100)
            }
            
            return next
          }

          // 理论上 loadingIndex 可能找不到（比如用户自定义 onSend 插入过其它消息）
          const next = [...prev, assistantMessage]
          
          // 检查是否为正确回答，如果是，添加庆祝动画
          if (assistantMessage.content.includes('恭喜你，答对了')) {
            // 触发庆祝动画
            setTimeout(() => {
              const messageElement = document.querySelector('.message-enter:last-child')
              if (messageElement) {
                messageElement.classList.add('celebration-animation')
              }
            }, 100)
          }
          
          return next
        })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '发生错误，无法获取 AI 回复'
      setMessages((prev) => {
        // 把占位“思考中...”替换成友好错误提示
        for (let i = prev.length - 1; i >= 0; i -= 1) {
          const m = prev[i]
          if (m.role === 'assistant' && m.content === LOADING_CONTENT) {
            const next = [...prev]
            next[i] = { role: 'assistant', content: msg }
            return next
          }
        }
        return [...prev, { role: 'assistant', content: msg }]
      })
    } finally {
      setIsSending(false)
      // 确保列表高度变化后仍能滚到底部
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    }
  }

  return (
    <div
      className={[
        'flex w-full flex-col rounded-lg border border-slate-700/60 bg-slate-800/40 shadow-lg transition-all duration-300 hover:shadow-xl',
        className,
      ].join(' ')}
    >
      <style>
        {
          `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes celebration {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
          }
          
          .message-enter {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          .loading-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          
          .user-message-enter {
            animation: slideInRight 0.3s ease-out forwards;
          }
          
          .assistant-message-enter {
            animation: slideIn 0.3s ease-out forwards;
          }
          
          .error-message {
            border-left: 4px solid #f43f5e !important;
          }
          
          .celebration-animation {
            animation: celebration 1s ease-in-out infinite;
          }
          
          .celebration-animation::after {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%);
            border-radius: 12px;
            z-index: -1;
            animation: pulse 1.5s ease-in-out infinite;
          }
        `
        }
      </style>
      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 transition-all duration-300"
      >
        {messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700/60 bg-slate-900/30 p-6 text-center text-sm text-slate-300 transition-all duration-500 hover:border-amber-400/30 hover:bg-slate-800/40 hover:scale-[1.02]">
            <div className="mb-2 text-2xl text-amber-400 animate-bounce">🤔</div>
            <p className="font-medium">还没有消息</p>
            <p className="mt-1 text-xs text-slate-400">输入问题开始对话</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m, idx) => (
              <div 
                key={`${idx}-${m.role}`} 
                className={`message-enter ${m.role === 'user' ? 'user-message-enter' : 'assistant-message-enter'}`} 
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Message message={m} />
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="flex items-center gap-3 border-t border-slate-700/60 p-3 transition-all duration-300 hover:bg-slate-800/60"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSend()
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={[
            'w-full flex-1 rounded-lg border px-3 py-2 text-slate-100 shadow-sm placeholder:text-slate-400',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all duration-300',
            isSending 
              ? 'border-slate-700/60 bg-slate-900/30 cursor-not-allowed'
              : 'border-slate-700/60 bg-slate-900/30 focus:border-amber-400/50'
          ].join(' ')}
          placeholder={placeholder}
          disabled={isSending}
        />

        <button
          type="submit"
          disabled={!trimmedInput || isSending}
          className={[
            'inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold shadow-lg transition-all duration-300',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
            !trimmedInput || isSending
              ? 'cursor-not-allowed bg-slate-700/60 text-slate-300 hover:bg-slate-700/80'
              : 'bg-amber-400 text-slate-900 hover:bg-amber-300 hover:shadow-xl active:scale-95'
          ].join(' ')}
        >
          {isSending ? (
            <div className="flex items-center gap-2 loading-pulse">
              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-slate-900 animate-spin" />
              <span>发送中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span>发送</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          )}
        </button>
      </form>
    </div>
  )
}

