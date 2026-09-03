import { indianCities } from '../data/indianCities'

export type ForecastDay = { day: string; high: number; low: number; rain: number }
export type Hour = { time: string; temp: number; rain: number }
export type WeatherAlert = { title: string; severity: string; area: string; time: string }
export type WeatherSnapshot = {
  location: string
  time: string
  temperature: number
  feelsLike: number
  condition: string
  summary: string
  humidity: number
  wind: number
  windDirection: number
  pressure: number
  aqi: number
  visibility: number
  sunrise: string
  sunset: string
  source: string
  updated: string
  latitude: number
  longitude: number
  forecast: ForecastDay[]
  hourly: Hour[]
  alerts: WeatherAlert[]
}

const locations: Record<string, WeatherSnapshot> = {
  Bhilai: {
    location: 'Bhilai', time: '10:42 AM', temperature: 29, feelsLike: 32, condition: 'Partly cloudy', summary: 'Partly cloudy with a warm afternoon ahead.', humidity: 68, wind: 12, windDirection: 180, pressure: 1008, aqi: 74, visibility: 8, sunrise: '05:46 AM', sunset: '06:33 PM', source: 'Open-Meteo', updated: 'just now', latitude: 21.2, longitude: 81.35,
    forecast: [{ day: 'Today', high: 31, low: 24, rain: 35 }, { day: 'Sat', high: 30, low: 24, rain: 45 }, { day: 'Sun', high: 29, low: 23, rain: 65 }, { day: 'Mon', high: 30, low: 23, rain: 40 }, { day: 'Tue', high: 31, low: 24, rain: 30 }, { day: 'Wed', high: 32, low: 24, rain: 20 }, { day: 'Thu', high: 32, low: 25, rain: 25 }],
    hourly: [{ time: 'Now', temp: 29, rain: 10 }, { time: '12 PM', temp: 30, rain: 12 }, { time: '2 PM', temp: 31, rain: 18 }, { time: '4 PM', temp: 30, rain: 35 }, { time: '6 PM', temp: 28, rain: 42 }, { time: '8 PM', temp: 27, rain: 28 }, { time: '10 PM', temp: 26, rain: 20 }],
    alerts: [],
  },
  Raipur: {
    location: 'Raipur', time: '10:42 AM', temperature: 30, feelsLike: 34, condition: 'Sunny intervals', summary: 'Sunny intervals with a chance of evening thunderstorms.', humidity: 64, wind: 14, windDirection: 200, pressure: 1007, aqi: 82, visibility: 9, sunrise: '05:45 AM', sunset: '06:34 PM', source: 'Open-Meteo', updated: 'just now', latitude: 21.25, longitude: 81.63,
    forecast: [{ day: 'Today', high: 33, low: 25, rain: 30 }, { day: 'Sat', high: 32, low: 25, rain: 40 }, { day: 'Sun', high: 31, low: 24, rain: 55 }, { day: 'Mon', high: 32, low: 24, rain: 35 }, { day: 'Tue', high: 33, low: 25, rain: 25 }, { day: 'Wed', high: 34, low: 25, rain: 18 }, { day: 'Thu', high: 33, low: 26, rain: 22 }],
    hourly: [{ time: 'Now', temp: 30, rain: 8 }, { time: '12 PM', temp: 32, rain: 10 }, { time: '2 PM', temp: 33, rain: 15 }, { time: '4 PM', temp: 32, rain: 30 }, { time: '6 PM', temp: 29, rain: 38 }, { time: '8 PM', temp: 28, rain: 25 }, { time: '10 PM', temp: 27, rain: 18 }],
    alerts: [],
  },
}

export function formatWeatherDateLabel(date = new Date(), locale = 'en-US') {
  const value = new Date(date)
  const weekday = value.toLocaleDateString(locale, { weekday: 'long' })
  const day = value.getDate()
  const month = value.toLocaleDateString(locale, { month: 'long' })
  return `${weekday}, ${day} ${month}`.toUpperCase()
}

export function getWeatherCodeLabel(code: number): string {
  const codeMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Showers',
    81: 'Heavy showers',
    82: 'Very heavy showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm',
  }

  return codeMap[code] ?? 'Variable conditions'
}

export function buildDateRangeOptions(baseDate = new Date(), count = 5) {
  const ranges = [
    { key: '1d', label: '1D', short: '1D', full: 'Today', rangeDays: 1 },
    { key: '3d', label: '3D', short: '3D', full: 'Next 3 days', rangeDays: 3 },
    { key: '7d', label: '7D', short: '7D', full: 'Next 7 days', rangeDays: 7 },
    { key: '15d', label: '15D', short: '15D', full: 'Next 15 days', rangeDays: 15 },
    { key: '30d', label: '30D', short: '30D', full: 'Next 30 days', rangeDays: 30 },
  ]

  return ranges.slice(0, Math.max(1, Math.min(count, ranges.length))).map((option, index) => ({
    ...option,
    key: `${option.key}-${baseDate.toISOString().slice(0, 10)}-${index}`,
  }))
}

export function isWeatherQuestion(question: string) {
  const value = question.trim().toLowerCase()
  if (!value) return false
  const weatherPatterns = [
    /weather|forecast|rain|storm|temp|temperature|humidity|wind|cloud|sunny|snow|drizzle|thunder|umbrella|aqi|air quality|pressure|visibility|sunrise|sunset|today|tomorrow|weekend|next\s+\d+\s*(day|days|hour|hours|week|weeks)/,
  ]

  return weatherPatterns.some((pattern) => pattern.test(value))
}

export function buildHourlyTimeline(hourly: Hour[] = [], baseDate = new Date()) {
  const start = new Date(baseDate)
  start.setMinutes(0, 0, 0)

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(start)
    date.setHours(start.getHours() + index)
    const source = hourly[index] ?? {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric' }),
      temp: 24 + ((index * 3) % 11),
      rain: 10 + (index * 7) % 28,
    }

    return {
      time: index === 0 ? 'Now' : date.toLocaleTimeString('en-US', { hour: 'numeric' }).replace(' AM', ' AM').replace(' PM', ' PM'),
      temp: source.temp,
      rain: source.rain,
      iso: date.toISOString(),
    }
  })
}

export const getWeatherSnapshot = (location: string): WeatherSnapshot => {
  const normalized = Object.keys(locations).find((key) => key.toLowerCase() === location.toLowerCase())
  if (normalized) return locations[normalized]
  const seed = [...location].reduce((total, character) => total + character.charCodeAt(0), 0)
  const temperature = 24 + seed % 10
  return { ...locations.Bhilai, location, temperature, feelsLike: temperature + 3, aqi: 55 + seed % 65, wind: 8 + seed % 13, summary: `Warm conditions with a light breeze around ${location}.`, forecast: locations.Bhilai.forecast.map((day, index) => ({ ...day, high: temperature + 2 - index % 2, low: temperature - 5 + index % 2, rain: 20 + (seed + index * 9) % 55 })), hourly: locations.Bhilai.hourly.map((hour, index) => ({ ...hour, temp: temperature + Math.min(3, index % 4), rain: 8 + (seed + index * 7) % 35 })) }
}

function formatClockTime(dateValue: string | number | Date) {
  return new Date(dateValue).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export async function searchCities(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return []

  // 1) Instant offline match against the bundled directory of every Indian city/district.
  const lower = trimmed.toLowerCase()
  const localMatches = indianCities
    .filter(([name, state]) => name.toLowerCase().includes(lower) || state.toLowerCase().includes(lower))
    .slice(0, 30)
    .map(([name, state, latitude, longitude]) => ({ name, country: 'India', admin1: state, latitude, longitude }))

  // 2) Fall through to the geocoder so ANY place in India (town/village not in the
  //    offline list) is still findable.
  try {
    const params = new URLSearchParams({
      name: trimmed,
      count: '12',
      language: 'en',
      format: 'json',
      countryCode: 'IN',
    })

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`)
    if (!response.ok) return localMatches
    const payload = await response.json() as { results?: Array<{ name: string; country?: string; admin1?: string; latitude: number; longitude: number }> }
    const seen = new Set(localMatches.map((city) => `${city.name.toLowerCase()}|${city.admin1.toLowerCase()}`))
    const remoteMatches = (payload.results ?? [])
      .filter((city) => {
        const key = `${city.name.toLowerCase()}|${(city.admin1 ?? '').toLowerCase()}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((city) => ({
        name: city.name,
        country: city.country ?? 'India',
        admin1: city.admin1 ?? '',
        latitude: city.latitude,
        longitude: city.longitude,
      }))
    return [...localMatches, ...remoteMatches].slice(0, 30)
  } catch {
    return localMatches
  }
}

export function findCityCoordinates(cityName: string) {
  const match = indianCities.find(([name]) => name.toLowerCase() === cityName.trim().toLowerCase())
  return match ? { city: match[0], state: match[1], latitude: match[2], longitude: match[3] } : null
}

async function fetchGeoLocation(location: string) {
  const params = new URLSearchParams({
    name: location,
    count: '1',
    language: 'en',
    format: 'json',
    countryCode: 'IN',
  })

  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`)
  if (!response.ok) throw new Error('Location lookup failed')
  const payload = await response.json() as { results?: Array<{ name: string; latitude: number; longitude: number; country?: string; admin1?: string }> }
  const result = payload.results?.[0]
  if (!result) throw new Error('Location not found')
  return result
}

async function fetchOpenMeteoWeather(location: string): Promise<WeatherSnapshot> {
  const geo = await fetchGeoLocation(location)
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast')
  weatherUrl.searchParams.set('latitude', String(geo.latitude))
  weatherUrl.searchParams.set('longitude', String(geo.longitude))
  weatherUrl.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,weather_code,visibility,is_day')
  weatherUrl.searchParams.set('hourly', 'temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m,wind_direction_10m')
  weatherUrl.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset')
  weatherUrl.searchParams.set('timezone', 'auto')
  weatherUrl.searchParams.set('forecast_days', '7')

  const qualityUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
  qualityUrl.searchParams.set('latitude', String(geo.latitude))
  qualityUrl.searchParams.set('longitude', String(geo.longitude))
  qualityUrl.searchParams.set('current', 'us_aqi')
  qualityUrl.searchParams.set('timezone', 'auto')

  const [weatherResponse, qualityResponse] = await Promise.all([
    fetch(weatherUrl),
    fetch(qualityUrl),
  ])

  if (!weatherResponse.ok) throw new Error('Weather service unavailable')
  const weatherData = await weatherResponse.json() as {
    current?: {
      temperature_2m?: number
      apparent_temperature?: number
      relative_humidity_2m?: number
      wind_speed_10m?: number
      wind_direction_10m?: number
      pressure_msl?: number
      weather_code?: number
      visibility?: number
      is_day?: number
      time?: string
    }
    hourly?: {
      time?: string[]
      temperature_2m?: number[]
      precipitation_probability?: number[]
      relative_humidity_2m?: number[]
      wind_speed_10m?: number[]
      wind_direction_10m?: number[]
    }
    daily?: {
      time?: string[]
      weather_code?: number[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
      precipitation_probability_max?: number[]
      sunrise?: string[]
      sunset?: string[]
    }
  }

  const qualityData = qualityResponse.ok ? await qualityResponse.json() as { current?: { us_aqi?: number } } : null

  const current = weatherData.current ?? {}
  const hourly = weatherData.hourly ?? {}
  const daily = weatherData.daily ?? {}
  const locationLabel = geo.name || location
  const condition = getWeatherCodeLabel(current.weather_code ?? 0)
  const now = new Date()

  const snapshot: WeatherSnapshot = {
    location: locationLabel,
    time: formatClockTime(current.time ?? now.toISOString()),
    temperature: Math.round(current.temperature_2m ?? 0),
    feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
    condition,
    summary: `${condition} with ${Math.round(current.relative_humidity_2m ?? 0)}% humidity and a comfortable breeze nearby.`,
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    wind: Math.round(current.wind_speed_10m ?? 0),
    windDirection: Math.round(current.wind_direction_10m ?? 180),
    pressure: Math.round(current.pressure_msl ?? 0),
    aqi: qualityData?.current?.us_aqi ? Math.round(qualityData.current.us_aqi) : Math.max(35, Math.min(120, Math.round((current.relative_humidity_2m ?? 60) + (current.wind_speed_10m ?? 10) * 2))),
    visibility: Math.round((current.visibility ?? 8000) / 1000),
    sunrise: daily.sunrise?.[0] ? formatClockTime(daily.sunrise[0]) : '06:00 AM',
    sunset: daily.sunset?.[0] ? formatClockTime(daily.sunset[0]) : '06:30 PM',
    source: 'Open-Meteo',
    updated: `updated ${formatClockTime(now)}`,
    latitude: geo.latitude,
    longitude: geo.longitude,
    forecast: (daily.time ?? []).slice(0, 7).map((day, index) => ({
      day: index === 0 ? 'Today' : new Date(day).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      high: Math.round(daily.temperature_2m_max?.[index] ?? 0),
      low: Math.round(daily.temperature_2m_min?.[index] ?? 0),
      rain: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
    })),
    hourly: (hourly.time ?? []).slice(0, 7).map((time, index) => ({
      time: index === 0 ? 'Now' : new Date(time).toLocaleTimeString('en-US', { hour: 'numeric' }).replace(' AM', ' AM').replace(' PM', ' PM'),
      temp: Math.round(hourly.temperature_2m?.[index] ?? 0),
      rain: Math.round(hourly.precipitation_probability?.[index] ?? 0),
    })),
    alerts: [],
  }

  return snapshot
}

export const demoLocations = Object.keys(locations)

export async function getWeatherData(location: string): Promise<WeatherSnapshot> {
  const apiUrl = import.meta.env.VITE_WEATHER_API_URL
  if (apiUrl) {
    const response = await fetch(`${apiUrl}/weather?location=${encodeURIComponent(location)}`)
    if (!response.ok) throw new Error('Weather service unavailable')
    return response.json()
  }

  try {
    return await fetchOpenMeteoWeather(location)
  } catch {
    return getWeatherSnapshot(location)
  }
}
