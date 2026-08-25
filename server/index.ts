import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import OpenAI from 'openai'

const app = express()
const port = Number(process.env.PORT ?? 8787)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, mode: openai ? 'live-ai' : 'demo-ai' })
})

app.post('/api/chat', async (request, response) => {
  const { question, weather, location } = request.body as { question?: string; weather?: unknown; location?: string }
  if (!question || !weather || !location) {
    response.status(400).json({ error: 'question, weather, and location are required' })
    return
  }

  if (!openai) {
    const context = weather as { summary?: string; temperature?: number; feelsLike?: number; humidity?: number; wind?: number; aqi?: number; forecast?: Array<{ day: string; high: number; low: number; rain: number }> }
    const questionText = (question ?? '').toLowerCase()
    const isWeatherQuestion = /(weather|forecast|rain|temperature|humidity|wind|cloud|sunny|storm|umbrella|aqi|pressure|visibility|today|tomorrow|weekend|next\s+\d+\s*(day|days|hour|hours))/i.test(questionText)

    if (!isWeatherQuestion) {
      response.json({ answer: `I can help with weather questions for ${location}. Ask about today, rain, wind, humidity, or the next 7-day forecast.`, source: 'WeatherGPT Demo AI' })
      return
    }

    const tomorrow = context.forecast?.[1]
    const answer = `For ${location}: ${context.summary ?? 'Weather information is available.'} Current temperature is ${context.temperature ?? 'unavailable'}° and feels like ${context.feelsLike ?? 'unavailable'}°. ${tomorrow ? `Tomorrow has a ${tomorrow.rain}% chance of rain, with a high of ${tomorrow.high}° and low of ${tomorrow.low}°. ` : ''}Humidity is ${context.humidity ?? 'unavailable'}%, wind is ${context.wind ?? 'unavailable'} km/h, and AQI is ${context.aqi ?? 'unavailable'}.`
    response.json({ answer, source: 'WeatherGPT Demo AI' })
    return
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are WeatherGPT. Answer only from the supplied structured weather context. Never invent values. Clearly say when context is unavailable, mention the relevant data time, and tell users to follow official authorities for critical warnings.' },
        { role: 'user', content: JSON.stringify({ location, question, weather }) },
      ],
    })
    response.json({ answer: completion.choices[0]?.message.content ?? 'I could not find an answer in the retrieved weather data.', source: 'WeatherGPT AI' })
  } catch {
    response.status(502).json({ error: 'AI service unavailable' })
  }
})

app.listen(port, () => console.log(`WeatherGPT API listening on http://localhost:${port}`))
