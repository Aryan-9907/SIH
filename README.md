# WeatherGPT

WeatherGPT is an AI-first weather intelligence dashboard for Smart India Hackathon 2026. It combines conversational questions with current conditions, hourly and 7-day forecasts, safety alerts, a weather map, and historical climate insights.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The app runs in clearly labelled Demo Mode with realistic mock data for Bhilai and Raipur, so no API keys are required.

To run the secure Express API alongside the frontend:

```bash
cp .env.example .env
npm run dev:all
```

Set `OPENAI_API_KEY` in `.env` to enable live LLM responses through the backend. Never place that key in frontend code. Set `VITE_WEATHER_API_URL` when a weather adapter is available; otherwise the typed demo weather service is used automatically.

## Architecture

- `src/services/weatherService.ts`: typed weather adapter with realistic Demo Mode data.
- `server/index.ts`: Express `/api/chat` endpoint. The LLM only receives structured weather context and the user question.
- `src/App.tsx`: dashboard composition and interaction states.
- Leaflet/OpenStreetMap and a live weather adapter can be connected at the map/service boundaries.

Demo data is not live weather. For critical warnings, always follow official authorities rather than relying solely on AI.
