// OpenAI-compatible LLM client — supports AvalAI, OpenAI, and any compatible endpoint.
// Configure via environment variables: AI_BASE_URL, AI_API_KEY, AI_MODEL

import OpenAI from 'openai'

const baseURL =
  process.env.AI_BASE_URL ??
  process.env.AVALAI_BASE_URL ??
  'https://api.avalai.ir/v1'

const apiKey =
  process.env.AI_API_KEY ??
  process.env.AVALAI_API_KEY ??
  process.env.GEMINI_API_KEY ??
  'no-key'

const model = process.env.AI_MODEL ?? 'gemini-2.0-flash'

const openai = new OpenAI({ apiKey, baseURL })

if (!process.env.AI_API_KEY && !process.env.AVALAI_API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn('[ai] No API key configured — set AI_API_KEY env var')
}

// ── Low-level completion call ─────────────────────────────────────────────────

async function callAI(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  })
  return completion.choices[0]?.message?.content ?? ''
}

// ── Public helpers ────────────────────────────────────────────────────────────

export async function generateText(prompt: string): Promise<string> {
  return callAI([{ role: 'user', content: prompt }])
}

export async function chat(
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction: string,
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...history.map((m) => ({
      role: m.role === 'model' ? ('assistant' as const) : ('user' as const),
      content: m.text,
    })),
  ]
  return callAI(messages)
}
