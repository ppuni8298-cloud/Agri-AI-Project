"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "kn";

const translations = {
  en: {
    title: "Profile Settings",
    subtitle: "Manage your AgriAI account information",

    personal: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",

    firstPlaceholder: "Enter your first name",
    lastPlaceholder: "Enter your last name",
    emailPlaceholder: "Enter your email address",

    updateProfile: "Update Profile",

    security: "Security",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",

    currentPlaceholder: "Enter current password",
    newPlaceholder: "Enter new password",
    confirmPlaceholder: "Confirm new password",

    changePasswordButton: "Change Password",

    backDashboard: "Back to Dashboard",
    logout: "Logout",

    profileSuccess: "Profile updated successfully.",
    passwordSuccess: "Password changed successfully.",

    fillFields: "Please fill in all fields.",
    invalidEmail: "Please enter a valid email address.",
    passwordMismatch: "New passwords do not match.",
    incorrectPassword: "Current password is incorrect.",
    passwordRequirement:
      "Password must contain 1 uppercase, 1 lowercase & 1 number.",

    noUser: "User information not found. Please login again.",
  },

  kn: {
    title: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    subtitle: "ನಿಮ್ಮ AgriAI ಖಾತೆಯ ಮಾಹಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ",

    personal: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
    firstName: "ಮೊದಲ ಹೆಸರು",
    lastName: "ಕೊನೆಯ ಹೆಸರು",
    email: "ಇಮೇಲ್ ವಿಳಾಸ",

    firstPlaceholder: "ನಿಮ್ಮ ಮೊದಲ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    lastPlaceholder: "ನಿಮ್ಮ ಕೊನೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    emailPlaceholder: "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",

    updateProfile: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",

    security: "ಭದ್ರತೆ",
    changePassword: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",
    currentPassword: "ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್",
    newPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
    confirmPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",

    currentPlaceholder: "ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    newPlaceholder: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    confirmPlaceholder: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ನಮೂದಿಸಿ",

    changePasswordButton: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",

    backDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    logout: "ಲಾಗ್ ಔಟ್",

    profileSuccess: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    passwordSuccess: "ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.",

    fillFields: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    invalidEmail: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.",
    passwordMismatch: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
    incorrectPassword: "ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.",
    passwordRequirement:
      "ಪಾಸ್‌ವರ್ಡ್‌ನಲ್ಲಿ 1 ದೊಡ್ಡ ಅಕ್ಷರ, 1 ಸಣ್ಣ ಅಕ್ಷರ ಮತ್ತು 1 ಸಂಖ್ಯೆ ಇರಬೇಕು.",

    noUser: "ಬಳಕೆದಾರರ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
  },
};

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("en");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const t = translations[language];

  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage === "en" || savedLanguage === "kn") {
      setLanguage(savedLanguage);
    }

    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
      router.push("/");
      return;
    }

    try {
      const user: User = JSON.parse(currentUser);

      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    } catch {
      router.push("/");
    }
  }, [router]);

  // =========================================================
  // CHANGE LANGUAGE
  // =========================================================

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);

    localStorage.setItem("language", lang);
    localStorage.setItem("chat_language", lang);

    setProfileMessage("");
    setProfileError("");
    setPasswordMessage("");
    setPasswordError("");
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleProfileUpdate = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setProfileError(t.fillFields);
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setProfileError(t.invalidEmail);
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setProfileError(t.noUser);
      return;
    }

    try {
      const user: User = JSON.parse(savedUser);

      const updatedUser: User = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
      };

      // Update main user
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Update logged-in user
      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      setEmail(updatedUser.email);

      setProfileMessage(t.profileSuccess);
    } catch {
      setProfileError(t.noUser);
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handlePasswordChange = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(t.fillFields);
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setPasswordError(t.noUser);
      return;
    }

    try {
      const user: User = JSON.parse(savedUser);

      // Check current password
      if (currentPassword !== user.password) {
        setPasswordError(t.incorrectPassword);
        return;
      }

      // Password validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

      if (!passwordRegex.test(newPassword)) {
        setPasswordError(t.passwordRequirement);
        return;
      }

      // Confirm password
      if (newPassword !== confirmPassword) {
        setPasswordError(t.passwordMismatch);
        return;
      }

      const updatedUser: User = {
        ...user,
        password: newPassword,
      };

      // Update stored user
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Update current logged-in user
      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(t.passwordSuccess);
    } catch {
      setPasswordError(t.noUser);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#061b12] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-green-400/10 blur-[120px]" />

      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8 md:px-12">

        {/* LOGO */}

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
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
              SMART AGRICULTURE
            </p>

          </div>

        </button>

        {/* RIGHT */}

        <div className="flex items-center gap-3">

          {/* LANGUAGE */}

          <div className="flex rounded-xl border border-white/10 bg-white/10 p-1 backdrop-blur-xl">

            <button
              type="button"
              onClick={() => changeLanguage("en")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                language === "en"
                  ? "bg-emerald-500 text-white"
                  : "text-green-100/70 hover:bg-white/10"
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("kn")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                language === "kn"
                  ? "bg-emerald-500 text-white"
                  : "text-green-100/70 hover:bg-white/10"
              }`}
            >
              ಕನ್ನಡ
            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="relative z-10 mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">

        {/* HEADER */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mb-5 text-sm text-emerald-300 transition hover:text-emerald-200"
          >
            ← {t.backDashboard}
          </button>

          <h2 className="text-3xl font-black sm:text-4xl">
            {t.title}
          </h2>

          <p className="mt-2 text-sm text-green-100/50">
            {t.subtitle}
          </p>

        </div>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">

          <div className="mb-7 flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-2xl">
              👤
            </div>

            <div>

              <h3 className="text-xl font-bold">
                {t.personal}
              </h3>

              <p className="text-sm text-green-100/40">
                {t.subtitle}
              </p>

            </div>

          </div>

          {profileMessage && (
            <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              ✓ {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {profileError}
            </div>
          )}

          <form
            onSubmit={handleProfileUpdate}
            className="space-y-5"
          >

            {/* FIRST + LAST */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-green-50">
                  {t.firstName}
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  placeholder={t.firstPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-green-50">
                  {t.lastName}
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  placeholder={t.lastPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60"
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
                    setEmail(e.target.value)
                  }
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60"
                />

              </div>

            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 py-3.5 font-bold text-green-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:px-8"
            >
              {t.updateProfile}
            </button>

          </form>

        </div>

        {/* =====================================================
            PASSWORD
        ====================================================== */}

        <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">

          <div className="mb-7 flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-2xl">
              🔐
            </div>

            <div>

              <h3 className="text-xl font-bold">
                {t.security}
              </h3>

              <p className="text-sm text-green-100/40">
                {t.changePassword}
              </p>

            </div>

          </div>

          {passwordMessage && (
            <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              ✓ {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
              {passwordError}
            </div>
          )}

          <form
            onSubmit={handlePasswordChange}
            className="space-y-5"
          >

            {/* CURRENT PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-green-50">
                {t.currentPassword}
              </label>

              <div className="relative">

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder={t.currentPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-16 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-100/50 hover:text-white"
                >
                  {showCurrentPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {/* NEW PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-green-50">
                {t.newPassword}
              </label>

              <div className="relative">

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder={t.newPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-16 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-100/50 hover:text-white"
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>

              </div>

              <p className="mt-2 text-xs text-green-100/40">
                {t.passwordRequirement}
              </p>

            </div>

            {/* CONFIRM PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-green-50">
                {t.confirmPassword}
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder={t.confirmPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 pr-16 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-green-100/50 hover:text-white"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 py-3.5 font-bold text-green-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:px-8"
            >
              {t.changePasswordButton}
            </button>

          </form>

        </div>

        {/* LOGOUT */}

        <div className="mt-8 flex justify-center">

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-red-400/30 bg-red-500/5 px-6 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            {t.logout}
          </button>

        </div>

      </section>

    </main>
  );
}