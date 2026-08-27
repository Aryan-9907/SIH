# WeatherGPT 🌦️🤖

**Conversational AI Weather Intelligence Platform** built with React, TypeScript & Node.js

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-LLM-412991?style=for-the-badge&logo=openai&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

---

## About This Project

**WeatherGPT** is an AI-first conversational weather intelligence platform developed as a **vibe-coded prototype for Smart India Hackathon 2026 — Problem Statement 26068**.

The project addresses the problem of weather information being spread across different sources and interfaces by providing a single conversational interface where users can ask questions about current conditions, forecasts, rainfall, wind, weather safety, and everyday planning.

Unlike a traditional weather application that primarily displays weather values, **WeatherGPT allows users to ask questions in natural language and receive contextual explanations based on structured weather data.**

The application combines weather data retrieval, conversational AI, location search, forecasts, weather insights, safety information, interactive maps, multilingual UI, voice input, and Android packaging into one platform.

This project was built with **AI-assisted / vibe-coded development**, with the goal of rapidly prototyping and refining a polished SIH-ready product experience.

---

## 🎯 Smart India Hackathon

**Problem Statement ID:** 26068

**Problem Statement:**  
**WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information**

**Organization:** Ministry of Earth Sciences (MoES)

**Department:** India Meteorological Department (IMD)

**Category:** Software

**Theme:** Disaster Management

Official problem statement:

https://sih.gov.in/sih2026PS

---

## ✨ Features

### 🤖 Conversational Weather AI

- Ask natural-language questions about weather
- ChatGPT-style conversational interface
- Weather-aware responses
- Weather context is supplied to the AI backend
- Suggested questions for quick interaction
- Weather information and AI explanation are presented separately
- Fallback responses when the AI service is unavailable

Example questions:

- "Will it rain tomorrow?"
- "Explain today's weather simply"
- "What should I wear?"
- "Best time for planting crops this week?"
- "How is my day looking?"

---

### 🌡️ Current Weather

View detailed weather conditions for the selected location:

- 🌡️ Temperature
- 🤗 Feels-like temperature
- 💧 Humidity
- 💨 Wind speed
- 🧭 Wind direction
- 📊 Atmospheric pressure
- 👁️ Visibility
- 🌫️ Air Quality Index
- 🌅 Sunrise
- 🌇 Sunset
- 🌧️ Precipitation probability

---

### ⏱️ Hourly & 7-Day Forecast

WeatherGPT provides:

- Hourly weather timeline
- 7-day forecast
- Daily temperature highs and lows
- Rain probability
- Wind information
- Weather conditions throughout the day

---

### 🔄 Automatic Weather Refresh

Weather information automatically refreshes approximately every **7 seconds**.

The application also uses a meaningful-change check so that unchanged weather data does not unnecessarily trigger large UI updates.

This keeps the weather information fresh while reducing unnecessary rendering and mobile scrolling lag.

---

### 📍 Location Search

Users can change the active weather location through:

- City search
- Popular Indian cities
- Open-Meteo geocoding
- Location-based weather retrieval

Demo locations include:

- Bhilai
- Raipur
- Delhi
- Mumbai
- Kolkata
- Chennai
- Bengaluru
- Hyderabad
- Pune
- Jaipur
- Ahmedabad
- Lucknow

The location selection interface is kept on the main Weather dashboard rather than appearing throughout every tab.

---

### 🗺️ Interactive Weather Map

The Map section uses **Leaflet + OpenStreetMap**.

Available views include:

- 🌡️ Temperature
- 💨 Wind
- 💧 Humidity

The map displays the selected location and its current weather context.

---

### 🚨 Weather Safety Center

The Safety Center provides a dedicated interface for weather-related warnings and safety guidance.

It includes:

- Alert severity
- Alert title
- Affected location
- Timing
- Warning description
- Safety recommendations
- Emergency-services access

The application also provides access to India's emergency number **108**.

For critical weather situations, users are reminded to follow official authorities rather than relying solely on AI-generated explanations.

> **Note:** The current prototype does not directly integrate live IMD warning feeds. The safety/alert interface is implemented as part of the prototype and is ready to be connected to an official warning source in the future.

---

### 📊 Weather & Climate Insights

The Insights section provides visual weather analysis across selectable ranges:

- 1 Day
- 3 Days
- 7 Days
- 15 Days
- 30 Days

It includes:

- Average temperature
- Rain expectancy
- Humidity
- Wind
- Pressure
- Comfort index
- Visual trend charts
- Weather pattern summaries

The current prototype derives these insight series from the available weather/forecast context.

It does **not** currently connect to a long-term historical climate database.

---

### 🇮🇳 Multilingual Interface

The interface supports multiple Indian languages:

- 🇬🇧 English
- 🇮🇳 Hindi
- Bengali
- Marathi
- Tamil
- Telugu
- Gujarati
- Punjabi
- Malayalam

The selected language is stored locally so the user's preference can persist between sessions.

---

### 🎙️ Voice Input

WeatherGPT supports browser-based speech recognition for voice-to-text queries.

Supported speech locales include Indian language variants such as:

- `en-IN`
- `hi-IN`
- `bn-IN`
- `mr-IN`
- `ta-IN`
- `te-IN`
- `gu-IN`
- `pa-IN`
- `ml-IN`

> Voice interaction currently provides **speech-to-text input**. Voice-generated AI responses / text-to-speech are not currently implemented.

---

### 🧪 Demo Mode

WeatherGPT can operate without API keys using clearly labelled **Demo Mode** data.

This makes the application suitable for:

- Hackathon demonstrations
- UI testing
- Development without API credentials
- Exploring the complete interface

Demo data is clearly identified rather than being presented as live meteorological data.

---

### 🌐 Live Weather Data

The weather service is modular and can retrieve live weather information.

The current implementation integrates:

**Open-Meteo**

The weather service can retrieve information including:

- Current weather
- Hourly forecasts
- Daily forecasts
- Precipitation probability
- Humidity
- Wind
- Pressure
- Visibility
- Sunrise/sunset
- Air quality

The weather provider is isolated inside the weather service so it can be replaced or extended later.

---

### 🔐 Secure AI Architecture

The AI API key is not exposed in the frontend.

The application uses:

```text
React Frontend
      ↓
Express Backend
      ↓
OpenAI API
