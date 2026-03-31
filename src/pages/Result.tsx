import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Message, { type TMessage } from '../components/Message'
import { stories, type TStory } from '../stories'

export default function Result() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const storyId = searchParams.get('storyId') ?? ''
  const reason = searchParams.get('reason') ?? ''

  const story = useMemo((): TStory | null => {
    if (!storyId) return null
    return stories.find((s) => s.id === storyId) ?? null
  }, [storyId])

  const RESULT_CHAT_STORAGE_KEY = story ? `haiguitang:chat:${story.id}` : ''

  type TRevealPhase = 'idle' | 'burst' | 'revealed'
  const [revealPhase, setRevealPhase] = useState<TRevealPhase>('idle')
  const [historyMessages, setHistoryMessages] = useState<TMessage[]>([])

  const REVEAL_DONE_MS = 1400

  // 模拟加载过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!story) return
    setRevealPhase('burst')
    
    // 创建闪烁效果
    const createSparkles = () => {
      const container = document.querySelector('.sparkle-container')
      if (!container) return
      
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const sparkle = document.createElement('div')
          sparkle.className = 'sparkle'
          sparkle.style.left = `${Math.random() * 100}%`
          sparkle.style.top = `${Math.random() * 100}%`
          sparkle.style.animationDelay = `${Math.random() * 0.5}s`
          sparkle.style.animationDuration = `${1 + Math.random() * 0.5}s`
          container.appendChild(sparkle)
          
          setTimeout(() => {
            sparkle.remove()
          }, 1500)
        }, i * 100)
      }
    }
    
    createSparkles()
    const t = window.setTimeout(() => setRevealPhase('revealed'), REVEAL_DONE_MS)
    return () => window.clearTimeout(t)
  }, [storyId, story])

  const isValidMessage = (value: unknown): value is TMessage => {
    if (!value || typeof value !== 'object') return false
    const v = value as { role?: unknown; content?: unknown }
    const roleOk = v.role === 'user' || v.role === 'assistant'
    const contentOk = typeof v.content === 'string'
    return roleOk && contentOk
  }

  useEffect(() => {
    if (!story) return
    try {
      const raw = sessionStorage.getItem(RESULT_CHAT_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return
      const next = parsed.filter(isValidMessage)
      setHistoryMessages(next)
    } catch {
      // 忽略：sessionStorage 可能不可用/数据可能被破坏
    }
  }, [RESULT_CHAT_STORAGE_KEY, story])

  const backToLobby = () => {
    if (story) {
      try {
        sessionStorage.removeItem(RESULT_CHAT_STORAGE_KEY)
      } catch {
        // 忽略
      }
    }
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-xl font-semibold text-amber-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <header className="rounded-lg bg-slate-800/60 p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-amber-400">结果不存在</h1>
          <p className="mt-2 text-slate-200">
            找不到该海龟汤：<span className="text-slate-100">{storyId}</span>
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={backToLobby}
            className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-amber-300 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            再来一局
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <style>
        {
          `
@keyframes HAIGUITANG_BURST {
  0% { transform: scale(0.55); opacity: 0; }
  20% { opacity: 1; }
  55% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1.45); opacity: 0; }
}
@keyframes HAIGUITANG_FLOAT {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes HAIGUITANG_SHIMMER {
  0% { transform: translateX(-60%); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateX(60%); opacity: 0; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes sparkle {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
.sparkle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #fbbf24, transparent);
  border-radius: 50%;
  pointer-events: none;
  animation: sparkle 1s ease-out forwards;
}
.pulse {
  animation: pulse 2s ease-in-out infinite;
}
.slide-in {
  animation: slideIn 0.6s ease-out forwards;
}
`
        }
      </style>
      <header className="rounded-lg bg-slate-800/60 p-6 shadow-lg fade-in">
        <h1 className="text-3xl font-bold text-amber-400">{story.title}</h1>
        <p className="mt-2 text-slate-200">
          {reason === 'view'
            ? '你选择先看汤底，然后回到结果页。'
            : '恭喜，真相已准备就绪。'}{' '}
          <span className="text-slate-100">难度：{story.difficulty}</span>
        </p>
      </header>

      <section className="relative overflow-hidden rounded-lg bg-slate-800/60 p-6 shadow-lg ring-1 ring-amber-400/20 fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-amber-200">汤底</h2>
          <div className="text-sm font-semibold text-slate-200">
            {revealPhase === 'revealed' ? '已揭晓' : '正在揭晓...'}
          </div>
        </div>

        <div className="relative mt-5 sparkle-container">
          {revealPhase !== 'revealed' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 p-4">
              <div className="relative flex flex-col items-center">
                <div
                  className="absolute -inset-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.5),transparent_60%)] pulse"
                  style={{ animation: 'HAIGUITANG_FLOAT 1.2s ease-in-out infinite' }}
                />
                <div
                  className="h-24 w-24 rounded-full bg-amber-400/30 shadow-lg flex items-center justify-center"
                  style={{ animation: 'HAIGUITANG_BURST 1.6s ease-out forwards' }}
                >
                  <div className="text-4xl font-bold text-amber-400">🔍</div>
                </div>
                <div className="mt-6 text-lg font-semibold tracking-widest text-amber-200">
                  揭晓真相
                </div>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-10"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(251,191,36,0.7), transparent)',
                    transform: 'translateX(-60%)',
                    opacity: 0,
                    animation: 'HAIGUITANG_SHIMMER 1.2s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          )}

          <div
            className={[
              'whitespace-pre-wrap break-words rounded-lg border border-amber-400/30 bg-slate-900/50 p-6',
              'text-lg leading-relaxed text-slate-100 shadow-lg sm:text-xl',
              'transition-all duration-1000 ease-out',
              revealPhase === 'revealed'
                ? 'opacity-100 translate-y-0 blur-0'
                : 'opacity-0 translate-y-3 blur-md',
            ].join(' ')}
          >
            {story.bottom}
          </div>
        </div>
      </section>

      {historyMessages.length > 0 && (
        <section className="rounded-lg bg-slate-800/60 p-6 shadow-lg fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-amber-200">对话历史（可选）</h2>
            <div className="text-sm text-slate-300">
              共 {historyMessages.length} 条消息
            </div>
          </div>
          <div className="mt-4 max-h-[45svh] overflow-y-auto space-y-4">
            {historyMessages.map((m, idx) => (
              <div key={`${idx}-${m.role}`} className="message-enter" style={{ animationDelay: `${idx * 0.1}s` }}>
                <Message message={m} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg bg-slate-800/60 p-6 shadow-lg fade-in" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-xl font-semibold text-slate-100">下一步</h2>
        <p className="mt-2 text-slate-200">
          如果你想换个角度继续推理，回到大厅重新开始一局吧。
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={backToLobby}
            className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-amber-300 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            再来一局
          </button>
        </div>
      </section>
    </div>
  )
}

