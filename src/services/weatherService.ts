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
  pressure: number
  aqi: number
  sunrise: string
  sunset: string
  source: string
  updated: string
  forecast: ForecastDay[]
  hourly: Hour[]
  alerts: WeatherAlert[]
}

const locations: Record<string, WeatherSnapshot> = {
  Bhilai: {
    location: 'Bhilai', time: '10:42 AM', temperature: 29, feelsLike: 32, condition: 'Partly cloudy', summary: 'Partly cloudy with a warm afternoon ahead.', humidity: 68, wind: 12, pressure: 1008, aqi: 74, sunrise: '05:46 AM', sunset: '06:33 PM', source: 'Demo Weather Service', updated: '3 min ago',
    forecast: [{ day: 'Today', high: 31, low: 24, rain: 35 }, { day: 'Sat', high: 30, low: 24, rain: 45 }, { day: 'Sun', high: 29, low: 23, rain: 65 }, { day: 'Mon', high: 30, low: 23, rain: 40 }, { day: 'Tue', high: 31, low: 24, rain: 30 }, { day: 'Wed', high: 32, low: 24, rain: 20 }, { day: 'Thu', high: 32, low: 25, rain: 25 }],
    hourly: [{ time: 'Now', temp: 29, rain: 10 }, { time: '12 PM', temp: 30, rain: 12 }, { time: '2 PM', temp: 31, rain: 18 }, { time: '4 PM', temp: 30, rain: 35 }, { time: '6 PM', temp: 28, rain: 42 }, { time: '8 PM', temp: 27, rain: 28 }, { time: '10 PM', temp: 26, rain: 20 }],
    alerts: [{ title: 'Thunderstorm watch', severity: 'MODERATE', area: 'Durg district', time: 'Until 8:00 PM' }],
  },
  Raipur: {
    location: 'Raipur', time: '10:42 AM', temperature: 30, feelsLike: 34, condition: 'Sunny intervals', summary: 'Sunny intervals with a chance of evening thunderstorms.', humidity: 64, wind: 14, pressure: 1007, aqi: 82, sunrise: '05:45 AM', sunset: '06:34 PM', source: 'Demo Weather Service', updated: '3 min ago',
    forecast: [{ day: 'Today', high: 33, low: 25, rain: 30 }, { day: 'Sat', high: 32, low: 25, rain: 40 }, { day: 'Sun', high: 31, low: 24, rain: 55 }, { day: 'Mon', high: 32, low: 24, rain: 35 }, { day: 'Tue', high: 33, low: 25, rain: 25 }, { day: 'Wed', high: 34, low: 25, rain: 18 }, { day: 'Thu', high: 33, low: 26, rain: 22 }],
    hourly: [{ time: 'Now', temp: 30, rain: 8 }, { time: '12 PM', temp: 32, rain: 10 }, { time: '2 PM', temp: 33, rain: 15 }, { time: '4 PM', temp: 32, rain: 30 }, { time: '6 PM', temp: 29, rain: 38 }, { time: '8 PM', temp: 28, rain: 25 }, { time: '10 PM', temp: 27, rain: 18 }],
    alerts: [{ title: 'Heat advisory', severity: 'LOW', area: 'Raipur city', time: 'Until 5:00 PM' }],
  },
}

export const getWeatherSnapshot = (location: string): WeatherSnapshot => {
  const normalized = Object.keys(locations).find((key) => key.toLowerCase() === location.toLowerCase())
  if (normalized) return locations[normalized]
  const seed = [...location].reduce((total, character) => total + character.charCodeAt(0), 0)
  const temperature = 24 + seed % 10
  return { ...locations.Bhilai, location, temperature, feelsLike: temperature + 3, aqi: 55 + seed % 65, wind: 8 + seed % 13, summary: `Warm conditions with a light breeze around ${location}.`, forecast: locations.Bhilai.forecast.map((day, index) => ({ ...day, high: temperature + 2 - index % 2, low: temperature - 5 + index % 2, rain: 20 + (seed + index * 9) % 55 })), hourly: locations.Bhilai.hourly.map((hour, index) => ({ ...hour, temp: temperature + Math.min(3, index % 4), rain: 8 + (seed + index * 7) % 35 })) }
}

export const demoLocations = Object.keys(locations)

export async function getWeatherData(location: string): Promise<WeatherSnapshot> {
  const apiUrl = import.meta.env.VITE_WEATHER_API_URL
  if (apiUrl) {
    const response = await fetch(`${apiUrl}/weather?location=${encodeURIComponent(location)}`)
    if (!response.ok) throw new Error('Weather service unavailable')
    return response.json()
  }
  return getWeatherSnapshot(location)
}
