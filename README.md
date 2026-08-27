# WeatherGPT 🌦️🤖

**Conversational AI Weather Intelligence Platform** built with React, TypeScript & Node.js.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-LLM-412991?style=for-the-badge&logo=openai&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

---

## 🚀 Try WeatherGPT

🌐 **Live Web App:** *Add your deployed website link here*

📱 **Android APK:**  
https://github.com/Aryan-9907/SIH/actions/runs/33048750271

The latest GitHub Actions build contains the Android APK for testing.

---

## 🌤️ About WeatherGPT

**WeatherGPT** is an AI-first conversational weather platform developed for **Smart India Hackathon 2026 — Problem Statement 26068**.

Traditional weather apps primarily present numbers, charts and forecasts. WeatherGPT goes a step further by allowing users to **ask questions about weather in natural language** and receive contextual, easy-to-understand answers based on structured weather data.

The platform combines 🌡️ live weather data, 🤖 conversational AI, 📍 location intelligence, 📊 forecasts & insights, 🚨 safety information, 🗺️ interactive maps, 🇮🇳 multilingual support, 🎙️ voice input and 📱 Android support in one experience.

The project was developed using **AI-assisted engineering and rapid prototyping workflows** to quickly build, test and refine the platform.

---

## 🎯 Why WeatherGPT?

Weather information is often scattered across dashboards, charts, alerts and multiple screens.

WeatherGPT turns that information into **conversational, contextual and actionable weather intelligence**.

Instead of interpreting multiple weather values, users can simply ask:

> 🌧️ *"Will it rain tomorrow?"*

> 🌾 *"Is this week suitable for planting crops?"*

> 🚨 *"What should I do during this weather alert?"*

> 🗣️ *"Explain today's weather in Hindi."*

The goal is to make weather information **easier to understand, more accessible and more useful in everyday decisions**.

---

## 🎯 Smart India Hackathon 2026

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

Ask weather questions naturally instead of navigating through multiple screens.

💬 Natural-language queries • 🧠 Weather-aware context • 💡 Suggested questions • 🌦️ Forecast explanations • 🗣️ Conversational responses • 🛡️ Fallback responses

**Example queries:**

> 🌧️ *"Will it rain tomorrow?"*  
> 👕 *"What should I wear today?"*  
> 🌾 *"Is this week suitable for planting crops?"*  
> ☀️ *"Explain today's weather simply."*

---

### 🌡️ Live Weather Dashboard

Get a detailed snapshot of the selected location using live weather data.

🌡️ Temperature • 🤗 Feels-like • 💧 Humidity • 💨 Wind • 🧭 Wind direction • 📊 Pressure • 👁️ Visibility • 🌫️ AQI • 🌅 Sunrise & sunset • 🌧️ Rain probability

---

### ⏰ Forecasts

📅 **7-Day Forecast** • 🕐 **Hourly Forecast** • 🌡️ Daily highs & lows • 🌧️ Precipitation probability • 💨 Wind conditions • ☁️ Weather conditions

🔄 Weather data automatically refreshes approximately every **7 seconds**, with change detection used to avoid unnecessary UI updates.

---

### 📍 Location Intelligence

Search and switch between locations using city search and geocoding.

🇮🇳 **Bhilai, Raipur, Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Jaipur, Ahmedabad, Lucknow** and many more.

---

### 🗺️ Interactive Weather Map

Powered by **Leaflet + OpenStreetMap**.

🌡️ Temperature • 💨 Wind • 💧 Humidity • 📍 Location mapping

---

### 🚨 Weather Safety Center

A dedicated space for weather warnings and safety information.

⚠️ Alert severity • 📍 Affected area • ⏱️ Timing • 📝 Warning description • 🛡️ Safety guidance • 📞 Emergency-services access

> For critical situations, users should always follow official authorities and emergency instructions.

**Current status:** Live IMD warning-feed integration is planned for a future version.

---

### 📊 Weather & Climate Insights

Explore available weather patterns across:

`1D` • `3D` • `7D` • `15D` • `30D`

📈 Temperature • 🌧️ Rain expectancy • 💧 Humidity • 💨 Wind • 📊 Pressure • 😊 Comfort index • 🔎 Pattern summaries

> Current insights are derived from available live weather and forecast data. Long-term historical climate datasets are not yet integrated.

---

### 🇮🇳 Multilingual Interface

Support for:

🇬🇧 English • 🇮🇳 Hindi • 🇮🇳 Bengali • 🇮🇳 Marathi • 🇮🇳 Tamil • 🇮🇳 Telugu • 🇮🇳 Gujarati • 🇮🇳 Punjabi • 🇮🇳 Malayalam

The implementation includes multilingual UI support and language-aware voice input.

---

### 🎙️ Voice Input

Ask WeatherGPT using browser-based speech recognition.

🎤 Speech-to-text • 🇮🇳 Indian language locales • 🗣️ Natural voice queries

> Voice input is implemented. AI voice responses / text-to-speech are planned for a future version.

---

## 🌐 Live Weather Data

WeatherGPT currently uses **Open-Meteo** for live weather and forecast retrieval.

Available data includes:

🌡️ Current weather • 🕐 Hourly forecasts • 📅 Daily forecasts • 🌧️ Precipitation probability • 💧 Humidity • 💨 Wind • 📊 Pressure • 👁️ Visibility • 🌅 Sunrise/sunset • 🌫️ Air quality

The weather service is separated from the UI, making future weather-provider integrations easier.

> **Weather values displayed by WeatherGPT are intended to come from live weather and forecast data rather than hard-coded demonstration data.**

---

## 📱 Android Application

WeatherGPT is packaged as an Android application using **Capacitor**.

🚀 **Latest APK Build:**  
https://github.com/Aryan-9907/SIH/actions/runs/33048750271

The GitHub Actions workflow provides the latest Android build artifact for testing.

---

## 🔐 Secure AI Architecture

The OpenAI API key is kept on the **server** and is not exposed in the frontend.

```text
User
  ↓
React Frontend
  ↓
Express Backend
  ↓
OpenAI API
  ↓
WeatherGPT Response
