type TMessageRole = 'user' | 'assistant'

export type TMessage = {
  role: TMessageRole
  content: string
}

export type TMessageProps = {
  message: TMessage
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function AssistantIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1-5a4 4 0 0 1-1-2V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M7.5 10.5h.01" />
      <path d="M12 10.5h.01" />
      <path d="M16.5 10.5h.01" />
    </svg>
  )
}

function MessageAvatar({ role }: { role: TMessageRole }) {
  const isUser = role === 'user'
  return (
    <div
      className={[
        'flex h-9 w-9 items-center justify-center rounded-full border shadow-lg transition-transform duration-300',
        isUser
          ? 'border-amber-400/40 bg-amber-400/15 text-amber-400 hover:scale-110'
          : 'border-slate-700/60 bg-slate-800/60 text-amber-400 hover:scale-110',
      ].join(' ')}
      aria-hidden="true"
    >
      {isUser ? (
        <UserIcon className="h-5 w-5" />
      ) : (
        <AssistantIcon className="h-5 w-5" />
      )}
    </div>
  )
}

export default function Message({ message }: TMessageProps) {
  const { role, content } = message
  const isUser = role === 'user'

  const bubbleClassName = isUser
    ? 'bg-amber-400 text-slate-900 border-amber-400/40'
    : 'bg-slate-800/60 text-slate-100 border-slate-700/70'

  const outerAlign = isUser ? 'justify-end' : 'justify-start'

  // 检测是否为错误消息
  const isError = content.includes('错误') || content.includes('失败') || content.includes('无法');
  // 检测是否为正确回答
  const isCorrect = content.includes('恭喜你，答对了');

  return (
    <div className={['flex w-full', outerAlign].join(' ')}>
      {!isUser && <MessageAvatar role={role} />}

      <div className="flex max-w-[85%] flex-col gap-1 px-2">
        <div className="text-xs font-semibold text-slate-300">
          {isUser ? '你' : 'AI助手'}
        </div>

        <div
          className={[
            'whitespace-pre-wrap rounded-lg border px-4 py-3 shadow-lg',
            'break-words text-sm leading-relaxed transition-all duration-300',
            'hover:shadow-xl relative',
            bubbleClassName,
            isError && !isUser ? 'error-message bg-rose-900/20 border-rose-500/30 text-rose-200' : '',
            isCorrect && !isUser ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200' : '',
          ].join(' ')}
          style={{
            animation: isCorrect ? 'pulse 2s ease-in-out infinite' : undefined
          }}
        >
          {content}
        </div>
      </div>

      {isUser && <MessageAvatar role={role} />}
    </div>
  )
}

