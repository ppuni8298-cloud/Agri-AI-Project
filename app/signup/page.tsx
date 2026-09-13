"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "kn";

const translations = {
  en: {
    smart: "SMART AGRICULTURE",

    alreadyTop: "Already have an account?",
    signInTop: "Sign In",

    create: "Create Account",
    subtitle: "Join AgriAI and start farming smarter",

    first: "First Name",
    last: "Last Name",

    firstPlaceholder: "First name",
    lastPlaceholder: "Last name",

    email: "Email Address",
    emailPlaceholder: "you@example.com",

    password: "Password",
    passwordPlaceholder: "Create a password",

    requirement:
      "Password must contain 1 uppercase, 1 lowercase & 1 number.",

    confirm: "Confirm Password",
    confirmPlaceholder: "Confirm your password",

    createButton: "🌱 Create Account",

    haveAccount: "Already have an account?",
    signIn: "Sign In",

    footer:
      "Your journey towards smarter farming starts here 🌾",

    fill: "Please fill in all fields.",

    invalidPassword:
      "Password must contain 1 uppercase, 1 lowercase & 1 number.",

    mismatch: "Passwords do not match.",

    invalidEmail: "Please enter a valid email address.",

    success:
      "Account created successfully! Please login.",
  },

  kn: {
    smart: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",

    alreadyTop: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    signInTop: "ಲಾಗಿನ್",

    create: "ಖಾತೆ ರಚಿಸಿ",

    subtitle:
      "AgriAI ಗೆ ಸೇರಿ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಪ್ರಾರಂಭಿಸಿ",

    first: "ಮೊದಲ ಹೆಸರು",
    last: "ಕೊನೆಯ ಹೆಸರು",

    firstPlaceholder: "ಮೊದಲ ಹೆಸರು",
    lastPlaceholder: "ಕೊನೆಯ ಹೆಸರು",

    email: "ಇಮೇಲ್ ವಿಳಾಸ",
    emailPlaceholder: "you@example.com",

    password: "ಪಾಸ್‌ವರ್ಡ್",
    passwordPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",

    requirement:
      "ಪಾಸ್‌ವರ್ಡ್‌ನಲ್ಲಿ 1 ದೊಡ್ಡ ಅಕ್ಷರ, 1 ಸಣ್ಣ ಅಕ್ಷರ ಮತ್ತು 1 ಸಂಖ್ಯೆ ಇರಬೇಕು.",

    confirm: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    confirmPlaceholder:
      "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ನಮೂದಿಸಿ",

    createButton: "🌱 ಖಾತೆ ರಚಿಸಿ",

    haveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    signIn: "ಲಾಗಿನ್",

    footer:
      "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಯತ್ತ ನಿಮ್ಮ ಪ್ರಯಾಣ ಇಲ್ಲಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ 🌾",

    fill: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಭರ್ತಿ ಮಾಡಿ.",

    invalidPassword:
      "ಪಾಸ್‌ವರ್ಡ್‌ನಲ್ಲಿ 1 ದೊಡ್ಡ ಅಕ್ಷರ, 1 ಸಣ್ಣ ಅಕ್ಷರ ಮತ್ತು 1 ಸಂಖ್ಯೆ ಇರಬೇಕು.",

    mismatch:
      "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",

    invalidEmail:
      "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.",

    success:
      "ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ! ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.",
  },
};

export default function SignupPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<Language>("en");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * LOAD SAVED LANGUAGE
   */
  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("language");

    if (
      savedLanguage === "en" ||
      savedLanguage === "kn"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = translations[language];

  /*
   * CHANGE LANGUAGE
   */
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);

    localStorage.setItem(
      "language",
      lang
    );

    setError("");
  };

  /*
   * SIGNUP
   */
  const handleSignup = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    /*
     * EMPTY FIELD CHECK
     */
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(t.fill);
      return;
    }

    /*
     * PASSWORD CHECK
     *
     * 1 uppercase
     * 1 lowercase
     * 1 number
     */
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

    if (!passwordRegex.test(password)) {
      setError(t.invalidPassword);
      return;
    }

    /*
     * CONFIRM PASSWORD
     */
    if (password !== confirmPassword) {
      setError(t.mismatch);
      return;
    }

    /*
     * EMAIL CHECK
     */
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    /*
     * USER OBJECT
     */
    const user = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    /*
     * SAVE USER
     */
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    /*
     * LOGOUT OLD SESSION
     */
    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "currentUser"
    );

    /*
     * SUCCESS
     */
    alert(t.success);

    /*
     * GO TO LOGIN
     */
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#041a10] text-white">

      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-green-400/10 blur-[120px]" />

      </div>

      <div className="relative z-10 min-h-screen">

        {/* ================================================= */}
        {/* NAVBAR */}
        {/* ================================================= */}

        <nav className="flex items-center justify-between px-5 py-5 sm:px-8 md:px-12">

          {/* LOGO */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-2xl">
              🌱
            </div>

            <div className="text-left">

              <h1 className="text-xl font-bold tracking-wide">
                Agri
                <span className="text-emerald-400">
                  AI
                </span>
              </h1>

              <p className="text-[9px] font-medium tracking-[0.2em] text-emerald-300/70">
                {t.smart}
              </p>

            </div>

          </button>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* ================================================= */}
            {/* LANGUAGE SELECTOR */}
            {/* ================================================= */}

            <div className="flex items-center rounded-xl border border-emerald-300/30 bg-white/10 p-1 shadow-lg backdrop-blur-xl">

              <button
                type="button"
                onClick={() =>
                  changeLanguage("en")
                }
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  language === "en"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() =>
                  changeLanguage("kn")
                }
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  language === "kn"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>

            </div>

            {/* DESKTOP LOGIN */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white sm:block"
            >
              {t.signInTop}
            </button>

          </div>

        </nav>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-5 py-8">

          <div className="w-full max-w-xl">

            {/* CARD */}
            <div className="rounded-[30px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl sm:p-8 md:p-10">

              {/* ICON */}
              <div className="mb-6 flex justify-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400 to-green-600 text-3xl shadow-lg">
                  🌱
                </div>

              </div>

              {/* TITLE */}
              <div className="text-center">

                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                  {t.smart}
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {t.create}
                </h2>

                <p className="mt-2 text-sm leading-6 text-green-100/50">
                  {t.subtitle}
                </p>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                  {error}
                </div>
              )}

              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form
                onSubmit={handleSignup}
                className="mt-8 space-y-5"
              >

                {/* FIRST + LAST */}
                <div className="grid gap-5 sm:grid-cols-2">

                  {/* FIRST NAME */}
                  <div>

                    <label className="mb-2 block text-sm font-medium text-green-50">
                      {t.first}
                    </label>

                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) =>
                        setFirstName(
                          e.target.value
                        )
                      }
                      placeholder={
                        t.firstPlaceholder
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60 focus:bg-black/30"
                    />

                  </div>

                  {/* LAST NAME */}
                  <div>

                    <label className="mb-2 block text-sm font-medium text-green-50">
                      {t.last}
                    </label>

                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) =>
                        setLastName(
                          e.target.value
                        )
                      }
                      placeholder={
                        t.lastPlaceholder
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60 focus:bg-black/30"
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-green-50">
                    {t.email}
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      ✉️
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder={
                        t.emailPlaceholder
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60 focus:bg-black/30"
                    />

                  </div>

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-green-50">
                    {t.password}
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
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
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-20 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60 focus:bg-black/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-100/50 transition hover:text-white"
                    >
                      {showPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-green-100/40">
                    {t.requirement}
                  </p>

                </div>

                {/* CONFIRM PASSWORD */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-green-50">
                    {t.confirm}
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔐
                    </span>

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder={
                        t.confirmPlaceholder
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-20 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60 focus:bg-black/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-100/50 transition hover:text-white"
                    >
                      {showConfirmPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                </div>

                {/* CREATE ACCOUNT */}
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 py-4 font-bold text-green-950 shadow-lg shadow-green-900/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span>
                    {t.createButton}
                  </span>
                </button>

              </form>

              {/* LOGIN */}
              <div className="mt-7 border-t border-white/10 pt-6 text-center">

                <p className="text-sm text-green-100/50">

                  {t.haveAccount}{" "}

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/")
                    }
                    className="font-semibold text-emerald-400 transition hover:text-emerald-300"
                  >
                    {t.signIn}
                  </button>

                </p>

              </div>

              {/* FOOTER */}
              <p className="mt-6 text-center text-xs leading-5 text-green-100/30">
                {t.footer}
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}