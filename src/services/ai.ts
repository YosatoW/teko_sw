import { Ollama } from 'ollama'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

// Test other models from ollama
// ⚠️ Not more than 7 billion parameters ⚠️
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b'

export let ollama: Ollama

export const initializeOllama = async () => {
  if (ollama) return
  console.log('Initializing Ollama...')
  const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:12434'
  console.log('Initializing Ollama with model:', OLLAMA_MODEL)
  console.log('using Ollama host:', OLLAMA_HOST)
  ollama = new Ollama({
    host: OLLAMA_HOST, 
  })
  // This will pull the model from the server
  // ⚠️ Can take a few minutes ⚠️
  console.log('Pulling model from server... This can take a few minutes')
  await ollama.pull({ model: OLLAMA_MODEL })
}


const TextAnalysisResult = z.object({
  sentiment: z.enum(['ok', 'hate_speech']),
  subjectivity: z.enum(['subjective', 'objective']),
  correction: z.string(),
})

export async function textAnalysis(text: string) {
  await initializeOllama()
  console.log('Analyzing text:', text)

  const prompt = `
Analyze the following text for inappropriate content.
Respond in JSON format with these rules:

"sentiment": Classify as "hate_speech" if the text contains ANY of:
- Hate speech or discrimination
- Offensive language or slurs
- Personal attacks
- Harassment
- Threats
Otherwise, use "ok"

"subjectivity": Use "subjective" for opinions, "objective" for facts

"correction": If sentiment is "hate_speech", suggest a more appropriate way to express the message

Text to analyze: "${text}"
`

  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      format: zodToJsonSchema(TextAnalysisResult),
    })

    console.log('Analysis result:', response.message.content)
    return JSON.parse(response.message.content) as z.infer<typeof TextAnalysisResult>
  } catch (error) {
    console.error('Analysis failed:', error)
    // Return safe default if analysis fails
    return {
      sentiment: 'ok',
      subjectivity: 'objective',
      correction: undefined
    }
  }
}
