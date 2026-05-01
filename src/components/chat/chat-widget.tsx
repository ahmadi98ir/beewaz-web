'use client'

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { XIcon, PhoneIcon } from '@/components/ui/icons'
import type { ChatMessage, ChatStep, SessionData } from '@/types/chat'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function makeVisitorToken() {
  if (typeof window === 'undefined') return ''
  const key = 'beewaz_vid'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const id = 'v_' + makeId() + makeId()
  localStorage.setItem(key, id)
  return id
}

const INITIAL_BOT_MSG: ChatMessage = {
  id: 'init',
  role: 'bot',
  content: 'سلام! 👋 چطور می‌تونم کمکتون کنم؟\n\nبرای شروع مشاوره رایگان، روی دکمه زیر بزنید.',
  timestamp: Date.now(),
  quickReplies: ['شروع مشاوره رایگان'],
}

// ── Main Widget ────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MSG])
  const [step, setStep] = useState<ChatStep>('GREETING')
  const [sessionData, setSessionData] = useState<SessionData>({})
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [requirePhoneInput, setRequirePhoneInput] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const visitorToken = useRef('')

  useEffect(() => {
    visitorToken.current = makeVisitorToken()
  }, [])

  // اسکرول به آخرین پیام
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // فوکوس روی input پس از باز شدن
  useEffect(() => {
    if (open && requirePhoneInput) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open, requirePhoneInput])

  const pushBotMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
    if (!open) setHasNewMsg(true)
  }, [open])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return

      // پیام کاربر
      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInputValue('')
      setRequirePhoneInput(false)
      setIsTyping(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), step, sessionData }),
        })

        const data = await res.json()
        setIsTyping(false)

        const botMsg: ChatMessage = {
          id: makeId(),
          role: 'bot',
          content: data.message,
          timestamp: Date.now(),
          quickReplies: data.quickReplies,
          requirePhoneInput: data.requirePhoneInput,
        }

        pushBotMessage(botMsg)
        setStep(data.nextStep)
        setSessionData(data.sessionData ?? {})
        setRequirePhoneInput(!!data.requirePhoneInput)

        // ذخیره lead در CRM
        if (data.leadCaptured && data.sessionData?.phone && !leadSaved) {
          setLeadSaved(true)
          fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: data.sessionData.phone,
              place: data.sessionData.place,
              size: data.sessionData.size,
              budget: data.sessionData.budget,
              source: 'chatbot',
              visitorToken: visitorToken.current,
            }),
          }).catch(console.error)
        }
      } catch {
        setIsTyping(false)
        pushBotMessage({
          id: makeId(),
          role: 'bot',
          content: 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
          timestamp: Date.now(),
          quickReplies: ['تلاش مجدد'],
        })
      }
    },
    [step, sessionData, isTyping, leadSaved, pushBotMessage],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) sendMessage(inputValue)
  }

  const handleOpen = () => {
    setOpen(true)
    setHasNewMsg(false)
  }

  return (
    <>
      {/* ── Chat Window ──────────────────────────────────────────────────── */}
      <div
        className={[
          'fixed bottom-20 end-4 sm:end-6 z-50 w-[calc(100vw-2rem)] sm:w-96',
          'transition-all duration-300 ease-out origin-bottom-end',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="چت‌بات بیواز"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden flex flex-col h-[520px] sm:h-[560px]">

          {/* Header */}
          <div className="bg-gradient-to-l from-brand-700 to-brand-600 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            {/* آواتار */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <PhoneIcon size={18} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-brand-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">دستیار هوشمند بیواز</p>
              <p className="text-xs text-white/70">آنلاین — پاسخگو ۲۴ ساعته</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/15 transition-colors text-white/80 hover:text-white"
              aria-label="بستن چت"
            >
              <XIcon size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onQuickReply={sendMessage}
              />
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-surface-100 p-3 bg-surface-50/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type={requirePhoneInput ? 'tel' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  requirePhoneInput
                    ? 'شماره موبایل: ۰۹۱۲...'
                    : 'پیام بنویسید...'
                }
                disabled={isTyping}
                dir={requirePhoneInput ? 'ltr' : 'rtl'}
                className="flex-1 input text-sm py-2.5 px-3.5 disabled:opacity-50"
                autoComplete={requirePhoneInput ? 'tel' : 'off'}
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="ارسال پیام"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  {/* آیکون ارسال — مناسب RTL (چرخش ۱۸۰ درجه) */}
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>

            <p className="text-center text-xs text-surface-400 mt-2">
              بیواز — مشاوره رایگان ۲۴/۷
            </p>
          </div>

        </div>
      </div>

      {/* ── Floating Button ───────────────────────────────────────────────── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className={[
          'fixed bottom-4 end-4 sm:end-6 z-50 w-14 h-14 rounded-2xl shadow-xl',
          'flex items-center justify-center transition-all duration-300',
          open
            ? 'bg-surface-700 rotate-0'
            : 'bg-brand-600 hover:bg-brand-700 hover:scale-105',
        ].join(' ')}
        aria-label={open ? 'بستن چت' : 'باز کردن چت'}
        aria-expanded={open}
      >
        {/* Pulse ring — فقط وقتی بسته است */}
        {!open && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-brand-600 animate-ping opacity-30" />
            <span className="absolute inset-0 rounded-2xl bg-brand-600 animate-ping opacity-20 animation-delay-500" />
          </>
        )}

        {open ? (
          <XIcon size={22} className="text-white" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}

        {/* Badge پیام جدید */}
        {hasNewMsg && !open && (
          <span className="absolute -top-1 -start-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-bounce" />
        )}
      </button>
    </>
  )
}
