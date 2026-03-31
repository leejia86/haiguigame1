import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatBox from '../components/ChatBox'
import { type TMessage } from '../components/Message'
import { askAI } from '../api'
import { stories, type TStory } from '../stories'

export default function GameById() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isBottomOpen, setIsBottomOpen] = useState(false)
  const [messagesForResult, setMessagesForResult] = useState<TMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const story = useMemo(() => {
    if (!id) return null
    return stories.find((s) => s.id === id) ?? null
  }, [id])

  const RESULT_CHAT_STORAGE_KEY = story ? `haiguitang:chat:${story.id}` : ''

  // 模拟加载过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // 进入结果前把当前对话缓存起来（用于 Result 页“可选”展示历史）。
  useEffect(() => {
    if (!story) return
    try {
      sessionStorage.removeItem(RESULT_CHAT_STORAGE_KEY)
    } catch {
      // 忽略：sessionStorage 可能不可用
    }
  }, [RESULT_CHAT_STORAGE_KEY])

  useEffect(() => {
    if (!story) return
    try {
      sessionStorage.setItem(RESULT_CHAT_STORAGE_KEY, JSON.stringify(messagesForResult))
    } catch {
      // 忽略：sessionStorage 可能不可用
    }
  }, [messagesForResult, RESULT_CHAT_STORAGE_KEY, story])

  const goToResult = (reason: 'view' | 'end') => {
    if (!story) return
    navigate(`/result?storyId=${encodeURIComponent(story.id)}&reason=${reason}`)
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
          <h1 className="text-3xl font-bold text-amber-400">游戏不存在</h1>
          <p className="mt-2 text-slate-200">
            找不到该海龟汤：<span className="text-slate-100">{id}</span>
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 shadow-lg hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            返回大厅
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>
        {
          `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .slide-up {
            animation: slideUp 0.3s ease-out forwards;
          }
          
          .pulse {
            animation: pulse 2s ease-in-out infinite;
          }
        `
        }
      </style>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
        <header className="rounded-lg bg-slate-800/60 p-4 md:p-6 shadow-lg fade-in transform transition-all duration-500 hover:shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">{story.title}</h1>
              <p className="whitespace-pre-wrap text-slate-200 text-sm md:text-base">{story.surface}</p>
            </div>
            <div className="shrink-0 mt-2 sm:mt-0">
              <div
                className={[
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 transform hover:scale-105',
                  story.difficulty === '简单'
                    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                    : story.difficulty === '中等'
                      ? 'border-amber-500/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                      : 'border-rose-500/30 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25',
                ].join(' ')}
              >
                {story.difficulty}
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-lg shadow-lg fade-in" style={{ animationDelay: '0.2s' }}>
          <ChatBox
            initialMessages={[
              {
                role: 'assistant',
                content: '我是AI侦探。我只回答「是 / 否 / 无关」。你可以开始提问！',
              },
            ]}
            placeholder="输入你的封闭式问题（按回车发送）"
            onMessagesChange={setMessagesForResult}
            onSend={async (userContent) => {
              return askAI(userContent, story)
            }}
          />
        </section>

        <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            type="button"
            onClick={() => setIsBottomOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-amber-300 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full sm:w-auto"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            查看汤底
          </button>

          <button
            type="button"
            onClick={() => goToResult('end')}
            className="inline-flex items-center justify-center rounded-lg bg-slate-700/60 px-4 py-2 font-semibold text-slate-100 shadow-lg transition-all duration-300 hover:bg-slate-600 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full sm:w-auto"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            结束游戏
          </button>
        </footer>
      </div>

      {isBottomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="汤底弹窗"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsBottomOpen(false)
          }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-slate-900 shadow-2xl ring-1 ring-slate-700/80 slide-up transform transition-all duration-500 hover:shadow-3xl">
            <div className="flex items-center justify-between border-b border-slate-800/70 p-4">
              <h2 className="text-lg font-semibold text-amber-400 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                汤底
              </h2>
              <button
                type="button"
                onClick={() => setIsBottomOpen(false)}
                className="rounded-lg bg-slate-800/60 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-slate-800 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100">
                {story.bottom}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800/70 p-4">
              <button
                type="button"
                onClick={() => setIsBottomOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-slate-700/60 px-4 py-2 font-semibold text-slate-100 shadow-lg transition-all duration-300 hover:bg-slate-600 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBottomOpen(false)
                  goToResult('view')
                }}
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-amber-300 hover:shadow-xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                去结果页
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

