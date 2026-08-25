import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildDateRangeOptions, formatWeatherDateLabel, getWeatherCodeLabel, isWeatherQuestion } from '../src/services/weatherService'

describe('weather service live-data helpers', () => {
  it('returns a human-friendly label for a known weather code', () => {
    assert.equal(getWeatherCodeLabel(0), 'Clear sky')
    assert.equal(getWeatherCodeLabel(61), 'Rain')
  })

  it('formats the current day label in the app style', () => {
    const label = formatWeatherDateLabel(new Date('2026-08-25T10:00:00Z'))
    assert.equal(label, 'TUESDAY, 25 AUGUST')
  })

  it('detects weather-related prompts and ignores unrelated questions', () => {
    assert.equal(isWeatherQuestion('what is the weather in Bhilai today?'), true)
    assert.equal(isWeatherQuestion("what's a chicken?"), false)
  })

  it('builds a real date-range selector from the live forecast window', () => {
    const options = buildDateRangeOptions(new Date('2026-08-25T10:00:00Z'), 5)
    assert.deepEqual(options.map((option) => option.label), ['1D', '3D', '7D', '15D', '30D'])
  })
})
