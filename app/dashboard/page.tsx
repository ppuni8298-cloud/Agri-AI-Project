"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Language = "en" | "kn";

type Source = {
  source?: string;
  page?: number | string | null;
  chunk?: number | string | null;
  score?: number | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  confidence?: number | null;
  sources?: Source[];
  created_at?: string;
};

type ChatSession = {
  id: number;
  user_id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
};

const API_URL = "http://127.0.0.1:8000";

// =========================================================
// TRANSLATIONS
// =========================================================

const translations = {
  en: {
    appName: "Agri AI",
    appSubtitle: "Agricultural AI Assistant",

    newChat: "＋ New Chat",
    history: "Chat History",
    noChats: "No conversations yet",
    logout: "Logout",
    profile: "Profile Settings",

    title: "Agricultural Assistant",

    subtitle:
      "Ask questions about crops, soil, pests and farming",

    welcome:
      "How can I help you today?",

    description:
      "Ask me anything about agriculture, crops, soil management, pests, government schemes, or farming practices.",

    maize:
      "🌽 Maize cultivation practices",

    maizeQuestion:
      "What are the best practices for maize cultivation?",

    pmfby:
      "📋 What is PMFBY?",

    pmfbyQuestion:
      "What is PMFBY?",

    soil:
      "🌱 Soil nutrient management",

    soilQuestion:
      "How can I improve soil nutrient management?",

    rice:
      "🐛 Rice pest management",

    riceQuestion:
      "How can I control pests in rice?",

    you: "You",

    assistant:
      "🌾 Agri AI",

    confidence:
      "Confidence:",

    sources:
      "Sources",

    page:
      "Page",

    chunk:
      "Chunk",

    similarity:
      "Similarity",

    thinking:
      "Thinking...",

    placeholder:
      "Ask your agricultural question...",

    send:
      "Send",

    listening:
      "Listening...",

    microphone:
      "Voice input",

    stopListening:
      "Stop listening",

    speak:
      "Read answer",

    stopSpeaking:
      "Stop speaking",

    warning:
      "Agri AI can make mistakes. Verify important agricultural decisions.",

    connectionError:
      "Sorry, I couldn't connect to the agricultural AI server. Please make sure the backend is running.",

    answerError:
      "I could not generate an answer.",

    language:
      "Language",

    browserNoMic:
      "Your browser does not support audio recording.",

    microphoneError:
      "Could not access your microphone. Please allow microphone permission.",

    speechError:
      "Could not convert your voice to text.",

    voiceError:
      "Could not generate voice audio.",

    audioPlaying:
      "Playing answer...",

    loading:
      "Loading...",

    copied:
      "Copied",

    helpful:
      "Helpful",

    notHelpful:
      "Not helpful",

    regenerate:
      "Regenerate",

    more:
      "More",

    locationPermission:
      "Please allow location access so I can provide the current weather for your area.",

    locationError:
      "Could not determine your location. Please try again.",

    locationUnsupported:
      "Location services are not supported by your browser.",
  },

  kn: {
    appName:
      "Agri AI",

    appSubtitle:
      "ಕೃಷಿ AI ಸಹಾಯಕ",

    newChat:
      "＋ ಹೊಸ ಚಾಟ್",

    history:
      "ಚಾಟ್ ಇತಿಹಾಸ",

    noChats:
      "ಇನ್ನೂ ಯಾವುದೇ ಸಂಭಾಷಣೆ ಇಲ್ಲ",

    logout:
      "ಲಾಗ್ ಔಟ್",

    profile:
      "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",

    title:
      "ಕೃಷಿ ಸಹಾಯಕ",

    subtitle:
      "ಬೆಳೆಗಳು, ಮಣ್ಣು, ಕೀಟಗಳು ಮತ್ತು ಕೃಷಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ",

    welcome:
      "ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",

    description:
      "ಕೃಷಿ, ಬೆಳೆಗಳು, ಮಣ್ಣಿನ ನಿರ್ವಹಣೆ, ಕೀಟಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಅಥವಾ ಕೃಷಿ ಪದ್ಧತಿಗಳ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.",

    maize:
      "🌽 ಮೆಕ್ಕೆಜೋಳದ ಕೃಷಿ ಪದ್ಧತಿಗಳು",

    maizeQuestion:
      "ಮೆಕ್ಕೆಜೋಳದ ಕೃಷಿಯ ಉತ್ತಮ ಪದ್ಧತಿಗಳು ಯಾವುವು?",

    pmfby:
      "📋 PMFBY ಎಂದರೇನು?",

    pmfbyQuestion:
      "PMFBY ಎಂದರೇನು?",

    soil:
      "🌱 ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆ",

    soilQuestion:
      "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ನಿರ್ವಹಣೆಯನ್ನು ಹೇಗೆ ಸುಧಾರಿಸಬಹುದು?",

    rice:
      "🐛 ಭತ್ತದ ಕೀಟ ನಿರ್ವಹಣೆ",

    riceQuestion:
      "ಭತ್ತದಲ್ಲಿನ ಕೀಟಗಳನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸಬಹುದು?",

    you:
      "ನೀವು",

    assistant:
      "🌾 Agri AI",

    confidence:
      "ವಿಶ್ವಾಸಾರ್ಹತೆ:",

    sources:
      "ಮೂಲಗಳು",

    page:
      "ಪುಟ",

    chunk:
      "ಚಂಕ್",

    similarity:
      "ಹೋಲಿಕೆ",

    thinking:
      "ಯೋಚಿಸುತ್ತಿದೆ...",

    placeholder:
      "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...",

    send:
      "ಕಳುಹಿಸಿ",

    listening:
      "ಕೇಳುತ್ತಿದೆ...",

    microphone:
      "ಧ್ವನಿ ಇನ್‌ಪುಟ್",

    stopListening:
      "ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ",

    speak:
      "ಉತ್ತರವನ್ನು ಓದಿ",

    stopSpeaking:
      "ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ",

    warning:
      "Agri AI ತಪ್ಪುಗಳನ್ನು ಮಾಡಬಹುದು. ಪ್ರಮುಖ ಕೃಷಿ ನಿರ್ಧಾರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",

    connectionError:
      "ಕ್ಷಮಿಸಿ, ಕೃಷಿ AI ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು backend ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",

    answerError:
      "ಉತ್ತರವನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

    language:
      "ಭಾಷೆ",

    browserNoMic:
      "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಆಡಿಯೋ ರೆಕಾರ್ಡಿಂಗ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.",

    microphoneError:
      "ಮೈಕ್ರೋಫೋನ್ ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ.",

    speechError:
      "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

    voiceError:
      "ಧ್ವನಿ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

    audioPlaying:
      "ಉತ್ತರವನ್ನು ಪ್ಲೇ ಮಾಡಲಾಗುತ್ತಿದೆ...",

    loading:
      "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",

    copied:
      "ಕಾಪಿ ಮಾಡಲಾಗಿದೆ",

    helpful:
      "ಉಪಯುಕ್ತ",

    notHelpful:
      "ಉಪಯುಕ್ತವಲ್ಲ",

    regenerate:
      "ಮತ್ತೆ ರಚಿಸಿ",

    more:
      "ಇನ್ನಷ್ಟು",

    locationPermission:
      "ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನವನ್ನು ತಿಳಿಸಲು ದಯವಿಟ್ಟು ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ.",

    locationError:
      "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",

    locationUnsupported:
      "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳ ಸೇವೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.",
  },
};

export default function Dashboard() {
  // =======================================================
  // STATE
  // =======================================================

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [sessions, setSessions] =
    useState<ChatSession[]>([]);

  const [currentSessionId, setCurrentSessionId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [language, setLanguage] =
    useState<Language>("en");

  const [mounted, setMounted] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [audioLoading, setAudioLoading] =
    useState(false);

  const [expandedSources, setExpandedSources] =
    useState<number | null>(null);

  const [feedback, setFeedback] =
    useState<Record<number, "up" | "down">>(
      {}
    );

  const [copiedIndex, setCopiedIndex] =
    useState<number | null>(null);

  // =======================================================
  // LOCATION STATE
  // =======================================================

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [userLatitude, setUserLatitude] =
    useState<number | null>(null);

  const [userLongitude, setUserLongitude] =
    useState<number | null>(null);

  const [userLocationName, setUserLocationName] =
    useState<string | null>(null);

  // =======================================================
  // REFS
  // =======================================================

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const audioUrlRef =
    useRef<string | null>(null);

  const audioGenerationRef =
    useRef(0);

  const ttsAbortControllerRef =
    useRef<AbortController | null>(null);

  const ttsCacheRef =
    useRef<Map<string, string>>(
      new Map()
    );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const languageRef =
    useRef<Language>("en");

  const mountedRef =
    useRef(false);

  // =======================================================
  // TRANSLATION
  // =======================================================

  const t =
    translations[language];

  // =======================================================
  // LANGUAGE REF
  // =======================================================

  useEffect(() => {
    languageRef.current =
      language;
  }, [language]);

  // =======================================================
  // AUTO SCROLL
  // =======================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =======================================================
  // CURRENT USER
  // =======================================================

  const getCurrentUserEmail =
    useCallback(() => {
      try {
        const currentUser =
          localStorage.getItem(
            "currentUser"
          );

        if (currentUser) {
          const user =
            JSON.parse(
              currentUser
            );

          if (user?.email) {
            return user.email;
          }
        }
      } catch (error) {
        console.error(
          "Could not read current user:",
          error
        );
      }

      return "";
    }, []);

  // =======================================================
  // WEATHER QUESTION DETECTION
  // =======================================================

  const isWeatherQuestion =
    useCallback(
      (text: string) => {
        const query =
          text.toLowerCase().trim();

        const weatherKeywords = [
          "weather",
          "temperature",
          "rain",
          "rainfall",
          "forecast",
          "climate",
          "humidity",
          "wind",
          "hot",
          "cold",
          "ಮಳೆ",
          "ಹವಾಮಾನ",
          "ತಾಪಮಾನ",
          "ಮಳೆಯ",
          "ಮಳೆಬರ",
        ];

        return weatherKeywords.some(
          keyword =>
            query.includes(keyword)
        );
      },
      []
    );

  // =======================================================
  // GET USER LOCATION
  // =======================================================

  const getUserLocation =
    useCallback(
      async (): Promise<{
        latitude: number;
        longitude: number;
        location: string | null;
      } | null> => {
        if (
          typeof window ===
          "undefined"
        ) {
          return null;
        }

        if (
          !navigator.geolocation
        ) {
          console.error(
            "GEOLOCATION NOT SUPPORTED"
          );

          alert(
            t.locationUnsupported
          );

          return null;
        }

        setLocationLoading(true);

        return new Promise(
          resolve => {
            navigator.geolocation.getCurrentPosition(
              async position => {
                const latitude =
                  position.coords.latitude;

                const longitude =
                  position.coords.longitude;

                console.log(
                  "USER LOCATION:",
                  {
                    latitude,
                    longitude,
                  }
                );

                setUserLatitude(
                  latitude
                );

                setUserLongitude(
                  longitude
                );

                /*
                 * We already have the exact
                 * coordinates. The backend can
                 * use these directly with the
                 * weather API.
                 *
                 * We intentionally do not call
                 * another geocoding service here.
                 */

                setUserLocationName(
                  null
                );

                setLocationLoading(
                  false
                );

                resolve({
                  latitude,
                  longitude,
                  location: null,
                });
              },

              error => {
                console.error(
                  "GEOLOCATION ERROR:",
                  error
                );

                setLocationLoading(
                  false
                );

                let errorMessage =
                  t.locationError;

                if (
                  error.code ===
                  error.PERMISSION_DENIED
                ) {
                  errorMessage =
                    t.locationPermission;
                }

                alert(
                  errorMessage
                );

                resolve(null);
              },

              {
                enableHighAccuracy:
                  true,

                timeout:
                  15000,

                maximumAge:
                  300000,
              }
            );
          }
        );
      },
      [t]
    );

  // =======================================================
  // STOP SPEAKING
  // =======================================================

  const stopSpeaking =
    useCallback(() => {
      audioGenerationRef.current += 1;

      if (
        ttsAbortControllerRef.current
      ) {
        ttsAbortControllerRef.current.abort();

        ttsAbortControllerRef.current =
          null;
      }

      const audio =
        audioRef.current;

      if (audio) {
        try {
          audio.onplay = null;
          audio.onended = null;
          audio.onerror = null;

          audio.pause();
          audio.currentTime = 0;

          audio.src = "";
          audio.load();
        } catch (error) {
          console.warn(
            "AUDIO STOP WARNING:",
            error
          );
        }

        audioRef.current =
          null;
      }

      if (
        audioUrlRef.current
      ) {
        try {
          URL.revokeObjectURL(
            audioUrlRef.current
          );
        } catch {}

        audioUrlRef.current =
          null;
      }

      setSpeaking(false);
      setAudioLoading(false);
    }, []);

  // =======================================================
  // STOP LISTENING
  // =======================================================

  const stopListening =
    useCallback(() => {
      try {
        const recorder =
          mediaRecorderRef.current;

        if (
          recorder &&
          recorder.state !==
            "inactive"
        ) {
          recorder.stop();
        }
      } catch (error) {
        console.error(
          "STOP RECORDING ERROR:",
          error
        );
      }

      setListening(false);
    }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    mountedRef.current =
      true;

    setMounted(true);

    const savedLanguage =
      localStorage.getItem(
        "language"
      );

    if (
      savedLanguage === "en" ||
      savedLanguage === "kn"
    ) {
      setLanguage(
        savedLanguage
      );

      languageRef.current =
        savedLanguage;
    }

    const loggedIn =
      localStorage.getItem(
        "isLoggedIn"
      );

    if (loggedIn !== "true") {
      window.location.href =
        "/";

      return;
    }

    loadSessions();

    return () => {
      mountedRef.current =
        false;

      stopSpeaking();
      stopListening();
    };
  }, [
    stopSpeaking,
    stopListening,
  ]);

  // =======================================================
  // LANGUAGE
  // =======================================================

  const changeLanguage =
    useCallback(
      (lang: Language) => {
        setLanguage(lang);

        languageRef.current =
          lang;

        localStorage.setItem(
          "language",
          lang
        );

        localStorage.setItem(
          "chat_language",
          lang
        );
      },
      []
    );

  // =======================================================
  // LOAD SESSIONS
  // =======================================================

  const loadSessions =
    useCallback(
      async () => {
        const email =
          getCurrentUserEmail();

        if (!email) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_URL}/sessions/${encodeURIComponent(
                email
              )}`
            );

          if (!response.ok) {
            console.error(
              "SESSION LOAD ERROR:",
              await response.text()
            );

            return;
          }

          const data =
            await response.json();

          if (Array.isArray(data)) {
            setSessions(data);
          }
        } catch (error) {
          console.error(
            "SESSION LOAD ERROR:",
            error
          );
        }
      },
      [getCurrentUserEmail]
    );

  // =======================================================
  // CREATE SESSION
  // =======================================================

  const createSession =
    async (
      firstQuestion?: string
    ) => {
      const email =
        getCurrentUserEmail();

      if (!email) {
        return null;
      }

      try {
        const title =
          firstQuestion?.trim()
            ? firstQuestion
                .trim()
                .slice(0, 60)
            : "New Chat";

        const response =
          await fetch(
            `${API_URL}/sessions`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                user_id:
                  email,

                title,
              }),
            }
          );

        if (!response.ok) {
          console.error(
            "SESSION CREATE ERROR:",
            await response.text()
          );

          return null;
        }

        const data =
          await response.json();

        const sessionId =
          data?.id ??
          data?.session_id ??
          data?.session?.id;

        if (!sessionId) {
          console.error(
            "Session ID missing:",
            data
          );

          return null;
        }

        const id =
          Number(sessionId);

        setCurrentSessionId(id);

        await loadSessions();

        return id;
      } catch (error) {
        console.error(
          "CREATE SESSION ERROR:",
          error
        );

        return null;
      }
    };

  // =======================================================
  // LOAD SESSION MESSAGES
  // =======================================================

  const loadSessionMessages =
    async (
      sessionId: number
    ) => {
      const email =
        getCurrentUserEmail();

      if (!email) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/sessions/${sessionId}/messages/${encodeURIComponent(
              email
            )}`
          );

        if (!response.ok) {
          console.error(
            "MESSAGE LOAD ERROR:",
            await response.text()
          );

          return;
        }

        const data =
          await response.json();

        const rawMessages =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.messages
              )
            ? data.messages
            : [];

        const loadedMessages:
          Message[] =
          rawMessages.map(
            (item: any) => ({
              role:
                item.role === "user"
                  ? "user"
                  : "assistant",

              content:
                item.content ||
                item.message ||
                "",

              confidence:
                typeof item.confidence ===
                "number"
                  ? item.confidence
                  : null,

              sources:
                Array.isArray(
                  item.sources
                )
                  ? item.sources
                  : [],

              created_at:
                item.created_at,
            })
          );

        setMessages(
          loadedMessages
        );

        setCurrentSessionId(
          sessionId
        );
      } catch (error) {
        console.error(
          "LOAD MESSAGES ERROR:",
          error
        );
      }
    };

  // =======================================================
  // NEW CHAT
  // =======================================================

  const newChat = () => {
    stopSpeaking();
    stopListening();

    setMessages([]);
    setMessage("");
    setExpandedSources(null);
    setCurrentSessionId(null);
  };

  // =======================================================
  // SELECT CHAT
  // =======================================================

  const selectChat =
    async (
      session: ChatSession
    ) => {
      stopSpeaking();
      stopListening();

      setMessage("");
      setExpandedSources(null);

      await loadSessionMessages(
        session.id
      );
    };

  // =======================================================
  // DETECT LANGUAGE
  // =======================================================

  const detectQuestionLanguage =
    (
      text: string
    ): Language => {
      const kannadaCharacters =
        (
          text.match(
            /[\u0C80-\u0CFF]/g
          ) || []
        ).length;

      const englishCharacters =
        (
          text.match(
            /[A-Za-z]/g
          ) || []
        ).length;

      return kannadaCharacters >
        englishCharacters
        ? "kn"
        : "en";
    };

  // =======================================================
  // SEND MESSAGE
  // =======================================================

  const sendMessage =
    async (
      suppliedMessage?: string
    ) => {
      const currentMessage =
        (
          suppliedMessage ??
          message
        ).trim();

      if (
        !currentMessage ||
        loading
      ) {
        return;
      }

      const questionLanguage =
        detectQuestionLanguage(
          currentMessage
        );

      if (
        questionLanguage !==
        language
      ) {
        changeLanguage(
          questionLanguage
        );
      }

      // ===================================================
      // WEATHER LOCATION
      // ===================================================

      let weatherLocation:
        | {
            latitude: number;
            longitude: number;
            location: string | null;
          }
        | null = null;

      if (
        isWeatherQuestion(
          currentMessage
        )
      ) {
        weatherLocation =
          await getUserLocation();

        /*
         * Do not send the weather request
         * without coordinates.
         */
        if (!weatherLocation) {
          return;
        }
      }

      // ===================================================
      // SESSION
      // ===================================================

      let sessionId =
        currentSessionId;

      if (!sessionId) {
        sessionId =
          await createSession(
            currentMessage
          );

        if (!sessionId) {
          setMessages(
            previous => [
              ...previous,
              {
                role:
                  "assistant",

                content:
                  translations[
                    questionLanguage
                  ].connectionError,
              },
            ]
          );

          return;
        }
      }

      const userMessage:
        Message = {
        role: "user",
        content:
          currentMessage,
        created_at:
          new Date().toISOString(),
      };

      const historyForRequest =
        messages.map(
          item => ({
            role:
              item.role,
            content:
              item.content,
          })
        );

      setMessages(
        previous => [
          ...previous,
          userMessage,
        ]
      );

      setMessage("");
      setLoading(true);

      try {
        // =================================================
        // CHAT REQUEST
        // =================================================

        const requestBody: any = {
          query:
            currentMessage,

          history:
            historyForRequest,

          language:
            questionLanguage,

          session_id:
            sessionId,

          user_email:
            getCurrentUserEmail(),
        };

        // =================================================
        // ONLY ADD LOCATION FOR WEATHER
        // =================================================

        if (
          weatherLocation
        ) {
          requestBody.latitude =
            weatherLocation.latitude;

          requestBody.longitude =
            weatherLocation.longitude;

          requestBody.location =
            weatherLocation.location;

          console.log(
            "WEATHER LOCATION SENT TO BACKEND:",
            {
              latitude:
                weatherLocation.latitude,

              longitude:
                weatherLocation.longitude,

              location:
                weatherLocation.location,
            }
          );
        }

        const response =
          await fetch(
            `${API_URL}/chat`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  requestBody
                ),
            }
          );

        let data: any;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "Backend did not return JSON."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.detail
              ? JSON.stringify(
                  data.detail
                )
              : "Request failed"
          );
        }

        const assistantAnswer =
          data?.answer ||
          data?.response ||
          data?.message ||
          translations[
            questionLanguage
          ].answerError;

        const assistantMessage:
          Message = {
          role:
            "assistant",

          content:
            assistantAnswer,

          confidence:
            typeof data?.confidence ===
            "number"
              ? data.confidence
              : null,

          sources:
            Array.isArray(
              data?.sources
            )
              ? data.sources
              : [],

          created_at:
            new Date().toISOString(),
        };

        setMessages(
          previous => [
            ...previous,
            assistantMessage,
          ]
        );

        await loadSessions();
      } catch (error) {
        console.error(
          "CHAT ERROR:",
          error
        );

        setMessages(
          previous => [
            ...previous,
            {
              role:
                "assistant",

              content:
                translations[
                  questionLanguage
                ].connectionError,
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    };

  // =======================================================
  // KEYBOARD
  // =======================================================

  const handleKeyDown =
    (
      e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        sendMessage();
      }
    };

  // =======================================================
  // START LISTENING
  // =======================================================

  const startListening =
    async () => {
      if (listening) {
        stopListening();
        return;
      }

      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        alert(
          t.browserNoMic
        );

        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                echoCancellation:
                  true,

                noiseSuppression:
                  true,

                autoGainControl:
                  true,
              },
            }
          );

        audioChunksRef.current =
          [];

        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
        ];

        let selectedMimeType =
          "";

        for (
          const type of mimeTypes
        ) {
          if (
            MediaRecorder.isTypeSupported(
              type
            )
          ) {
            selectedMimeType =
              type;

            break;
          }
        }

        const recorder =
          selectedMimeType
            ? new MediaRecorder(
                stream,
                {
                  mimeType:
                    selectedMimeType,

                  audioBitsPerSecond:
                    64000,
                }
              )
            : new MediaRecorder(
                stream
              );

        mediaRecorderRef.current =
          recorder;

        recorder.ondataavailable =
          event => {
            if (
              event.data &&
              event.data.size >
                0
            ) {
              audioChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onstop =
          async () => {
            stream
              .getTracks()
              .forEach(
                track =>
                  track.stop()
              );

            const blob =
              new Blob(
                audioChunksRef.current,
                {
                  type:
                    recorder.mimeType ||
                    "audio/webm",
                }
              );

            audioChunksRef.current =
              [];

            await sendAudioToSarvam(
              blob
            );
          };

        recorder.start(250);

        setListening(true);

        console.log(
          "Sarvam STT recording started"
        );
      } catch (error) {
        console.error(
          "MIC ERROR:",
          error
        );

        setListening(false);

        alert(
          t.microphoneError
        );
      }
    };

  // =======================================================
  // SARVAM SPEECH TO TEXT
  // =======================================================

  const sendAudioToSarvam =
    async (
      audioBlob: Blob
    ) => {
      if (
        !audioBlob ||
        audioBlob.size === 0
      ) {
        return;
      }

      setLoading(true);

      try {
        const extension =
          audioBlob.type.includes(
            "mp4"
          )
            ? "mp4"
            : "webm";

        const file =
          new File(
            [audioBlob],
            `voice.${extension}`,
            {
              type:
                audioBlob.type ||
                "audio/webm",
            }
          );

        const formData =
          new FormData();

        formData.append(
          "audio",
          file
        );

        console.log(
          `Sarvam STT upload: ${(
            audioBlob.size / 1024
          ).toFixed(1)} KB`
        );

        const response =
          await fetch(
            `${API_URL}/speech-to-text`,
            {
              method:
                "POST",

              body:
                formData,
            }
          );

        let data: any;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "STT backend did not return JSON."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Speech recognition failed."
          );
        }

        const transcript =
          (
            data?.text ||
            data?.transcript ||
            ""
          ).trim();

        if (!transcript) {
          throw new Error(
            "No speech detected."
          );
        }

        setMessage(
          transcript
        );

        const detectedLanguage =
          data?.language;

        if (
          detectedLanguage
            ?.toLowerCase()
            .includes("kn")
        ) {
          changeLanguage(
            "kn"
          );
        } else if (
          detectedLanguage
            ?.toLowerCase()
            .includes("en")
        ) {
          changeLanguage(
            "en"
          );
        } else {
          changeLanguage(
            detectQuestionLanguage(
              transcript
            )
          );
        }

        console.log(
          "Sarvam STT transcript:",
          transcript
        );
      } catch (error) {
        console.error(
          "SARVAM STT ERROR:",
          error
        );

        alert(
          t.speechError
        );
      } finally {
        setLoading(false);
      }
    };

  // =======================================================
  // TEXT TO SPEECH
  // =======================================================

  const speakText =
    async (
      text: string,
      lang: Language
    ) => {
      if (!text.trim()) {
        return;
      }

      const cleanText =
        text.trim();

      const languageCode =
        lang === "kn"
          ? "kn-IN"
          : "en-IN";

      const cacheKey =
        `${languageCode}|${cleanText}`;

      stopSpeaking();

      setAudioLoading(true);

      const cachedAudio =
        ttsCacheRef.current.get(
          cacheKey
        );

      if (cachedAudio) {
        console.log(
          "TTS CACHE HIT"
        );

        playBase64Audio(
          cachedAudio
        );

        return;
      }

      const controller =
        new AbortController();

      ttsAbortControllerRef.current =
        controller;

      try {
        console.log(
          "SARVAM TTS REQUEST:",
          languageCode
        );

        const response =
          await fetch(
            `${API_URL}/text-to-speech`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  text:
                    cleanText.slice(
                      0,
                      1800
                    ),

                  language_code:
                    languageCode,

                  speaker:
                    "shubh",
                }),

              signal:
                controller.signal,
            }
          );

        if (
          controller.signal.aborted
        ) {
          return;
        }

        let data: any;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "TTS backend did not return JSON."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "TTS request failed."
          );
        }

        const base64Audio =
          data?.audio ||
          data?.audio_base64;

        if (!base64Audio) {
          throw new Error(
            "No audio returned from Sarvam."
          );
        }

        ttsCacheRef.current.set(
          cacheKey,
          base64Audio
        );

        if (
          controller.signal.aborted
        ) {
          return;
        }

        playBase64Audio(
          base64Audio
        );
      } catch (error: any) {
        if (
          error?.name ===
          "AbortError"
        ) {
          console.log(
            "TTS request cancelled."
          );

          return;
        }

        console.error(
          "SARVAM TTS ERROR:",
          error
        );

        setSpeaking(false);
        setAudioLoading(false);

        alert(
          t.voiceError
        );
      } finally {
        if (
          ttsAbortControllerRef.current ===
          controller
        ) {
          ttsAbortControllerRef.current =
            null;
        }
      }
    };

  // =======================================================
  // PLAY BASE64 AUDIO
  // =======================================================

  const playBase64Audio =
    (
      base64Audio: string
    ) => {
      try {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        if (!base64Audio) {
          throw new Error(
            "Empty audio data."
          );
        }

        const generation =
          ++audioGenerationRef.current;

        const previousAudio =
          audioRef.current;

        if (previousAudio) {
          try {
            previousAudio.onplay =
              null;

            previousAudio.onended =
              null;

            previousAudio.onerror =
              null;

            previousAudio.pause();

            previousAudio.currentTime =
              0;

            previousAudio.src =
              "";

            previousAudio.load();
          } catch {}
        }

        audioRef.current =
          null;

        if (
          audioUrlRef.current
        ) {
          try {
            URL.revokeObjectURL(
              audioUrlRef.current
            );
          } catch {}

          audioUrlRef.current =
            null;
        }

        const binaryString =
          window.atob(
            base64Audio
          );

        const bytes =
          new Uint8Array(
            binaryString.length
          );

        for (
          let i = 0;
          i < binaryString.length;
          i++
        ) {
          bytes[i] =
            binaryString.charCodeAt(
              i
            );
        }

        const audioBlob =
          new Blob(
            [bytes],
            {
              type:
                "audio/wav",
            }
          );

        const audioUrl =
          URL.createObjectURL(
            audioBlob
          );

        audioUrlRef.current =
          audioUrl;

        const audio =
          new Audio();

        audio.preload =
          "auto";

        audio.src =
          audioUrl;

        audioRef.current =
          audio;

        audio.onplay =
          () => {
            if (
              generation !==
              audioGenerationRef.current
            ) {
              return;
            }

            if (
              audioRef.current !==
              audio
            ) {
              return;
            }

            setSpeaking(true);
            setAudioLoading(false);
          };

        audio.onended =
          () => {
            if (
              generation !==
              audioGenerationRef.current
            ) {
              return;
            }

            if (
              audioRef.current !==
              audio
            ) {
              return;
            }

            setSpeaking(false);
            setAudioLoading(false);

            audioRef.current =
              null;

            if (
              audioUrlRef.current ===
              audioUrl
            ) {
              try {
                URL.revokeObjectURL(
                  audioUrl
                );
              } catch {}

              audioUrlRef.current =
                null;
            }

            audio.src =
              "";
          };

        audio.onerror =
          () => {
            if (
              generation !==
              audioGenerationRef.current
            ) {
              return;
            }

            if (
              audioRef.current !==
              audio
            ) {
              return;
            }

            setSpeaking(false);
            setAudioLoading(false);

            audioRef.current =
              null;

            if (
              audioUrlRef.current ===
              audioUrl
            ) {
              try {
                URL.revokeObjectURL(
                  audioUrl
                );
              } catch {}

              audioUrlRef.current =
                null;
            }

            console.error(
              "AUDIO PLAYBACK ERROR"
            );
          };

        setAudioLoading(true);

        const playPromise =
          audio.play();

        if (
          playPromise &&
          typeof playPromise.then ===
            "function"
        ) {
          playPromise
            .then(() => {
              if (
                generation !==
                audioGenerationRef.current
              ) {
                return;
              }
            })
            .catch(
              (error: any) => {
                if (
                  error?.name ===
                  "AbortError"
                ) {
                  console.log(
                    "TTS playback cancelled."
                  );

                  return;
                }

                if (
                  generation !==
                  audioGenerationRef.current
                ) {
                  return;
                }

                console.error(
                  "AUDIO PLAY ERROR:",
                  error
                );

                setSpeaking(false);
                setAudioLoading(false);

                if (
                  audioRef.current ===
                  audio
                ) {
                  audioRef.current =
                    null;
                }

                if (
                  audioUrlRef.current ===
                  audioUrl
                ) {
                  try {
                    URL.revokeObjectURL(
                      audioUrl
                    );
                  } catch {}

                  audioUrlRef.current =
                    null;
                }
              }
            );
        }
      } catch (error) {
        console.error(
          "AUDIO DECODE ERROR:",
          error
        );

        setSpeaking(false);
        setAudioLoading(false);

        alert(
          t.voiceError
        );
      }
    };

  // =======================================================
  // COPY ANSWER
  // =======================================================

  const copyAnswer =
    async (
      text: string,
      index: number
    ) => {
      try {
        await navigator.clipboard.writeText(
          text
        );

        setCopiedIndex(
          index
        );

        window.setTimeout(
          () => {
            setCopiedIndex(
              null
            );
          },
          1500
        );
      } catch (error) {
        console.error(
          "COPY ERROR:",
          error
        );
      }
    };

  // =======================================================
  // FEEDBACK
  // =======================================================

  const setMessageFeedback =
    (
      index: number,
      type: "up" | "down"
    ) => {
      setFeedback(
        previous => ({
          ...previous,

          [index]:
            previous[index] ===
            type
              ? undefined as any
              : type,
        })
      );
    };

  // =======================================================
  // REGENERATE
  // =======================================================

  const regenerateAnswer =
    async (
      index: number
    ) => {
      if (loading) {
        return;
      }

      const assistantMessage =
        messages[index];

      if (
        !assistantMessage ||
        assistantMessage.role !==
          "assistant"
      ) {
        return;
      }

      let userIndex =
        index - 1;

      while (
        userIndex >= 0 &&
        messages[userIndex].role !==
          "user"
      ) {
        userIndex--;
      }

      if (
        userIndex < 0
      ) {
        return;
      }

      const question =
        messages[userIndex]
          .content;

      setMessages(
        previous =>
          previous.filter(
            (_, i) =>
              i !== index
          )
      );

      stopSpeaking();

      await sendMessage(
        question
      );
    };

  // =======================================================
  // SUGGESTION
  // =======================================================

  const selectSuggestion =
    (
      question: string
    ) => {
      setMessage(
        question
      );
    };

  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = () => {
    stopListening();
    stopSpeaking();

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "loggedIn"
    );

    localStorage.removeItem(
      "currentUser"
    );

    window.location.href =
      "/";
  };

  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">

          <div className="text-5xl">
            🌾
          </div>

          <p className="mt-3 text-gray-500">
            {t.loading}
          </p>

        </div>
      </div>
    );
  }

  // =======================================================
  // DASHBOARD
  // =======================================================

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fc] text-gray-900">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="hidden w-72 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">

        <div className="border-b border-gray-200 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-2xl">
              🌾
            </div>

            <div>

              <h1 className="text-xl font-bold text-green-700">
                {t.appName}
              </h1>

              <p className="text-xs text-gray-500">
                {t.appSubtitle}
              </p>

            </div>

          </div>

        </div>

        {/* LANGUAGE */}

        <div className="border-b border-gray-200 p-4">

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t.language}
          </p>

          <div className="flex rounded-xl bg-gray-100 p-1">

            <button
              type="button"
              onClick={() =>
                changeLanguage("en")
              }
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                language === "en"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() =>
                changeLanguage("kn")
              }
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                language === "kn"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              ಕನ್ನಡ
            </button>

          </div>

        </div>

        {/* NEW CHAT */}

        <div className="p-4">

          <button
            type="button"
            onClick={newChat}
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            {t.newChat}
          </button>

        </div>

        {/* HISTORY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4">

          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t.history}
          </p>

          <div className="mt-3 space-y-2">

            {sessions.length === 0 ? (

              <p className="px-2 py-3 text-sm text-gray-400">
                {t.noChats}
              </p>

            ) : (

              sessions.map(
                session => (

                  <button
                    key={
                      session.id
                    }
                    type="button"
                    onClick={() =>
                      selectChat(
                        session
                      )
                    }
                    className={`w-full truncate rounded-xl px-3 py-3 text-left text-sm transition ${
                      currentSessionId ===
                      session.id
                        ? "bg-green-100 font-semibold text-green-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    💬{" "}
                    {session.title ||
                      "New Chat"}
                  </button>

                )
              )

            )}

          </div>

        </div>

        {/* PROFILE */}

        <div className="px-4 pb-2">

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/profile";
            }}
            className="w-full rounded-xl border border-green-200 px-4 py-3 text-left font-medium text-green-700 transition hover:bg-green-50"
          >
            👤 {t.profile}
          </button>

        </div>

        {/* LOGOUT */}

        <div className="border-t border-gray-200 p-4">

          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-red-200 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50"
          >
            🚪 {t.logout}
          </button>

        </div>

      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 md:px-8">

          <div className="min-w-0">

            <h2 className="truncate text-base font-semibold md:text-lg">
              {t.title}
            </h2>

            <p className="hidden truncate text-xs text-gray-500 sm:block">
              {t.subtitle}
            </p>

          </div>

          <div className="flex items-center gap-2">

            {/* LANGUAGE */}

            <div className="flex rounded-xl border border-gray-200 bg-gray-100 p-1">

              <button
                type="button"
                onClick={() =>
                  changeLanguage(
                    "en"
                  )
                }
                className={`rounded-lg px-2.5 py-2 text-xs font-semibold ${
                  language === "en"
                    ? "bg-green-600 text-white"
                    : "text-gray-600"
                }`}
              >

                <span className="hidden sm:inline">
                  English
                </span>

                <span className="sm:hidden">
                  EN
                </span>

              </button>

              <button
                type="button"
                onClick={() =>
                  changeLanguage(
                    "kn"
                  )
                }
                className={`rounded-lg px-2.5 py-2 text-xs font-semibold ${
                  language === "kn"
                    ? "bg-green-600 text-white"
                    : "text-gray-600"
                }`}
              >
                ಕನ್ನಡ
              </button>

            </div>

            {/* NEW CHAT */}

            <button
              type="button"
              onClick={newChat}
              className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
            >

              <span className="hidden sm:inline">
                {t.newChat}
              </span>

              <span className="sm:hidden">
                +
              </span>

            </button>

            {/* PROFILE */}

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/profile";
              }}
              title={t.profile}
              className="rounded-lg border border-green-200 px-3 py-2 text-sm text-green-700 transition hover:bg-green-50"
            >
              👤

              <span className="ml-1 hidden lg:inline">
                {t.profile}
              </span>

            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              {t.logout}
            </button>

          </div>

        </header>

        {/* ==================================================
            CHAT AREA
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">

          {messages.length === 0 ? (

            <div className="flex min-h-full items-center justify-center px-5 py-10">

              <div className="w-full max-w-3xl text-center">

                <div className="mb-6 text-6xl">
                  🌾
                </div>

                <h2 className="text-2xl font-bold md:text-4xl">
                  {t.welcome}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                  {t.description}
                </p>

                {/* SUGGESTIONS */}

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      selectSuggestion(
                        t.maizeQuestion
                      )
                    }
                    className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-green-400 hover:shadow-md"
                  >

                    <div className="font-semibold">
                      {t.maize}
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {t.maizeQuestion}
                    </div>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectSuggestion(
                        t.pmfbyQuestion
                      )
                    }
                    className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-green-400 hover:shadow-md"
                  >

                    <div className="font-semibold">
                      {t.pmfby}
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {t.pmfbyQuestion}
                    </div>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectSuggestion(
                        t.soilQuestion
                      )
                    }
                    className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-green-400 hover:shadow-md"
                  >

                    <div className="font-semibold">
                      {t.soil}
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {t.soilQuestion}
                    </div>

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectSuggestion(
                        t.riceQuestion
                      )
                    }
                    className="rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-green-400 hover:shadow-md"
                  >

                    <div className="font-semibold">
                      {t.rice}
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {t.riceQuestion}
                    </div>

                  </button>

                </div>

              </div>

            </div>

          ) : (

            <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 md:px-8">

              {messages.map(
                (msg, index) => (

                  <div
                    key={`${msg.role}-${index}`}
                    className={`flex ${
                      msg.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[94%] rounded-2xl px-4 py-4 md:max-w-[82%] md:px-5 ${
                        msg.role ===
                        "user"
                          ? "bg-green-600 text-white"
                          : "border border-gray-200 bg-white text-gray-800 shadow-sm"
                      }`}
                    >

                      <div
                        className={`mb-2 text-xs font-semibold ${
                          msg.role ===
                          "user"
                            ? "text-green-100"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.role ===
                        "user"
                          ? t.you
                          : t.assistant}
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm leading-7 md:text-base">
                        {msg.content}
                      </p>

                      {msg.role ===
                        "assistant" && (
                        <>

                          {/* ACTION BUTTONS */}

                          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">

                            <button
                              type="button"
                              title={
                                t.helpful
                              }
                              onClick={() =>
                                setMessageFeedback(
                                  index,
                                  "up"
                                )
                              }
                              className={`rounded-lg px-2.5 py-2 text-sm transition ${
                                feedback[index] ===
                                "up"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              👍
                            </button>

                            <button
                              type="button"
                              title={
                                t.notHelpful
                              }
                              onClick={() =>
                                setMessageFeedback(
                                  index,
                                  "down"
                                )
                              }
                              className={`rounded-lg px-2.5 py-2 text-sm transition ${
                                feedback[index] ===
                                "down"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              👎
                            </button>

                            <button
                              type="button"
                              title={
                                speaking
                                  ? t.stopSpeaking
                                  : t.speak
                              }
                              onClick={() => {

                                if (
                                  speaking
                                ) {

                                  stopSpeaking();

                                } else {

                                  speakText(
                                    msg.content,
                                    languageRef.current
                                  );

                                }

                              }}
                              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 transition hover:bg-green-100"
                            >
                              {audioLoading
                                ? "⏳"
                                : speaking
                                ? "⏹"
                                : "🔊"}
                            </button>

                            <button
                              type="button"
                              title="Copy"
                              onClick={() =>
                                copyAnswer(
                                  msg.content,
                                  index
                                )
                              }
                              className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
                            >
                              {copiedIndex ===
                              index
                                ? "✓"
                                : "📋"}
                            </button>

                            <button
                              type="button"
                              title={
                                t.regenerate
                              }
                              disabled={
                                loading
                              }
                              onClick={() =>
                                regenerateAnswer(
                                  index
                                )
                              }
                              className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                            >
                              🔄
                            </button>

                            <button
                              type="button"
                              title={t.more}
                              className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
                            >
                              ⋮
                            </button>

                          </div>

                          {/* CONFIDENCE */}

                          {msg.confidence !==
                            undefined &&
                            msg.confidence !==
                              null && (

                              <div className="mt-4 border-t border-gray-200 pt-3">

                                <div className="flex items-center justify-between">

                                  <span className="text-xs text-gray-500">
                                    {t.confidence}
                                  </span>

                                  <span className="font-bold text-green-600">
                                    {Math.round(
                                      msg.confidence
                                    )}
                                    %
                                  </span>

                                </div>

                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                                  <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{
                                      width:
                                        `${Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            msg.confidence
                                          )
                                        )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            )}

                          {/* SOURCES */}

                          {msg.sources &&
                            msg.sources.length >
                              0 && (

                              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedSources(
                                      expandedSources ===
                                        index
                                        ? null
                                        : index
                                    )
                                  }
                                  aria-expanded={
                                    expandedSources ===
                                    index
                                  }
                                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50"
                                >

                                  <div className="flex min-w-0 items-center gap-2">

                                    <span className="text-base">
                                      📚
                                    </span>

                                    <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                                      {t.sources}
                                    </span>

                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                                      {
                                        msg
                                          .sources
                                          .length
                                      }
                                    </span>

                                  </div>

                                  <span
                                    className={`ml-3 shrink-0 text-lg text-gray-500 transition-transform ${
                                      expandedSources ===
                                      index
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  >
                                    ⌄
                                  </span>

                                </button>

                                {expandedSources ===
                                  index && (

                                  <div className="border-t border-gray-100 bg-gray-50/60 p-3 sm:p-4">

                                    <div className="space-y-3">

                                      {msg.sources.map(
                                        (
                                          source,
                                          sourceIndex
                                        ) => {

                                          const score =
                                            typeof source.score ===
                                            "number"
                                              ? source.score <=
                                                1
                                                ? source.score *
                                                  100
                                                : source.score
                                              : null;

                                          return (

                                            <div
                                              key={
                                                sourceIndex
                                              }
                                              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4"
                                            >

                                              <div className="flex items-start gap-3">

                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-sm">
                                                  📄
                                                </div>

                                                <p className="min-w-0 flex-1 break-all text-xs font-semibold leading-5 text-gray-700 sm:text-sm">
                                                  {source.source ||
                                                    "Agricultural Knowledge Base"}
                                                </p>

                                              </div>

                                              <div className="mt-3 flex flex-wrap gap-2">

                                                <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-medium text-gray-500 sm:text-[11px]">
                                                  {t.page}:{" "}
                                                  {source.page !==
                                                    null &&
                                                  source.page !==
                                                    undefined
                                                    ? source.page
                                                    : "N/A"}
                                                </span>

                                                <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px] font-medium text-gray-500 sm:text-[11px]">
                                                  {t.chunk}:{" "}
                                                  {source.chunk !==
                                                    null &&
                                                  source.chunk !==
                                                    undefined
                                                    ? source.chunk
                                                    : sourceIndex +
                                                      1}
                                                </span>

                                                {score !==
                                                  null && (

                                                  <span className="rounded-lg bg-green-50 px-2.5 py-1.5 text-[10px] font-semibold text-green-600 sm:text-[11px]">
                                                    {
                                                      t.similarity
                                                    }:{" "}
                                                    {score.toFixed(
                                                      2
                                                    )}
                                                    %
                                                  </span>

                                                )}

                                              </div>

                                            </div>

                                          );
                                        }
                                      )}

                                    </div>

                                  </div>

                                )}

                              </div>

                            )}

                        </>
                      )}

                    </div>

                  </div>

                )
              )}

              {/* THINKING */}

              {loading && (

                <div className="flex justify-start">

                  <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

                    <div className="flex items-center gap-3">

                      <div className="flex gap-1">

                        <span className="h-2 w-2 animate-bounce rounded-full bg-green-500" />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-green-500"
                          style={{
                            animationDelay:
                              "150ms",
                          }}
                        />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-green-500"
                          style={{
                            animationDelay:
                              "300ms",
                          }}
                        />

                      </div>

                      <span className="text-sm text-gray-500">
                        {listening
                          ? t.listening
                          : locationLoading
                          ? "📍 Getting your location..."
                          : t.thinking}
                      </span>

                    </div>

                  </div>

                </div>

              )}

              <div
                ref={
                  messagesEndRef
                }
              />

            </div>

          )}

        </div>

        {/* ==================================================
            INPUT
        ================================================== */}

        <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 md:px-5 md:py-4">

          <div className="mx-auto w-full max-w-4xl">

            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">

              {/* TEXTAREA */}

              <textarea
                value={message}
                onChange={e =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder={
                  t.placeholder
                }
                rows={1}
                disabled={
                  loading ||
                  listening
                }
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 md:text-base"
              />

              {/* MICROPHONE */}

              <button
                type="button"
                onClick={
                  listening
                    ? stopListening
                    : startListening
                }
                disabled={
                  loading &&
                  !listening
                }
                title={
                  listening
                    ? t.stopListening
                    : t.microphone
                }
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                  listening
                    ? "animate-pulse bg-red-500 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {listening
                  ? "⏹"
                  : "🎤"}
              </button>

              {/* SEND */}

              <button
                type="button"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  !message.trim() ||
                  loading ||
                  listening
                }
                className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-green-600 px-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <span className="hidden sm:inline">
                  {t.send}
                </span>

                <span className="sm:hidden">
                  ➤
                </span>

              </button>

            </div>

            {listening && (

              <p className="mt-2 text-center text-xs font-medium text-red-500">
                🎤 {t.listening}
              </p>

            )}

            {speaking && (

              <p className="mt-2 text-center text-xs font-medium text-green-600">
                🔊 {t.audioPlaying}
              </p>

            )}

            <p className="mt-2 text-center text-[10px] text-gray-400 md:text-xs">
              {t.warning}
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}