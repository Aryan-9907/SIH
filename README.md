# WeatherGPT 🌦️🤖

**Conversational AI Weather Intelligence Platform** built with React, TypeScript & Node.js

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-LLM-412991?style=for-the-badge&logo=openai&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

---

## 🌤️ About This Project

**WeatherGPT** is an AI-first conversational weather platform developed as a **vibe-coded prototype for Smart India Hackathon 2026 — Problem Statement 26068**.

Instead of simply displaying weather numbers, WeatherGPT lets users **ask questions about the weather in natural language** and receive contextual explanations using live, structured weather data.

The platform brings together 🌡️ live weather data, 🤖 conversational AI, 📍 location intelligence, 📊 forecasts & insights, 🚨 safety information, 🗺️ maps, 🇮🇳 multilingual UI, 🎙️ voice input, and 📱 Android support in one polished experience.

Development was accelerated using **AI-assisted / vibe-coded development** to rapidly prototype, test and refine the application.

---

## 🎯 Smart India Hackathon

**Problem Statement:** `26068` — *WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information*

🏛️ **Organization:** Ministry of Earth Sciences (MoES)  
🌦️ **Department:** India Meteorological Department (IMD)  
💻 **Category:** Software  
🚨 **Theme:** Disaster Management

🔗 **Official Problem Statement:**  
https://sih.gov.in/sih2026PS

---

## ✨ Features

### 🤖 Conversational Weather AI

Ask questions naturally instead of navigating through multiple weather screens.

💬 Natural-language weather queries • 🧠 Weather-aware AI context • 💡 Suggested questions • 🌦️ Forecast explanations • 🗣️ Conversational responses • 🛡️ Fallback responses when AI is unavailable

Example questions:

> 🌧️ *"Will it rain tomorrow?"*  
> 👕 *"What should I wear today?"*  
> 🌾 *"Is this week suitable for planting crops?"*  
> ☀️ *"Explain today's weather simply."*

---

### 🌡️ Weather Dashboard

Get a detailed snapshot of the selected location using live weather data:

🌡️ Temperature • 🤗 Feels-like • 💧 Humidity • 💨 Wind • 🧭 Wind direction • 📊 Pressure • 👁️ Visibility • 🌫️ AQI • 🌅 Sunrise & sunset • 🌧️ Rain probability

---

### ⏰ Forecasts

📅 **7-Day Forecast** • 🕐 **Hourly Forecast** • 🌡️ Daily highs & lows • 🌧️ Precipitation probability • 💨 Wind conditions • ☁️ Weather conditions

🔄 Weather data automatically refreshes approximately every **7 seconds**, while a change-detection guard helps prevent unnecessary UI updates.

---

### 📍 Location Intelligence

Search and switch between locations using city search and geocoding.

🇮🇳 Locations can include **Bhilai, Raipur, Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Jaipur, Ahmedabad, Lucknow** and many more.

---

### 🗺️ Interactive Weather Map

Powered by **Leaflet + OpenStreetMap**.

🌡️ Temperature view • 💨 Wind view • 💧 Humidity view • 📍 Selected-location mapping

---

### 🚨 Weather Safety Center

A dedicated space for weather warnings and safety information.

⚠️ Alert severity • 📍 Affected area • ⏱️ Timing • 📝 Warning description • 🛡️ Safety guidance • 📞 Emergency-services access

> For critical situations, users should always follow official authorities and emergency instructions.

**Note:** Live IMD warning-feed integration is planned for a future version.

---

### 📊 Weather & Climate Insights

Explore weather patterns across:

`1D` • `3D` • `7D` • `15D` • `30D`

📈 Temperature • 🌧️ Rain expectancy • 💧 Humidity • 💨 Wind • 📊 Pressure • 😊 Comfort index • 🔎 Pattern summaries

> Current insights are derived from available live weather/forecast data. Long-term historical climate datasets are not yet integrated.

---

### 🇮🇳 Multilingual Interface

🌐 **English, Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Punjabi & Malayalam**

The current implementation provides multilingual UI support and language-aware voice input.

---

### 🎙️ Voice Input

Ask WeatherGPT using browser-based speech recognition.

🎤 Speech-to-text • 🇮🇳 Indian language locales • 🗣️ Natural voice queries

> Voice input is implemented; AI voice responses / text-to-speech are planned for the future.

---

### 🌐 Live Weather Data

WeatherGPT currently uses **Open-Meteo** for live weather and forecast retrieval.

It can provide:

🌡️ Current weather • 🕐 Hourly forecasts • 📅 Daily forecasts • 🌧️ Precipitation probability • 💧 Humidity • 💨 Wind • 📊 Pressure • 👁️ Visibility • 🌅 Sunrise/sunset • 🌫️ Air quality

The weather service is separated from the UI, making future API replacements easier.

**Weather values shown by the application are intended to come from live weather/forecast data rather than hard-coded demonstration weather.**

---

## 📱 Android APK

WeatherGPT is also packaged as an Android application using **Capacitor**.

🚀 **Latest APK build:**  
https://github.com/Aryan-9907/SIH/actions/runs/33048750271

The GitHub Actions run contains the current Android build artifact for testing.

---

## 🔐 Secure AI Architecture

The OpenAI API key is kept on the **server**, not exposed inside the frontend.

```text
User Question
      ↓
React Frontend
      ↓
Express Backend
      ↓
OpenAI API
      ↓
WeatherGPT Response
