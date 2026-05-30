import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) console.warn('[gemini] GEMINI_API_KEY not set')

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export function getGeminiModel(model = 'gemini-2.0-flash') {
  if (!genAI) throw new Error('GEMINI_API_KEY is not configured')
  return genAI.getGenerativeModel({ model })
}

export async function generateText(prompt: string): Promise<string> {
  const model = getGeminiModel()
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function chat(
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction: string,
): Promise<string> {
  const model = getGeminiModel()
  const chatSession = model.startChat({
    systemInstruction,
    history: history.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
  })
  const lastMessage = history[history.length - 1]?.text ?? ''
  const result = await chatSession.sendMessage(lastMessage)
  return result.response.text()
}
