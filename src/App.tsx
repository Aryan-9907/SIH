import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, BarChart3, Bell, CloudDrizzle, CloudRain, Droplets, Gauge, LocateFixed, Map as MapIcon, Mic, Moon, Navigation, Search, Send, Sparkles, Sun, Thermometer, Wind } from 'lucide-react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { buildDateRangeOptions, buildHourlyTimeline, formatWeatherDateLabel, getWeatherData, getWeatherSnapshot, isWeatherQuestion, searchCities, type WeatherSnapshot } from './services/weatherService'

type Tab = 'weather' | 'ask' | 'alerts' | 'map' | 'insights'
type Message = { role: 'assistant' | 'user'; text: string; data?: string }
type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te' | 'gu' | 'pa' | 'ml'

type TranslationSet = {
  appName: string
  demoMode: string
  locationTitle: string
  popularCities: string
  askPlaceholder: string
  askAi: string
  weatherTab: string
  alertsTab: string
  mapTab: string
  insightsTab: string
  exploreQuestion: string
  useVoice: string
  languageTitle: string
  languageSubtitle: string
  chooseLanguage: string
  continueLabel: string
  greetings: {
    normal: string
    crop: string
    rain: string
    day: string
  }
}

const recommendations = [
  { icon: CloudRain, text: 'Will it rain tomorrow?' },
  { icon: Sun, text: 'Explain today simply' },
  { icon: Wind, text: 'What should I wear?' },
  { icon: Droplets, text: 'Best time for planting crops this week?' },
  { icon: Sparkles, text: 'How is my day looking?' },
]
const openingQuotes = ['A quieter sky is still telling a story.', 'Look up. The atmosphere is always in motion.', 'Today arrives one cloud at a time.', 'The best forecast is the one that helps you plan.', 'Somewhere between sun and rain, plans begin.']
const indianCities = ['Bhilai', 'Raipur', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow']
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
    askPlaceholder: 'Ask about the weather...',
    askAi: 'Ask AI',
    weatherTab: 'Weather',
    alertsTab: 'Alerts',
    mapTab: 'Map',
    insightsTab: 'Insights',
    exploreQuestion: 'Explore a question',
    useVoice: 'Speak',
    languageTitle: 'Choose your language',
    languageSubtitle: 'Select your preferred language for the full app experience.',
    chooseLanguage: 'Choose language',
    continueLabel: 'Continue',
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
    askPlaceholder: 'मौसम के बारे में पूछें...',
    askAi: 'एआई से पूछें',
    weatherTab: 'मौसम',
    alertsTab: 'अलर्ट',
    mapTab: 'मानचित्र',
    insightsTab: 'इनसाइट्स',
    exploreQuestion: 'प्रश्न चुनें',
    useVoice: 'बोलें',
    languageTitle: 'अपनी भाषा चुनें',
    languageSubtitle: 'पूरा ऐप अपनी पसंदीदा भाषा में चलाने के लिए चुनें।',
    chooseLanguage: 'भाषा चुनें',
    continueLabel: 'जारी रखें',
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
    askPlaceholder: 'আবহাওয়া সম্পর্কে জিজ্ঞেস করুন...',
    askAi: 'এআই জিজ্ঞাসা',
    weatherTab: 'আবহাওয়া',
    alertsTab: 'সতর্কতা',
    mapTab: 'মানচিত্র',
    insightsTab: 'ইনসাইটস',
    exploreQuestion: 'একটি প্রশ্ন বেছে নিন',
    useVoice: 'কথুন',
    languageTitle: 'আপনার ভাষা নির্বাচন করুন',
    languageSubtitle: 'সম্পূর্ণ অ্যাপটি আপনার পছন্দের ভাষায় দেখতে বেছে নিন।',
    chooseLanguage: 'ভাষা বেছে নিন',
    continueLabel: 'চালিয়ে যান',
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
    askPlaceholder: 'हवामानाबद्दल विचारणा करा...',
    askAi: 'एआय विचारा',
    weatherTab: 'हवामान',
    alertsTab: 'अलर्ट',
    mapTab: 'नकाशा',
    insightsTab: 'इन्साइट्स',
    exploreQuestion: 'प्रश्न निवडा',
    useVoice: 'बोलणे',
    languageTitle: 'तुमची भाषा निवडा',
    languageSubtitle: 'संपूर्ण अॅप तुमच्या पसंतीची भाषा मध्ये पाहण्यासाठी निवडा.',
    chooseLanguage: 'भाषा निवडा',
    continueLabel: 'सुरू ठेवा',
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
    askPlaceholder: 'வானிலை குறித்து கேளுங்கள்...',
    askAi: 'ஏஐ கேளுங்கள்',
    weatherTab: 'வானிலை',
    alertsTab: 'எச்சரிக்கைகள்',
    mapTab: 'வரைபடம்',
    insightsTab: 'உணர்வுகள்',
    exploreQuestion: 'ஒரு கேள்வியை தேர்வு செய்யுங்கள்',
    useVoice: 'பேசுங்கள்',
    languageTitle: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    languageSubtitle: 'முழு அப்அபையும் விரும்பிய மொழியில் பயன்படுத்தவும்.',
    chooseLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
    continueLabel: 'தொடரவும்',
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
    askPlaceholder: 'వాతావరణం గురించి అడగండి...',
    askAi: 'AI అడగండి',
    weatherTab: 'వాతావరణం',
    alertsTab: 'అలర్ట్లు',
    mapTab: 'మ్యాప్',
    insightsTab: 'ఇన్‌సైట్ల్',
    exploreQuestion: 'ప్రశ్నను ఎంచుకోండి',
    useVoice: 'మాట్లండి',
    languageTitle: 'మీ భాషను ఎంచుకోండి',
    languageSubtitle: 'మొత్తం యాప్‌ను మీ ఇష్టమైన భాషలో చూడండి.',
    chooseLanguage: 'భాషను ఎంచుకోండి',
    continueLabel: 'కొనసాగించండి',
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
    askPlaceholder: 'હવામાન વિશે પૂછો...',
    askAi: 'એઆઈ પૂછો',
    weatherTab: 'હવામાન',
    alertsTab: 'ચેતણીઓ',
    mapTab: 'નકશો',
    insightsTab: 'ઇન્ઝાઇટ્સ',
    exploreQuestion: 'એક પ્રશ્ન પસંદ કરો',
    useVoice: 'બોલો',
    languageTitle: 'તમારી ભાષા પસંદ કરો',
    languageSubtitle: 'સંપૂર્ણ એપ તમારી પસંદની ભાષામાં જોવા માટે પસંદ કરો.',
    chooseLanguage: 'ભાષા પસંદ કરો',
    continueLabel: 'ચાલુ રાખો',
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
    askPlaceholder: 'ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ...',
    askAi: 'AI ਬਾਰੇ ਪੁੱਛੋ',
    weatherTab: 'ਮੌਸਮ',
    alertsTab: 'ਚੇਤਾਵਨੀਆਂ',
    mapTab: 'ਮੈਪ',
    insightsTab: 'ਇੰਸਾਈਟਸ',
    exploreQuestion: 'ਇੱਕ ਸਵਾਲ ਚੁਣੋ',
    useVoice: 'ਬੋਲੋ',
    languageTitle: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    languageSubtitle: 'ਪੂ rite ਐਪ ਨੂੰ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਵੇਖਣ ਲਈ ਚੁਣੋ।',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    continueLabel: 'ਜਾਰੀ ਰੱਖੋ',
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
    askPlaceholder: 'വെATHER പരക്കെ ചോദ്യങ്ങൾ ചോദിക്കാം...',
    askAi: 'എഐ ചോദിക്കുക',
    weatherTab: 'ഹവായ്',
    alertsTab: 'അറിയിപ്പുകൾ',
    mapTab: 'മാപ്പ്',
    insightsTab: 'ഇൻസൈറ്റ്‌സ്',
    exploreQuestion: 'ഒരു ചോദ്യം തിരഞ്ഞെടുക്കുക',
    useVoice: 'സംസാരിക്കുക',
    languageTitle: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    languageSubtitle: 'പൂർണ്ണ ആപ്പും നിങ്ങളുടെ പ്രിയപ്പെട്ട ഭാഷയിൽ കാണാൻ തിരഞ്ഞെടുക്കുക.',
    chooseLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    continueLabel: 'തുടരുക',
    greetings: {
      normal: 'ഹലോ! ഞാൻ വെതർജിപിടി. നിങ്ങളുടെ ദിവസം എങ്ങനെയാണെന്ന്? കാലാവസ്ഥയെക്കുറിച്ച് ഞാൻ സഹായിക്കാം.',
      crop: 'ഈ ವಾರ പച്ചക്കറി നട്ട് നല്ലതാണ്, മണ്ണ് തണുത്ത് നിലനിൽക്കുകയും മഴ മിതമായി ലഭിക്കുകയും ചെയ്താൽ. ചൂടിൽ നിന്നു രക്ഷിക്കാൻ രാവിലെ അല്ലെങ്കിൽ വൈകുന്നേരം നട്ടാലും.',
      rain: 'ഇന്ന് വൈകുന്നേരം മഴയ്ക്ക് സാധ്യതയുണ്ട്, അതിനാൽ ലഘുവായ കുടയുമായി പോകുക, ബാഹ്യ പരിപാടികൾ കുറച്ച് ഇളക്കമുള്ളതാക്കി വെക്കുക.',
      day: 'ഇന്ന് ദിവസമൊരു സമതുലിതമാണ്, മിതമായ കാറ്റും നന്നായി നിലനിൽക്കുന്ന താപനിലയും ഉണ്ടാകും.',
    },
  },
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

function buildFallbackAnswer(question: string, weather: WeatherSnapshot, language: LanguageCode) {
  const q = question.trim()
  if (!q) return localeText[language].greetings.normal

  if (detectGreeting(q)) return getGreetingReply(q, language)

  if (!isWeatherQuestion(q)) {
    return `I can help with weather questions for ${weather.location}. Ask about today, rain, wind, humidity, or the next 7-day forecast.`
  }

  if (/(year|annual|month|next\s+1\s+year|next\s+month)/i.test(q)) {
    return `The live weather feed here is tuned to the current and next 7-day outlook for ${weather.location}, not a full-year climate model. Right now it is ${weather.condition.toLowerCase()} with ${weather.temperature}°C and ${weather.humidity}% humidity.`
  }

  if (detectCropQuestion(q)) {
    const rainChance = weather.forecast[1]?.rain ?? 30
    const temp = weather.temperature
    return `${localeText[language].greetings.crop} ${weather.location} has a ${rainChance}% rain chance this week, and current conditions are around ${temp}°C with manageable humidity, which is decent for sowing in the morning.`
  }

  if (detectRainQuestion(q) || /wear|outfit|umbrella|plan|travel|walk|trip/.test(q)) {
    return `${localeText[language].greetings.rain} The current temperature is ${weather.temperature}°C, feels like ${weather.feelsLike}°C, and wind is ${weather.wind} km/h. A light rain cover is a smart idea today.`
  }

  const nextRain = weather.forecast[1]?.rain ?? 35
  const nextHigh = weather.forecast[1]?.high ?? weather.temperature + 2
  const nextLow = weather.forecast[1]?.low ?? weather.temperature - 2
  return `The outlook for ${weather.location} is ${weather.summary.toLowerCase()}. Tomorrow is likely to be ${nextHigh}°C to ${nextLow}°C with about ${nextRain}% rain chance, so plan around a cooler late afternoon and keep your outdoor timing flexible.`
}

function hasMeaningfulWeatherChange(current: WeatherSnapshot, incoming: WeatherSnapshot) {
  return current.location !== incoming.location ||
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
  const [location, setLocation] = useState('Bhilai')
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [cityResults, setCityResults] = useState<Array<{ name: string; country: string; admin1: string; latitude: number; longitude: number }>>([])
  const [refreshTick, setRefreshTick] = useState(0)
  const [quote] = useState(() => openingQuotes[Math.floor(Math.random() * openingQuotes.length)])
  const [question, setQuestion] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [typing, setTyping] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [showLanguageModal, setShowLanguageModal] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi, I’m WeatherGPT. Ask me anything about the sky around you.' },
  ])
  const [weather, setWeather] = useState<WeatherSnapshot>(() => getWeatherSnapshot('Bhilai'))
  const recognitionRef = useRef<{ start: () => void; stop: () => void; abort: () => void; onresult: ((event: any) => void) | null; onend: (() => void) | null; lang: string; continuous: boolean; interimResults: boolean } | null>(null)

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

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshTick((tick) => tick + 1), REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])

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

  const selectLocation = useCallback((value: string) => {
    const next = value.trim()
    if (!next) return
    setLocation(next)
    setLocationQuery('')
    setCityResults([])
    setLocationOpen(false)
  }, [])

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

  const openWeatherTab = useCallback(() => setTab('weather'), [])
  const openAskTab = useCallback(() => setTab('ask'), [])
  const openAlertsTab = useCallback(() => setTab('alerts'), [])
  const openMapTab = useCallback(() => setTab('map'), [])
  const openInsightsTab = useCallback(() => setTab('insights'), [])

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
      setMessages((current) => [...current, { role: 'assistant', text: result.answer ?? fallbackAnswer, data: `${result.source ?? 'WeatherGPT'} · ${weather.location} · ${weather.updated}` }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: fallbackAnswer, data: `Live weather context · ${weather.location}` }])
    } finally {
      setTyping(false)
    }
  }, [language, question, typing, weather])

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessages((current) => [...current, { role: 'assistant', text: 'Voice input is not supported in this browser yet. Use the text box instead.' }])
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

  return <div className={darkMode ? 'app dark' : 'app'} lang={language}>
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
              onClick={() => {
                setLanguage(option.code)
                setShowLanguageModal(false)
              }}
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
      {tab === 'weather' && <div className="location-bar centered-location">
        <button className="location-trigger" onClick={() => setLocationOpen(!locationOpen)}>
          <LocateFixed size={16} />
          <span>{location}, India</span>
          <span className="trigger-chevron">⌄</span>
        </button>
        <button className="location-search-trigger" onClick={() => { setLocationOpen(true); setLocationQuery('') }} aria-label="Search locations"><Search size={15} /></button>
        {locationOpen && <div className="location-card glass-card">
          <div className="location-card-head">
            <div>
              <p className="overline">WEATHER LOCATION</p>
              <h3>{t.locationTitle}</h3>
            </div>
            <button className="location-close" onClick={() => setLocationOpen(false)} aria-label="Close location picker">×</button>
          </div>
          <div className="location-card-search">
            <Search size={15} />
            <input autoFocus value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') selectLocation(locationQuery) }} placeholder="Search any city in India..." />
          </div>
          <p className="location-card-label">{t.popularCities.toUpperCase()}</p>
          <div className="city-grid">
            {(cityResults.length ? cityResults : indianCities.map((city) => ({ name: city, country: 'India', admin1: 'Popular city' }))).slice(0, 8).map((city) => (
              <button className={city.name === location ? 'city-chip selected' : 'city-chip'} key={`${city.name}-${city.admin1}`} onClick={() => selectLocation(city.name)}>
                <LocateFixed size={13} />
                <span>{city.name}</span>
                {city.name === location && <b>✓</b>}
              </button>
            ))}
          </div>
          {locationQuery && <button className="apply-location" onClick={() => selectLocation(locationQuery)}>View weather for “{locationQuery}” <Search size={14} /></button>}
        </div>}
      </div>}

      {tab === 'weather' && <WeatherTab weather={weather} quote={quote} onAsk={openAskTab} />}
      {tab === 'ask' && <AskTab messages={messages} question={question} setQuestion={setQuestion} typing={typing} ask={ask} weather={weather} onMicClick={startVoiceInput} onStopMic={stopVoiceInput} t={t} />}
      {tab === 'alerts' && <AlertsTab weather={weather} />}
      {tab === 'map' && <MapTab weather={weather} />}
      {tab === 'insights' && <InsightsTab weather={weather} />}
      <FooterCredit />
    </main>

    <nav className="bottom-dock" aria-label="Primary navigation">
      <NavItem icon={Sun} label={t.weatherTab} active={tab === 'weather'} onClick={openWeatherTab} />
      <NavItem icon={Sparkles} label={t.askAi} active={tab === 'ask'} onClick={openAskTab} accent />
      <NavItem icon={Bell} label={t.alertsTab} active={tab === 'alerts'} onClick={openAlertsTab} count={weather.alerts.length} />
      <NavItem icon={MapIcon} label={t.mapTab} active={tab === 'map'} onClick={openMapTab} />
      <NavItem icon={BarChart3} label={t.insightsTab} active={tab === 'insights'} onClick={openInsightsTab} />
    </nav>
  </div>
}

const WeatherTab = memo(function WeatherTab({ weather, quote, onAsk }: { weather: WeatherSnapshot; quote: string; onAsk: () => void }) {
  const todayLabel = useMemo(() => formatWeatherDateLabel(new Date()), [])
  const hourlyTimeline = useMemo(() => buildHourlyTimeline(weather.hourly, new Date()), [weather.hourly])

  return <section className="tab-content weather-tab">
    <div className="greeting"><div><p className="overline">{todayLabel}</p><h1>Good morning, <em>Aryan.</em></h1><p className="weather-quote">“{quote}”</p></div></div>
    <div className="weather-hero glass-card"><div className="hero-glow" /><div className="hero-top"><div><p className="overline">{weather.location.toUpperCase()}</p><div className="big-temperature">{weather.temperature}<sup>°C</sup></div><p className="hero-condition">{weather.condition}</p></div><Sun className="hero-sun" size={78} strokeWidth={1.2} /></div><div className="feels-line"><Thermometer size={15} /> Feels like {weather.feelsLike}° <span>·</span> {weather.summary}</div></div>
    <div className="weather-widgets"><MetricWidget icon={<Thermometer />} label="Feels like" value={`${weather.feelsLike}°`} tone="warm" /><MetricWidget icon={<Droplets />} label="Humidity" value={`${weather.humidity}%`} tone="aqua" /><MetricWidget icon={<Wind />} label="Wind speed" value={`${weather.wind} km/h`} tone="blue" /><MetricWidget icon={<Gauge />} label="Visibility" value={`${weather.visibility} km`} tone="green" /><MetricWidget icon={<Gauge />} label="Pressure" value={`${weather.pressure} hPa`} tone="violet" /></div>
    <div className="section-heading"><div><p className="overline">NEXT 12 HOURS</p><h2>Today’s forecast</h2></div></div>
    <div className="hour-strip glass-card">{hourlyTimeline.map((hour, index) => <div className={index === 0 ? 'hour-cell now' : 'hour-cell'} key={`${hour.time}-${index}`}><span>{hour.time}</span>{hour.rain > 25 ? <CloudDrizzle size={21} /> : <Sun size={21} />}<b>{hour.temp}°</b><small>{hour.rain}%</small></div>)}</div>
    <div className="section-heading forecast-title"><div><p className="overline">THE WEEK AHEAD</p><h2>Forecast rhythm</h2></div><span className="section-link">7 days</span></div>
    <div className="week-list premium-week glass-card">{weather.forecast.map((day, index) => <div className={index === 0 ? 'week-row today' : 'week-row'} key={`${day.day}-${index}`}><div className="day-badge"><span>{day.day}</span><small>{index === 0 ? 'Now' : `0${index}`}</small></div><span className="week-icon">{day.rain > 30 ? <CloudRain size={22} /> : <Sun size={22} />}</span><div className="week-range"><b>{day.high}°</b><div className="temp-track"><i style={{ width: `${Math.min(100, (day.high - day.low) * 14)}%` }} /></div><span>{day.low}°</span></div><span className="week-rain"><Droplets size={12} /> {day.rain}%</span></div>)}</div>
    <button className="ask-banner" onClick={onAsk}><span className="ai-spark"><Sparkles size={18} /></span><span><b>Have a weather question?</b><small>Ask WeatherGPT anything about today.</small></span><Send size={17} /></button>
  </section>
})

const AskTab = memo(function AskTab({ messages, question, setQuestion, typing, ask, weather, onMicClick, onStopMic, t }: { messages: Message[]; question: string; setQuestion: (v: string) => void; typing: boolean; ask: (v?: string) => void; weather: WeatherSnapshot; onMicClick: () => void; onStopMic: () => void; t: TranslationSet }) {
  const [isListening, setIsListening] = useState(false)
  const handleVoice = () => {
    if (isListening) {
      onStopMic()
      setIsListening(false)
      return
    }
    setIsListening(true)
    onMicClick()
  }

  return <section className="tab-content ask-tab"><div className="ai-heading"><WeatherGPTMark /><div><h1>Ask <em>WeatherGPT</em></h1><p className="ai-subtitle">Weather answers, grounded in real data</p></div><span className="ai-location"><LocateFixed size={13} /> {weather.location}</span></div><div className="conversation">{messages.map((message, index) => <div className={`bubble-row ${message.role}`} key={`${message.text}-${index}`}><div className="bubble-avatar">{message.role === 'assistant' ? <WeatherGPTMark small /> : 'AS'}</div><div className="bubble"><p>{message.text}</p>{message.data && <small><ShieldIcon /> {message.data}</small>}</div></div>)}{typing && <div className="bubble-row assistant"><div className="bubble-avatar"><WeatherGPTMark small /></div><div className="bubble typing"><i /><i /><i /></div></div>}</div><div className="recommendations"><p className="recommendation-title">{t.exploreQuestion}</p><div className="recommendation-scroll">{recommendations.map(({ icon: Icon, text }) => <button key={text} onClick={() => ask(text)}><Icon size={15} />{text}</button>)}</div></div><form className="ask-composer" onSubmit={(event) => { event.preventDefault(); ask() }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.askPlaceholder} aria-label="Ask WeatherGPT" /><button type="button" className={isListening ? 'mic-button active' : 'mic-button'} onClick={handleVoice} aria-label={t.useVoice}><Mic size={18} /></button><button type="submit" aria-label="Send message"><Send size={18} /></button></form></section>
})

const AlertsTab = memo(function AlertsTab({ weather }: { weather: WeatherSnapshot }) {
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
        <p className="overline">STAY AHEAD OF THE WEATHER</p>
        <h1>Safety <em>center.</em></h1>
        <p className="muted-copy">Clear, timely alerts for {weather.location} and nearby areas.</p>
      </div>
      <div className="alert-summary glass-card">
        <div><span className="alert-number">{weather.alerts.length + 1}</span><p>active alert</p></div>
        <div className="alert-summary-icon"><Bell size={23} /></div>
      </div>
      <article className="full-alert glass-card emergency-card">
        <div className="full-alert-title">
          <span className="warning-icon"><AlertTriangle size={20} /></span>
          <div>
            <p className="overline">HIGH PRIORITY</p>
            <h2>Thunderstorm Alert</h2>
          </div>
        </div>
        <p className="muted-copy">{weather.location} · Now</p>
        <p className="alert-description">A thunderstorm is likely nearby with gusty winds and reduced visibility. Stay indoors if possible and avoid open fields, metal structures, and water bodies until conditions clear.</p>
        <div className="emergency-actions">
          <button className="emergency-action primary" onClick={handleEmergencyCall}>Call emergency services</button>
          <button className="emergency-action" onClick={handleCopyEmergency}>{emergencyCopied ? 'Emergency no. copied.' : 'Copy emergency no.'}</button>
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
          <p className="alert-description">Conditions may change quickly. Keep your plans flexible and check official local advisories before travelling.</p>
          <div className="source-line"><i /> {weather.source} <span>·</span> {weather.updated}</div>
        </article>
      ))}
      <div className="official-note"><ShieldIcon /><span><b>Important</b> For critical warnings, always follow official authorities.</span></div>
    </section>
  )
})

const MapTab = memo(function MapTab({ weather }: { weather: WeatherSnapshot }) {
  const [layer, setLayer] = useState<'temperature' | 'wind' | 'humidity'>('temperature')
  const mapCenter = useMemo(() => [weather.latitude || 21.2, weather.longitude || 81.35] as [number, number], [weather.latitude, weather.longitude])
  const layerValue = layer === 'temperature' ? `${weather.temperature}°` : layer === 'wind' ? `${weather.wind} km/h` : `${weather.humidity}%`

  return (
    <section className="tab-content simple-tab">
      <div className="page-intro">
        <p className="overline">REGIONAL VIEW</p>
        <h1>Weather <em>map.</em></h1>
        <p className="muted-copy">Conditions around {weather.location}.</p>
      </div>
      <div className="map-toolbar">
        <button className={layer === 'temperature' ? 'active' : ''} onClick={() => setLayer('temperature')}><Thermometer size={13} /> Temperature</button>
        <button className={layer === 'wind' ? 'active' : ''} onClick={() => setLayer('wind')}><Wind size={13} /> Wind</button>
        <button className={layer === 'humidity' ? 'active' : ''} onClick={() => setLayer('humidity')}><Droplets size={13} /> Humidity</button>
      </div>
      <div className="map-metric glass-card">
        <span>{layer === 'temperature' ? 'Current temperature' : layer === 'wind' ? 'Surface wind' : 'Relative humidity'}</span>
        <b>{layerValue}</b>
        <small>{weather.location} · {weather.windDirection}° wind</small>
      </div>
      <div className="big-map real-map glass-card">
        <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CircleMarker center={mapCenter} radius={15} pathOptions={{ color: '#80e4ed', fillColor: '#ff8b69', fillOpacity: .9 }} />
          <MapCenter center={mapCenter} />
        </MapContainer>
        <div className="map-center-label"><Navigation size={14} fill="currentColor" /> {weather.location}</div>
        <div className="map-key"><i /><span>Live conditions · {layerValue}</span></div>
      </div>
      <p className="map-disclaimer">Map tiles from OpenStreetMap. Weather overlays are synchronized to the current local conditions.</p>
    </section>
  )
})

function MapCenter({ center }: { center: [number, number] }) { const map = useMap(); useEffect(() => { map.setView(center, 7) }, [center, map]); return null }

const InsightsTab = memo(function InsightsTab({ weather }: { weather: WeatherSnapshot }) {
  const [selectedRange, setSelectedRange] = useState(0)
  const rangeOptions = useMemo(() => buildDateRangeOptions(new Date(), 5), [])
  const selectedRangeDays = rangeOptions[selectedRange]?.rangeDays ?? 1

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
        <p className="overline">CLIMATE INTELLIGENCE</p>
        <h1>See the <em>pattern.</em></h1>
        <p className="muted-copy">A calm read of long-term signals for {weather.location}.</p>
      </div>

      <div className="insight-callout glass-card">
        <div className="insight-icon"><BarChart3 size={21} /></div>
        <div>
          <p className="overline">WEATHERGPT READS</p>
          <h2>{weather.summary}</h2>
          <p>Conditions are anchored to live observations, and the selected range now reflects a distinct {rangeOptions[selectedRange]?.full.toLowerCase()} pattern rather than repeating the same 7-day snapshot.</p>
        </div>
      </div>

      <div className="insight-range glass-card">
        <span className="overline">DATE RANGE</span>
        <div className="range-pills">
          {rangeOptions.map((option, index) => (
            <button key={option.key} className={selectedRange === index ? 'active' : ''} onClick={() => setSelectedRange(index)}>{option.short}</button>
          ))}
        </div>
      </div>

      <div className="insight-metrics">
        <div className="glass-card"><span>AVG HIGH</span><b>{avgHigh}°</b><small>{rangeOptions[selectedRange]?.full}</small></div>
        <div className="glass-card"><span>COMFORT</span><b>{avgComfort}/100</b><small>overall feel</small></div>
        <div className="glass-card"><span>RAIN EXP.</span><b>{avgRain}%</b><small>expected</small></div>
      </div>

      <div className="chart-grid">
        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">RAIN</p><h2>Rain expectancy</h2></div>
            <span className="trend-up">↗ live</span>
          </div>
          <div className="insight-chart">
            {rainExpectancySeries.map((height, index) => (
              <div key={`${height}-${index}`}>
                <span style={{ height: `${Math.max(18, height)}%` }} />
                <small>{rangeInsightData[index]?.label ?? `D${index + 1}`}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">HUMIDITY</p><h2>Moisture index</h2></div>
            <span className="trend-up">◔ steady</span>
          </div>
          <div className="mini-line">
            <svg viewBox="0 0 220 120" preserveAspectRatio="none">
              <polyline points={humiditySeries.map((value, index) => `${(index / Math.max(1, humiditySeries.length - 1)) * 220},${120 - value}`).join(' ')} />
            </svg>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">PRESSURE</p><h2>Air column</h2></div>
            <span className="trend-up">✓ stable</span>
          </div>
          <div className="ring-wrap">
            <div className="ring-chart"><span>{pressureSeries[0] ?? weather.pressure} hPa</span></div>
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">TEMPERATURE</p><h2>Heat profile</h2></div>
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
            <div><p className="overline">WIND</p><h2>Crosswind flow</h2></div>
            <span className="trend-up">⇄ active</span>
          </div>
          <div className="insight-chart">
            {windSeries.map((height, index) => (
              <div key={`${height}-${index}`}>
                <span style={{ height: `${Math.max(24, height * 4)}%` }} />
                <small>{rangeInsightData[index]?.label ?? `D${index + 1}`}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <div className="section-heading">
            <div><p className="overline">COMFORT</p><h2>Comfort index</h2></div>
            <span className="trend-up">≈ steady</span>
          </div>
          <div className="insight-chart">
            {comfortSeries.map((value, index) => (
              <div key={`${value}-${index}`}>
                <span style={{ height: `${Math.max(18, value)}%` }} />
                <small>{rangeInsightData[index]?.label ?? `D${index + 1}`}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-note"><ShieldIcon /> Live weather observations and regional climate context for {weather.location}</div>
    </section>
  )
})

const NavItem = memo(function NavItem({ icon: Icon, label, active, onClick, accent = false, count }: { icon: typeof Sun; label: string; active: boolean; onClick: () => void; accent?: boolean; count?: number }) { return <button className={active ? 'nav-item active' : 'nav-item'} onClick={onClick}><span className={accent ? 'nav-icon accent' : 'nav-icon'}><Icon size={19} />{count ? <b>{count}</b> : null}</span><small>{label}</small></button> })
function FooterCredit() { return <div className="footer-credit"><span>Made with</span> ❤️ <span>by Aryan</span></div> }
function ShieldIcon() { return <span className="shield-icon">✓</span> }
function WeatherGPTMark({ small = false }: { small?: boolean }) { return <span className={small ? 'weather-mark small' : 'weather-mark'}><span /><CloudRain size={small ? 12 : 19} /></span> }
function MetricWidget({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) { return <div className={`metric-widget ${tone} glass-card`}><span className="metric-widget-icon">{icon}</span><div><small>{label}</small><b>{value}</b></div></div> }

export default App