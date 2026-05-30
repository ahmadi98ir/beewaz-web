// AvalAI — OpenAI-compatible API that works from Iranian servers
// Docs: https://avalai.ir

const BASE_URL = process.env.AVALAI_BASE_URL ?? 'https://api.avalai.ir/v1'
const API_KEY  = process.env.AVALAI_API_KEY ?? process.env.GEMINI_API_KEY ?? ''
const MODEL    = process.env.AI_MODEL ?? 'gemini-2.0-flash'

if (!API_KEY) console.warn('[ai] No API key configured (AVALAI_API_KEY)')

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callAI(messages: Message[]): Promise<string> {
  if (!API_KEY) throw new Error('AI API key not configured')

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`AI API error ${res.status}: ${err}`)
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[]
  }
  return data.choices[0]?.message?.content ?? ''
}

export async function generateText(prompt: string): Promise<string> {
  return callAI([{ role: 'user', content: prompt }])
}

export async function chat(
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction: string,
): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: systemInstruction },
    ...history.map((m) => ({
      role: m.role === 'model' ? 'assistant' as const : 'user' as const,
      content: m.text,
    })),
  ]
  return callAI(messages)
}
