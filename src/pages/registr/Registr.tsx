"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import apiService from "../../api/apiService"

import google from "../../assets/images/google.svg"

// Make sure this is defined on the window object for the Telegram script
declare global {
  interface Window {
    handleTelegramLogin: (user: any) => void
  }
}

function Registr() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken } = useAuth()

  const from = location.state?.from?.pathname || "/home"

  // Stricter email regex: allows letters, numbers, dots, hyphens, underscores in local part
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Check for random or suspicious email patterns
  const isRandomEmail = (email: string): boolean => {
    const localPart = email.split("@")[0]
    const numericCount = (localPart.match(/[0-9]/g) || []).length
    const letterCount = (localPart.match(/[a-zA-Z]/g) || []).length
    // Flag as random if numbers exceed 1.5x letters or local part is too long
    return numericCount > letterCount * 1.5 || localPart.length > 20
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailError("")

    // Client-side email validation
    if (!emailRegex.test(email)) {
      setEmailError("Iltimos, to'g'ri email manzilini kiriting")
      return
    }

    // Check for random or suspicious email patterns
    if (isRandomEmail(email)) {
      setEmailError("Email manzili haqiqiy bo'lishi kerak (masalan, ism.familiya@gmail.com)")
      return
    }

    try {
      const response = await apiService.post("/signup", { fullName, email, password })
      if (response.data.success) {
        setToken(response.data.token)
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Signup failed"
      const uzbekErrors: { [key: string]: string } = {
        "User already exists": "Foydalanuvchi allaqachon mavjud",
        "Invalid email": "Noto'g'ri email formati",
        "Password must be at least 8 characters long": "Parol kamida 8 belgidan iborat bo'lishi kerak",
      }
      setError(uzbekErrors[errorMsg] || "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  // Validate email on blur for real-time feedback
  const handleEmailBlur = () => {
    setEmailError("")
    if (!email) return

    if (!emailRegex.test(email)) {
      setEmailError("Iltimos, to'g'ri email manzilini kiriting (masalan, diyorbek@gmail.com)")
      return
    }
    if (isRandomEmail(email)) {
      setEmailError("Email manzili haqiqiy bo'lishi kerak (masalan, ism.familiya@gmail.com)")
      return
    }
  }

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`
    window.location.href = googleAuthUrl
  }

  // Setup Telegram callback
  useEffect(() => {
    window.handleTelegramLogin = (user: any) => {
      apiService
        .get("/telegram", { params: user })
        .then((response) => {
          if (response.data.success) {
            setToken(response.data.token)
            navigate(from, { replace: true })
          } else {
            setError(response.data.error || "Telegram orqali ro'yxatdan o'tishda xatolik.")
          }
        })
        .catch((err) => {
          console.error("Telegram signup error:", err)
          setError(err.response?.data?.error || "Telegram orqali ro'yxatdan o'tishda xatolik.")
        })
    }
    return () => {
      delete window.handleTelegramLogin
    }
  }, [navigate, from, setToken])

  return (
    <div className="login flex justify-center items-center min-h-screen bg-gray-100">
      <div className="login-container max-w-[504px] w-full mx-auto sm:rounded-2xl rounded-0 border-[0.5px] border-gray-200 bg-white md:px-14 px-5 py-10 shadow-xl">
        <h2 className="font-manrope font-semibold text-[32px] leading-[120%] tracking-[0%] mb-7 text-center text-gray-900">
          Roʻyxatdan oʻtish
        </h2>
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full sm:h-[56px] h-12 gap-2.5 border border-gray-300 rounded-xl cursor-pointer mb-3 hover:bg-gray-50 transition-colors"
        >
          <img className="flex w-5 h-5" src={google || "/placeholder.svg"} alt="Google" />
          <span className="font-manrope font-semibold text-[16px] leading-[140%] tracking-[0%] text-gray-700">
            Google orqali
          </span>
        </button>

        <script
          async
          src="https://telegram.org/js/telegram-widget.js?22"
          data-telegram-login={import.meta.env.VITE_TELEGRAM_BOT_USERNAME}
          data-size="large"
          data-radius="10"
          data-onauth="handleTelegramLogin(user)"
          data-request-access="write"
          className="telegram-login-button mb-3"
        ></script>

        <div className="flex items-center justify-center my-6">
          {/* <hr className="flex-grow border-t border-gray-300" /> */}
          <span className="px-3 text-gray-500 text-center text-sm">yoki</span>
          {/* <hr className="flex-grow border-t border-gray-300" /> */}
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              className="w-full sm:h-[56px] h-12 rounded-xl border border-gray-300 bg-gray-50 outline-none px-4 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="To'liq ism"
              required
            />
          </div>
          <div>
            <input
              className={`w-full sm:h-[56px] h-12 rounded-xl border ${emailError ? "border-red-500" : "border-gray-300"} bg-gray-50 outline-none px-4 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="Email kiriting"
              required
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <input
              className="w-full sm:h-[56px] h-12 rounded-xl border border-gray-300 bg-gray-50 outline-none px-4 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol (kamida 8 belgi)"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            className="w-full sm:h-14 h-12 rounded-xl border-none bg-blue-600 text-white cursor-pointer font-semibold hover:bg-blue-700 transition-colors sm:mb-8 mb-5"
            disabled={!!emailError}
          >
            RO'YXATDAN O'TISH
          </button>
        </form>
        <p className="text-center font-normal text-gray-600 text-sm">
          Sizda allaqachon hisob bormi?{" "}
          <a href="/login" className="font-semibold text-blue-600 hover:underline">
            Kirish
          </a>
        </p>
      </div>
    </div>
  )
}

export default Registr
