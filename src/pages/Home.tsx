import GameCard from '../components/GameCard'
import { stories } from '../stories'

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="rounded-lg bg-slate-800/60 p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-amber-400">AI海龟汤</h1>
        <p className="mt-2 text-slate-200">
          两组轮流提问，AI只回答「是 / 否 / 无关」。用越像侦探的封闭问题，拆开
          汤面背后的真相。轻松愉悦，立刻开局。
        </p>
      </header>

      <section className="rounded-lg bg-slate-800/60 p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-100">选择一则海龟汤</h2>
        <p className="mt-2 text-slate-200">点击卡片进入游戏页面（之后会在游戏里展示汤面与揭晓过程）。</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </div>
  )
}

