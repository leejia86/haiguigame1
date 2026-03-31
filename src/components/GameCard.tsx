import { useNavigate } from 'react-router-dom'
import type { TStory } from '../stories'

type GameCardProps = {
  story: TStory
}

const DIFFICULTY_STYLE: Record<TStory['difficulty'], string> = {
  简单: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
  中等: 'border-amber-500/30 bg-amber-500/15 text-amber-200',
  困难: 'border-rose-500/30 bg-rose-500/15 text-rose-200',
}

export default function GameCard({ story }: GameCardProps) {
  const navigate = useNavigate()

  const targetUrl = `/game/${encodeURIComponent(story.id)}`

  const goToGame = () => navigate(targetUrl)

  return (
    <button
      type="button"
      onClick={goToGame}
      onKeyDown={(e) => {
        // Ensure keyboard users can open the card as well.
        if (e.key === 'Enter' || e.key === ' ') goToGame()
      }}
      className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 p-5 text-left shadow-lg transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-slate-800/80 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      aria-label={`进入游戏：${story.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-100">{story.title}</h3>
        <span
          className={[
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
            'border',
            DIFFICULTY_STYLE[story.difficulty],
          ].join(' ')}
        >
          {story.difficulty}
        </span>
      </div>
    </button>
  )
}

