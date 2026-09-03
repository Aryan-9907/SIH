import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, BarChart3, Bell, CloudDrizzle, CloudRain, Droplets, Gauge, Info, LocateFixed, Map as MapIcon, Mic, Moon, Navigation, Search, Send, Sparkles, Sun, Thermometer, Wind } from 'lucide-react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { buildDateRangeOptions, buildHourlyTimeline, formatWeatherDateLabel, getWeatherData, getWeatherSnapshot, isWeatherQuestion, searchCities, type WeatherSnapshot } from './services/weatherService'
import { indianCities, POPULAR_CITIES } from './data/indianCities'

type Tab = 'weather' | 'alerts' | 'ask' | 'map' | 'insights' | 'about'
const TABS: Tab[] = ['weather', 'alerts', 'ask', 'map', 'insights', 'about']
type Message = { role: 'assistant' | 'user'; text: string; data?: string }
type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te' | 'gu' | 'pa' | 'ml'

type TranslationSet = {
  appName: string
  demoMode: string
  locationTitle: string
  popularCities: string
  recommendedCities: string
  askPlaceholder: string
  askAi: string
  weatherTab: string
  alertsTab: string
  mapTab: string
  insightsTab: string
  aboutTab: string
  exploreQuestion: string
  useVoice: string
  languageTitle: string
  languageSubtitle: string
  chooseLanguage: string
  continueLabel: string
  greetingMorning: string
  greetingAfternoon: string
  greetingEvening: string
  greetingNight: string
  locationEmpty: string
  feelsLike: string
  humidity: string
  windSpeed: string
  wind: string
  temperature: string
  visibility: string
  pressure: string
  next12Hours: string
  todaysForecast: string
  theWeekAhead: string
  forecastRhythm: string
  sevenDays: string
  nowLabel: string
  askBannerTitle: string
  askBannerSubtitle: string
  aiSubtitle: string
  weatherLocationOverline: string
  searchCityPlaceholder: string
  viewWeatherFor: string
  recRain: string
  recExplain: string
  recWear: string
  recCrops: string
  recDay: string
  voiceUnsupported: string
  initialMessage: string
  notWeatherReply: string
  outlookReply: string
  yearReply: string
  cropExtra: string
  rainExtra: string
  stayAhead: string
  safetyCenter: string
  alertsSubtitle: string
  activeAlert: string
  highPriority: string
  thunderstormAlert: string
  thunderstormDescription: string
  callEmergency: string
  copyEmergency: string
  emergencyCopiedLabel: string
  genericAlertDescription: string
  important: string
  followOfficial: string
  regionalView: string
  weatherMap: string
  conditionsAround: string
  currentTemperature: string
  surfaceWind: string
  relativeHumidity: string
  liveConditions: string
  mapDisclaimer: string
  climateIntelligence: string
  seeThePattern: string
  longTermSignals: string
  weathergptReads: string
  insightBody: string
  dateRange: string
  avgHigh: string
  comfort: string
  overallFeel: string
  rainExp: string
  expected: string
  rainLabel: string
  rainExpectancy: string
  liveLabel: string
  humidityOverline: string
  moistureIndex: string
  steady: string
  pressureOverline: string
  airColumn: string
  stable: string
  temperatureOverline: string
  heatProfile: string
  windOverline: string
  crosswindFlow: string
  active: string
  comfortIndex: string
  dataNote: string
  today: string
  countryLabel: string
  quote: string
  askHeading: string
  justNow: string
  updatedPrefix: string
  liveContext: string
  summaryTemplate: string
  conditions: Record<string, string>
  greetings: {
    normal: string
    crop: string
    rain: string
    day: string
  }
}

type AboutCopy = {
  title: string
  mission: string
  missionText: string
  missionDetails?: string
  whatWeDo: string
  doItems: string[]
  keyFeatures: string
  featureItems: string[]
  approach: string
  approachQuote: string
  approachText: string
  development: string
  developmentText: string
  hackathon: string
  problemStatement: string
  organization: string
  department: string
  category: string
  theme: string
  tagline: string
}

const recommendations = [
  { icon: CloudRain, key: 'recRain', prompt: 'Will it rain tomorrow?' },
  { icon: Sun, key: 'recExplain', prompt: 'Explain today simply' },
  { icon: Wind, key: 'recWear', prompt: 'What should I wear?' },
  { icon: Droplets, key: 'recCrops', prompt: 'Best time for planting crops this week?' },
  { icon: Sparkles, key: 'recDay', prompt: 'How is my day looking?' },
] as const
const languageOptions = [
  { code: 'en', label: 'English', native: 'English', speech: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', speech: 'hi-IN' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', speech: 'bn-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', speech: 'mr-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', speech: 'ta-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', speech: 'te-IN' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', speech: 'gu-IN' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', speech: 'pa-IN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', speech: 'ml-IN' },
] as const

const REFRESH_INTERVAL_MS = 7000

const localeText: Record<LanguageCode, TranslationSet> = {
  en: {
    appName: 'WeatherGPT',
    demoMode: 'Demo mode',
    locationTitle: 'Where are you today?',
    popularCities: 'Popular cities',
    recommendedCities: 'Recommended cities',
    askPlaceholder: 'Ask about the weather...',
    askAi: 'Ask AI',
    weatherTab: 'Weather',
    alertsTab: 'Alerts',
    mapTab: 'Map',
    insightsTab: 'Insights',
    aboutTab: 'About',
    exploreQuestion: 'Explore a question',
    useVoice: 'Speak',
    languageTitle: 'Choose your language',
    languageSubtitle: 'Select your preferred language for the full app experience.',
    chooseLanguage: 'Choose language',
    continueLabel: 'Continue',
    greetingMorning: 'Good morning,',
    greetingAfternoon: 'Good afternoon,',
    greetingEvening: 'Good evening,',
    greetingNight: 'Good night,',
    locationEmpty: 'No cities found. Try a different spelling or check the online search.',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    windSpeed: 'Wind speed',
    wind: 'Wind',
    temperature: 'Temperature',
    visibility: 'Visibility',
    pressure: 'Pressure',
    next12Hours: 'NEXT 12 HOURS',
    todaysForecast: 'Today’s forecast',
    theWeekAhead: 'THE WEEK AHEAD',
    forecastRhythm: 'Forecast rhythm',
    sevenDays: '7 days',
    nowLabel: 'Now',
    askBannerTitle: 'Have a weather question?',
    askBannerSubtitle: 'Ask WeatherGPT anything about today.',
    aiSubtitle: 'Weather answers, grounded in real data',
    weatherLocationOverline: 'WEATHER LOCATION',
    searchCityPlaceholder: 'Search any city in India...',
    viewWeatherFor: 'View weather for',
    recRain: 'Will it rain tomorrow?',
    recExplain: 'Explain today simply',
    recWear: 'What should I wear?',
    recCrops: 'Best time for planting crops this week?',
    recDay: 'How is my day looking?',
    voiceUnsupported: 'Voice input is not supported in this browser yet. Use the text box instead.',
    initialMessage: 'Hi, I’m WeatherGPT. Ask me anything about the sky around you.',
    notWeatherReply: 'I can help with weather questions for {location}. Ask about today, rain, wind, humidity, or the next 7-day forecast.',
    outlookReply: 'The outlook for {location} is {summary}. Tomorrow is likely to be {high}°C to {low}°C with about {rain}% rain chance, so plan around a cooler late afternoon and keep your outdoor timing flexible.',
    yearReply: 'The live weather feed here is tuned to the current and next 7-day outlook for {location}, not a full-year climate model. Right now it is {condition} with {temp}°C and {humidity}% humidity.',
    cropExtra: '{location} has a {rain}% rain chance this week, and current conditions are around {temp}°C with manageable humidity, which is decent for sowing in the morning.',
    rainExtra: 'The current temperature is {temp}°C, feels like {feels}°C, and wind is {wind} km/h. A light rain cover is a smart idea today.',
    stayAhead: 'STAY AHEAD OF THE WEATHER',
    safetyCenter: 'Safety center',
    alertsSubtitle: 'Clear, timely alerts for {location} and nearby areas.',
    activeAlert: 'active alert',
    highPriority: 'HIGH PRIORITY',
    thunderstormAlert: 'Thunderstorm Alert',
    thunderstormDescription: 'A thunderstorm is likely nearby with gusty winds and reduced visibility. Stay indoors if possible and avoid open fields, metal structures, and water bodies until conditions clear.',
    callEmergency: 'Call emergency services',
    copyEmergency: 'Copy emergency no.',
    emergencyCopiedLabel: 'Emergency no. copied.',
    genericAlertDescription: 'Conditions may change quickly. Keep your plans flexible and check official local advisories before travelling.',
    important: 'Important',
    followOfficial: 'For critical warnings, always follow official authorities.',
    regionalView: 'REGIONAL VIEW',
    weatherMap: 'Weather map',
    conditionsAround: 'Conditions around {location}.',
    currentTemperature: 'Current temperature',
    surfaceWind: 'Surface wind',
    relativeHumidity: 'Relative humidity',
    liveConditions: 'Live conditions',
    mapDisclaimer: 'Map tiles from OpenStreetMap. Weather overlays are synchronized to the current local conditions.',
    climateIntelligence: 'CLIMATE INTELLIGENCE',
    seeThePattern: 'See the pattern',
    longTermSignals: 'A calm read of long-term signals for {location}.',
    weathergptReads: 'WEATHERGPT READS',
    insightBody: 'Conditions are anchored to live observations, and the selected range reflects a distinct {range} pattern.',
    dateRange: 'DATE RANGE',
    avgHigh: 'AVG HIGH',
    comfort: 'COMFORT',
    overallFeel: 'overall feel',
    rainExp: 'RAIN EXP.',
    expected: 'expected',
    rainLabel: 'RAIN',
    rainExpectancy: 'Rain expectancy',
    liveLabel: 'live',
    humidityOverline: 'HUMIDITY',
    moistureIndex: 'Moisture index',
    steady: 'steady',
    pressureOverline: 'PRESSURE',
    airColumn: 'Air column',
    stable: 'stable',
    temperatureOverline: 'TEMPERATURE',
    heatProfile: 'Heat profile',
    windOverline: 'WIND',
    crosswindFlow: 'Crosswind flow',
    active: 'active',
    comfortIndex: 'Comfort index',
    dataNote: 'Live weather observations and regional climate context for {location}',
    today: 'Today',
    countryLabel: 'India',
    quote: 'The best forecast is the one that helps you plan.',
    askHeading: 'Ask {brand}',
    justNow: 'just now',
    updatedPrefix: 'updated',
    liveContext: 'Live weather context',
    summaryTemplate: '{condition} with {humidity}% humidity and a comfortable breeze nearby.',
    conditions: {
      'Clear sky': 'Clear sky',
      'Mostly clear': 'Mostly clear',
      'Partly cloudy': 'Partly cloudy',
      'Sunny intervals': 'Sunny intervals',
      Overcast: 'Overcast',
      Foggy: 'Foggy',
      'Light drizzle': 'Light drizzle',
      Drizzle: 'Drizzle',
      'Heavy drizzle': 'Heavy drizzle',
      Rain: 'Rain',
      'Heavy rain': 'Heavy rain',
      Showers: 'Showers',
      'Heavy showers': 'Heavy showers',
      Thunderstorm: 'Thunderstorm',
      'Variable conditions': 'Variable conditions',
    },
    greetings: {
      normal: 'Hi! I am WeatherGPT. How is your day going, and how can I help with the weather?',
      crop: 'This week is suitable for planting, provided the soil stays moist and the rain stays moderate. I would aim for early morning or late evening sowing to reduce heat stress.',
      rain: 'Rain is likely later today, so carry light rain protection and keep outdoor plans flexible.',
      day: 'The day looks mostly steady with a comfortable breeze and a manageable temperature.',
    },
  },
  hi: {
    appName: 'वेदरजीपीटी',
    demoMode: 'डेमो मोड',
    locationTitle: 'आप आज कहाँ हैं?',
    popularCities: 'लोकप्रिय शहर',
    recommendedCities: 'सुझाए गए शहर',
    askPlaceholder: 'मौसम के बारे में पूछें...',
    askAi: 'एआई से पूछें',
    weatherTab: 'मौसम',
    alertsTab: 'अलर्ट',
    mapTab: 'मानचित्र',
    insightsTab: 'इनसाइट्स',
    aboutTab: 'परिचय',
    exploreQuestion: 'प्रश्न चुनें',
    useVoice: 'बोलें',
    languageTitle: 'अपनी भाषा चुनें',
    languageSubtitle: 'पूरा ऐप अपनी पसंदीदा भाषा में चलाने के लिए चुनें।',
    chooseLanguage: 'भाषा चुनें',
    continueLabel: 'जारी रखें',
    greetingMorning: 'सुप्रभात,',
    greetingAfternoon: 'शुभ दोपहर,',
    greetingEvening: 'शुभ संध्या,',
    greetingNight: 'शुभ रात्रि,',
    locationEmpty: 'कोई शहर नहीं मिला। दूसरा नाम आज़माएँ।',
    feelsLike: 'महसूस होता है',
    humidity: 'नमी',
    windSpeed: 'हवा की गति',
    wind: 'हवा',
    temperature: 'तापमान',
    visibility: 'दृश्यता',
    pressure: 'दबाव',
    next12Hours: 'अगले 12 घंटे',
    todaysForecast: 'आज का पूर्वानुमान',
    theWeekAhead: 'आने वाला सप्ताह',
    forecastRhythm: 'पूर्वानुमान लय',
    sevenDays: '7 दिन',
    nowLabel: 'अभी',
    askBannerTitle: 'मौसम का सवाल है?',
    askBannerSubtitle: 'WeatherGPT से आज के मौसम के बारे में पूछें।',
    aiSubtitle: 'वास्तविक डेटा पर आधारित मौसम उत्तर',
    weatherLocationOverline: 'मौसम स्थान',
    searchCityPlaceholder: 'भारत का कोई भी शहर खोजें...',
    viewWeatherFor: 'मौसम देखें',
    recRain: 'क्या कल बारिश होगी?',
    recExplain: 'आज का मौसम सरल भाषा में समझाइए',
    recWear: 'मुझे क्या पहनना चाहिए?',
    recCrops: 'इस सप्ताह फसल लगाने का सबसे अच्छा समय?',
    recDay: 'मेरा दिन कैसा जा रहा है?',
    voiceUnsupported: 'इस ब्राउज़र में वॉइस इनपुट अभी समर्थित नहीं है। कृपया टेक्स्ट बॉक्स का उपयोग करें।',
    initialMessage: 'नमस्ते! मैं WeatherGPT हूँ। आपके आसपास के मौसम के बारे में कुछ भी पूछें।',
    notWeatherReply: 'मैं {location} के मौसम के सवालों में मदद कर सकता हूँ। आज, बारिश, हवा, नमी या 7 दिन के पूर्वानुमान के बारे में पूछें।',
    outlookReply: '{location} का पूर्वानुमान {summary} है। कल शायद {high}°C से {low}°C तक रहेगा, बारिश की संभावना लगभग {rain}% है, इसलिए दोपहर बाद ठंडक और लचीली योजना रखें।',
    yearReply: 'यहाँ का लाइव मौसम फीड {location} के वर्तमान और अगले 7 दिनों के पूर्वानुमान तक सीमित है, पूरे साल के मॉडल तक नहीं। अभी {condition} है, तापमान {temp}°C और नमी {humidity}% है।',
    cropExtra: '{location} में इस सप्ताह बारिश की संभावना {rain}% है, और मौजूदा स्थिति लगभग {temp}°C है, जो सुबह बोने के लिए ठीक है।',
    rainExtra: 'मौजूदा तापमान {temp}°C है, महसूस होता है {feels}°C, और हवा {wind} किमी/घंटा है। आज हल्का रेन कवर रखना समझदारी है।',
    stayAhead: 'मौसम से एक कदम आगे रहें',
    safetyCenter: 'सुरक्षा केंद्र',
    alertsSubtitle: '{location} और आसपास के क्षेत्रों के लिए स्पष्ट और समय पर अलर्ट।',
    activeAlert: 'सक्रिय अलर्ट',
    highPriority: 'उच्च प्राथमिकता',
    thunderstormAlert: 'आंधी-तूफान चेतावनी',
    thunderstormDescription: 'आसपास आंधी-तूफान की संभावना है, तेज़ हवाएँ और कम दृश्यता संभव है। जहाँ तक संभव हो घर के अंदर रहें और खुले मैदान, धातु संरचनाओं और जल निकायों से बचें।',
    callEmergency: 'आपातकालीन सेवा को कॉल करें',
    copyEmergency: 'आपातकालीन नंबर कॉपी करें',
    emergencyCopiedLabel: 'आपातकालीन नंबर कॉपी हो गया।',
    genericAlertDescription: 'स्थितियाँ जल्दी बदल सकती हैं। यात्रा से पहले आधिकारिक स्थानीय सलाह जाँचें और योजनाएँ लचीली रखें।',
    important: 'महत्वपूर्ण',
    followOfficial: 'गंभीर चेतावनियों के लिए हमेशा आधिकारिक संस्थाओं का पालन करें।',
    regionalView: 'क्षेत्रीय दृश्य',
    weatherMap: 'मौसम नक्शा',
    conditionsAround: '{location} के आसपास की स्थितियाँ।',
    currentTemperature: 'वर्तमान तापमान',
    surfaceWind: 'सतही हवा',
    relativeHumidity: 'सापेक्ष नमी',
    liveConditions: 'लाइव स्थितियाँ',
    mapDisclaimer: 'नक्शे OpenStreetMap से। मौसम ओवरले वर्तमान स्थानीय स्थितियों के साथ सिंक्रनाइज़ हैं।',
    climateIntelligence: 'जलवायु बुद्धिमत्ता',
    seeThePattern: 'पैटर्न देखें',
    longTermSignals: '{location} के दीर्घकालिक संकेतों का शांत विश्लेषण।',
    weathergptReads: 'WEATHERGPT का पठन',
    insightBody: 'स्थितियाँ लाइव अवलोकनों पर आधारित हैं, और चुनी गई अवधि एक स्पष्ट {range} पैटर्न दिखाती है।',
    dateRange: 'तिथि सीमा',
    avgHigh: 'औसत अधिकतम',
    comfort: 'आराम',
    overallFeel: 'समग्र अनुभूति',
    rainExp: 'बारिश संभावना',
    expected: 'अनुमानित',
    rainLabel: 'बारिश',
    rainExpectancy: 'बारिश की संभावना',
    liveLabel: 'लाइव',
    humidityOverline: 'नमी',
    moistureIndex: 'आर्द्रता सूचकांक',
    steady: 'स्थिर',
    pressureOverline: 'दबाव',
    airColumn: 'वायु स्तंभ',
    stable: 'स्थिर',
    temperatureOverline: 'तापमान',
    heatProfile: 'गर्मी प्रोफ़ाइल',
    windOverline: 'हवा',
    crosswindFlow: 'अनुप्रस्थ हवा प्रवाह',
    active: 'सक्रिय',
    comfortIndex: 'आराम सूचकांक',
    dataNote: '{location} के लिए लाइव मौसम अवलोकन और क्षेत्रीय जलवायु संदर्भ',
    today: 'आज',
    countryLabel: 'भारत',
    quote: 'सबसे अच्छा पूर्वानुमान वही है जो योजना बनाने में मदद करे।',
    askHeading: '{brand} से पूछें',
    justNow: 'अभी',
    updatedPrefix: 'अपडेट',
    liveContext: 'लाइव मौसम संदर्भ',
    summaryTemplate: '{condition}, नमी {humidity}% और आसपास सुखद हवा।',
    conditions: {
      'Clear sky': 'साफ़ आसमान',
      'Mostly clear': 'ज़्यादातर साफ़',
      'Partly cloudy': 'आंशिक बादल',
      'Sunny intervals': 'बीच-बीच में धूप',
      Overcast: 'बादल छाए',
      Foggy: 'कोहरा',
      'Light drizzle': 'बूंदाबांदी',
      Drizzle: 'बूंदाबांदी',
      'Heavy drizzle': 'तेज़ बूंदाबांदी',
      Rain: 'बारिश',
      'Heavy rain': 'तेज़ बारिश',
      Showers: 'बौछारें',
      'Heavy showers': 'तेज़ बौछारें',
      Thunderstorm: 'आंधी-तूफ़ान',
      'Variable conditions': 'बदलता मौसम',
    },
    greetings: {
      normal: 'नमस्ते! मैं वेदरजीपीटी हूँ। आपका दिन कैसा चल रहा है? मौसम के बारे में मैं आपकी मदद कर सकता हूँ।',
      crop: 'इस सप्ताह फसल लगाना ठीक रहेगा, बशर्ते मिट्टी नम रहे और बारिश मध्यम स्तर की रहे। पाला और गर्मी से बचने के लिए सुबह या देर शाम बोना सही रहेगा।',
      rain: 'आज बाद में बारिश की संभावना है, इसलिए हल्का रेन कवर लेकर चलें और बाहरी योजनाएँ थोड़ा लचीली रखें।',
      day: 'आज का दिन सामान्य रूप से संतुलित है, हल्की हवा है और तापमान सहनीय है।',
    },
  },
  bn: {
    appName: 'ওয়েদারজিপিটি',
    demoMode: 'ডেমো মোড',
    locationTitle: 'আপনি আজ কোথায়?',
    popularCities: 'জনপ্রিয় শহর',
    recommendedCities: 'সুপারিশকৃত শহর',
    askPlaceholder: 'আবহাওয়া সম্পর্কে জিজ্ঞেস করুন...',
    askAi: 'এআই জিজ্ঞাসা',
    weatherTab: 'আবহাওয়া',
    alertsTab: 'সতর্কতা',
    mapTab: 'মানচিত্র',
    insightsTab: 'ইনসাইটস',
    aboutTab: 'সম্পর্কে',
    exploreQuestion: 'একটি প্রশ্ন বেছে নিন',
    useVoice: 'কথুন',
    languageTitle: 'আপনার ভাষা নির্বাচন করুন',
    languageSubtitle: 'সম্পূর্ণ অ্যাপটি আপনার পছন্দের ভাষায় দেখতে বেছে নিন।',
    chooseLanguage: 'ভাষা বেছে নিন',
    continueLabel: 'চালিয়ে যান',
    greetingMorning: 'শুভ সকাল,',
    greetingAfternoon: 'শুভ অপরাহ্ন,',
    greetingEvening: 'শুভ সন্ধ্যা,',
    greetingNight: 'শুভ রাত্রি,',
    locationEmpty: 'কোনো শহর পাওয়া যায়নি।',
    feelsLike: 'অনুভূত হয়',
    humidity: 'আর্দ্রতা',
    windSpeed: 'বাতাসের গতি',
    wind: 'বাতাস',
    temperature: 'তাপমাত্রা',
    visibility: 'দৃশ্যমানতা',
    pressure: 'চাপ',
    next12Hours: 'পরবর্তী ১২ ঘণ্টা',
    todaysForecast: 'আজকের পূর্বাভাস',
    theWeekAhead: 'আসন্ন সপ্তাহ',
    forecastRhythm: 'পূর্বাভাসের ছন্দ',
    sevenDays: '৭ দিন',
    nowLabel: 'এখন',
    askBannerTitle: 'আবহাওয়া নিয়ে প্রশ্ন আছে?',
    askBannerSubtitle: 'WeatherGPT-কে আজকের আবহাওয়া নিয়ে যা খুশি জিজ্ঞাসা করুন।',
    aiSubtitle: 'প্রকৃত ডেটার উপর ভিত্তি করে আবহাওয়ার উত্তর',
    weatherLocationOverline: 'আবহাওয়ার অবস্থান',
    searchCityPlaceholder: 'ভারতের যেকোনো শহর খুঁজুন...',
    viewWeatherFor: 'আবহাওয়া দেখুন',
    recRain: 'আগামীকাল কি বৃষ্টি হবে?',
    recExplain: 'আজকের আবহাওয়া সহজ ভাষায় বলুন',
    recWear: 'আমি কী পরব?',
    recCrops: 'এই সপ্তাহে ফসল রোপণের সেরা সময় কখন?',
    recDay: 'আমার দিন কেমন যাচ্ছে?',
    voiceUnsupported: 'এই ব্রাউজারে ভয়েস ইনপুট এখনও সমর্থিত নয়। টেক্সট বক্স ব্যবহার করুন।',
    initialMessage: 'হ্যালো! আমি WeatherGPT। আপনার আশেপাশের আবহাওয়া নিয়ে যা খুশি জিজ্ঞাসা করুন।',
    notWeatherReply: 'আমি {location}-এর আবহাওয়া সংক্রান্ত প্রশ্নে সাহায্য করতে পারি। আজ, বৃষ্টি, বাতাস, আর্দ্রতা বা ৭ দিনের পূর্বাভাস নিয়ে জিজ্ঞাসা করুন।',
    outlookReply: '{location}-এর অবস্থা {summary}। আগামীকাল সম্ভবত {high}°C থেকে {low}°C এবং প্রায় {rain}% বৃষ্টির সম্ভাবনা, তাই পরিকল্পনা নমনীয় রাখুন।',
    yearReply: 'এখানকার লাইভ ফিড {location}-এর বর্তমান ও আগামী ৭ দিনের পূর্বাভাসে সীমাবদ্ধ, সারা বছরের মডেল নয়। এখন {condition}, তাপমাত্রা {temp}°C এবং আর্দ্রতা {humidity}%।',
    cropExtra: '{location}-এ এই সপ্তাহে বৃষ্টির সম্ভাবনা {rain}%, এবং বর্তমান অবস্থা প্রায় {temp}°C, যা সকালে বপনের জন্য ভালো।',
    rainExtra: 'বর্তমান তাপমাত্রা {temp}°C, অনুভূত {feels}°C, বাতাস {wind} কিমি/ঘণ্টা। আজ হালকা রেইন কভার রাখা ভালো।',
    stayAhead: 'আবহাওয়ার এক ধাপ এগিয়ে থাকুন',
    safetyCenter: 'নিরাপত্তা কেন্দ্র',
    alertsSubtitle: '{location} ও আশেপাশের এলাকার জন্য স্পষ্ট ও সময়মতো সতর্কতা।',
    activeAlert: 'সক্রিয় সতর্কতা',
    highPriority: 'উচ্চ অগ্রাধিকার',
    thunderstormAlert: 'বজ্রঝড় সতর্কতা',
    thunderstormDescription: 'কাছাকাছি বজ্রঝড়ের সম্ভাবনা, দমকা হাওয়া ও কম দৃশ্যমানতা সম্ভব। যতটা সম্ভব ঘরের ভেতরে থাকুন এবং খোলা মাঠ, ধাতব কাঠামো ও জলাশয় এড়িয়ে চলুন।',
    callEmergency: 'জরুরি সেবায় কল করুন',
    copyEmergency: 'জরুরি নম্বর কপি করুন',
    emergencyCopiedLabel: 'জরুরি নম্বর কপি হয়েছে।',
    genericAlertDescription: 'পরিস্থিতি দ্রুত বদলাতে পারে। ভ্রমণের আগে সরকারি পরামর্শ দেখে নিন এবং পরিকল্পনা নমনীয় রাখুন।',
    important: 'গুরুত্বপূর্ণ',
    followOfficial: 'গুরুতর সতর্কবার্তায় সবসময় সরকারি নির্দেশ মানুন।',
    regionalView: 'আঞ্চলিক দৃশ্য',
    weatherMap: 'আবহাওয়ার মানচিত্র',
    conditionsAround: '{location}-এর আশেপাশের অবস্থা।',
    currentTemperature: 'বর্তমান তাপমাত্রা',
    surfaceWind: 'পৃষ্ঠ বাতাস',
    relativeHumidity: 'আপেক্ষিক আর্দ্রতা',
    liveConditions: 'লাইভ অবস্থা',
    mapDisclaimer: 'মানচিত্র OpenStreetMap থেকে। আবহাওয়ার ওভারলে বর্তমান স্থানীয় অবস্থার সাথে সমন্বিত।',
    climateIntelligence: 'জলবায়ু বিশ্লেষণ',
    seeThePattern: 'প্যাটার্ন দেখুন',
    longTermSignals: '{location}-এর দীর্ঘমেয়াদি সংকেতের শান্ত বিশ্লেষণ।',
    weathergptReads: 'WEATHERGPT পড়ছে',
    insightBody: 'অবস্থা লাইভ পর্যবেক্ষণের উপর ভিত্তি করে, এবং নির্বাচিত সময়সীমা একটি স্বতন্ত্র {range} প্যাটার্ন দেখায়।',
    dateRange: 'তারিখ সীমা',
    avgHigh: 'গড় সর্বোচ্চ',
    comfort: 'আরাম',
    overallFeel: 'সামগ্রিক অনুভূতি',
    rainExp: 'বৃষ্টি সম্ভাবনা',
    expected: 'প্রত্যাশিত',
    rainLabel: 'বৃষ্টি',
    rainExpectancy: 'বৃষ্টির সম্ভাবনা',
    liveLabel: 'লাইভ',
    humidityOverline: 'আর্দ্রতা',
    moistureIndex: 'আর্দ্রতা সূচক',
    steady: 'স্থির',
    pressureOverline: 'চাপ',
    airColumn: 'বায়ু স্তম্ভ',
    stable: 'স্থিতিশীল',
    temperatureOverline: 'তাপমাত্রা',
    heatProfile: 'তাপ প্রোফাইল',
    windOverline: 'বাতাস',
    crosswindFlow: 'আড় বাতাস প্রবাহ',
    active: 'সক্রিয়',
    comfortIndex: 'আরাম সূচক',
    dataNote: '{location}-এর জন্য লাইভ আবহাওয়া পর্যবেক্ষণ ও আঞ্চলিক জলবায়ু প্রেক্ষাপট',
    today: 'আজ',
    countryLabel: 'ভারত',
    quote: 'সেরা পূর্বাভাস সেটিই যা পরিকল্পনায় সাহায্য করে।',
    askHeading: '{brand}-কে জিজ্ঞাসা করুন',
    justNow: 'এই মুহূর্তে',
    updatedPrefix: 'আপডেট',
    liveContext: 'লাইভ আবহাওয়ার প্রেক্ষাপট',
    summaryTemplate: '{condition}, আর্দ্রতা {humidity}% এবং আশেপাশে মৃদু বাতাস।',
    conditions: {
      'Clear sky': 'পরিষ্কার আকাশ',
      'Mostly clear': 'প্রায় পরিষ্কার',
      'Partly cloudy': 'আংশিক মেঘলা',
      'Sunny intervals': 'মাঝে মাঝে রোদ',
      Overcast: 'মেঘলা',
      Foggy: 'কুয়াশা',
      'Light drizzle': 'গুঁড়ি বৃষ্টি',
      Drizzle: 'গুঁড়ি বৃষ্টি',
      'Heavy drizzle': 'ভারী গুঁড়ি বৃষ্টি',
      Rain: 'বৃষ্টি',
      'Heavy rain': 'ভারী বৃষ্টি',
      Showers: 'বৃষ্টির ঝাপটা',
      'Heavy showers': 'ভারী বৃষ্টির ঝাপটা',
      Thunderstorm: 'বজ্রঝড়',
      'Variable conditions': 'পরিবর্তনশীল আবহাওয়া',
    },
    greetings: {
      normal: 'হ্যালো! আমি ওয়েদারজিপিটি। আপনার দিন কেমন যাচ্ছে? আবহাওয়া নিয়ে আমি সাহায্য করতে পারি।',
      crop: 'এই সপ্তাহে বীজ বপন করা ভালো, যদি মাটি আর্দ্র থাকে এবং বৃষ্টি মাঝারি থাকে। গরমে স্ট্রেস কমাতে সকাল বা বিকেলের দিকে বপন ideal।',
      rain: 'আজকের পরে বৃষ্টির সম্ভাবনা আছে, তাই হালকা রেইন কভার রাখুন এবং বাহিরের পরিকল্পনা কিছুটা নমনীয় রাখুন।',
      day: 'আজকের দিন তুলনামূলকভাবে স্থির, হালকা বাতাস এবং সহনীয় তাপমাত্রা আছে।',
    },
  },
  mr: {
    appName: 'वेदरजीपीटी',
    demoMode: 'डेमो मोड',
    locationTitle: 'तुम्ही आज कुठे आहात?',
    popularCities: 'लोकप्रिय शहरे',
    recommendedCities: 'शिफारस केलेली शहरे',
    askPlaceholder: 'हवामानाबद्दल विचारणा करा...',
    askAi: 'एआय विचारा',
    weatherTab: 'हवामान',
    alertsTab: 'अलर्ट',
    mapTab: 'नकाशा',
    insightsTab: 'इन्साइट्स',
    aboutTab: 'बद्दल',
    exploreQuestion: 'प्रश्न निवडा',
    useVoice: 'बोलणे',
    languageTitle: 'तुमची भाषा निवडा',
    languageSubtitle: 'संपूर्ण अॅप तुमच्या पसंतीची भाषा मध्ये पाहण्यासाठी निवडा.',
    chooseLanguage: 'भाषा निवडा',
    continueLabel: 'सुरू ठेवा',
    greetingMorning: 'शुभ प्रभात,',
    greetingAfternoon: 'शुभ दुपार,',
    greetingEvening: 'शुभ संध्याकाळ,',
    greetingNight: 'शुभ रात्री,',
    locationEmpty: 'शहर सापडले नाही. दुसरे स्पेलिंग वापरून पहा.',
    feelsLike: 'वाटते',
    humidity: 'आर्द्रता',
    windSpeed: 'वाऱ्याचा वेग',
    wind: 'वारा',
    temperature: 'तापमान',
    visibility: 'दृश्यमानता',
    pressure: 'दाब',
    next12Hours: 'पुढील १२ तास',
    todaysForecast: 'आजचा अंदाज',
    theWeekAhead: 'येता आठवडा',
    forecastRhythm: 'अंदाजाची लय',
    sevenDays: '७ दिवस',
    nowLabel: 'आता',
    askBannerTitle: 'हवामानाचा प्रश्न आहे का?',
    askBannerSubtitle: 'WeatherGPT ला आजच्या हवामानाबद्दल काहीही विचारा.',
    aiSubtitle: 'प्रत्यक्ष डेटावर आधारित हवामान उत्तरे',
    weatherLocationOverline: 'हवामान स्थान',
    searchCityPlaceholder: 'भारतातील कोणतेही शहर शोधा...',
    viewWeatherFor: 'हवामान पहा',
    recRain: 'उद्या पाऊस पडेल का?',
    recExplain: 'आजचे हवामान सोप्या भाषेत सांगा',
    recWear: 'मला काय घालावे?',
    recCrops: 'या आठवड्यात पीक लावण्याची सर्वोत्तम वेळ?',
    recDay: 'माझा दिवस कसा जात आहे?',
    voiceUnsupported: 'या ब्राउझरमध्ये आवाज इनपुट अजून समर्थित नाही. मजकूर बॉक्स वापरा.',
    initialMessage: 'नमस्कार! मी WeatherGPT आहे. तुमच्या आसपासच्या हवामानाबद्दल काहीही विचारा.',
    notWeatherReply: 'मी {location} च्या हवामानाबद्दल प्रश्नांमध्ये मदत करू शकतो. आज, पाऊस, वारा, आर्द्रता किंवा ७ दिवसांचा अंदाज याबद्दल विचारा.',
    outlookReply: '{location} चा अंदाज {summary} आहे. उद्या बहुधा {high}°C ते {low}°C आणि {rain}% पावसाची शक्यता, त्यामुळे नियोजन लवचिक ठेवा.',
    yearReply: 'येथील लाइव्ह फीड {location} च्या चालू आणि पुढील ७ दिवसांच्या अंदाजापर्यंत मर्यादित आहे, संपूर्ण वर्षाच्या मॉडेलपर्यंत नाही. आता {condition}, तापमान {temp}°C आणि आर्द्रता {humidity}%.',
    cropExtra: '{location} मध्ये या आठवड्यात {rain}% पावसाची शक्यता आहे, आणि सध्याची स्थिती सुमारे {temp}°C आहे, जे सकाळी लावणीसाठी योग्य आहे.',
    rainExtra: 'सध्याचे तापमान {temp}°C आहे, वाटते {feels}°C, आणि वारा {wind} किमी/तास आहे. आज हलका रेन कव्हर ठेवणे चांगले.',
    stayAhead: 'हवामानाच्या एक पाऊल पुढे रहा',
    safetyCenter: 'सुरक्षा केंद्र',
    alertsSubtitle: '{location} आणि आसपासच्या भागांसाठी स्पष्ट आणि वेळेवर सूचना.',
    activeAlert: 'सक्रिय सूचना',
    highPriority: 'उच्च प्राधान्य',
    thunderstormAlert: 'गारपीट/वादळ सूचना',
    thunderstormDescription: 'आसपास वादळाची शक्यता आहे, जोरदार वारे आणि कमी दृश्यमानता शक्य. शक्य असेल तर घरात राहा आणि उघडा मैदान, धातूची संरचना आणि पाण्याचे स्रोत टाळा.',
    callEmergency: 'आपत्कालीन सेवेला कॉल करा',
    copyEmergency: 'आपत्कालीन नंबर कॉपी करा',
    emergencyCopiedLabel: 'आपत्कालीन नंबर कॉपी झाला.',
    genericAlertDescription: 'परिस्थिती लवकर बदलू शकते. प्रवासापूर्वी अधिकृत स्थानिक सल्लामसलत तपासा आणि नियोजन लवचिक ठेवा.',
    important: 'महत्त्वाचे',
    followOfficial: 'गंभीर इशाऱ्यांसाठी नेहमी अधिकृत संस्थांचे पालन करा.',
    regionalView: 'प्रादेशिक दृश्य',
    weatherMap: 'हवामान नकाशा',
    conditionsAround: '{location} आसपासची स्थिती.',
    currentTemperature: 'सध्याचे तापमान',
    surfaceWind: 'पृष्ठभागावरील वारा',
    relativeHumidity: 'सापेक्ष आर्द्रता',
    liveConditions: 'थेट स्थिती',
    mapDisclaimer: 'नकाशे OpenStreetMap कडून. हवामान ओव्हरले सध्याच्या स्थानिक परिस्थितीशी समकालीन आहेत.',
    climateIntelligence: 'हवामान बुद्धिमत्ता',
    seeThePattern: 'पॅटर्न पहा',
    longTermSignals: '{location} च्या दीर्घकालीन संकेतांचे शांत विश्लेषण.',
    weathergptReads: 'WEATHERGPT वाचन',
    insightBody: 'परिस्थिती थेट निरीक्षणांवर आधारित आहे, आणि निवडलेली मुदत एक वेगळा {range} पॅटर्न दर्शवते.',
    dateRange: 'तारीख श्रेणी',
    avgHigh: 'सरासरी कमाल',
    comfort: 'आराम',
    overallFeel: 'एकूण अनुभव',
    rainExp: 'पावसाची शक्यता',
    expected: 'अपेक्षित',
    rainLabel: 'पाऊस',
    rainExpectancy: 'पावसाची शक्यता',
    liveLabel: 'थेट',
    humidityOverline: 'आर्द्रता',
    moistureIndex: 'आर्द्रता निर्देशांक',
    steady: 'स्थिर',
    pressureOverline: 'दाब',
    airColumn: 'वायु स्तंभ',
    stable: 'स्थिर',
    temperatureOverline: 'तापमान',
    heatProfile: 'उष्णता प्रोफाइल',
    windOverline: 'वारा',
    crosswindFlow: 'आडवा वाऱ्याचा प्रवाह',
    active: 'सक्रिय',
    comfortIndex: 'आराम निर्देशांक',
    dataNote: '{location} साठी थेट हवामान निरीक्षणे आणि प्रादेशिक हवामान संदर्भ',
    today: 'आज',
    countryLabel: 'भारत',
    quote: 'सर्वोत्तम अंदाज तोच जो नियोजनात मदत करतो.',
    askHeading: '{brand} ला विचारा',
    justNow: 'आत्ताच',
    updatedPrefix: 'अपडेट',
    liveContext: 'थेट हवामान संदर्भ',
    summaryTemplate: '{condition}, आर्द्रता {humidity}% आणि आसपास सुखद वारा.',
    conditions: {
      'Clear sky': 'निर्भळ आकाश',
      'Mostly clear': 'बहुतेक निर्भळ',
      'Partly cloudy': 'अंशतः ढगाळ',
      'Sunny intervals': 'मधूनमधून सूर्यप्रकाश',
      Overcast: 'ढगाळ',
      Foggy: 'धुके',
      'Light drizzle': 'सरकसरक पाऊस',
      Drizzle: 'सरकसरक पाऊस',
      'Heavy drizzle': 'जोरदार सरकसरक पाऊस',
      Rain: 'पाऊस',
      'Heavy rain': 'मुसळधार पाऊस',
      Showers: 'पावसाचे संचार',
      'Heavy showers': 'जोरदार पावसाचे संचार',
      Thunderstorm: 'वादळ',
      'Variable conditions': 'बदलते हवामान',
    },
    greetings: {
      normal: 'नमस्कार! मी वेदरजीपीटी आहे. तुमचा दिवस कसा चालला आहे? हवामानाबद्दल मी मदत करू शकतो.',
      crop: 'या आठवड्यात पीक लावणे चांगले आहे, जर माती ओलसर राहील आणि पाऊस मध्यम रहील. उष्णतेपासून सुरक्षित राहण्यासाठी सकाळी किंवा संध्याकाळी लावणे योग्य आहे.',
      rain: 'आज नंतर पाऊस पडण्याची शक्यता आहे, म्हणून हलका रेन कव्हर घ्या आणि बाह्य कार्यक्रम काहीशी लवचिक ठेवा.',
      day: 'आजचा दिवस संतुलित आहे, हलका वारा आहे आणि तापमान नियंत्रित आहे.',
    },
  },
  ta: {
    appName: 'வெதர்ஜிபிடி',
    demoMode: 'டேமோ மோட்',
    locationTitle: 'இன்று நீங்கள் எங்கே இருக்கிறீர்கள்?',
    popularCities: 'பிரபலமான நகரங்கள்',
    recommendedCities: 'பரிந்துரைக்கப்பட்ட நகரங்கள்',
    askPlaceholder: 'வானிலை குறித்து கேளுங்கள்...',
    askAi: 'ஏஐ கேளுங்கள்',
    weatherTab: 'வானிலை',
    alertsTab: 'எச்சரிக்கைகள்',
    mapTab: 'வரைபடம்',
    insightsTab: 'உணர்வுகள்',
    aboutTab: 'பற்றி',
    exploreQuestion: 'ஒரு கேள்வியை தேர்வு செய்யுங்கள்',
    useVoice: 'பேசுங்கள்',
    languageTitle: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    languageSubtitle: 'முழு அப்அபையும் விரும்பிய மொழியில் பயன்படுத்தவும்.',
    chooseLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
    continueLabel: 'தொடரவும்',
    greetingMorning: 'காலை வணக்கம்,',
    greetingAfternoon: 'மதிய வணக்கம்,',
    greetingEvening: 'மாலை வணக்கம்,',
    greetingNight: 'இரவு வணக்கம்,',
    locationEmpty: 'நகரம் கிடைக்கவில்லை. வேறு எழுத்துப்பிழையில் முயற்சிக்கவும்.',
    feelsLike: 'உணரப்படும்',
    humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்றின் வேகம்',
    wind: 'காற்று',
    temperature: 'வெப்பநிலை',
    visibility: 'தெரிவுநிலை',
    pressure: 'அழுத்தம்',
    next12Hours: 'அடுத்த 12 மணி',
    todaysForecast: 'இன்றைய முன்னறிவிப்பு',
    theWeekAhead: 'வரும் வாரம்',
    forecastRhythm: 'முன்னறிவிப்பு தாளம்',
    sevenDays: '7 நாட்கள்',
    nowLabel: 'இப்போது',
    askBannerTitle: 'வானிலை கேள்வி உள்ளதா?',
    askBannerSubtitle: 'WeatherGPT இடம் இன்றைய வானிலை பற்றி எதையும் கேளுங்கள்.',
    aiSubtitle: 'உண்மையான தரவின் அடிப்படையில் வானிலை பதில்கள்',
    weatherLocationOverline: 'வானிலை இடம்',
    searchCityPlaceholder: 'இந்தியாவில் எந்த நகரத்தையும் தேடுங்கள்...',
    viewWeatherFor: 'வானிலையைப் பார்',
    recRain: 'நாளை மழை பெய்யுமா?',
    recExplain: 'இன்றைய வானிலையை எளிதாக விளக்குங்கள்',
    recWear: 'நான் என்ன அணிய வேண்டும்?',
    recCrops: 'இந்த வாரம் பயிர் நடவு செய்ய சிறந்த நேரம் எது?',
    recDay: 'என் நாள் எப்படி இருக்கிறது?',
    voiceUnsupported: 'இந்த உலாவியில் குரல் உள்ளீடு இன்னும் ஆதரிக்கப்படவில்லை. உரை பெட்டியைப் பயன்படுத்துங்கள்.',
    initialMessage: 'வணக்கம்! நான் WeatherGPT. உங்களை சுற்றியுள்ள வானிலை பற்றி எதையும் கேளுங்கள்.',
    notWeatherReply: '{location} வானிலை கேள்விகளில் நான் உதவ முடியும். இன்று, மழை, காற்று, ஈரப்பதம் அல்லது 7 நாள் முன்னறிவிப்பு பற்றி கேளுங்கள்.',
    outlookReply: '{location} க்கான முன்னோட்டம் {summary}. நாளை பெரும்பாலும் {high}°C முதல் {low}°C வரை, சுமார் {rain}% மழை வாய்ப்பு, எனவே திட்டமிடலை நெகிழ்வாக வைக்கவும்.',
    yearReply: 'இங்குள்ள நேரடி ஊட்டம் {location} இன் தற்போதைய மற்றும் அடுத்த 7 நாள் முன்னறிவிப்பிற்கு மட்டுமே, ஆண்டு முழுவதும் அல்ல. இப்போது {condition}, வெப்பநிலை {temp}°C மற்றும் ஈரப்பதம் {humidity}%.',
    cropExtra: '{location} இல் இந்த வாரம் {rain}% மழை வாய்ப்பு உள்ளது, தற்போதைய நிலை சுமார் {temp}°C, காலை நடவுக்கு ஏற்றது.',
    rainExtra: 'தற்போதைய வெப்பநிலை {temp}°C, {feels}°C போல உணரப்படுகிறது, காற்று {wind} கி.மீ/மணி. இன்று லேசான மழை பாதுகாப்பு வைப்பது நல்லது.',
    stayAhead: 'வானிலையில் ஒரு அடி முன்னேறுங்கள்',
    safetyCenter: 'பாதுகாப்பு மையம்',
    alertsSubtitle: '{location} மற்றும் அருகிலுள்ள பகுதிகளுக்கு தெளிவான, சரியான நேர எச்சரிக்கைகள்.',
    activeAlert: 'செயலில் உள்ள எச்சரிக்கை',
    highPriority: 'உயர் முன்னுரிமை',
    thunderstormAlert: 'இடி மின்னல் எச்சரிக்கை',
    thunderstormDescription: 'அருகில் இடி மின்னல் வாய்ப்பு, பலத்த காற்று மற்றும் குறைந்த தெரிவுநிலை இருக்கலாம். முடிந்தவரை வீட்டிற்குள் இருங்கள், திறந்த வெளி, உலோக அமைப்புகள் மற்றும் நீர்நிலைகளைத் தவிர்க்கவும்.',
    callEmergency: 'அவசர சேவையை அழைக்கவும்',
    copyEmergency: 'அவசர எண்ணை நகலெடுக்கவும்',
    emergencyCopiedLabel: 'அவசர எண் நகலெடுக்கப்பட்டது.',
    genericAlertDescription: 'நிலைமைகள் விரைவாக மாறலாம். பயணத்திற்கு முன் அதிகாரப்பூர்வ உள்ளூர் ஆலோசனைகளை சரிபார்த்து திட்டங்களை நெகிழ்வாக வைக்கவும்.',
    important: 'முக்கியம்',
    followOfficial: 'கடுமையான எச்சரிக்கைகளுக்கு எப்போதும் அதிகாரப்பூர்வ அமைப்புகளைப் பின்பற்றுங்கள்.',
    regionalView: 'பிராந்திய பார்வை',
    weatherMap: 'வானிலை வரைபடம்',
    conditionsAround: '{location} சுற்றியுள்ள நிலைமைகள்.',
    currentTemperature: 'தற்போதைய வெப்பநிலை',
    surfaceWind: 'மேற்பரப்பு காற்று',
    relativeHumidity: 'சார்பு ஈரப்பதம்',
    liveConditions: 'நேரடி நிலைமைகள்',
    mapDisclaimer: 'OpenStreetMap இலிருந்து வரைபடங்கள். வானிலை மேலடுக்குகள் தற்போதைய உள்ளூர் நிலைமைகளுடன் ஒத்திசைக்கப்படுகின்றன.',
    climateIntelligence: 'காலநிலை நுண்ணறிவு',
    seeThePattern: 'பேட்டர்னைப் பாருங்கள்',
    longTermSignals: '{location} க்கான நீண்டகால சமிக்ஞைகளின் அமைதி வாசிப்பு.',
    weathergptReads: 'WEATHERGPT வாசிப்பு',
    insightBody: 'நிலைமைகள் நேரடி அவதானிப்புகளில் நிலைநாட்டப்படுகின்றன, மேலும் தேர்ந்தெடுக்கப்பட்ட காலம் ஒரு தனித்துவமான {range} பேட்டர்னைக் காட்டுகிறது.',
    dateRange: 'தேதி வரம்பு',
    avgHigh: 'சராசரி உயர்',
    comfort: 'வசதி',
    overallFeel: 'ஒட்டுமொத்த உணர்வு',
    rainExp: 'மழை வாய்ப்பு',
    expected: 'எதிர்பார்க்கப்படுகிறது',
    rainLabel: 'மழை',
    rainExpectancy: 'மழை வாய்ப்பு',
    liveLabel: 'நேரடி',
    humidityOverline: 'ஈரப்பதம்',
    moistureIndex: 'ஈரப்பத குறியீடு',
    steady: 'நிலையான',
    pressureOverline: 'அழுத்தம்',
    airColumn: 'காற்று நெடுவரிசை',
    stable: 'நிலையான',
    temperatureOverline: 'வெப்பநிலை',
    heatProfile: 'வெப்ப பாத்திரம்',
    windOverline: 'காற்று',
    crosswindFlow: 'குறுக்கு காற்று ஓட்டம்',
    active: 'செயலில்',
    comfortIndex: 'வசதி குறியீடு',
    dataNote: '{location} க்கான நேரடி வானிலை அவதானிப்புகள் மற்றும் பிராந்திய காலநிலை சூழல்',
    today: 'இன்று',
    countryLabel: 'இந்தியா',
    quote: 'திட்டமிட உதவும் முன்னறிவிப்பே சிறந்தது.',
    askHeading: '{brand} இடம் கேளுங்கள்',
    justNow: 'இப்போது',
    updatedPrefix: 'புதுப்பிக்கப்பட்டது',
    liveContext: 'நேரடி வானிலை சூழல்',
    summaryTemplate: '{condition}, ஈரப்பதம் {humidity}% மற்றும் அருகில் இதமான காற்று.',
    conditions: {
      'Clear sky': 'தெளிவான வானம்',
      'Mostly clear': 'பெரும்பாலும் தெளிவு',
      'Partly cloudy': 'பகுதி மேகமூட்டம்',
      'Sunny intervals': 'இடைஇடையே வெயில்',
      Overcast: 'மேகமூட்டம்',
      Foggy: 'மூடுபனி',
      'Light drizzle': 'தூறல்',
      Drizzle: 'தூறல்',
      'Heavy drizzle': 'கனத்த தூறல்',
      Rain: 'மழை',
      'Heavy rain': 'கனமழை',
      Showers: 'மழைப்பொழிவு',
      'Heavy showers': 'கனமழைப்பொழிவு',
      Thunderstorm: 'இடிமழை',
      'Variable conditions': 'மாறும் நிலை',
    },
    greetings: {
      normal: 'வணக்கம்! நான் வெதர்ஜிபிடி. உங்கள் நாள் எப்படி செல்கிறது? வானிலை குறித்து நான் உதவ முடியும்.',
      crop: 'இந்த வாரம் பயிர் நடவு செய்வதற்கு நல்லது, மண் ஈரமாக இருந்தால் மற்றும் மழை மிதமாக இருந்தால். வெப்ப அழுத்தத்தைக் குறைக்க காலை அல்லது மாலை நடவு செய்யலாம்.',
      rain: 'இன்று பிற்பகுதியில் மழை பெய்யும் வாய்ப்பு உள்ளது, எனவே லேசான குடை எடுத்துச் செல்லுங்கள் மற்றும் வெளிப்புற திட்டங்களை நெகிழ்வாக வைத்துக்கொள்ளுங்கள்.',
      day: 'இன்று நாள் ஒப்பீட்டளவில் சீராக உள்ளது, லேசான காற்று மற்றும் வசதியான வெப்பநிலை உள்ளது.',
    },
  },
  te: {
    appName: 'వెదర్‌జీపీటీ',
    demoMode: 'డెమో మోడ్',
    locationTitle: 'మీరు ఈరోజు ఎక్కడ ఉన్నారు?',
    popularCities: 'ప్రచురిత నగరాలు',
    recommendedCities: 'సిఫార్సు చేసిన నగరాలు',
    askPlaceholder: 'వాతావరణం గురించి అడగండి...',
    askAi: 'AI అడగండి',
    weatherTab: 'వాతావరణం',
    alertsTab: 'అలర్ట్లు',
    mapTab: 'మ్యాప్',
    insightsTab: 'ఇన్‌సైట్ల్',
    aboutTab: 'గురించి',
    exploreQuestion: 'ప్రశ్నను ఎంచుకోండి',
    useVoice: 'మాట్లండి',
    languageTitle: 'మీ భాషను ఎంచుకోండి',
    languageSubtitle: 'మొత్తం యాప్‌ను మీ ఇష్టమైన భాషలో చూడండి.',
    chooseLanguage: 'భాషను ఎంచుకోండి',
    continueLabel: 'కొనసాగించండి',
    greetingMorning: 'శుభోదయం,',
    greetingAfternoon: 'శుభ మధ్యాహ్నం,',
    greetingEvening: 'శుభ సాయంత్రం,',
    greetingNight: 'శుభ రాత్రి,',
    locationEmpty: 'నగరం కనుగొనబడలేదు.',
    feelsLike: 'అనిపించేది',
    humidity: 'తేమ',
    windSpeed: 'గాలి వేగం',
    wind: 'గాలి',
    temperature: 'ఉష్ణోగ్రత',
    visibility: 'దృశ్యమానత',
    pressure: 'పీడనం',
    next12Hours: 'తర్వాతి 12 గంటలు',
    todaysForecast: 'ఈరోజు అంచనా',
    theWeekAhead: 'రాబోయే వారం',
    forecastRhythm: 'అంచనా లయ',
    sevenDays: '7 రోజులు',
    nowLabel: 'ఇప్పుడు',
    askBannerTitle: 'వాతావరణ ప్రశ్న ఉందా?',
    askBannerSubtitle: 'WeatherGPT ని ఈరోజు వాతావరణం గురించి ఏదైనా అడగండి.',
    aiSubtitle: 'నిజమైన డేటా ఆధారంగా వాతావరణ సమాధానాలు',
    weatherLocationOverline: 'వాతావరణ స్థానం',
    searchCityPlaceholder: 'భారతదేశంలో ఏ నగరమైనా వెతకండి...',
    viewWeatherFor: 'వాతావరణం చూడండి',
    recRain: 'రేపు వర్షం పడుతుందా?',
    recExplain: 'ఈరోజు వాతావరణాన్ని సులభంగా చెప్పండి',
    recWear: 'నేను ఏమి ధరించాలి?',
    recCrops: 'ఈ వారం పంట నాటడానికి ఉత్తమ సమయం ఏది?',
    recDay: 'నా రోజు ఎలా ఉంది?',
    voiceUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ ఇంకా మద్దతు లేదు. టెక్స్ట్ బాక్స్ ఉపయోగించండి.',
    initialMessage: 'హలో! నేను WeatherGPT. మీ చుట్టూ ఉన్న వాతావరణం గురించి ఏదైనా అడగండి.',
    notWeatherReply: '{location} వాతావరణ ప్రశ్నలలో నేను సహాయం చేయగలను. ఈరోజు, వర్షం, గాలి, తేమ లేదా 7 రోజుల అంచనా గురించి అడగండి.',
    outlookReply: '{location} అంచనా {summary}. రేపు బహుశా {high}°C నుండి {low}°C వరకు, సుమారు {rain}% వర్ష అవకాశం, కాబట్టి ప్రణాళికలు లవచీకరంగా ఉంచండి.',
    yearReply: 'ఇక్కడి లైవ్ ఫీడ్ {location} ప్రస్తుత మరియు తర్వాతి 7 రోజుల అంచనాకు మాత్రమే సీమితం, ఏడాది మొత్తానికి కాదు. ఇప్పుడు {condition}, ఉష్ణోగ్రత {temp}°C మరియు తేమ {humidity}%.',
    cropExtra: '{location}లో ఈ వారం {rain}% వర్ష అవకాశం ఉంది, ప్రస్తుత పరిస్థితి సుమారు {temp}°C, ఉదయం నాటడానికి అనుకూలం.',
    rainExtra: 'ప్రస్తుత ఉష్ణోగ్రత {temp}°C, {feels}°C అనిపిస్తుంది, గాలి {wind} కి.మీ/గం. ఈరోజు లైట్ రైన్ కవర్ ఉంచడం మంచిది.',
    stayAhead: 'వాతావరణంలో ఒక అడుగు ముందుండండి',
    safetyCenter: 'భద్రతా కేంద్రం',
    alertsSubtitle: '{location} మరియు చుట్టుపక్కల ప్రాంతాలకు స్పష్టమైన, సకాలిక హెచ్చరికలు.',
    activeAlert: 'క్రియాశీల హెచ్చరిక',
    highPriority: 'అధిక ప్రాధాన్యత',
    thunderstormAlert: 'ఉరుముల హెచ్చరిక',
    thunderstormDescription: 'సమీపంలో ఉరుముల వర్షం అవకాశం, పదునైన గాలులు మరియు తక్కువ దృశ్యమానత ఉండవచ్చు. వీలైనంత వరకు లోపల ఉండండి, బహిరంగ మైదానాలు, లోహ నిర్మాణాలు మరియు నీటి వనరులను నివారించండి.',
    callEmergency: 'అత్యవసర సేవలకు కాల్ చేయండి',
    copyEmergency: 'అత్యవసర నంబర్‌ను కాపీ చేయండి',
    emergencyCopiedLabel: 'అత్యవసర నంబర్ కాపీ అయింది.',
    genericAlertDescription: 'పరిస్థితులు త్వరగా మారవచ్చు. ప్రయాణానికి ముందు అధికారిక స్థానిక సలహాలను తనిఖీ చేసి ప్రణాళికలు లవచీకరంగా ఉంచండి.',
    important: 'ముఖ్యం',
    followOfficial: 'తీవ్రమైన హెచ్చరికలకు ఎప్పుడూ అధికారిక సంస్థలను అనుసరించండి.',
    regionalView: 'ప్రాంతీయ దృశ్యం',
    weatherMap: 'వాతావరణ మ్యాప్',
    conditionsAround: '{location} చుట్టూ పరిస్థితులు.',
    currentTemperature: 'ప్రస్తుత ఉష్ణోగ్రత',
    surfaceWind: 'ఉపరితల గాలి',
    relativeHumidity: 'సాపేక్ష తేమ',
    liveConditions: 'ప్రత్యక్ష పరిస్థితులు',
    mapDisclaimer: 'OpenStreetMap నుండి మ్యాప్‌లు. వాతావరణ పొరలు ప్రస్తుత స్థానిక పరిస్థితులతో సమకాలీనం.',
    climateIntelligence: 'వాతావరణ విశ్లేషణ',
    seeThePattern: 'నమూనాను చూడండి',
    longTermSignals: '{location} కు సంబంధించిన దీర్ఘకాలిక సంకేతాల శాంత విశ్లేషణ.',
    weathergptReads: 'WEATHERGPT విశ్లేషణ',
    insightBody: 'పరిస్థితులు ప్రత్యక్ష పరిశీలనలపై ఆధారపడి ఉంటాయి, మరియు ఎంచుకున్న కాలం ఒక ప్రత్యేక {range} నమూనాను చూపుతుంది.',
    dateRange: 'తేదీ పరిధి',
    avgHigh: 'సగటు గరిష్ఠ',
    comfort: 'సౌకర్యం',
    overallFeel: 'మొత్తం అనుభూతి',
    rainExp: 'వర్ష అవకాశం',
    expected: 'అంచనా',
    rainLabel: 'వర్షం',
    rainExpectancy: 'వర్ష అవకాశం',
    liveLabel: 'లైవ్',
    humidityOverline: 'తేమ',
    moistureIndex: 'తేమ సూచిక',
    steady: 'స్థిరం',
    pressureOverline: 'పీడనం',
    airColumn: 'గాలి స్తంభం',
    stable: 'స్థిరం',
    temperatureOverline: 'ఉష్ణోగ్రత',
    heatProfile: 'వేడి ప్రొఫైల్',
    windOverline: 'గాలి',
    crosswindFlow: 'అడ్డంకి గాలి ప్రవాహం',
    active: 'క్రియాశీల',
    comfortIndex: 'సౌకర్య సూచిక',
    dataNote: '{location} కు ప్రత్యక్ష వాతావరణ పరిశీలనలు మరియు ప్రాంతీయ వాతావరణ సందర్భం',
    today: 'ఈరోజు',
    countryLabel: 'భారతదేశం',
    quote: 'ప్రణాళికకు తోడ్పడే అంచనాయే ఉత్తమం.',
    askHeading: '{brand} ని అడగండి',
    justNow: 'ఇప్పుడే',
    updatedPrefix: 'అప్‌డేట్',
    liveContext: 'ప్రత్యక్ష వాతావరణ సందర్భం',
    summaryTemplate: '{condition}, తేమ {humidity}% మరియు చుట్టూ తేలికపాటి గాలి.',
    conditions: {
      'Clear sky': 'స్పష్టమైన ఆకాశం',
      'Mostly clear': 'ఎక్కువగా స్పష్టం',
      'Partly cloudy': 'పాక్షికంగా మేఘాలు',
      'Sunny intervals': 'మధ్యంతర ఎండ',
      Overcast: 'మేఘావృతం',
      Foggy: 'పొగమంచు',
      'Light drizzle': 'చినుకులు',
      Drizzle: 'చినుకులు',
      'Heavy drizzle': 'బలమైన చినుకులు',
      Rain: 'వర్షం',
      'Heavy rain': 'భారీ వర్షం',
      Showers: 'జల్లులు',
      'Heavy showers': 'భారీ జల్లులు',
      Thunderstorm: 'ఉరుముల వర్షం',
      'Variable conditions': 'మారుతున్న పరిస్థితులు',
    },
    greetings: {
      normal: 'హలో! నేను వెదర్‌జీపీటీ. మీ రోజు ఎలా ఉంది? వాతావరణంపై నేను సహాయం చేయగలను.',
      crop: 'ఈ వారం పంటను నాటడం మంచిది, నేల తేమగా ఉండి వర్షం మితంగా ఉంటే. వేడిని తగ్గించేందుకు ఉదయం లేదా సాయంత్రం నాటడం మంచిది.',
      rain: 'ఈరోజు తర్వాత వర్షం వచ్చే అవకాశం ఉంది, కాబట్టి లైట్ రైన్ కవరును తీసుకెళ్లండి మరియు బాహ్య ప్రణాళికలు కొద్దిగా নমnంగా ఉంచండి.',
      day: 'ఈ రోజు comparatively steady, తేలికైన గాలితో పాటు మితమైన ఉష్ణోగ్రత ఉంటుంది.',
    },
  },
  gu: {
    appName: 'વેધરજિપિટી',
    demoMode: 'ડેમો મોડ',
    locationTitle: 'તમે આજે ક્યાં છો?',
    popularCities: 'પ્રસિદ્ધ શહેરો',
    recommendedCities: 'ભલામણ કરેલ શહેરો',
    askPlaceholder: 'હવામાન વિશે પૂછો...',
    askAi: 'એઆઈ પૂછો',
    weatherTab: 'હવામાન',
    alertsTab: 'ચેતણીઓ',
    mapTab: 'નકશો',
    insightsTab: 'ઇન્ઝાઇટ્સ',
    aboutTab: 'વિશે',
    exploreQuestion: 'એક પ્રશ્ન પસંદ કરો',
    useVoice: 'બોલો',
    languageTitle: 'તમારી ભાષા પસંદ કરો',
    languageSubtitle: 'સંપૂર્ણ એપ તમારી પસંદની ભાષામાં જોવા માટે પસંદ કરો.',
    chooseLanguage: 'ભાષા પસંદ કરો',
    continueLabel: 'ચાલુ રાખો',
    greetingMorning: 'સુપ્રભાત,',
    greetingAfternoon: 'શુભ બપોર,',
    greetingEvening: 'શુભ સંધ્યા,',
    greetingNight: 'શુભ રાત્રિ,',
    locationEmpty: 'કોઈ શહેર મળ્યું નથી. અલગ જોડણી અજમાવો.',
    feelsLike: 'અનુભવાય છે',
    humidity: 'ભેજ',
    windSpeed: 'પવનની ગતિ',
    wind: 'પવન',
    temperature: 'તાપમાન',
    visibility: 'દૃશ્યતા',
    pressure: 'દબાણ',
    next12Hours: 'આગળના 12 કલાક',
    todaysForecast: 'આજનું અનુમાન',
    theWeekAhead: 'આવનારું સપ્તાહ',
    forecastRhythm: 'અનુમાનની લય',
    sevenDays: '7 દિવસ',
    nowLabel: 'હમણાં',
    askBannerTitle: 'હવામાન વિશે પ્રશ્ન છે?',
    askBannerSubtitle: 'WeatherGPT ને આજના હવામાન વિશે કંઈપણ પૂછો.',
    aiSubtitle: 'વાસ્તવિક ડેટા આધારિત હવામાન જવાબો',
    weatherLocationOverline: 'હવામાન સ્થળ',
    searchCityPlaceholder: 'ભારતમાં કોઈપણ શહેર શોધો...',
    viewWeatherFor: 'હવામાન જુઓ',
    recRain: 'કાલે વરસાદ પડશે?',
    recExplain: 'આજનું હવામાન સરળ ભાષામાં સમજાવો',
    recWear: 'મારે શું પહેરવું જોઈએ?',
    recCrops: 'આ અઠવાડિયે પાક રોપવાનો શ્રેષ્ઠ સમય કયો?',
    recDay: 'મારો દિવસ કેવો છે?',
    voiceUnsupported: 'આ બ્રાઉઝરમાં વોઇસ ઇનપુટ હજુ સપોર્ટેડ નથી. ટેક્સ્ટ બોક્સનો ઉપયોગ કરો.',
    initialMessage: 'હાય! હું WeatherGPT છું. તમારી આસપાસના હવામાન વિશે કંઈપણ પૂછો.',
    notWeatherReply: 'હું {location} ના હવામાન પ્રશ્નોમાં મદદ કરી શકું છું. આજ, વરસાદ, પવન, ભેજ કે 7 દિવસના અનુમાન વિશે પૂછો.',
    outlookReply: '{location} નું અનુમાન {summary} છે. કાલે સંભવતઃ {high}°C થી {low}°C અને આશરે {rain}% વરસાદની શક્યતા, તેથી યોજના લવચીક રાખો.',
    yearReply: 'અહીંનો લાઇવ ફીડ {location} ના વર્તમાન અને આગળના 7 દિવસના અનુમાન સુધી મર્યાદિત છે, સમગ્ર વર્ષ માટે નહીં. હાલ {condition}, તાપમાન {temp}°C અને ભેજ {humidity}%.',
    cropExtra: '{location} માં આ અઠવાડિયે {rain}% વરસાદની શક્યતા છે, અને વર્તમાન સ્થિતિ આશરે {temp}°C છે, જે સવારે રોપવા માટે યોગ્ય છે.',
    rainExtra: 'વર્તમાન તાપમાન {temp}°C છે, અનુભવાય છે {feels}°C, અને પવન {wind} કિમી/કલાક છે. આજે હલકો રેન કવર રાખવો સારો વિચાર છે.',
    stayAhead: 'હવામાનમાં એક પગલું આગળ રહો',
    safetyCenter: 'સુરક્ષા કેન્દ્ર',
    alertsSubtitle: '{location} અને આસપાસના વિસ્તારો માટે સ્પષ્ટ, સમયસર ચેતવણીઓ.',
    activeAlert: 'સક્રિય ચેતવણી',
    highPriority: 'ઉચ્ચ પ્રાથમિકતા',
    thunderstormAlert: 'ગરજ/વાવાઝોડું ચેતવણી',
    thunderstormDescription: 'નજીકમાં ગરજની શક્યતા છે, ઝડપી પવન અને ઓછી દૃશ્યતા શક્ય છે. શક્ય હોય ત્યાં સુધી ઘરની અંદર રહો અને ખુલ્લા મેદાન, ધાતુની માળખા અને જળ સ્ત્રોતો ટાળો.',
    callEmergency: 'કટોકટી સેવાને કૉલ કરો',
    copyEmergency: 'કટોકટી નંબર કૉપિ કરો',
    emergencyCopiedLabel: 'કટોકટી નંબર કૉપિ થયો.',
    genericAlertDescription: 'પરિસ્થિતિ ઝડપથી બદલાઈ શકે છે. પ્રવાસ પહેલાં સત્તાવાર સ્થાનિક સલાહ તપાસો અને યોજના લવચીક રાખો.',
    important: 'મહત્વપૂર્ણ',
    followOfficial: 'ગંભીર ચેતવણીઓ માટે હંમેશા સત્તાવાર સંસ્થાઓનું પાલન કરો.',
    regionalView: 'પ્રાદેશિક દૃશ્ય',
    weatherMap: 'હવામાન નકશો',
    conditionsAround: '{location} આસપાસની સ્થિતિ.',
    currentTemperature: 'વર્તમાન તાપમાન',
    surfaceWind: 'સપાટી પવન',
    relativeHumidity: 'સાપેક્ષ ભેજ',
    liveConditions: 'લાઇવ સ્થિતિ',
    mapDisclaimer: 'OpenStreetMap માંથી નકશા. હવામાન ઓવરલે વર્તમાન સ્થાનિક સ્થિતિ સાથે સમકાલિન છે.',
    climateIntelligence: 'હવામાન બુદ્ધિ',
    seeThePattern: 'પેટર્ન જુઓ',
    longTermSignals: '{location} માટે લાંબા ગાળાના સંકેતોનું શાંત વિશ્લેષણ.',
    weathergptReads: 'WEATHERGPT વિશ્લેષણ',
    insightBody: 'પરિસ્થિતિ લાઇવ નિરીક્ષણો પર આધારિત છે, અને પસંદ કરેલ સમયગાળો એક અલગ {range} પેટર્ન દર્શાવે છે.',
    dateRange: 'તારીખ શ્રેણી',
    avgHigh: 'સરેરાશ મહત્તમ',
    comfort: 'આરામ',
    overallFeel: 'એકંદર અનુભવ',
    rainExp: 'વરસાદની શક્યતા',
    expected: 'અપેક્ષિત',
    rainLabel: 'વરસાદ',
    rainExpectancy: 'વરસાદની શક્યતા',
    liveLabel: 'લાઇવ',
    humidityOverline: 'ભેજ',
    moistureIndex: 'ભેજ સૂચકાંક',
    steady: 'સ્થિર',
    pressureOverline: 'દબાણ',
    airColumn: 'વાયુ સ્તંભ',
    stable: 'સ્થિર',
    temperatureOverline: 'તાપમાન',
    heatProfile: 'ગરમી પ્રોફાઇલ',
    windOverline: 'પવન',
    crosswindFlow: 'આડું પવન પ્રવાહ',
    active: 'સક્રિય',
    comfortIndex: 'આરામ સૂચકાંક',
    dataNote: '{location} માટે લાઇવ હવામાન નિરીક્ષણો અને પ્રાદેશિક હવામાન સંદર્ભ',
    today: 'આજે',
    countryLabel: 'ભારત',
    quote: 'આયોજનમાં મદદ કરતું અનુમાન જ શ્રેષ્ઠ છે.',
    askHeading: '{brand} ને પૂછો',
    justNow: 'હમણાં',
    updatedPrefix: 'અપડેટ',
    liveContext: 'લાઇવ હવામાન સંદર્ભ',
    summaryTemplate: '{condition}, ભેજ {humidity}% અને આસપાસ હળવો પવન.',
    conditions: {
      'Clear sky': 'ચંપલ આકાશ',
      'Mostly clear': 'મોટે ભાગે ચંપલ',
      'Partly cloudy': 'અંશત વાદળછાયું',
      'Sunny intervals': 'વચ્ચે ચંપલ તડ',
      Overcast: 'વાદળછાયું',
      Foggy: 'ધુમ્મસ',
      'Light drizzle': 'ઝાપટાં',
      Drizzle: 'ઝાપટાં',
      'Heavy drizzle': 'ભારે ઝાપટાં',
      Rain: 'વરસાદ',
      'Heavy rain': 'ભારે વરસાદ',
      Showers: 'છાંટા',
      'Heavy showers': 'ભારે છાંટા',
      Thunderstorm: 'વીજળી વાદળ',
      'Variable conditions': 'બદલાતી સ્થિતિ',
    },
    greetings: {
      normal: 'હાય! હું વેધરજિપિટી. તમારું દિવસ કેમ છે? હવામાન અંગે હું સહાય કરી શકું.',
      crop: 'આ અઠવાડિયે પાક રોપવાનું સારું છે, જો માટી ભેજવાળી હોય અને વરસાદ معت moderation હોય. ગરમીથી બચવા માટે સવારે અથવા સાંજે રોપવું વધુ સારું.',
      rain: 'આજે પછી વરસાદની સંભાવના છે, તો હળવો રેન કવર લાવજો અને બાહ્ય આયોજન થોડું લવચીક રાખો.',
      day: 'આ દિવસ સામાન્ય રીતે સંતુલિત છે અને હળવા પવન સાથે તાપમાન યોગ્ય છે.',
    },
  },
  pa: {
    appName: 'ਵੈਦਰਜੀਪੀਟੀ',
    demoMode: 'ਡੈਮੋ ਮੋਡ',
    locationTitle: 'ਤੁਸੀਂ ਅੱਜ ਕਿੱਥੇ ਹੋ?',
    popularCities: 'ਪ੍ਰਸਿੱਧ ਸ਼ਹਿਰ',
    recommendedCities: 'ਸਿਫ਼ਾਰਸ਼ ਕੀਤੇ ਸ਼ਹਿਰ',
    askPlaceholder: 'ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ...',
    askAi: 'AI ਬਾਰੇ ਪੁੱਛੋ',
    weatherTab: 'ਮੌਸਮ',
    alertsTab: 'ਚੇਤਾਵਨੀਆਂ',
    mapTab: 'ਮੈਪ',
    insightsTab: 'ਇੰਸਾਈਟਸ',
    aboutTab: 'ਬਾਰੇ',
    exploreQuestion: 'ਇੱਕ ਸਵਾਲ ਚੁਣੋ',
    useVoice: 'ਬੋਲੋ',
    languageTitle: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    languageSubtitle: 'ਪੂ rite ਐਪ ਨੂੰ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਵੇਖਣ ਲਈ ਚੁਣੋ।',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    continueLabel: 'ਜਾਰੀ ਰੱਖੋ',
    greetingMorning: 'ਸ਼ੁਭ ਸਵੇਰ,',
    greetingAfternoon: 'ਸ਼ੁਭ ਦੁਪਹਰ,',
    greetingEvening: 'ਸ਼ੁਭ ਸ਼ਾਮ,',
    greetingNight: 'ਸ਼ੁਭ ਰਾਤ,',
    locationEmpty: 'ਕੋਈ ਸ਼ਹਿਰ ਨਹੀਂ ਮਿਲਿਆ। ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ।',
    feelsLike: 'ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ',
    humidity: 'ਨਮੀ',
    windSpeed: 'ਹਵਾ ਦੀ ਗਤੀ',
    wind: 'ਹਵਾ',
    temperature: 'ਤਾਪਮਾਨ',
    visibility: 'ਦਿੱਖ',
    pressure: 'ਦਬਾਅ',
    next12Hours: 'ਅਗਲੇ 12 ਘੰਟੇ',
    todaysForecast: 'ਅੱਜ ਦਾ ਅਨੁਮਾਨ',
    theWeekAhead: 'ਆ ਰਿਹਾ ਹਫ਼ਤਾ',
    forecastRhythm: 'ਅਨੁਮਾਨ ਦੀ ਤਾਲ',
    sevenDays: '7 ਦਿਨ',
    nowLabel: 'ਹੁਣ',
    askBannerTitle: 'ਮੌਸਮ ਬਾਰੇ ਸਵਾਲ ਹੈ?',
    askBannerSubtitle: 'WeatherGPT ਨੂੰ ਅੱਜ ਦੇ ਮੌਸਮ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।',
    aiSubtitle: 'ਅਸਲ ਡੇਟਾ ਅਧਾਰਿਤ ਮੌਸਮ ਜਵਾਬ',
    weatherLocationOverline: 'ਮੌਸਮ ਸਥਾਨ',
    searchCityPlaceholder: 'ਭਾਰਤ ਵਿੱਚ ਕੋਈ ਵੀ ਸ਼ਹਿਰ ਲੱਭੋ...',
    viewWeatherFor: 'ਮੌਸਮ ਵੇਖੋ',
    recRain: 'ਕੀ ਕੱਲ੍ਹ ਬਾਰਿਸ਼ ਹੋਵੇਗੀ?',
    recExplain: 'ਅੱਜ ਦਾ ਮੌਸਮ ਸਧਾਰਨ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ',
    recWear: 'ਮੈਨੂੰ ਕੀ ਪਹਿਨਣਾ ਚਾਹੀਦਾ ਹੈ?',
    recCrops: 'ਇਸ ਹਫ਼ਤੇ ਫਸਲ ਲਗਾਉਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਕੀ ਹੈ?',
    recDay: 'ਮੇਰਾ ਦਿਨ ਕਿਵੇਂ ਜਾ ਰਿਹਾ ਹੈ?',
    voiceUnsupported: 'ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਵੌਇਸ ਇਨਪੁਟ ਅਜੇ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ। ਟੈਕਸਟ ਬਾਕਸ ਵਰਤੋ।',
    initialMessage: 'ਹੈਲੋ! ਮੈਂ WeatherGPT ਹਾਂ। ਆਪਣੇ ਆਲੇ-ਦੁਆਲੇ ਦੇ ਮੌਸਮ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।',
    notWeatherReply: 'ਮੈਂ {location} ਦੇ ਮੌਸਮ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਅੱਜ, ਬਾਰਿਸ਼, ਹਵਾ, ਨਮੀ ਜਾਂ 7 ਦਿਨਾਂ ਦੇ ਅਨੁਮਾਨ ਬਾਰੇ ਪੁੱਛੋ।',
    outlookReply: '{location} ਦਾ ਅਨੁਮਾਨ {summary} ਹੈ। ਕੱਲ੍ਹ ਸ਼ਾਇਦ {high}°C ਤੋਂ {low}°C ਤੱਕ, ਲਗਭਗ {rain}% ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ, ਇਸ ਲਈ ਯੋਜਨਾ ਲਚਕੀਲੀ ਰੱਖੋ।',
    yearReply: 'ਇੱਥੋਂ ਦਾ ਲਾਈਵ ਫੀਡ {location} ਦੇ ਵਰਤਮਾਨ ਅਤੇ ਅਗਲੇ 7 ਦਿਨਾਂ ਦੇ ਅਨੁਮਾਨ ਤੱਕ ਸੀਮਿਤ ਹੈ, ਪੂਰੇ ਸਾਲ ਲਈ ਨਹੀਂ। ਹੁਣ {condition}, ਤਾਪਮਾਨ {temp}°C ਅਤੇ ਨਮੀ {humidity}%.',
    cropExtra: '{location} ਵਿੱਚ ਇਸ ਹਫ਼ਤੇ {rain}% ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ ਹੈ, ਅਤੇ ਮੌਜੂਦਾ ਸਥਿਤੀ ਲਗਭਗ {temp}°C ਹੈ, ਜੋ ਸਵੇਰੇ ਬੀਜਣ ਲਈ ਠੀਕ ਹੈ।',
    rainExtra: 'ਮੌਜੂਦਾ ਤਾਪਮਾਨ {temp}°C ਹੈ, ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ {feels}°C, ਅਤੇ ਹਵਾ {wind} ਕਿਮੀ/ਘੰਟਾ ਹੈ। ਅੱਜ ਹਲਕਾ ਰੈਨ ਕਵਰ ਰੱਖਣਾ ਚੰਗਾ ਵਿਚਾਰ ਹੈ।',
    stayAhead: 'ਮੌਸਮ ਤੋਂ ਇੱਕ ਕਦਮ ਅੱਗੇ ਰਹੋ',
    safetyCenter: 'ਸੁਰੱਖਿਆ ਕੇਂਦਰ',
    alertsSubtitle: '{location} ਅਤੇ ਆਸਪਾਸ ਦੇ ਖੇਤਰਾਂ ਲਈ ਸਪਸ਼ਟ, ਸਮੇਂ ਸਿਰ ਚੇਤਾਵਨੀਆਂ।',
    activeAlert: 'ਸਰਗਰਮ ਚੇਤਾਵਨੀ',
    highPriority: 'ਉੱਚ ਪ੍ਰਾਥਮਿਕਤਾ',
    thunderstormAlert: 'ਗਰਜ-ਤੂਫ਼ਾਨ ਚੇਤਾਵਨੀ',
    thunderstormDescription: 'ਨੇੜੇ ਗਰਜ-ਤੂਫ਼ਾਨ ਦੀ ਸੰਭਾਵਨਾ ਹੈ, ਤੇਜ਼ ਹਵਾਵਾਂ ਅਤੇ ਘੱਟ ਦਿੱਖ ਸੰਭਵ ਹੈ। ਜਿੱਥੋਂ ਤੱਕ ਸੰਭਵ ਹੋਵੇ ਘਰ ਦੇ ਅੰਦਰ ਰਹੋ ਅਤੇ ਖੁੱਲ੍ਹੇ ਮੈਦਾਨ, ਧਾਤੂ ਢਾਂਚੇ ਅਤੇ ਪਾਣੀ ਦੇ ਸ੍ਰੋਤਾਂ ਤੋਂ ਬਚੋ।',
    callEmergency: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾ ਨੂੰ ਕਾਲ ਕਰੋ',
    copyEmergency: 'ਐਮਰਜੈਂਸੀ ਨੰਬਰ ਕਾਪੀ ਕਰੋ',
    emergencyCopiedLabel: 'ਐਮਰਜੈਂਸੀ ਨੰਬਰ ਕਾਪੀ ਹੋ ਗਿਆ।',
    genericAlertDescription: 'ਸਥਿਤੀਆਂ ਤੇਜ਼ੀ ਨਾਲ ਬਦਲ ਸਕਦੀਆਂ ਹਨ। ਯਾਤਰਾ ਤੋਂ ਪਹਿਲਾਂ ਅਧਿਕਾਰਿਤ ਸਥਾਨਕ ਸਲਾਹ ਚੈੱਕ ਕਰੋ ਅਤੇ ਯੋਜਨਾਵਾਂ ਲਚਕੀਲੀਆਂ ਰੱਖੋ।',
    important: 'ਮਹੱਤਵਪੂਰਨ',
    followOfficial: 'ਗੰਭੀਰ ਚੇਤਾਵਨੀਆਂ ਲਈ ਹਮੇਸ਼ਾ ਅਧਿਕਾਰਿਤ ਸੰਸਥਾਵਾਂ ਦਾ ਪਾਲਣ ਕਰੋ।',
    regionalView: 'ਖੇਤਰੀ ਦ੍ਰਿਸ਼',
    weatherMap: 'ਮੌਸਮ ਨਕਸ਼ਾ',
    conditionsAround: '{location} ਦੇ ਆਸਪਾਸ ਦੀ ਸਥਿਤੀ।',
    currentTemperature: 'ਮੌਜੂਦਾ ਤਾਪਮਾਨ',
    surfaceWind: 'ਸਤਹੀ ਹਵਾ',
    relativeHumidity: 'ਸਾਪੇਖ ਨਮੀ',
    liveConditions: 'ਲਾਈਵ ਸਥਿਤੀਆਂ',
    mapDisclaimer: 'ਨਕਸ਼ੇ OpenStreetMap ਤੋਂ। ਮੌਸਮ ਓਵਰਲੇ ਮੌਜੂਦਾ ਸਥਾਨਕ ਸਥਿਤੀਆਂ ਨਾਲ ਸਿੰਕ੍ਰੋਨਾਈਜ਼ਡ ਹਨ।',
    climateIntelligence: 'ਜਲਵਾਯੂ ਬੁੱਧੀ',
    seeThePattern: 'ਪੈਟਰਨ ਵੇਖੋ',
    longTermSignals: '{location} ਲਈ ਲੰਬੇ ਸਮੇਂ ਦੇ ਸੰਕੇਤਾਂ ਦਾ ਸ਼ਾਂਤ ਵਿਸ਼ਲੇਸ਼ਣ।',
    weathergptReads: 'WEATHERGPT ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ',
    insightBody: 'ਸਥਿਤੀਆਂ ਲਾਈਵ ਨਿਰੀਖਣਾਂ ʼਤੇ ਆਧਾਰਿਤ ਹਨ, ਅਤੇ ਚੁਣੀ ਗਈ ਮਿਆਦ ਇੱਕ ਵੱਖਰਾ {range} ਪੈਟਰਨ ਦਿਖਾਉਂਦੀ ਹੈ।',
    dateRange: 'ਤਾਰੀਖ ਸੀਮਾ',
    avgHigh: 'ਔਸਤ ਵੱਧ',
    comfort: 'ਆਰਾਮ',
    overallFeel: 'ਸਮੁੱਚੀ ਭਾਵਨਾ',
    rainExp: 'ਬਾਰਿਸ਼ ਸੰਭਾਵਨਾ',
    expected: 'ਸੰਭਾਵਿਤ',
    rainLabel: 'ਬਾਰਿਸ਼',
    rainExpectancy: 'ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ',
    liveLabel: 'ਲਾਈਵ',
    humidityOverline: 'ਨਮੀ',
    moistureIndex: 'ਨਮੀ ਸੂਚਕ',
    steady: 'ਸਥਿਰ',
    pressureOverline: 'ਦਬਾਅ',
    airColumn: 'ਹਵਾ ਥੰਮ੍ਹ',
    stable: 'ਸਥਿਰ',
    temperatureOverline: 'ਤਾਪਮਾਨ',
    heatProfile: 'ਗਰਮੀ ਪ੍ਰੋਫਾਈਲ',
    windOverline: 'ਹਵਾ',
    crosswindFlow: 'ਪਾਰ ਹਵਾ ਦਾ ਵਹਾਅ',
    active: 'ਸਰਗਰਮ',
    comfortIndex: 'ਆਰਾਮ ਸੂਚਕ',
    dataNote: '{location} ਲਈ ਲਾਈਵ ਮੌਸਮ ਨਿਰੀਖਣ ਅਤੇ ਖੇਤਰੀ ਜਲਵਾਯੂ ਸੰਦਰਭ',
    today: 'ਅੱਜ',
    countryLabel: 'ਭਾਰਤ',
    quote: 'ਸਭ ਤੋਂ ਵਧੀਆ ਭਵਿੱਖਬਾਣੀ ਉਹ ਹੈ ਜੋ ਯੋਜਨਾ ਵਿੱਚ ਮਦਦ ਕਰੇ।',
    askHeading: '{brand} ਤੋਂ ਪੁੱਛੋ',
    justNow: 'ਹੁਣੇ',
    updatedPrefix: 'ਅੱਪਡੇਟ',
    liveContext: 'ਲਾਈਵ ਮੌਸਮ ਸੰਦਰਭ',
    summaryTemplate: '{condition}, ਨਮੀ {humidity}% ਅਤੇ ਆਸ-ਪਾਸ ਹਲਕੀ ਹਵਾ।',
    conditions: {
      'Clear sky': 'ਸਾਫ਼ ਅਸਮਾਨ',
      'Mostly clear': 'ਜ਼ਿਆਦਾਤਰ ਸਾਫ਼',
      'Partly cloudy': 'ਅੰਸ਼ਕ ਬੱਦਲ',
      'Sunny intervals': 'ਵਿਚਕਾਰ ਧੁੱਪ',
      Overcast: 'ਬੱਦਲ',
      Foggy: 'ਧੁੰਦ',
      'Light drizzle': 'ਬੂੰਦਾਬਾਂਦੀ',
      Drizzle: 'ਬੂੰਦਾਬਾਂਦੀ',
      'Heavy drizzle': 'ਤੇਜ਼ ਬੂੰਦਾਬਾਂਦੀ',
      Rain: 'ਮੀਂਹ',
      'Heavy rain': 'ਤੇਜ਼ ਮੀਂਹ',
      Showers: 'ਬਰਸਾਤ',
      'Heavy showers': 'ਤੇਜ਼ ਬਰਸਾਤ',
      Thunderstorm: 'ਗਰਜ ਨਾਲ ਮੀਂਹ',
      'Variable conditions': 'ਬਦਲਦਾ ਮੌਸਮ',
    },
    greetings: {
      normal: 'ਹੈਲੋ! ਮੈਂ ਵੈਦਰਜੀਪੀਟੀ ਹਾਂ। ਤੁਹਾਡਾ ਦਿਨ ਕਿਵੇਂ ਹੈ? ਮੌਸਮ ਬਾਰੇ ਮੈਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।',
      crop: 'ਇਸ ਹਫਤੇ ਫਸਲ ਲਗਾਉਣ ਲਈ ਬਿਹਤਰ ਹੈ, ਜੇ ਮਿੱਟੀ ਨਮੀ ਵਾਲੀ ਰਹੇ ਅਤੇ ਬਾਰਿਸ ਮੱਧਮ ਹੋਵੇ। ਗਰਮੀ ਤੋਂ ਬਚਣ ਲਈ ਸਵੇਰ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਲਗਾਉਣਾ ਚੰਗਾ ਹੈ।',
      rain: 'ਅੱਜ ਦੇ ਬਾਅਦ ਬਾਰਿਸ ਦੀ ਸੰਭਾਵਨਾ ਹੈ, ਇਸਲਈ ਹਲਕਾ ਰੈਨ ਕਵਰ ਲੈ ਜਾਓ ਅਤੇ ਬਾਹਰ ਦੀ ਯੋਜਨਾਵਾਂ ਨੂੰ ਕੁਝ ਹਲਕਾ ਰੱਖੋ।',
      day: 'ਅੱਜ ਦਾ ਦਿਨ ਬਰਾਬਰ ਹੈ, ਹਲਕਾ ਹਵਾ ਅਤੇ ਸੰਭਾਵੀ ਤਾਪਮਾਨ ਹੈ।',
    },
  },
  ml: {
    appName: 'വെയ്തർജിപിടി',
    demoMode: 'ഡെമോ മോഡ്',
    locationTitle: 'ഇന്ന് നിങ്ങൾ എവിടെ ഉണ്ടു?',
    popularCities: 'പോപുലർ സിറ്റികൾ',
    recommendedCities: 'ശുപാർശ ചെയ്ത നഗരങ്ങൾ',
    askPlaceholder: 'വെATHER പരക്കെ ചോദ്യങ്ങൾ ചോദിക്കാം...',
    askAi: 'എഐ ചോദിക്കുക',
    weatherTab: 'ഹവായ്',
    alertsTab: 'അറിയിപ്പുകൾ',
    mapTab: 'മാപ്പ്',
    insightsTab: 'ഇൻസൈറ്റ്‌സ്',
    aboutTab: 'ഏതുമായി',
    exploreQuestion: 'ഒരു ചോദ്യം തിരഞ്ഞെടുക്കുക',
    useVoice: 'സംസാരിക്കുക',
    languageTitle: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    languageSubtitle: 'പൂർണ്ണ ആപ്പും നിങ്ങളുടെ പ്രിയപ്പെട്ട ഭാഷയിൽ കാണാൻ തിരഞ്ഞെടുക്കുക.',
    chooseLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    continueLabel: 'തുടരുക',
    greetingMorning: 'സുപ്രഭാതം,',
    greetingAfternoon: 'ശുഭ മധ്യാഹ്നം,',
    greetingEvening: 'ശുഭ വൈകുന്നേരം,',
    greetingNight: 'ശുഭ രാത്രി,',
    locationEmpty: 'നഗരം കണ്ടെത്തിയില്ല. മറ്റ് അക്ഷരവിന്യാസം പരീക്ഷിക്കുക.',
    feelsLike: 'അനുഭവപ്പെടുന്നത്',
    humidity: 'ഈർപ്പം',
    windSpeed: 'കാറ്റിന്റെ വേഗത',
    wind: 'കാറ്റ്',
    temperature: 'താപനില',
    visibility: 'ദൃശ്യത',
    pressure: 'മർദ്ദം',
    next12Hours: 'അടുത്ത 12 മണിക്കൂർ',
    todaysForecast: 'ഇന്നത്തെ പ്രവചനം',
    theWeekAhead: 'വരാനിരിക്കുന്ന ആഴ്ച',
    forecastRhythm: 'പ്രവചന താളം',
    sevenDays: '7 ദിവസം',
    nowLabel: 'ഇപ്പോൾ',
    askBannerTitle: 'കാലാവസ്ഥയെക്കുറിച്ച് ചോദ്യമുണ്ടോ?',
    askBannerSubtitle: 'WeatherGPTയോട് ഇന്നത്തെ കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കുക.',
    aiSubtitle: 'യഥാർത്ഥ ഡാറ്റയെ അടിസ്ഥാനമാക്കിയുള്ള കാലാവസ്ഥാ ഉത്തരങ്ങൾ',
    weatherLocationOverline: 'കാലാവസ്ഥാ സ്ഥലം',
    searchCityPlaceholder: 'ഇന്ത്യയിലെ ഏത് നഗരവും തിരയുക...',
    viewWeatherFor: 'കാലാവസ്ഥ കാണുക',
    recRain: 'നാളെ മഴ പെയ്യുമോ?',
    recExplain: 'ഇന്നത്തെ കാലാവസ്ഥ ലളിതമായി പറയൂ',
    recWear: 'ഞാൻ എന്ത് ധരിക്കണം?',
    recCrops: 'ഈ ആഴ്ച വിള നടുന്നതിനുള്ള ഏറ്റവും നല്ല സമയം എന്നതാണ്?',
    recDay: 'എന്റെ ദിവസം എങ്ങനെ പോകുന്നു?',
    voiceUnsupported: 'ഈ ബ്രൗസറിൽ വോയ്സ് ഇൻപുട്ട് ഇതുവരെ പിന്തുണയ്ക്കുന്നില്ല. ടെക്സ്റ്റ് ബോക്സ് ഉപയോഗിക്കുക.',
    initialMessage: 'ഹലോ! ഞാൻ WeatherGPT. നിങ്ങളുടെ ചുറ്റുമുള്ള കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ.',
    notWeatherReply: '{location}-ലെ കാലാവസ്ഥാ ചോദ്യങ്ങളിൽ ഞാൻ സഹായിക്കാം. ഇന്ന്, മഴ, കാറ്റ്, ഈർപ്പം അല്ലെങ്കിൽ 7 ദിവസത്തെ പ്രവചനത്തെക്കുറിച്ച് ചോദിക്കൂ.',
    outlookReply: '{location}-ലെ നില {summary}. നാളെ {high}°C മുതൽ {low}°C വരെ, ഏകദേശം {rain}% മഴയ്ക്ക് സാധ്യത, അതിനാൽ പദ്ധതികൾ വഴക്കമുള്ളതാക്കി വയ്ക്കുക.',
    yearReply: 'ഇവിടുത്തെ ലൈവ് ഫീഡ് {location}-ലെ ഇപ്പോഴത്തെയും അടുത്ത 7 ദിവസത്തെയും കാലാവസ്ഥയിലേക്ക് മാത്രം ഒതുങ്ങുന്നു, വർഷം മുഴുവൻ മോഡലല്ല. ഇപ്പോൾ {condition}, താപനില {temp}°C, ഈർപ്പം {humidity}%.',
    cropExtra: '{location}-ൽ ഈ ആഴ്ച {rain}% മഴയ്ക്ക് സാധ്യതയുണ്ട്, ഇപ്പോഴത്തെ അവസ്ഥ ഏകദേശം {temp}°C ആണ്, രാവിലെ വിതയ്ക്കാൻ അനുയോജ്യം.',
    rainExtra: 'ഇപ്പോഴത്തെ താപനില {temp}°C, {feels}°C പോലെ അനുഭവപ്പെടുന്നു, കാറ്റ് {wind} കി.മീ/മണിക്കൂർ. ഇന്ന് ഒരു ലഘു മഴ സംരക്ഷണം സൂക്ഷിക്കുന്നത് നല്ലതാണ്.',
    stayAhead: 'കാലാവസ്ഥയിൽ ഒരു ചുവട് മുന്നിൽ',
    safetyCenter: 'സുരക്ഷാ കേന്ദ്രം',
    alertsSubtitle: '{location}-ഉം സമീപ പ്രദേശങ്ങൾക്കുമുള്ള വ്യക്തമായ, സമയബന്ധിതമായ മുന്നറിയിപ്പുകൾ.',
    activeAlert: 'സജീവ മുന്നറിയിപ്പ്',
    highPriority: 'ഉയർന്ന മുൻഗണന',
    thunderstormAlert: 'ഇടിമിന്നൽ മുന്നറിയിപ്പ്',
    thunderstormDescription: 'അടുത്ത് ഇടിമിന്നലോടുകൂടിയ മഴയ്ക്ക് സാധ്യതയുണ്ട്, ശക്തമായ കാറ്റും കുറഞ്ഞ ദൃശ്യതയും ഉണ്ടാകാം. കഴിയുന്നിടത്തോളം അകത്ത് തുടരുക, തുറന്ന സ്ഥലങ്ങൾ, ലോഹ ഘടനകൾ, ജലാശയങ്ങൾ എന്നിവ ഒഴിവാക്കുക.',
    callEmergency: 'അത്യാവശ്യ സേവനങ്ങളെ വിളിക്കുക',
    copyEmergency: 'അത്യാവശ്യ നമ്പർ പകർത്തുക',
    emergencyCopiedLabel: 'അത്യാവശ്യ നമ്പർ പകർത്തി.',
    genericAlertDescription: 'സാഹചര്യങ്ങൾ പെട്ടെന്ന് മാറാം. യാത്രയ്ക്ക് മുമ്പ് ഔദ്യോഗിക പ്രാദേശിക ഉപദേശങ്ങൾ പരിശോധിച്ച് പദ്ധതികൾ വഴക്കമുള്ളതാക്കി വയ്ക്കുക.',
    important: 'പ്രധാനം',
    followOfficial: 'ഗുരുതരമായ മുന്നറിയിപ്പുകൾക്ക് എല്ലായ്പ്പോഴും ഔദ്യോഗിക അധികാരികളെ പിന്തുടരുക.',
    regionalView: 'പ്രാദേശിക കാഴ്ച',
    weatherMap: 'കാലാവസ്ഥാ ഭൂപടം',
    conditionsAround: '{location}-ന് ചുറ്റുമുള്ള സാഹചര്യങ്ങൾ.',
    currentTemperature: 'ഇപ്പോഴത്തെ താപനില',
    surfaceWind: 'ഉപരിതല കാറ്റ്',
    relativeHumidity: 'ആപേക്ഷിക ഈർപ്പം',
    liveConditions: 'ലൈവ് സാഹചര്യങ്ങൾ',
    mapDisclaimer: 'OpenStreetMap-ൽ നിന്നുള്ള ഭൂപട ടൈലുകൾ. കാലാവസ്ഥാ പാളികൾ ഇപ്പോഴത്തെ പ്രാദേശിക സാഹചര്യങ്ങളുമായി സമന്വയിപ്പിച്ചിരിക്കുന്നു.',
    climateIntelligence: 'കാലാവസ്ഥാ വിശകലനം',
    seeThePattern: 'പാറ്റേൺ കാണുക',
    longTermSignals: '{location}-നുള്ള ദീർഘകാല സൂചനകളുടെ ശാന്തമായ വായന.',
    weathergptReads: 'WEATHERGPT വായിക്കുന്നു',
    insightBody: 'സാഹചര്യങ്ങൾ ലൈവ് നിരീക്ഷണങ്ങളിൽ ഉറപ്പിച്ചിരിക്കുന്നു, തിരഞ്ഞെടുത്ത കാലയളവ് ഒരു വ്യതിരിക്തമായ {range} പാറ്റേൺ കാണിക്കുന്നു.',
    dateRange: 'തീയതി പരിധി',
    avgHigh: 'ശരാശരി ഉയർന്ന',
    comfort: 'സുഖം',
    overallFeel: 'മൊത്തത്തിലുള്ള അനുഭവം',
    rainExp: 'മഴ സാധ്യത',
    expected: 'പ്രതീക്ഷിക്കുന്നത്',
    rainLabel: 'മഴ',
    rainExpectancy: 'മഴയ്ക്കുള്ള സാധ്യത',
    liveLabel: 'ലൈവ്',
    humidityOverline: 'ഈർപ്പം',
    moistureIndex: 'ഈർപ്പ സൂചിക',
    steady: 'സ്ഥിരം',
    pressureOverline: 'മർദ്ദം',
    airColumn: 'വായു സ്തംഭം',
    stable: 'സ്ഥിരത',
    temperatureOverline: 'താപനില',
    heatProfile: 'താപ പ്രൊഫൈൽ',
    windOverline: 'കാറ്റ്',
    crosswindFlow: 'കുറുകെയുള്ള കാറ്റ് പ്രവാഹം',
    active: 'സജീവം',
    comfortIndex: 'സുഖ സൂചിക',
    dataNote: '{location}-നുള്ള ലൈവ് കാലാവസ്ഥാ നിരീക്ഷണങ്ങളും പ്രാദേശിക കാലാവസ്ഥാ സന്ദർഭവും',
    today: 'ഇന്ന്',
    countryLabel: 'ഇന്ത്യ',
    quote: 'ആസൂത്രണത്തിന് സഹായിക്കുന്ന പ്രവചനമാണ് ഏറ്റവും നല്ലത്.',
    askHeading: '{brand} ചോദിക്കുക',
    justNow: 'ഇപ്പോൾ',
    updatedPrefix: 'അപ്ഡേറ്റ്',
    liveContext: 'തത്സമയ കാലാവസ്ഥാ സന്ദർഭം',
    summaryTemplate: '{condition}, ഈർപ്പം {humidity}% കൂടാതെ ചുറ്റും സുഖകരമായ കാറ്റ്.',
    conditions: {
      'Clear sky': 'വ്യക്തമായ ആകാശം',
      'Mostly clear': 'മിക്കവാറും വ്യക്തം',
      'Partly cloudy': 'ഭാഗികമായി മേഘാവൃതം',
      'Sunny intervals': 'ഇടയ്ക്കിടെ വെയിൽ',
      Overcast: 'മേഘാവൃതം',
      Foggy: 'മഞ്ഞ്',
      'Light drizzle': 'ചാറ്റൽമഴ',
      Drizzle: 'ചാറ്റൽമഴ',
      'Heavy drizzle': 'കനത്ത ചാറ്റൽമഴ',
      Rain: 'മഴ',
      'Heavy rain': 'കനത്ത മഴ',
      Showers: 'മഴപെയ്ത്ത്',
      'Heavy showers': 'കനത്ത മഴപെയ്ത്ത്',
      Thunderstorm: 'ഇടിമിന്നൽ',
      'Variable conditions': 'മാറുന്ന അവസ്ഥ',
    },
    greetings: {
      normal: 'ഹലോ! ഞാൻ വെതർജിപിടി. നിങ്ങളുടെ ദിവസം എങ്ങനെയാണെന്ന്? കാലാവസ്ഥയെക്കുറിച്ച് ഞാൻ സഹായിക്കാം.',
      crop: 'ഈ ವಾರ പച്ചക്കറി നട്ട് നല്ലതാണ്, മണ്ണ് തണുത്ത് നിലനിൽക്കുകയും മഴ മിതമായി ലഭിക്കുകയും ചെയ്താൽ. ചൂടിൽ നിന്നു രക്ഷിക്കാൻ രാവിലെ അല്ലെങ്കിൽ വൈകുന്നേരം നട്ടാലും.',
      rain: 'ഇന്ന് വൈകുന്നേരം മഴയ്ക്ക് സാധ്യതയുണ്ട്, അതിനാൽ ലഘുവായ കുടയുമായി പോകുക, ബാഹ്യ പരിപാടികൾ കുറച്ച് ഇളക്കമുള്ളതാക്കി വെക്കുക.',
      day: 'ഇന്ന് ദിവസമൊരു സമതുലിതമാണ്, മിതമായ കാറ്റും നന്നായി നിലനിൽക്കുന്ന താപനിലയും ഉണ്ടാകും.',
    },
  },
}

const aboutCopy: Record<LanguageCode, AboutCopy> = {
  en: {
    title: 'About WeatherGPT', mission: '🌤️ Our Mission',
    missionText: 'is an AI-first conversational weather intelligence platform developed as a vibe-coded prototype for Smart India Hackathon 2026 — Problem Statement 26068.',
    missionDetails: 'Instead of simply displaying weather numbers, WeatherGPT helps users understand what the weather means. Users can ask questions in natural language and receive contextual, weather-grounded information powered by live, structured weather data.',
    whatWeDo: '🎯 What We Do',
    doItems: ['🌦️ Understand — Turn complex weather information into clear, easy-to-understand insights.', '🤖 Ask — Ask weather questions naturally and get contextual AI-powered responses.', '📊 Analyze — Explore forecasts, trends, rainfall, humidity, pressure, temperature, and other weather insights.', '🚨 Act — Use weather alerts, safety information, and practical conditions to make better decisions.', '🗺️ Explore — Visualize weather information through interactive maps and location-based data.'],
    keyFeatures: '✨ Key Features',
    featureItems: ['🌡️ Live Weather Data — Current weather conditions and observations', '🤖 Conversational AI — Ask questions about weather in natural language', '📍 Location Intelligence — Explore weather across multiple locations', '📊 Forecasts & Insights — Hourly breakdowns and 7-day forecasts', '🚨 Weather Alerts — Important weather and safety information', '🗺️ Interactive Maps — Visualize weather conditions geographically', '🇮🇳 Multilingual UI — Interface available in 9 Indian languages', '🎙️ Voice Input — Speak your weather questions', '📱 Android Support — Mobile-first experience through a native Android build'],
    approach: '🧠 Our Approach', approachQuote: "Don't just show the weather. Help people understand what it means.",
    approachText: 'WeatherGPT combines weather data, conversational AI, visualizations, and contextual insights into a single platform designed to make meteorological information more accessible and useful.',
    development: '🚀 Development', developmentText: 'Development was accelerated using AI-assisted / vibe-coded development to rapidly prototype, test, iterate, and refine the application.',
    hackathon: '📋 Smart India Hackathon 2026', problemStatement: 'Problem Statement:', organization: 'Organization:', department: 'Department:', category: 'Category:', theme: 'Theme:',
    tagline: 'WeatherGPT — Understand the weather. Make better decisions. 🌦️',
  },
  hi: {
    title: 'वेदरजीपीटी के बारे में', mission: '🌤️ हमारा मिशन', missionText: 'एक AI-प्रथम संवादात्मक मौसम इंटेलिजेंस प्लेटफ़ॉर्म है, जिसे स्मार्ट इंडिया हैकाथॉन 2026 — समस्या विवरण 26068 के लिए वाइब-कोडेड प्रोटोटाइप के रूप में बनाया गया है।', missionDetails: 'सिर्फ मौसम के आंकड़े दिखाने के बजाय, वेदरजीपीटी लोगों को मौसम का अर्थ समझने में मदद करता है।', whatWeDo: '🎯 हम क्या करते हैं', doItems: ['🌦️ समझें — जटिल मौसम जानकारी को स्पष्ट और आसान जानकारी में बदलें।', '🤖 पूछें — मौसम के सवाल स्वाभाविक रूप से पूछें और संदर्भ सहित AI उत्तर पाएं।', '📊 विश्लेषण करें — पूर्वानुमान, रुझान, बारिश, नमी, दबाव, तापमान और अन्य जानकारी देखें।', '🚨 कार्रवाई करें — बेहतर निर्णयों के लिए मौसम चेतावनियों और सुरक्षा जानकारी का उपयोग करें।', '🗺️ खोजें — इंटरैक्टिव मानचित्रों और स्थान-आधारित डेटा से मौसम देखें।'], keyFeatures: '✨ मुख्य विशेषताएं', featureItems: ['🌡️ लाइव मौसम डेटा — वर्तमान मौसम स्थितियां और अवलोकन', '🤖 संवादात्मक AI — प्राकृतिक भाषा में मौसम के सवाल पूछें', '📍 स्थान इंटेलिजेंस — कई स्थानों का मौसम देखें', '📊 पूर्वानुमान और इनसाइट्स — प्रति घंटे जानकारी और 7 दिन का पूर्वानुमान', '🚨 मौसम अलर्ट — महत्वपूर्ण मौसम और सुरक्षा जानकारी', '🗺️ इंटरैक्टिव मानचित्र — भौगोलिक रूप से मौसम देखें', '🇮🇳 बहुभाषी UI — 9 भारतीय भाषाओं में इंटरफ़ेस', '🎙️ वॉइस इनपुट — मौसम के सवाल बोलकर पूछें', '📱 Android सहायता — नेटिव Android बिल्ड के साथ मोबाइल अनुभव'], approach: '🧠 हमारा दृष्टिकोण', approachQuote: 'सिर्फ मौसम न दिखाएं। लोगों को उसका अर्थ समझने में मदद करें।', approachText: 'वेदरजीपीटी मौसम डेटा, संवादात्मक AI, विज़ुअलाइज़ेशन और संदर्भपूर्ण जानकारी को एक प्लेटफ़ॉर्म में जोड़ता है।', development: '🚀 विकास', developmentText: 'ऐप का प्रोटोटाइप, परीक्षण और सुधार तेजी से करने के लिए AI-सहायित / वाइब-कोडेड विकास का उपयोग किया गया।', hackathon: '📋 स्मार्ट इंडिया हैकाथॉन 2026', problemStatement: 'समस्या विवरण:', organization: 'संगठन:', department: 'विभाग:', category: 'श्रेणी:', theme: 'विषय:', tagline: 'वेदरजीपीटी — मौसम समझें। बेहतर निर्णय लें। 🌦️',
  },
  bn: {
    title: 'ওয়েদারজিপিটি সম্পর্কে', mission: '🌤️ আমাদের লক্ষ্য', missionText: 'ওয়েদারজিপিটি একটি AI-প্রথম কথোপকথনমূলক আবহাওয়া বুদ্ধিমত্তা প্ল্যাটফর্ম, যা স্মার্ট ইন্ডিয়া হ্যাকাথন ২০২৬ — সমস্যা বিবৃতি ২৬০৬৮-এর জন্য তৈরি একটি প্রোটোটাইপ।', whatWeDo: '🎯 আমরা কী করি', doItems: ['🌦️ বুঝুন — জটিল আবহাওয়ার তথ্যকে সহজ অন্তর্দৃষ্টিতে রূপান্তর করুন।', '🤖 জিজ্ঞাসা করুন — স্বাভাবিক ভাষায় প্রশ্ন করে প্রসঙ্গভিত্তিক AI উত্তর পান।', '📊 বিশ্লেষণ করুন — পূর্বাভাস, প্রবণতা, বৃষ্টি, আর্দ্রতা, চাপ ও তাপমাত্রা দেখুন।', '🚨 পদক্ষেপ নিন — ভালো সিদ্ধান্তের জন্য সতর্কতা ও নিরাপত্তা তথ্য ব্যবহার করুন।', '🗺️ অনুসন্ধান করুন — ইন্টার‌্যাক্টিভ মানচিত্রে আবহাওয়া দেখুন।'], keyFeatures: '✨ প্রধান বৈশিষ্ট্য', featureItems: ['🌡️ লাইভ আবহাওয়া তথ্য — বর্তমান অবস্থা ও পর্যবেক্ষণ', '🤖 কথোপকথনমূলক AI — স্বাভাবিক ভাষায় আবহাওয়া জিজ্ঞাসা', '📍 অবস্থান বুদ্ধিমত্তা — একাধিক স্থানের আবহাওয়া দেখুন', '📊 পূর্বাভাস ও ইনসাইটস — ঘণ্টাভিত্তিক ও ৭ দিনের পূর্বাভাস', '🚨 আবহাওয়া সতর্কতা — গুরুত্বপূর্ণ আবহাওয়া ও নিরাপত্তা তথ্য', '🗺️ ইন্টার‌্যাক্টিভ মানচিত্র — ভৌগোলিকভাবে আবহাওয়া দেখুন', '🇮🇳 বহুভাষিক UI — ৯টি ভারতীয় ভাষায় ইন্টারফেস', '🎙️ ভয়েস ইনপুট — কথা বলে প্রশ্ন করুন', '📱 Android সহায়তা — নেটিভ Android অভিজ্ঞতা'], approach: '🧠 আমাদের পদ্ধতি', approachQuote: 'শুধু আবহাওয়া দেখাবেন না। এর অর্থ বুঝতে সাহায্য করুন।', approachText: 'ওয়েদারজিপিটি আবহাওয়া তথ্য, কথোপকথনমূলক AI, ভিজ্যুয়ালাইজেশন ও প্রসঙ্গভিত্তিক অন্তর্দৃষ্টি একত্র করে।', development: '🚀 উন্নয়ন', developmentText: 'দ্রুত প্রোটোটাইপ, পরীক্ষা ও উন্নতির জন্য AI-সহায়িত / ভাইব-কোডেড উন্নয়ন ব্যবহার করা হয়েছে।', hackathon: '📋 স্মার্ট ইন্ডিয়া হ্যাকাথন ২০২৬', problemStatement: 'সমস্যা বিবৃতি:', organization: 'সংস্থা:', department: 'বিভাগ:', category: 'বিভাগ:', theme: 'বিষয়:', tagline: 'ওয়েদারজিপিটি — আবহাওয়া বুঝুন। আরও ভালো সিদ্ধান্ত নিন। 🌦️',
  },
  mr: {
    title: 'वेदरजीपीटी बद्दल', mission: '🌤️ आमचे ध्येय', missionText: 'वेदरजीपीटी हे AI-प्रथम संवादात्मक हवामान बुद्धिमत्ता व्यासपीठ आहे, जे स्मार्ट इंडिया हॅकाथॉन २०२६ — समस्या विधान २६०६८ साठी प्रोटोटाइप म्हणून विकसित केले आहे.', whatWeDo: '🎯 आम्ही काय करतो', doItems: ['🌦️ समजून घ्या — गुंतागुंतीची हवामान माहिती सोप्या अंतर्दृष्टीत बदला.', '🤖 विचारा — नैसर्गिक भाषेत हवामानाचे प्रश्न विचारा आणि AI उत्तरे मिळवा.', '📊 विश्लेषण करा — अंदाज, पाऊस, आर्द्रता, दाब, तापमान आणि इतर माहिती पाहा.', '🚨 कृती करा — चांगले निर्णय घेण्यासाठी सूचना व सुरक्षा माहिती वापरा.', '🗺️ शोधा — परस्परसंवादी नकाशांवर हवामान पाहा.'], keyFeatures: '✨ मुख्य वैशिष्ट्ये', featureItems: ['🌡️ थेट हवामान माहिती — सध्याची स्थिती व निरीक्षणे', '🤖 संवादात्मक AI — नैसर्गिक भाषेत हवामान विचारा', '📍 स्थान बुद्धिमत्ता — अनेक ठिकाणांचे हवामान पाहा', '📊 अंदाज व इनसाइट्स — तासिक व ७ दिवसांचा अंदाज', '🚨 हवामान सूचना — महत्त्वाची हवामान व सुरक्षा माहिती', '🗺️ परस्परसंवादी नकाशे — भौगोलिक हवामान पाहा', '🇮🇳 बहुभाषिक UI — ९ भारतीय भाषांमध्ये इंटरफेस', '🎙️ आवाज इनपुट — प्रश्न बोलून विचारा', '📱 Android समर्थन — नेटिव्ह Android अनुभव'], approach: '🧠 आमचा दृष्टिकोन', approachQuote: 'फक्त हवामान दाखवू नका. त्याचा अर्थ समजून घेण्यास मदत करा.', approachText: 'वेदरजीपीटी हवामान डेटा, संवादात्मक AI, दृश्यचित्रे आणि संदर्भपूर्ण अंतर्दृष्टी एकत्र करते.', development: '🚀 विकास', developmentText: 'जलद प्रोटोटाइप, चाचणी आणि सुधारणा करण्यासाठी AI-सहाय्यित / वाइब-कोडेड विकास वापरला.', hackathon: '📋 स्मार्ट इंडिया हॅकाथॉन २०२६', problemStatement: 'समस्या विधान:', organization: 'संस्था:', department: 'विभाग:', category: 'श्रेणी:', theme: 'विषय:', tagline: 'वेदरजीपीटी — हवामान समजा. चांगले निर्णय घ्या. 🌦️',
  },
  ta: {
    title: 'வெதர்ஜிபிடி பற்றி', mission: '🌤️ எங்கள் நோக்கம்', missionText: 'வெதர்ஜிபிடி என்பது ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026 — பிரச்சினை அறிக்கை 26068-க்காக உருவாக்கப்பட்ட AI-முதல் உரையாடல் வானிலை தளமாகும்.', whatWeDo: '🎯 நாங்கள் செய்வது', doItems: ['🌦️ புரிந்துகொள்ளுங்கள் — சிக்கலான வானிலை தகவலை எளிய நுண்ணறிவாக மாற்றுங்கள்.', '🤖 கேளுங்கள் — இயல்பான மொழியில் வானிலை கேள்விகளைக் கேட்டு AI பதில்களைப் பெறுங்கள்.', '📊 பகுப்பாய்வு செய்யுங்கள் — முன்னறிவிப்பு, மழை, ஈரப்பதம், அழுத்தம் மற்றும் வெப்பநிலையைப் பாருங்கள்.', '🚨 செயல்படுங்கள் — எச்சரிக்கைகள் மற்றும் பாதுகாப்புத் தகவல்களைப் பயன்படுத்துங்கள்.', '🗺️ ஆராயுங்கள் — ஊடாடும் வரைபடங்களில் வானிலையைப் பாருங்கள்.'], keyFeatures: '✨ முக்கிய அம்சங்கள்', featureItems: ['🌡️ நேரடி வானிலைத் தரவு — தற்போதைய நிலைமைகள்', '🤖 உரையாடல் AI — இயல்பான மொழியில் கேளுங்கள்', '📍 இட நுண்ணறிவு — பல இடங்களின் வானிலையைப் பாருங்கள்', '📊 முன்னறிவிப்புகள் மற்றும் நுண்ணறிவுகள் — மணிநேர மற்றும் 7 நாள் முன்னறிவிப்பு', '🚨 வானிலை எச்சரிக்கைகள் — முக்கிய பாதுகாப்புத் தகவல்', '🗺️ ஊடாடும் வரைபடங்கள் — வானிலையைப் புவியியல் ரீதியாகப் பாருங்கள்', '🇮🇳 பல்மொழி UI — 9 இந்திய மொழிகளில் இடைமுகம்', '🎙️ குரல் உள்ளீடு — கேள்விகளைப் பேசுங்கள்', '📱 Android ஆதரவு — மொபைல் அனுபவம்'], approach: '🧠 எங்கள் அணுகுமுறை', approachQuote: 'வானிலையை மட்டும் காட்டாதீர்கள். அதன் அர்த்தத்தைப் புரிந்துகொள்ள உதவுங்கள்.', approachText: 'வெதர்ஜிபிடி வானிலைத் தரவு, உரையாடல் AI, காட்சிப்படுத்தல்கள் மற்றும் சூழல் நுண்ணறிவை இணைக்கிறது.', development: '🚀 மேம்பாடு', developmentText: 'விரைவான முன்மாதிரி மற்றும் மேம்பாட்டிற்காக AI-உதவிய / வைப்கோடட் மேம்பாடு பயன்படுத்தப்பட்டது.', hackathon: '📋 ஸ்மார்ட் இந்தியா ஹேக்கத்தான் 2026', problemStatement: 'பிரச்சினை அறிக்கை:', organization: 'அமைப்பு:', department: 'துறை:', category: 'வகை:', theme: 'கருத்து:', tagline: 'வெதர்ஜிபிடி — வானிலையைப் புரிந்துகொள்ளுங்கள். சிறந்த முடிவுகளை எடுங்கள். 🌦️',
  },
  te: {
    title: 'వెదర్‌జీపీటీ గురించి', mission: '🌤️ మా లక్ష్యం', missionText: 'వెదర్‌జీపీటీ అనేది స్మార్ట్ ఇండియా హ్యాకథాన్ 2026 — సమస్య ప్రకటన 26068 కోసం రూపొందించిన AI-మొదటి సంభాషణాత్మక వాతావరణ వేదిక.', whatWeDo: '🎯 మేము చేసేది', doItems: ['🌦️ అర్థం చేసుకోండి — క్లిష్టమైన వాతావరణ సమాచారాన్ని సులభమైన విషయాలుగా మార్చండి.', '🤖 అడగండి — సహజ భాషలో ప్రశ్నలు అడిగి AI సమాధానాలు పొందండి.', '📊 విశ్లేషించండి — అంచనాలు, వర్షం, తేమ, పీడనం, ఉష్ణోగ్రత చూడండి.', '🚨 చర్య తీసుకోండి — హెచ్చరికలు మరియు భద్రతా సమాచారాన్ని ఉపయోగించండి.', '🗺️ అన్వేషించండి — ఇంటరాక్టివ్ మ్యాప్‌లలో వాతావరణాన్ని చూడండి.'], keyFeatures: '✨ ముఖ్య లక్షణాలు', featureItems: ['🌡️ ప్రత్యక్ష వాతావరణ డేటా — ప్రస్తుత పరిస్థితులు', '🤖 సంభాషణాత్మక AI — సహజ భాషలో వాతావరణం అడగండి', '📍 స్థాన మేధస్సు — అనేక ప్రాంతాల వాతావరణం', '📊 అంచనాలు మరియు ఇన్‌సైట్స్ — గంటవారీ మరియు 7 రోజుల అంచనాలు', '🚨 వాతావరణ హెచ్చరికలు — ముఖ్యమైన భద్రతా సమాచారం', '🗺️ ఇంటరాక్టివ్ మ్యాప్‌లు — వాతావరణాన్ని భౌగోళికంగా చూడండి', '🇮🇳 బహుభాషా UI — 9 భారతీయ భాషల్లో ఇంటర్‌ఫేస్', '🎙️ వాయిస్ ఇన్‌పుట్ — ప్రశ్నలను మాట్లాడండి', '📱 Android మద్దతు — మొబైల్ అనుభవం'], approach: '🧠 మా విధానం', approachQuote: 'వాతావరణాన్ని మాత్రమే చూపించవద్దు. దాని అర్థాన్ని అర్థం చేసుకోవడంలో సహాయపడండి.', approachText: 'వెదర్‌జీపీటీ వాతావరణ డేటా, సంభాషణాత్మక AI, విజువలైజేషన్లు మరియు సందర్భోచిత అంతర్దృష్టులను కలుపుతుంది.', development: '🚀 అభివృద్ధి', developmentText: 'వేగంగా ప్రోటోటైప్ చేయడానికి, పరీక్షించడానికి మరియు మెరుగుపరచడానికి AI-సహాయక అభివృద్ధిని ఉపయోగించారు.', hackathon: '📋 స్మార్ట్ ఇండియా హ్యాకథాన్ 2026', problemStatement: 'సమస్య ప్రకటన:', organization: 'సంస్థ:', department: 'శాఖ:', category: 'వర్గం:', theme: 'థీమ్:', tagline: 'వెదర్‌జీపీటీ — వాతావరణాన్ని అర్థం చేసుకోండి. మెరుగైన నిర్ణయాలు తీసుకోండి. 🌦️',
  },
  gu: {
    title: 'વેધરજિપિટી વિશે', mission: '🌤️ અમારું ધ્યેય', missionText: 'વેધરજિપિટી એ સ્માર્ટ ઇન્ડિયા હેકાથોન 2026 — સમસ્યા નિવેદન 26068 માટે બનાવેલું AI-પ્રથમ વાતચીત આધારિત હવામાન પ્લેટફોર્મ છે.', whatWeDo: '🎯 અમે શું કરીએ છીએ', doItems: ['🌦️ સમજો — જટિલ હવામાન માહિતીને સરળ સમજમાં ફેરવો.', '🤖 પૂછો — સ્વાભાવિક ભાષામાં પ્રશ્નો પૂછો અને AI જવાબો મેળવો.', '📊 વિશ્લેષણ કરો — આગાહી, વરસાદ, ભેજ, દબાણ અને તાપમાન જુઓ.', '🚨 કાર્ય કરો — ચેતવણીઓ અને સુરક્ષા માહિતીનો ઉપયોગ કરો.', '🗺️ શોધો — ઇન્ટરેક્ટિવ નકશા પર હવામાન જુઓ.'], keyFeatures: '✨ મુખ્ય સુવિધાઓ', featureItems: ['🌡️ લાઇવ હવામાન ડેટા — વર્તમાન સ્થિતિ', '🤖 વાતચીત AI — સ્વાભાવિક ભાષામાં હવામાન પૂછો', '📍 સ્થાન બુદ્ધિ — અનેક સ્થળોનું હવામાન', '📊 આગાહીઓ અને ઇનસાઇટ્સ — કલાકદીઠ અને 7 દિવસની આગાહી', '🚨 હવામાન ચેતવણીઓ — મહત્વપૂર્ણ સુરક્ષા માહિતી', '🗺️ ઇન્ટરેક્ટિવ નકશા — ભૌગોલિક હવામાન જુઓ', '🇮🇳 બહુભાષી UI — 9 ભારતીય ભાષાઓમાં ઇન્ટરફેસ', '🎙️ વૉઇસ ઇનપુટ — પ્રશ્નો બોલો', '📱 Android સપોર્ટ — મોબાઇલ અનુભવ'], approach: '🧠 અમારો અભિગમ', approachQuote: 'માત્ર હવામાન ન બતાવો. તેનો અર્થ સમજવામાં લોકોને મદદ કરો.', approachText: 'વેધરજિપિટી હવામાન ડેટા, વાતચીત AI, વિઝ્યુઅલાઇઝેશન અને સંદર્ભિત સમજને જોડે છે.', development: '🚀 વિકાસ', developmentText: 'ઝડપી પ્રોટોટાઇપ અને સુધારા માટે AI-સહાયિત વિકાસનો ઉપયોગ કરવામાં આવ્યો.', hackathon: '📋 સ્માર્ટ ઇન્ડિયા હેકાથોન 2026', problemStatement: 'સમસ્યા નિવેદન:', organization: 'સંસ્થા:', department: 'વિભાગ:', category: 'વર્ગ:', theme: 'થીમ:', tagline: 'વેધરજિપિટી — હવામાન સમજો. વધુ સારા નિર્ણયો લો. 🌦️',
  },
  pa: {
    title: 'ਵੈਦਰਜੀਪੀਟੀ ਬਾਰੇ', mission: '🌤️ ਸਾਡਾ ਮਿਸ਼ਨ', missionText: 'ਵੈਦਰਜੀਪੀਟੀ ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥਾਨ 2026 — ਸਮੱਸਿਆ ਬਿਆਨ 26068 ਲਈ ਬਣਾਇਆ ਗਿਆ AI-ਪਹਿਲਾ ਗੱਲਬਾਤੀ ਮੌਸਮ ਪਲੇਟਫਾਰਮ ਹੈ।', whatWeDo: '🎯 ਅਸੀਂ ਕੀ ਕਰਦੇ ਹਾਂ', doItems: ['🌦️ ਸਮਝੋ — ਗੁੰਝਲਦਾਰ ਮੌਸਮ ਜਾਣਕਾਰੀ ਨੂੰ ਸੌਖੀ ਸਮਝ ਵਿੱਚ ਬਦਲੋ।', '🤖 ਪੁੱਛੋ — ਕੁਦਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ AI ਜਵਾਬ ਲਵੋ।', '📊 ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ — ਪੂਰਵ-ਅਨੁਮਾਨ, ਮੀਂਹ, ਨਮੀ, ਦਬਾਅ ਅਤੇ ਤਾਪਮਾਨ ਵੇਖੋ।', '🚨 ਕਾਰਵਾਈ ਕਰੋ — ਚੇਤਾਵਨੀਆਂ ਅਤੇ ਸੁਰੱਖਿਆ ਜਾਣਕਾਰੀ ਵਰਤੋ।', '🗺️ ਖੋਜੋ — ਇੰਟਰਐਕਟਿਵ ਨਕਸ਼ਿਆਂ ਰਾਹੀਂ ਮੌਸਮ ਵੇਖੋ।'], keyFeatures: '✨ ਮੁੱਖ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ', featureItems: ['🌡️ ਲਾਈਵ ਮੌਸਮ ਡੇਟਾ — ਮੌਜੂਦਾ ਹਾਲਾਤ', '🤖 ਗੱਲਬਾਤੀ AI — ਕੁਦਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ ਮੌਸਮ ਪੁੱਛੋ', '📍 ਸਥਾਨ ਬੁੱਧੀ — ਕਈ ਥਾਵਾਂ ਦਾ ਮੌਸਮ', '📊 ਪੂਰਵ-ਅਨੁਮਾਨ ਅਤੇ ਇਨਸਾਈਟਸ — ਘੰਟਾਵਾਰ ਅਤੇ 7 ਦਿਨਾਂ ਦਾ ਅਨੁਮਾਨ', '🚨 ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ — ਮਹੱਤਵਪੂਰਨ ਸੁਰੱਖਿਆ ਜਾਣਕਾਰੀ', '🗺️ ਇੰਟਰਐਕਟਿਵ ਨਕਸ਼ੇ — ਭੂਗੋਲਿਕ ਮੌਸਮ ਵੇਖੋ', '🇮🇳 ਬਹੁਭਾਸ਼ੀ UI — 9 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਇੰਟਰਫੇਸ', '🎙️ ਵੌਇਸ ਇਨਪੁਟ — ਸਵਾਲ ਬੋਲੋ', '📱 Android ਸਹਾਇਤਾ — ਮੋਬਾਈਲ ਅਨੁਭਵ'], approach: '🧠 ਸਾਡਾ ਤਰੀਕਾ', approachQuote: 'ਸਿਰਫ਼ ਮੌਸਮ ਨਾ ਦਿਖਾਓ। ਲੋਕਾਂ ਨੂੰ ਇਸਦਾ ਮਤਲਬ ਸਮਝਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।', approachText: 'ਵੈਦਰਜੀਪੀਟੀ ਮੌਸਮ ਡੇਟਾ, ਗੱਲਬਾਤੀ AI, ਵਿਜ਼ੁਅਲਾਈਜ਼ੇਸ਼ਨ ਅਤੇ ਸੰਦਰਭਿਕ ਸਮਝ ਨੂੰ ਜੋੜਦਾ ਹੈ।', development: '🚀 ਵਿਕਾਸ', developmentText: 'ਤੇਜ਼ ਪ੍ਰੋਟੋਟਾਈਪ ਅਤੇ ਸੁਧਾਰ ਲਈ AI-ਸਹਾਇਤ ਵਿਕਾਸ ਵਰਤਿਆ ਗਿਆ।', hackathon: '📋 ਸਮਾਰਟ ਇੰਡੀਆ ਹੈਕਾਥਾਨ 2026', problemStatement: 'ਸਮੱਸਿਆ ਬਿਆਨ:', organization: 'ਸੰਸਥਾ:', department: 'ਵਿਭਾਗ:', category: 'ਸ਼੍ਰੇਣੀ:', theme: 'ਥੀਮ:', tagline: 'ਵੈਦਰਜੀਪੀਟੀ — ਮੌਸਮ ਸਮਝੋ। ਬਿਹਤਰ ਫੈਸਲੇ ਲਵੋ। 🌦️',
  },
  ml: {
    title: 'വെതർജിപിടിയെക്കുറിച്ച്', mission: '🌤️ ഞങ്ങളുടെ ദൗത്യം', missionText: 'സ്മാർട്ട് ഇന്ത്യ ഹാക്കത്തോൺ 2026 — പ്രശ്ന പ്രസ്താവന 26068-നായി വികസിപ്പിച്ച AI-ആദ്യ സംഭാഷണ കാലാവസ്ഥാ പ്ലാറ്റ്‌ഫോമാണ് വെതർജിപിടി.', whatWeDo: '🎯 ഞങ്ങൾ ചെയ്യുന്നത്', doItems: ['🌦️ മനസ്സിലാക്കുക — സങ്കീർണ്ണമായ കാലാവസ്ഥാ വിവരങ്ങൾ ലളിതമാക്കുക.', '🤖 ചോദിക്കുക — സ്വാഭാവിക ഭാഷയിൽ ചോദ്യങ്ങൾ ചോദിച്ച് AI ഉത്തരങ്ങൾ നേടുക.', '📊 വിശകലനം ചെയ്യുക — പ്രവചനം, മഴ, ഈർപ്പം, മർദ്ദം, താപനില എന്നിവ കാണുക.', '🚨 പ്രവർത്തിക്കുക — മുന്നറിയിപ്പുകളും സുരക്ഷാ വിവരങ്ങളും ഉപയോഗിക്കുക.', '🗺️ പര്യവേക്ഷണം ചെയ്യുക — ഇന്ററാക്ടീവ് മാപ്പുകളിൽ കാലാവസ്ഥ കാണുക.'], keyFeatures: '✨ പ്രധാന സവിശേഷതകൾ', featureItems: ['🌡️ തത്സമയ കാലാവസ്ഥാ ഡാറ്റ — നിലവിലെ സാഹചര്യങ്ങൾ', '🤖 സംഭാഷണ AI — സ്വാഭാവിക ഭാഷയിൽ കാലാവസ്ഥ ചോദിക്കുക', '📍 ലൊക്കേഷൻ ബുദ്ധി — ഒന്നിലധികം സ്ഥലങ്ങളിലെ കാലാവസ്ഥ', '📊 പ്രവചനങ്ങളും ഇൻസൈറ്റുകളും — മണിക്കൂർ, 7 ദിവസ പ്രവചനം', '🚨 കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ — പ്രധാന സുരക്ഷാ വിവരങ്ങൾ', '🗺️ ഇന്ററാക്ടീവ് മാപ്പുകൾ — ഭൂമിശാസ്ത്രപരമായി കാലാവസ്ഥ കാണുക', '🇮🇳 ബഹുഭാഷാ UI — 9 ഇന്ത്യൻ ഭാഷകളിൽ ഇന്റർഫേസ്', '🎙️ വോയ്സ് ഇൻപുട്ട് — ചോദ്യങ്ങൾ സംസാരിക്കുക', '📱 Android പിന്തുണ — മൊബൈൽ അനുഭവം'], approach: '🧠 ഞങ്ങളുടെ സമീപനം', approachQuote: 'കാലാവസ്ഥ മാത്രം കാണിക്കരുത്. അതിന്റെ അർത്ഥം മനസ്സിലാക്കാൻ സഹായിക്കുക.', approachText: 'വെതർജിപിടി കാലാവസ്ഥാ ഡാറ്റ, സംഭാഷണ AI, ദൃശ്യവൽക്കരണം, സന്ദർഭോചിതമായ അറിവ് എന്നിവ കൂട്ടിച്ചേർക്കുന്നു.', development: '🚀 വികസനം', developmentText: 'വേഗത്തിലുള്ള പ്രോട്ടോടൈപ്പിനും മെച്ചപ്പെടുത്തലിനുമായി AI-സഹായിത വികസനം ഉപയോഗിച്ചു.', hackathon: '📋 സ്മാർട്ട് ഇന്ത്യ ഹാക്കത്തോൺ 2026', problemStatement: 'പ്രശ്ന പ്രസ്താവന:', organization: 'സ്ഥാപനം:', department: 'വകുപ്പ്:', category: 'വിഭാഗം:', theme: 'പ്രമേയം:', tagline: 'വെതർജിപിടി — കാലാവസ്ഥ മനസ്സിലാക്കുക. മികച്ച തീരുമാനങ്ങൾ എടുക്കുക. 🌦️',
  },
}

function renderAboutItem(item: string) {
  const match = item.match(/^(\S+)\s+(.+?)\s+—\s+(.+)$/)
  if (!match) return item
  return <>{match[1]} <strong>{match[2]}</strong> — {match[3]}</>
}

const speechLanguageMap: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  ml: 'ml-IN',
}

const detectGreeting = (question: string) => /^(hi|hello|hey|namaste|hlo|hi there|good morning|good evening|good afternoon)/i.test(question.trim())
const detectCropQuestion = (question: string) => /(plant|planting|crop|farmer|sowing|seed|agri|agriculture|khet|fertilizer|harvest)/i.test(question)
const detectRainQuestion = (question: string) => /(rain|umbrella|storm|cloud|wet|drizzle|downpour|precipitation)/i.test(question)

function getGreetingReply(question: string, language: LanguageCode) {
  const t = localeText[language]
  const normalized = question.trim().toLowerCase()

  if (detectCropQuestion(normalized)) return t.greetings.crop
  if (detectRainQuestion(normalized)) return t.greetings.rain
  if (detectGreeting(normalized)) return t.greetings.normal
  return t.greetings.day
}

function fillTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

function localizeCondition(condition: string, t: TranslationSet) {
  return t.conditions[condition] ?? condition
}

function localizedSummary(weather: WeatherSnapshot, t: TranslationSet) {
  return fillTemplate(t.summaryTemplate, { condition: localizeCondition(weather.condition, t), humidity: weather.humidity })
}

function localizeDayName(day: string, language: LanguageCode, t: TranslationSet) {
  if (day === 'Today') return t.today
  const target = day.toUpperCase()
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    if (date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() === target) {
      return date.toLocaleDateString(speechLanguageMap[language], { weekday: 'short' })
    }
  }
  return day
}

function localizeHourLabel(time: string, language: LanguageCode, t: TranslationSet) {
  if (time === 'Now') return t.nowLabel
  const match = time.match(/^(\d{1,2})/)
  if (!match) return time
  const date = new Date()
  date.setHours(Number(match[1]), 0, 0, 0)
  return date.toLocaleTimeString(speechLanguageMap[language], { hour: 'numeric' })
}

function localizeUpdated(updated: string, t: TranslationSet) {
  if (updated === 'just now') return t.justNow
  if (updated.startsWith('updated ')) return `${t.updatedPrefix} ${updated.slice(8)}`
  return updated
}

type GreetingKey = 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' | 'greetingNight'

function getGreetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return 'greetingMorning'
  if (hour >= 12 && hour < 17) return 'greetingAfternoon'
  if (hour >= 17 && hour < 21) return 'greetingEvening'
  return 'greetingNight'
}

function buildFallbackAnswer(question: string, weather: WeatherSnapshot, language: LanguageCode) {
  const t = localeText[language]
  const q = question.trim()
  const vars = {
    location: weather.location,
    summary: localizedSummary(weather, t).toLowerCase(),
    condition: localizeCondition(weather.condition, t).toLowerCase(),
    temp: weather.temperature,
    humidity: weather.humidity,
    feels: weather.feelsLike,
    wind: weather.wind,
    rain: weather.forecast[1]?.rain ?? 35,
    high: weather.forecast[1]?.high ?? weather.temperature + 2,
    low: weather.forecast[1]?.low ?? weather.temperature - 2,
  }

  if (!q) return t.greetings.normal

  if (detectGreeting(q)) return getGreetingReply(q, language)

  if (!isWeatherQuestion(q)) {
    return fillTemplate(t.notWeatherReply, vars)
  }

  if (/(year|annual|month|next\s+1\s+year|next\s+month)/i.test(q)) {
    return fillTemplate(t.yearReply, vars)
  }

  if (detectCropQuestion(q)) {
    return `${t.greetings.crop} ${fillTemplate(t.cropExtra, vars)}`
  }

  if (detectRainQuestion(q) || /wear|outfit|umbrella|plan|travel|walk|trip/.test(q)) {
    return `${t.greetings.rain} ${fillTemplate(t.rainExtra, vars)}`
  }

  return fillTemplate(t.outlookReply, vars)
}

function hasMeaningfulWeatherChange(current: WeatherSnapshot, incoming: WeatherSnapshot) {
  return current.location !== incoming.location ||
    current.updated !== incoming.updated ||
    current.temperature !== incoming.temperature ||
    current.feelsLike !== incoming.feelsLike ||
    current.condition !== incoming.condition ||
    current.summary !== incoming.summary ||
    current.humidity !== incoming.humidity ||
    current.wind !== incoming.wind ||
    current.pressure !== incoming.pressure ||
    current.aqi !== incoming.aqi ||
    current.sunrise !== incoming.sunrise ||
    current.sunset !== incoming.sunset ||
    current.forecast.length !== incoming.forecast.length ||
    current.hourly.length !== incoming.hourly.length ||
    current.alerts.length !== incoming.alerts.length ||
    current.forecast.some((day, index) => {
      const next = incoming.forecast[index]
      return !next || day.day !== next.day || day.high !== next.high || day.low !== next.low || day.rain !== next.rain
    }) ||
    current.hourly.some((hour, index) => {
      const next = incoming.hourly[index]
      return !next || hour.time !== next.time || hour.temp !== next.temp || hour.rain !== next.rain
    }) ||
    current.alerts.some((alert, index) => {
      const next = incoming.alerts[index]
      return !next || alert.title !== next.title || alert.severity !== next.severity || alert.area !== next.area || alert.time !== next.time
    })
}

function App() {
  const [tab, setTab] = useState<Tab>('weather')
  const [slideDirection, setSlideDirection] = useState<'right' | 'left' | null>(null)
  const tabRef = useRef<Tab>(tab)
  tabRef.current = tab

  const appRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [location, setLocation] = useState('Bhilai')
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [cityResults, setCityResults] = useState<Array<{ name: string; country: string; admin1: string; latitude: number; longitude: number }>>([])
  const [recentCities, setRecentCities] = useState<string[]>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('weathergpt-recent-cities') : null
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 8) : []
    } catch {
      return []
    }
  })
  const [refreshTick, setRefreshTick] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const [question, setQuestion] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [typing, setTyping] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [showLanguageModal, setShowLanguageModal] = useState(true)
  const [messages, setMessages] = useState<Message[]>(() => {
    const storedLanguage = (typeof localStorage !== 'undefined' ? localStorage.getItem('weathergpt-language') : null) as LanguageCode | null
    const initialText = (storedLanguage && localeText[storedLanguage]?.initialMessage) || localeText.en.initialMessage
    return [{ role: 'assistant', text: initialText }]
  })
  const [weather, setWeather] = useState<WeatherSnapshot>(() => getWeatherSnapshot('Bhilai'))
  const recognitionRef = useRef<{ start: () => void; stop: () => void; abort: () => void; onresult: ((event: any) => void) | null; onend: (() => void) | null; lang: string; continuous: boolean; interimResults: boolean } | null>(null)

  const switchTab = useCallback((targetTab: Tab) => {
    setTab((currentTab) => {
      if (currentTab === targetTab) return currentTab
      const currentIndex = TABS.indexOf(currentTab)
      const targetIndex = TABS.indexOf(targetTab)
      setSlideDirection(targetIndex > currentIndex ? 'right' : 'left')
      window.scrollTo({ top: 0, behavior: 'instant' })
      return targetTab
    })
  }, [])

  const goToNextTab = useCallback(() => {
    setTab((currentTab) => {
      const currentIndex = TABS.indexOf(currentTab)
      if (currentIndex < TABS.length - 1) {
        setSlideDirection('right')
        window.scrollTo({ top: 0, behavior: 'instant' })
        return TABS[currentIndex + 1]
      }
      return currentTab
    })
  }, [])

  const goToPrevTab = useCallback(() => {
    setTab((currentTab) => {
      const currentIndex = TABS.indexOf(currentTab)
      if (currentIndex > 0) {
        setSlideDirection('left')
        window.scrollTo({ top: 0, behavior: 'instant' })
        return TABS[currentIndex - 1]
      }
      return currentTab
    })
  }, [])

  const openWeatherTab = useCallback(() => switchTab('weather'), [switchTab])
  const openAlertsTab = useCallback(() => switchTab('alerts'), [switchTab])
  const openAskTab = useCallback(() => switchTab('ask'), [switchTab])
  const openMapTab = useCallback(() => switchTab('map'), [switchTab])
  const openInsightsTab = useCallback(() => switchTab('insights'), [switchTab])
  const openAboutTab = useCallback(() => switchTab('about'), [switchTab])

  useEffect(() => {
    const appEl = appRef.current
    if (!appEl) return

    let startX = 0
    let startY = 0
    let startTime = 0
    let gesture: 'none' | 'horizontal' | 'vertical' = 'none'
    let isExcluded = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
      gesture = 'none'

      const target = e.target as HTMLElement | null
      if (
        target &&
        target.closest(
          '.bottom-dock, .header-actions, .language-overlay, .leaflet-container, .range-pills, .recommendation-scroll, .city-grid, input, textarea, select, .location-card, .location-sheet'
        )
      ) {
        isExcluded = true
        return
      }
      isExcluded = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isExcluded || e.touches.length !== 1) return
      const touch = e.touches[0]
      const diffX = touch.clientX - startX
      const diffY = touch.clientY - startY

      if (gesture === 'none') {
        const absX = Math.abs(diffX)
        const absY = Math.abs(diffY)
        if (absX > 7 || absY > 7) {
          if (absY >= absX) {
            gesture = 'vertical'
          } else {
            gesture = 'horizontal'
          }
        }
      }

      if (gesture === 'horizontal') {
        if (e.cancelable) {
          e.preventDefault()
        }

        const currentIndex = TABS.indexOf(tabRef.current)
        let offset = diffX
        if ((currentIndex === 0 && diffX > 0) || (currentIndex === TABS.length - 1 && diffX < 0)) {
          offset = diffX * 0.25
        }

        if (contentRef.current) {
          contentRef.current.style.transition = 'none'
          contentRef.current.style.transform = `translateX(${offset}px)`
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isExcluded) return

      if (gesture === 'horizontal') {
        const touch = e.changedTouches[0]
        const diffX = touch.clientX - startX
        const duration = Date.now() - startTime
        const velocityX = Math.abs(diffX) / Math.max(duration, 1)

        const currentIndex = TABS.indexOf(tabRef.current)

        if (Math.abs(diffX) > 48 || (Math.abs(diffX) > 24 && velocityX > 0.3)) {
          if (diffX < 0 && currentIndex < TABS.length - 1) {
            if (contentRef.current) {
              contentRef.current.style.transition = 'transform 0.16s ease-out, opacity 0.16s ease-out'
              contentRef.current.style.transform = 'translateX(-60px)'
              contentRef.current.style.opacity = '0'
            }
            goToNextTab()
            gesture = 'none'
            return
          } else if (diffX > 0 && currentIndex > 0) {
            if (contentRef.current) {
              contentRef.current.style.transition = 'transform 0.16s ease-out, opacity 0.16s ease-out'
              contentRef.current.style.transform = 'translateX(60px)'
              contentRef.current.style.opacity = '0'
            }
            goToPrevTab()
            gesture = 'none'
            return
          }
        }

        if (contentRef.current) {
          contentRef.current.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease'
          contentRef.current.style.transform = 'translateX(0)'
          contentRef.current.style.opacity = '1'
        }
      }

      gesture = 'none'
    }

    const handleTouchCancel = () => {
      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease'
        contentRef.current.style.transform = 'translateX(0)'
        contentRef.current.style.opacity = '1'
      }
      gesture = 'none'
    }

    appEl.addEventListener('touchstart', handleTouchStart, { passive: true })
    appEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    appEl.addEventListener('touchend', handleTouchEnd, { passive: true })
    appEl.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      appEl.removeEventListener('touchstart', handleTouchStart)
      appEl.removeEventListener('touchmove', handleTouchMove)
      appEl.removeEventListener('touchend', handleTouchEnd)
      appEl.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [goToNextTab, goToPrevTab])

  useEffect(() => {
    let wheelAccumulator = 0
    let wheelTimer: number | null = null
    let isLocked = false

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return

      const target = e.target as HTMLElement | null
      if (
        target &&
        target.closest(
          '.leaflet-container, .range-pills, .recommendation-scroll, .city-grid, input, textarea, select, .language-modal, .location-card, .location-sheet'
        )
      ) {
        return
      }

      if (isLocked) return

      wheelAccumulator += e.deltaX

      if (wheelTimer) window.clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        wheelAccumulator = 0
      }, 180)

      if (Math.abs(wheelAccumulator) > 35) {
        isLocked = true
        if (wheelAccumulator > 0) {
          goToNextTab()
        } else {
          goToPrevTab()
        }
        wheelAccumulator = 0
        window.setTimeout(() => {
          isLocked = false
        }, 380)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (wheelTimer) window.clearTimeout(wheelTimer)
    }
  }, [goToNextTab, goToPrevTab])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (e.key === 'ArrowRight') {
        goToNextTab()
      } else if (e.key === 'ArrowLeft') {
        goToPrevTab()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextTab, goToPrevTab])

  useEffect(() => {
    const storedLanguage = localStorage.getItem('weathergpt-language') as LanguageCode | null
    if (storedLanguage && languageOptions.some((option) => option.code === storedLanguage)) {
      setLanguage(storedLanguage)
    }
    setShowLanguageModal(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('weathergpt-language', language)
  }, [language])

  const chooseLanguage = useCallback((code: LanguageCode) => {
    setLanguage(code)
    setMessages((current) => {
      if (current.length === 1 && current[0].role === 'assistant' && !current[0].data && Object.values(localeText).some((entry) => entry.initialMessage === current[0].text)) {
        return [{ role: 'assistant', text: localeText[code].initialMessage }]
      }
      return current
    })
    setShowLanguageModal(false)
  }, [])

  useEffect(() => {
    const clockTimer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(clockTimer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshTick((tick) => tick + 1), REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    document.body.style.overflow = locationOpen ? 'hidden' : ''
    let viewport: VisualViewport | null = null
    const updateSheetInset = () => {
      let inset = 0
      if (locationOpen && typeof window !== 'undefined' && 'visualViewport' in window && window.visualViewport) {
        inset = Math.max(0, window.innerHeight - window.visualViewport.height)
      }
      document.documentElement.style.setProperty('--sheet-inset', `${inset}px`)
    }
    if (typeof window !== 'undefined' && 'visualViewport' in window && window.visualViewport) {
      viewport = window.visualViewport
      viewport.addEventListener('resize', updateSheetInset)
      updateSheetInset()
    }
    return () => {
      document.body.style.overflow = ''
      viewport?.removeEventListener('resize', updateSheetInset)
      document.documentElement.style.setProperty('--sheet-inset', '0px')
    }
  }, [locationOpen])

  useEffect(() => {
    let active = true
    const syncWeather = async () => {
      try {
        const freshWeather = await getWeatherData(location)
        if (!active) return
        setWeather((current) => (current && !hasMeaningfulWeatherChange(current, freshWeather) ? current : freshWeather))
      } catch {
        const fallbackWeather = getWeatherSnapshot(location)
        if (!active) return
        setWeather((current) => (current && !hasMeaningfulWeatherChange(current, fallbackWeather) ? current : fallbackWeather))
      }
    }

    syncWeather()

    return () => {
      active = false
    }
  }, [location, refreshTick])

  const t = useMemo(() => localeText[language], [language])

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('weathergpt-recent-cities', JSON.stringify(recentCities))
      }
    } catch {
      // storage may be unavailable (private mode) — ignore
    }
  }, [recentCities])

  const rememberCity = useCallback((name: string) => {
    setRecentCities((current) => [name, ...current.filter((item) => item.toLowerCase() !== name.toLowerCase())].slice(0, 8))
  }, [])

  const selectLocation = useCallback((value: string) => {
    const next = value.trim()
    if (!next) return
    setLocation(next)
    rememberCity(next)
    setLocationQuery('')
    setCityResults([])
    setLocationOpen(false)
  }, [rememberCity])

  useEffect(() => {
    const runSearch = async () => {
      if (!locationQuery.trim()) {
        setCityResults([])
        return
      }
      const results = await searchCities(locationQuery)
      setCityResults(results)
    }
    const timer = window.setTimeout(runSearch, 180)
    return () => window.clearTimeout(timer)
  }, [locationQuery])


  const ask = useCallback(async (value = question) => {
    if (!value.trim() || typing) return
    const prompt = value.trim()
    setMessages((current) => [...current, { role: 'user', text: prompt }])
    setQuestion('')
    setTyping(true)

    const fallbackAnswer = buildFallbackAnswer(prompt, weather, language)

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, location: weather.location, weather, language }),
      })
      if (!response.ok) throw new Error('AI service unavailable')
      const result = (await response.json()) as { answer?: string; source?: string }
      setMessages((current) => [...current, { role: 'assistant', text: result.answer ?? fallbackAnswer, data: `${result.source ?? 'WeatherGPT'} · ${weather.location} · ${localizeUpdated(weather.updated, t)}` }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: fallbackAnswer, data: `${t.liveContext} · ${weather.location}` }])
    } finally {
      setTyping(false)
    }
  }, [language, question, typing, weather, t])

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessages((current) => [...current, { role: 'assistant', text: t.voiceUnsupported }])
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = speechLanguageMap[language]
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      if (transcript) {
        setQuestion(transcript)
      }
    }

    recognition.onend = () => {
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceInput = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }

  return <div ref={appRef} className={darkMode ? 'app dark' : 'app'} lang={language}>
    {showLanguageModal && <div className="language-overlay">
      <div className="language-modal glass-card">
        <div className="language-header">
          <span className="language-badge"><Sparkles size={14} /></span>
          <div>
            <p className="overline">{t.chooseLanguage}</p>
            <h2>{t.languageTitle}</h2>
          </div>
        </div>
        <p className="language-subtitle">{t.languageSubtitle}</p>
        <div className="language-grid">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              className={language === option.code ? 'language-option selected' : 'language-option'}
              onClick={() => chooseLanguage(option.code)}
            >
              <span>{option.native}</span>
              <small>{option.label}</small>
            </button>
          ))}
        </div>
      </div>
    </div>}

    <header className="mobile-header">
      <div className="wordmark"><span className="wordmark-icon"><CloudRain size={18} /></span><span>{t.appName}</span></div>
      <div className="header-actions"><button className="round-button" aria-label="Toggle light mode" onClick={() => setDarkMode((value) => !value)}><Moon size={17} /></button><button className="profile-button">AK</button></div>
    </header>

    <main className={tab === 'ask' ? 'mobile-main ask-active' : 'mobile-main'}>
      <div
        key={tab}
        ref={contentRef}
        className={`tab-slider-content ${slideDirection === 'right' ? 'slide-from-right' : slideDirection === 'left' ? 'slide-from-left' : ''}`}
      >
        {tab === 'weather' && <div className="location-bar centered-location">
          <button className="location-trigger" onClick={() => setLocationOpen(!locationOpen)}>
            <LocateFixed size={16} />
            <span>{location}, {t.countryLabel}</span>
            <span className="trigger-chevron">⌄</span>
          </button>
          <button className="location-search-trigger" onClick={() => { setLocationOpen(true); setLocationQuery('') }} aria-label="Search locations"><Search size={15} /></button>
        </div>}

        {tab === 'weather' && <WeatherTab weather={weather} quote={t.quote} language={language} t={t} now={now} onAsk={openAskTab} />}
        {tab === 'alerts' && <AlertsTab weather={weather} t={t} />}
        {tab === 'ask' && <AskTab messages={messages} question={question} setQuestion={setQuestion} typing={typing} ask={ask} weather={weather} onMicClick={startVoiceInput} onStopMic={stopVoiceInput} t={t} />}
        {tab === 'map' && <MapTab weather={weather} t={t} />}
        {tab === 'insights' && <InsightsTab weather={weather} t={t} language={language} />}
        {tab === 'about' && <AboutTab language={language} />}
      </div>
    </main>

    {locationOpen && <div className="location-sheet" role="dialog" aria-modal="true" aria-label={t.locationTitle}>
      <div className="location-sheet-backdrop" onClick={() => setLocationOpen(false)} />
      <div className="location-sheet-panel glass-card">
        <div className="location-sheet-head">
          <div>
            <p className="overline">{t.weatherLocationOverline}</p>
            <h3>{t.locationTitle}</h3>
          </div>
          <button className="location-close" onClick={() => setLocationOpen(false)} aria-label="Close location picker">×</button>
        </div>
        <div className="location-card-search">
          <Search size={15} />
          <input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') selectLocation(locationQuery) }} placeholder={t.searchCityPlaceholder} />
          {locationQuery && <button className="location-clear" onClick={() => setLocationQuery('')} aria-label="Clear search">×</button>}
        </div>
        {locationQuery ? (
          <div className="location-sheet-body">
            <p className="location-card-label">{t.viewWeatherFor.toUpperCase()}</p>
            {cityResults.length ? (
              <div className="city-list">
                {cityResults.map((city) => (
                  <button className={city.name.toLowerCase() === location.toLowerCase() ? 'city-row selected' : 'city-row'} key={`${city.name}-${city.admin1}`} onClick={() => selectLocation(city.name)}>
                    <LocateFixed size={14} />
                    <span><b>{city.name}</b><small>{city.admin1 ? `${city.admin1}, ${city.country}` : city.country}</small></span>
                    {city.name.toLowerCase() === location.toLowerCase() && <em>✓</em>}
                  </button>
                ))}
              </div>
            ) : <p className="location-empty">{t.locationEmpty}</p>}
          </div>
        ) : (
          <div className="location-sheet-body">
            <p className="location-card-label">{t.recommendedCities.toUpperCase()}</p>
            {(() => {
              const recentNames = new Set(recentCities.map((name) => name.toLowerCase()))
              return (
                <>
                  {recentCities.length > 0 && (
                    <div className="city-list recent-list">
                      {recentCities.map((name) => {
                        const meta = indianCities.find(([each]) => each.toLowerCase() === name.toLowerCase())
                        const label = meta ? meta[0] : name
                        const active = label.toLowerCase() === location.toLowerCase()
                        return (
                          <button className={active ? 'city-row selected' : 'city-row'} key={name} onClick={() => selectLocation(name)}>
                            <LocateFixed size={14} />
                            <span><b>{label}</b><small>{meta ? meta[1] : t.countryLabel}</small></span>
                            {active && <em>✓</em>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <div className="city-grid">
                    {POPULAR_CITIES.filter((name) => !recentNames.has(name.toLowerCase())).map((name) => {
                      const meta = indianCities.find(([each]) => each.toLowerCase() === name.toLowerCase())
                      const label = meta ? meta[0] : name
                      const active = label.toLowerCase() === location.toLowerCase()
                      return (
                        <button className={active ? 'city-chip selected' : 'city-chip'} key={name} onClick={() => selectLocation(name)}>
                          <LocateFixed size={13} />
                          <span>{label}</span>
                          {active && <b>✓</b>}
                        </button>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>}

    <nav className="bottom-dock" aria-label="Primary navigation">
      <NavItem icon={Sun} label={t.weatherTab} active={tab === 'weather'} onClick={openWeatherTab} />
      <NavItem icon={Bell} label={t.alertsTab} active={tab === 'alerts'} onClick={openAlertsTab} count={weather.alerts.length} />
      <NavItem icon={Sparkles} label={t.askAi} active={tab === 'ask'} onClick={openAskTab} accent />
      <NavItem icon={MapIcon} label={t.mapTab} active={tab === 'map'} onClick={openMapTab} />
      <NavItem icon={BarChart3} label={t.insightsTab} active={tab === 'insights'} onClick={openInsightsTab} />
      <NavItem icon={Info} label={t.aboutTab} active={tab === 'about'} onClick={openAboutTab} />
    </nav>
  </div>
}

const WeatherTab = memo(function WeatherTab({ weather, quote, onAsk, language, t, now }: { weather: WeatherSnapshot; quote: string; onAsk: () => void; language: LanguageCode; t: TranslationSet; now: Date }) {
  const todayLabel = useMemo(() => formatWeatherDateLabel(now, speechLanguageMap[language]), [now, language])
  const timeLabel = useMemo(() => now.toLocaleTimeString(speechLanguageMap[language], { hour: 'numeric', minute: '2-digit', second: '2-digit' }), [now, language])
  const greetingKey = getGreetingKey(now.getHours())
  const hourlyTimeline = useMemo(() => buildHourlyTimeline(weather.hourly, now), [weather.hourly, now])

  return <section className="tab-content weather-tab">
    <div className="greeting"><div><p className="overline">{todayLabel}<span className="live-clock"> · {timeLabel}</span></p><h1>{t[greetingKey]} <em>Aryan.</em></h1><p className="weather-quote">“{quote}”</p></div></div>
    <div className="weather-hero glass-card"><div className="hero-glow" /><div className="hero-top"><div><p className="overline">{weather.location.toUpperCase()}</p><div className="big-temperature">{weather.temperature}<sup>°C</sup></div><p className="hero-condition">{localizeCondition(weather.condition, t)}</p></div><Sun className="hero-sun" size={78} strokeWidth={1.2} /></div><div className="feels-line"><Thermometer size={15} /> {t.feelsLike} {weather.feelsLike}° <span>·</span> {localizedSummary(weather, t)}</div></div>
    <div className="weather-widgets"><MetricWidget icon={<Thermometer />} label={t.feelsLike} value={`${weather.feelsLike}°`} tone="warm" /><MetricWidget icon={<Droplets />} label={t.humidity} value={`${weather.humidity}%`} tone="aqua" /><MetricWidget icon={<Wind />} label={t.windSpeed} value={`${weather.wind} km/h`} tone="blue" /><MetricWidget icon={<Gauge />} label={t.visibility} value={`${weather.visibility} km`} tone="green" /><MetricWidget icon={<Gauge />} label={t.pressure} value={`${weather.pressure} hPa`} tone="violet" /></div>
    <div className="section-heading"><div><p className="overline">{t.next12Hours}</p><h2>{t.todaysForecast}</h2></div></div>
    <div className="hour-strip glass-card">{hourlyTimeline.map((hour, index) => <div className={index === 0 ? 'hour-cell now' : 'hour-cell'} key={`${hour.time}-${index}`}><span>{localizeHourLabel(hour.time, language, t)}</span>{hour.rain > 25 ? <CloudDrizzle size={21} /> : <Sun size={21} />}<b>{hour.temp}°</b><small>{hour.rain}%</small></div>)}</div>
    <div className="section-heading forecast-title"><div><p className="overline">{t.theWeekAhead}</p><h2>{t.forecastRhythm}</h2></div><span className="section-link">{t.sevenDays}</span></div>
    <div className="week-list premium-week glass-card">{weather.forecast.map((day, index) => <div className={index === 0 ? 'week-row today' : 'week-row'} key={`${day.day}-${index}`}><div className="day-badge"><span>{localizeDayName(day.day, language, t)}</span><small>{index === 0 ? t.nowLabel : `0${index}`}</small></div><span className="week-icon">{day.rain > 30 ? <CloudRain size={22} /> : <Sun size={22} />}</span><div className="week-range"><b>{day.high}°</b><div className="temp-track"><i style={{ width: `${Math.min(100, (day.high - day.low) * 14)}%` }} /></div><span>{day.low}°</span></div><span className="week-rain"><Droplets size={12} /> {day.rain}%</span></div>)}</div>
    <button className="ask-banner" onClick={onAsk}><span className="ai-spark"><Sparkles size={18} /></span><span><b>{t.askBannerTitle}</b><small>{t.askBannerSubtitle}</small></span><Send size={17} /></button>
  </section>
})

const AskTab = memo(function AskTab({ messages, question, setQuestion, typing, ask, weather, onMicClick, onStopMic, t }: { messages: Message[]; question: string; setQuestion: (v: string) => void; typing: boolean; ask: (v?: string) => void; weather: WeatherSnapshot; onMicClick: () => void; onStopMic: () => void; t: TranslationSet }) {
  const [isListening, setIsListening] = useState(false)
  const [askHeadingPrefix, askHeadingSuffix] = t.askHeading.split('{brand}')
  const handleVoice = () => {
    if (isListening) {
      onStopMic()
      setIsListening(false)
      return
    }
    setIsListening(true)
    onMicClick()
  }

  return <section className="tab-content ask-tab"><div className="ai-heading"><WeatherGPTMark /><div><h1>{askHeadingPrefix}<em>WeatherGPT</em>{askHeadingSuffix}</h1><p className="ai-subtitle">{t.aiSubtitle}</p></div><span className="ai-location"><LocateFixed size={13} /> {weather.location}</span></div><div className="conversation">{messages.map((message, index) => <div className={`bubble-row ${message.role}`} key={`${message.text}-${index}`}><div className="bubble-avatar">{message.role === 'assistant' ? <WeatherGPTMark small /> : 'AS'}</div><div className="bubble"><p>{message.text}</p>{message.data && <small><ShieldIcon /> {message.data}</small>}</div></div>)}{typing && <div className="bubble-row assistant"><div className="bubble-avatar"><WeatherGPTMark small /></div><div className="bubble typing"><i /><i /><i /></div></div>}</div><div className="recommendations"><p className="recommendation-title">{t.exploreQuestion}</p><div className="recommendation-scroll">{recommendations.map((rec) => { const Icon = rec.icon; const label = t[rec.key]; return <button key={rec.key} onClick={() => ask(rec.prompt)}><Icon size={15} />{label}</button> })}</div></div><form className="ask-composer" onSubmit={(event) => { event.preventDefault(); ask() }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.askPlaceholder} aria-label="Ask WeatherGPT" /><button type="button" className={isListening ? 'mic-button active' : 'mic-button'} onClick={handleVoice} aria-label={t.useVoice}><Mic size={18} /></button><button type="submit" aria-label="Send message"><Send size={18} /></button></form></section>
})

const AlertsTab = memo(function AlertsTab({ weather, t }: { weather: WeatherSnapshot; t: TranslationSet }) {
  const emergencyNumber = '108'
  const [emergencyCopied, setEmergencyCopied] = useState(false)

  const handleEmergencyCall = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${emergencyNumber}`
    }
  }

  const handleCopyEmergency = async () => {
    try {
      await navigator.clipboard.writeText(emergencyNumber)
      setEmergencyCopied(true)
    } catch {
      if (typeof document !== 'undefined') {
        const helper = document.createElement('textarea')
        helper.value = emergencyNumber
        document.body.appendChild(helper)
        helper.select()
        document.execCommand('copy')
        document.body.removeChild(helper)
        setEmergencyCopied(true)
      }
    }
  }

  return (
    <section className="tab-content simple-tab">
      <div className="page-intro">
        <p className="overline">{t.stayAhead}</p>
        <h1>{t.safetyCenter}</h1>
        <p className="muted-copy">{fillTemplate(t.alertsSubtitle, { location: weather.location })}</p>
      </div>
      <div className="alert-summary glass-card">
        <div><span className="alert-number">{weather.alerts.length + 1}</span><p>{t.activeAlert}</p></div>
        <div className="alert-summary-icon"><Bell size={23} /></div>
      </div>
      <article className="full-alert glass-card emergency-card">
        <div className="full-alert-title">
          <span className="warning-icon"><AlertTriangle size={20} /></span>
          <div>
            <p className="overline">{t.highPriority}</p>
            <h2>{t.thunderstormAlert}</h2>
          </div>
        </div>
        <p className="muted-copy">{weather.location} · {t.nowLabel}</p>
        <p className="alert-description">{t.thunderstormDescription}</p>
        <div className="emergency-actions">
          <button className="emergency-action primary" onClick={handleEmergencyCall}>{t.callEmergency}</button>
          <button className="emergency-action" onClick={handleCopyEmergency}>{emergencyCopied ? t.emergencyCopiedLabel : t.copyEmergency}</button>
        </div>
      </article>
      {weather.alerts.map((alert) => (
        <article className="full-alert glass-card" key={alert.title}>
          <div className="full-alert-title">
            <span className="warning-icon"><AlertTriangle size={20} /></span>
            <div>
              <p className="overline">{alert.severity} PRIORITY</p>
              <h2>{alert.title}</h2>
            </div>
          </div>
          <p className="muted-copy">{alert.area} · {alert.time}</p>
          <p className="alert-description">{t.genericAlertDescription}</p>
          <div className="source-line"><i /> {weather.source} <span>·</span> {localizeUpdated(weather.updated, t)}</div>
        </article>
      ))}
      <div className="official-note"><ShieldIcon /><span><b>{t.important}</b> {t.followOfficial}</span></div>
    </section>
  )
})

const MapTab = memo(function MapTab({ weather, t }: { weather: WeatherSnapshot; t: TranslationSet }) {
  const [layer, setLayer] = useState<'temperature' | 'wind' | 'humidity'>('temperature')
  const mapCenter = useMemo(() => [weather.latitude || 21.2, weather.longitude || 81.35] as [number, number], [weather.latitude, weather.longitude])
  const layerValue = layer === 'temperature' ? `${weather.temperature}°` : layer === 'wind' ? `${weather.wind} km/h` : `${weather.humidity}%`

  return (
    <section className="tab-content simple-tab">
      <div className="page-intro">
        <p className="overline">{t.regionalView}</p>
        <h1>{t.weatherMap}</h1>
        <p className="muted-copy">{fillTemplate(t.conditionsAround, { location: weather.location })}</p>
      </div>
      <div className="map-toolbar">
        <button className={layer === 'temperature' ? 'active' : ''} onClick={() => setLayer('temperature')}><Thermometer size={13} /> {t.temperature}</button>
        <button className={layer === 'wind' ? 'active' : ''} onClick={() => setLayer('wind')}><Wind size={13} /> {t.wind}</button>
        <button className={layer === 'humidity' ? 'active' : ''} onClick={() => setLayer('humidity')}><Droplets size={13} /> {t.humidity}</button>
      </div>
      <div className="map-metric glass-card">
        <span>{layer === 'temperature' ? t.currentTemperature : layer === 'wind' ? t.surfaceWind : t.relativeHumidity}</span>
        <b>{layerValue}</b>
        <small>{weather.location} · {weather.windDirection}° {t.wind}</small>
      </div>
      <div className="big-map real-map glass-card">
        <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker center={mapCenter} radius={15} pathOptions={{ color: '#80e4ed', fillColor: '#ff8b69', fillOpacity: .9 }} />
          <MapCenter center={mapCenter} />
        </MapContainer>
        <div className="map-center-label"><Navigation size={14} fill="currentColor" /> {weather.location}</div>
        <div className="map-key"><i /><span>{t.liveConditions} · {layerValue}</span></div>
      </div>
      <p className="map-disclaimer">{t.mapDisclaimer}</p>
    </section>
  )
})

function MapCenter({ center }: { center: [number, number] }) { const map = useMap(); useEffect(() => { map.setView(center, 7) }, [center, map]); return null }

const InsightsTab = memo(function InsightsTab({ weather, t, language }: { weather: WeatherSnapshot; t: TranslationSet; language: LanguageCode }) {
  const [selectedRange, setSelectedRange] = useState(0)
  const rangeOptions = useMemo(() => buildDateRangeOptions(new Date(), 5), [])
  const selectedRangeDays = rangeOptions[selectedRange]?.rangeDays ?? 1
  const rangeFullLabel = selectedRangeDays === 1 ? t.today : new Intl.RelativeTimeFormat(speechLanguageMap[language], { numeric: 'auto' }).format(selectedRangeDays, 'day')

  const rangeInsightData = useMemo(() => {
    const source = weather.forecast?.length ? weather.forecast : [{ day: 'Today', high: weather.temperature + 2, low: weather.temperature - 2, rain: 35 }]
    const points = [] as Array<{ label: string; high: number; low: number; rain: number; humidity: number; wind: number; pressure: number; comfort: number }>

    for (let index = 0; index < selectedRangeDays; index += 1) {
      const base = source[index % source.length] ?? source[0]
      const swing = Math.sin((index + 1) * 1.6)
      const high = Math.round((base.high ?? weather.temperature + 4) + swing * 2.7)
      const low = Math.round((base.low ?? weather.temperature - 2) + Math.sin((index + 1) * 0.9) * 1.8)
      const rain = Math.max(8, Math.min(94, (base.rain ?? 35) + Math.round(Math.cos((index + 1) * 1.3) * 12) + (selectedRangeDays > 7 ? index % 3 : 0)))
      const humidity = Math.max(35, Math.min(92, Math.round(weather.humidity + Math.sin((index + 1) * 1.25) * 10 + (index % 4) * 2)))
      const wind = Math.max(6, Math.min(38, Math.round(weather.wind + Math.cos((index + 1) * 1.15) * 6 + (index % 2) * 2)))
      const pressure = Math.round(weather.pressure + Math.sin((index + 1) * 0.8) * 5)
      const comfort = Math.max(42, Math.min(95, Math.round(((high + low) / 2) + (100 - humidity) / 2 - wind / 2)))

      points.push({
        label: index === 0 ? 'Now' : selectedRangeDays <= 7 ? `D${index + 1}` : index % 5 === 0 ? `D${index + 1}` : `+${index}`,
        high,
        low,
        rain,
        humidity,
        wind,
        pressure,
        comfort,
      })
    }

    return points
  }, [selectedRangeDays, weather])

  const avgHigh = Math.round(rangeInsightData.reduce((sum, point) => sum + point.high, 0) / Math.max(1, rangeInsightData.length))
  const avgRain = Math.round(rangeInsightData.reduce((sum, point) => sum + point.rain, 0) / Math.max(1, rangeInsightData.length))
  const avgComfort = Math.round(rangeInsightData.reduce((sum, point) => sum + point.comfort, 0) / Math.max(1, rangeInsightData.length))

  const rainExpectancySeries = useMemo(() => rangeInsightData.slice(0, Math.min(8, rangeInsightData.length)).map((point) => point.rain), [rangeInsightData])
  const humiditySeries = useMemo(() => rangeInsightData.slice(0, 8).map((point) => point.humidity), [rangeInsightData])
  const windSeries = useMemo(() => rangeInsightData.slice(0, 8).map((point) => point.wind), [rangeInsightData])
  const tempSeries = useMemo(() => rangeInsightData.slice(0, 8).map((point) => (point.high + point.low) / 2), [rangeInsightData])
  const pressureSeries = useMemo(() => rangeInsightData.slice(0, 8).map((point) => point.pressure), [rangeInsightData])
  const comfortSeries = useMemo(() => rangeInsightData.slice(0, 8).map((point) => point.comfort), [rangeInsightData])

  return (
    <section className="tab-content simple-tab">
      <div className="page-intro">
        <p className="overline">{t.climateIntelligence}</p>
        <h1>{t.seeThePattern}</h1>
        <p className="muted-copy">{fillTemplate(t.longTermSignals, { location: weather.location })}</p>
      </div>

      <div className="insight-callout glass-card">
        <div className="insight-icon"><BarChart3 size={21} /></div>
        <div>
          <p className="overline">{t.weathergptReads}</p>
          <h2>{localizedSummary(weather, t)}</h2>
          <p>{fillTemplate(t.insightBody, { range: rangeFullLabel })}</p>
        </div>
      </div>

      <div className="insight-range glass-card">
        <span className="overline">{t.dateRange}</span>
        <div className="range-pills">
          {rangeOptions.map((option, index) => (
            <button key={option.key} className={selectedRange === index ? 'active' : ''} onClick={() => setSelectedRange(index)}>{option.short}</button>
          ))}
        </div>
      </div>

      <div className="insight-metrics">
        <div className="glass-card"><span>{t.avgHigh}</span><b>{avgHigh}°</b><small>{rangeFullLabel}</small></div>
        <div className="glass-card"><span>{t.comfort}</span><b>{avgComfort}/100</b><small>{t.overallFeel}</small></div>
        <div className="glass-card"><span>{t.rainExp}</span><b>{avgRain}%</b><small>{t.expected}</small></div>
      </div>

      <div className="chart-grid">
        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">{t.rainLabel}</p><h2>{t.rainExpectancy}</h2></div>
            <span className="trend-up">↗ {t.liveLabel}</span>
          </div>
          <div className="insight-chart">
            {rainExpectancySeries.map((height, index) => (
              <div key={`${height}-${index}`}>
                <span style={{ height: `${Math.max(18, height)}%` }} />
                <small>{rangeInsightData[index]?.label === 'Now' ? t.nowLabel : rangeInsightData[index]?.label ?? `D${index + 1}`}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">{t.humidityOverline}</p><h2>{t.moistureIndex}</h2></div>
            <span className="trend-up">◔ {t.steady}</span>
          </div>
          <div className="mini-line">
            <svg viewBox="0 0 220 120" preserveAspectRatio="none">
              <polyline points={humiditySeries.map((value, index) => `${(index / Math.max(1, humiditySeries.length - 1)) * 220},${120 - value}`).join(' ')} />
            </svg>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">{t.pressureOverline}</p><h2>{t.airColumn}</h2></div>
            <span className="trend-up">✓ {t.stable}</span>
          </div>
          <div className="ring-wrap">
            <div className="ring-chart"><span>{pressureSeries[0] ?? weather.pressure} hPa</span></div>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">{t.temperatureOverline}</p><h2>{t.heatProfile}</h2></div>
            <span className="trend-up">↗ {avgHigh}°</span>
          </div>
          <div className="heat-grid">
            {tempSeries.map((value, index) => (
              <span key={`${value}-${index}`} style={{ height: `${Math.min(100, Math.max(28, value))}%` }} className="heat-cell" title={`${value.toFixed(0)}°C`} />
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">{t.windOverline}</p><h2>{t.crosswindFlow}</h2></div>
            <span className="trend-up">⇄ {t.active}</span>
          </div>
          <div className="insight-chart">
            {windSeries.map((height, index) => (
              <div key={`${height}-${index}`}>
                <span style={{ height: `${Math.max(24, height * 4)}%` }} />
                <small>{rangeInsightData[index]?.label === 'Now' ? t.nowLabel : rangeInsightData[index]?.label ?? `D${index + 1}`}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">{t.comfort}</p><h2>{t.comfortIndex}</h2></div>
            <span className="trend-up">≈ {t.steady}</span>
          </div>
          <div className="insight-chart">
            {comfortSeries.map((value, index) => (
              <div key={`${value}-${index}`}>
                <span style={{ height: `${Math.max(18, value)}%` }} />
                <small>{rangeInsightData[index]?.label === 'Now' ? t.nowLabel : rangeInsightData[index]?.label ?? `D${index + 1}`}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-note"><ShieldIcon /> {fillTemplate(t.dataNote, { location: weather.location })}</div>
    </section>
  )
})

const AboutTab = memo(function AboutTab({ language }: { language: LanguageCode }) {
  const copy = aboutCopy[language]
  return <section className="tab-content about-tab">
    <div className="about-header">
      <h1>{copy.title}</h1>
    </div>
    
    <div className="about-content glass-card">
      <h2>{copy.mission}</h2>
      <p><strong>WeatherGPT</strong> {copy.missionText}</p>
      <p>{copy.missionDetails ?? copy.missionText}</p>
      
      <h3>{copy.whatWeDo}</h3>
      <ul className="feature-list">
        {copy.doItems.map((item) => <li key={item}>{renderAboutItem(item)}</li>)}
      </ul>
      
      <h3>{copy.keyFeatures}</h3>
      <ul>
        {copy.featureItems.map((item) => <li key={item}>{renderAboutItem(item)}</li>)}
      </ul>
      
      <h3>{copy.approach}</h3>
      <p className="approach-quote"><em>{copy.approachQuote}</em></p>
      <p>{copy.approachText}</p>
      
      <h3>{copy.development}</h3>
      <p>{copy.developmentText}</p>
      
      <h3>{copy.hackathon}</h3>
      <p><strong>{copy.problemStatement}</strong> <code>26068</code> — <em>WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information</em></p>
      <ul>
        <li>🏛️ <strong>{copy.organization}</strong> Ministry of Earth Sciences (MoES)</li>
        <li>🌦️ <strong>{copy.department}</strong> India Meteorological Department (IMD)</li>
        <li>💻 <strong>{copy.category}</strong> Software</li>
        <li>🚨 <strong>{copy.theme}</strong> Disaster Management</li>
      </ul>
      
      <p className="tagline"><strong>{copy.tagline}</strong></p>
    </div>
    
    <FooterCredit />
  </section>
})

const NavItem = memo(function NavItem({ icon: Icon, label, active, onClick, accent = false, count }: { icon: typeof Sun; label: string; active: boolean; onClick: () => void; accent?: boolean; count?: number }) { return <button className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}><span className={accent ? 'nav-icon accent' : 'nav-icon'}><Icon size={19} />{count ? <b>{count}</b> : null}</span><small>{label}</small></button> })
function FooterCredit() { return <div className="footer-credit"><span>Made with</span> ❤️ <span>by Team ThreadX</span></div> }
function ShieldIcon() { return <span className="shield-icon">✓</span> }
function WeatherGPTMark({ small = false }: { small?: boolean }) { return <span className={small ? 'weather-mark small' : 'weather-mark'}><span /><CloudRain size={small ? 12 : 19} /></span> }
function MetricWidget({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) { return <div className={`metric-widget ${tone} glass-card`}><span className="metric-widget-icon">{icon}</span><div><small>{label}</small><b>{value}</b></div></div> }

export default App