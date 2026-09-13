"use client";

import { useEffect, useState } from "react";

type Language = "en" | "kn";

const translations = {
  en: {
    smartAgriculture: "SMART AGRICULTURE",
    aiAdvisory: "AI Agricultural Advisory",
    smartFarming: "Multilingual Assistance",
    farmerFirst: "Farmer First 🌾",
    voiceAssistance: "Voice Assistance",
    voiceText: "Speak questions and listen to AI-powered answers",
    smartChat: "Smart Chat & History",
    smartChatText: "Manage conversations and access previous queries",

    badge: "AI-POWERED AGRICULTURAL INTELLIGENCE",

    future1: "AI-Based Agricultural Advisory System",
    future2: "for Multilingual Farmer Query Assistance",

    description:
      "AI-Based Agricultural Advisory System for Multilingual Farmer Query Assistance. Get intelligent, knowledge-based agricultural guidance through text and voice in English and Kannada.",

    advisoryTitle: "AI Advisory",
    advisoryText: "Intelligent agricultural assistance",

    farmingTitle: "Smart Farming",
    farmingText: "Better decisions for better crops",

    trust: "Built for the next generation of farmers",

    welcome: "WELCOME BACK",
    signInTitle: "Sign in to AgriAI",
    signInDescription:
      "Continue your journey toward smarter farming.",

    email: "Email address",
    password: "Password",

    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Enter your password",

    forgot: "Forgot password?",
    show: "Show",
    hide: "Hide",

    signIn: "Sign In",

    newTo: "NEW TO AGRIAI?",
    createAccount: "Create your account",

    footer:
      "By continuing, you agree to use AgriAI responsibly for agricultural guidance.",

    bottom:
      "© 2026 AgriAI · AI-Based Agricultural Advisory System",

    noAccount:
      "No account found. Please create an account first.",

    incorrect:
      "Incorrect email or password.",

    somethingWrong:
      "Something went wrong. Please create your account again.",
  },

  kn: {
    smartAgriculture: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    aiAdvisory: "AI ಕೃಷಿ ಸಲಹೆ",
    smartFarming: "ಬಹುಭಾಷಾ ಸಹಾಯ",
    farmerFirst: "ರೈತರಿಗೆ ಮೊದಲ ಆದ್ಯತೆ 🌾",
    voiceAssistance: "ಧ್ವನಿ ಸಹಾಯ",
    voiceText: "ಪ್ರಶ್ನೆಗಳನ್ನು ಮಾತನಾಡಿ ಮತ್ತು AI ಉತ್ತರಗಳನ್ನು ಕೇಳಿ",
    smartChat: "ಸ್ಮಾರ್ಟ್ ಚಾಟ್ ಮತ್ತು ಇತಿಹಾಸ",
    smartChatText: "ಸಂಭಾಷಣೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಹಿಂದಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ನೋಡಿ",

    badge: "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಕೃಷಿ ಮಾಹಿತಿ",

    future1: "ಬಹುಭಾಷಾ ರೈತರ ಪ್ರಶ್ನೆಗಳಿಗೆ", 
    future2: "AI ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ",

    description:
      "ಬಹುಭಾಷಾ ರೈತರ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುವ AI ಆಧಾರಿತ ಕೃಷಿ ಸಲಹಾ ವ್ಯವಸ್ಥೆ. ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಪಠ್ಯ ಹಾಗೂ ಧ್ವನಿ ಮೂಲಕ ಜ್ಞಾನಾಧಾರಿತ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.",

    advisoryTitle: "AI ಕೃಷಿ ಸಲಹೆ",
    advisoryText: "ಬುದ್ಧಿವಂತ ಕೃಷಿ ಸಹಾಯ",

    farmingTitle: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    farmingText: "ಉತ್ತಮ ಬೆಳೆಗಾಗಿ ಉತ್ತಮ ನಿರ್ಧಾರಗಳು",

    trust: "ಮುಂದಿನ ಪೀಳಿಗೆಯ ರೈತರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",

    welcome: "ಮತ್ತೆ ಸ್ವಾಗತ",
    signInTitle: "AgriAI ಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
    signInDescription:
      "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಯತ್ತ ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಮುಂದುವರಿಸಿ.",

    email: "ಇಮೇಲ್ ವಿಳಾಸ",
    password: "ಪಾಸ್‌ವರ್ಡ್",

    emailPlaceholder: "you@example.com",
    passwordPlaceholder:
      "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",

    forgot: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?",
    show: "ತೋರಿಸಿ",
    hide: "ಮರೆಮಾಡಿ",

    signIn: "ಲಾಗಿನ್",

    newTo: "AGRIAI ಗೆ ಹೊಸಬರೇ?",
    createAccount: "ಖಾತೆ ರಚಿಸಿ",

    footer:
      "ಮುಂದುವರಿಯುವ ಮೂಲಕ, AgriAI ಅನ್ನು ಕೃಷಿ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಜವಾಬ್ದಾರಿಯುತವಾಗಿ ಬಳಸಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ.",

    bottom:
      "© 2026 AgriAI · AI ಆಧಾರಿತ ಕೃಷಿ ಸಲಹಾ ವ್ಯವಸ್ಥೆ",

    noAccount:
      "ಯಾವುದೇ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ಮೊದಲು ಖಾತೆಯನ್ನು ರಚಿಸಿ.",

    incorrect:
      "ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.",

    somethingWrong:
      "ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಮತ್ತೊಮ್ಮೆ ರಚಿಸಿ.",
  },
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [language, setLanguage] =
    useState<Language>("en");

  // =========================================================
  // LOAD SAVED LANGUAGE
  // =========================================================

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("language");

    if (
      savedLanguage === "en" ||
      savedLanguage === "kn"
    ) {
      setLanguage(savedLanguage);

      // Keep chatbot language synchronized
      localStorage.setItem(
        "chat_language",
        savedLanguage
      );
    }
  }, []);

  const t = translations[language];

  // =========================================================
  // CHANGE LANGUAGE
  // =========================================================

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);

    // Main website language
    localStorage.setItem("language", lang);

    // Dashboard / chatbot language
    localStorage.setItem(
      "chat_language",
      lang
    );
  };

  // =========================================================
  // LOGIN
  // =========================================================

  function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const savedUser =
      localStorage.getItem("user");

    // -------------------------------------------------------
    // NO USER FOUND
    // -------------------------------------------------------

    if (!savedUser) {
      alert(t.noAccount);

      window.location.href = "/signup";

      return;
    }

    // -------------------------------------------------------
    // CHECK LOGIN
    // -------------------------------------------------------

    try {
      const user = JSON.parse(savedUser);

      if (
        email.trim().toLowerCase() !==
          user.email.trim().toLowerCase() ||
        password !== user.password
      ) {
        alert(t.incorrect);

        return;
      }

      // -----------------------------------------------------
      // LOGIN SUCCESS
      // -----------------------------------------------------

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      // Save language before entering dashboard
      localStorage.setItem(
        "language",
        language
      );

      localStorage.setItem(
        "chat_language",
        language
      );

      // Redirect dashboard
      window.location.href =
        "/dashboard";

    } catch {
      alert(t.somethingWrong);

      localStorage.removeItem("user");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#061b12] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />

        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-green-400/10 blur-[120px]" />

      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20">

        {/* LOGO */}

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl shadow-lg backdrop-blur-xl">
            🌱
          </div>

          <div>

            <h1 className="text-xl font-bold tracking-wide">
              Agri
              <span className="text-emerald-400">
                AI
              </span>
            </h1>

            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">
              {t.smartAgriculture}
            </p>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <div className="flex items-center gap-4">

          {/* LANGUAGE SELECTOR */}

          <div className="flex rounded-xl border border-white/10 bg-white/10 p-1 backdrop-blur-xl">

            <button
              type="button"
              onClick={() =>
                changeLanguage("en")
              }
              className={`rounded-lg px-3 py-2 text-sm transition ${
                language === "en"
                  ? "bg-emerald-500 text-white"
                  : "text-green-100/70 hover:bg-white/10"
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() =>
                changeLanguage("kn")
              }
              className={`rounded-lg px-3 py-2 text-sm transition ${
                language === "kn"
                  ? "bg-emerald-500 text-white"
                  : "text-green-100/70 hover:bg-white/10"
              }`}
            >
              ಕನ್ನಡ
            </button>

          </div>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-8 text-sm text-green-100 md:flex">

            <span>
              {t.aiAdvisory}
            </span>

            <span>
              {t.smartFarming}
            </span>

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-emerald-300">
              {t.farmerFirst}
            </span>

          </div>

        </div>

      </nav>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-16 px-6 pb-16 pt-8 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">

        {/* =================================================
            LEFT LANDING CONTENT
        ================================================== */}

        <div>

          {/* BADGE */}

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 backdrop-blur-xl">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            {t.badge}

          </div>

          {/* TITLE */}

          <h2 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">

            {t.future1}

            <br />

            <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-lime-200 bg-clip-text text-transparent">

              {t.future2}

            </span>

          </h2>

          {/* DESCRIPTION */}

          <p className="mt-7 max-w-xl text-base leading-8 text-green-100/70 md:text-lg">
            {t.description}
          </p>

          {/* FEATURES */}

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">

            {/* AI AGRICULTURAL ADVISORY */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-1">

              <div className="mb-3 text-2xl">🤖</div>

              <h3 className="font-semibold">
                {t.advisoryTitle}
              </h3>

              <p className="mt-1 text-xs leading-5 text-green-100/50">
                {t.advisoryText}
              </p>

            </div>

            {/* MULTILINGUAL ASSISTANCE */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-1">

              <div className="mb-3 text-2xl">🌐</div>

              <h3 className="font-semibold">
                {t.smartFarming}
              </h3>

              <p className="mt-1 text-xs leading-5 text-green-100/50">
                {language === "kn"
                  ? "ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ"
                  : "Ask questions and receive answers in English and Kannada"}
              </p>

            </div>

            {/* VOICE ASSISTANCE */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-1">

              <div className="mb-3 text-2xl">🎤</div>

              <h3 className="font-semibold">
                {t.voiceAssistance}
              </h3>

              <p className="mt-1 text-xs leading-5 text-green-100/50">
                {t.voiceText}
              </p>

            </div>

            {/* SMART CHAT & HISTORY */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-1">

              <div className="mb-3 text-2xl">💬</div>

              <h3 className="font-semibold">
                {t.smartChat}
              </h3>

              <p className="mt-1 text-xs leading-5 text-green-100/50">
                {t.smartChatText}
              </p>

            </div>

          </div>

          {/* TRUST */}

          <div className="mt-10 flex items-center gap-4">

            <div className="flex -space-x-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#061b12] bg-green-500">
                👨‍🌾
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#061b12] bg-emerald-400">
                👩‍🌾
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#061b12] bg-lime-300">
                🌱
              </div>

            </div>

            <p className="text-xs text-green-100/50">
              {t.trust}
            </p>

          </div>

        </div>

        {/* =================================================
            LOGIN CARD
        ================================================== */}

        <div className="relative">

          <div className="absolute inset-0 rounded-[35px] bg-emerald-400/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-2xl md:p-9">

            {/* LOGIN ICON */}

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-2xl shadow-lg">
              🌱
            </div>

            <p className="text-sm font-medium text-emerald-300">
              {t.welcome}
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {t.signInTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-green-100/50">
              {t.signInDescription}
            </p>

            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={handleLogin}
              className="relative mt-8"
            >

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-green-100">
                  {t.email}
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    ✉️
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder={
                      t.emailPlaceholder
                    }
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-green-100/25 focus:border-emerald-400/60 focus:bg-black/30"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-sm font-medium text-green-100">
                    {t.password}
                  </label>

                  <span className="text-xs text-emerald-300">
                    {t.forgot}
                  </span>

                </div>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder={
                      t.passwordPlaceholder
                    }
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-16 text-white outline-none transition placeholder:text-green-100/25 focus:border-emerald-400/60 focus:bg-black/30"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-100/60 hover:text-white"
                  >
                    {showPassword
                      ? t.hide
                      : t.show}
                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="group mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 py-4 font-bold text-green-950 shadow-lg transition hover:-translate-y-0.5"
              >

                <span>
                  {t.signIn}
                </span>

                <span className="transition group-hover:translate-x-1">
                  →
                </span>

              </button>

            </form>

            {/* DIVIDER */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-green-100/30">
                {t.newTo}
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            {/* SIGNUP */}

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/signup";
              }}
              className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400/5 py-3.5 font-semibold text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
            >
              {t.createAccount}
            </button>

            {/* RESPONSIBILITY FOOTER */}

            <p className="mt-6 text-center text-[11px] leading-5 text-green-100/30">
              {t.footer}
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          BOTTOM FOOTER
      ====================================================== */}

      <div className="relative z-10 border-t border-white/5 px-6 py-5 text-center text-xs text-green-100/30">
        {t.bottom}
      </div>

    </main>
  );
}