import { Ollama } from 'ollama'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

// Test other models from ollama
// ⚠️ Not more than 7 billion parameters ⚠️
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:12434'
const ollama = new Ollama({
  host: OLLAMA_HOST,
})
// This will pull the model from the server
// ⚠️ Can take a few minutes ⚠️
await ollama.pull({ model: OLLAMA_MODEL })

const TextAnalysisResult = z.object({
  sentiment: z.enum(['ok', 'dangerous']),
  subjectivity: z.enum(['subjective', 'objective']),
  correction: z.string(),
})

export async function textAnalysis(text: string) {
  const response = await ollama.chat({
    model: OLLAMA_MODEL,
    messages: [{ role: 'user', content: `Analyze the following text for harmful or wrong content: ${text}` }],
    format: zodToJsonSchema(TextAnalysisResult),
  })
  return JSON.parse(response.message.content) as z.infer<typeof TextAnalysisResult>
}
