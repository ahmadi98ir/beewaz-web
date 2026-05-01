'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types/chat'

type Props = {
  message: ChatMessage
  onQuickReply: (text: string) => void
}

// پارسر ساده markdown برای **bold** و \n
function parseContent(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="font-bold">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

export function MessageBubble({ message, onQuickReply }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isBot = message.role === 'bot'

  // ورود با انیمیشن
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'}`}
    >
      {/* حباب پیام */}
      <div
        className={[
          'max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isBot
            ? 'bg-surface-100 text-surface-800 rounded-ss-sm'
            : 'bg-brand-600 text-white rounded-se-sm',
        ].join(' ')}
      >
        {parseContent(message.content)}
      </div>

      {/* Quick Replies */}
      {isBot && message.quickReplies && message.quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-[90%]">
          {message.quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => onQuickReply(reply)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white transition-all duration-150 active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* زمان */}
      <span className="text-[10px] text-surface-400 px-1">
        {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(
          new Date(message.timestamp),
        )}
      </span>
    </div>
  )
}
