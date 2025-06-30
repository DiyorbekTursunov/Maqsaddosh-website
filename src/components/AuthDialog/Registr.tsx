"use client"

import type React from "react"
// import "./Registr.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import apiService from "../../api/apiService"
import google from "../../assets/images/google.svg"

interface RegistrProps {
  isDialog?: boolean;
  onAuthSuccess?: () => void;
}

function Registr({ isDialog = false, onAuthSuccess }: RegistrProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setToken } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const response = await apiService.post("/signup", { name, email, password })
      if (response.data.success) {
        setToken(response.data.token)
        if (onAuthSuccess) {
          onAuthSuccess()
        } else {
          navigate("/home", { replace: true })
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Signup failed"
      const uzbekErrors: { [key: string]: string } = {
        "Email already exists": "Bu email allaqachon ro'yxatdan o'tgan",
        "Invalid email": "Noto'g'ri email formati",
      }
      setError(uzbekErrors[errorMsg] || "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`
    window.location.href = googleAuthUrl
  }

  const content = (
    <div className="max-w-[504px] w-full mx-auto sm:rounded-4xl rounded-0 border-[0.5px] border-gray-100 bg-gray-50 md:px-14 px-5 pt-10 pb-5">
      <h2 className="font-manrope font-medium text-[32px] leading-[120%] tracking-[0%] mb-7">Ro'yxatdan o'tish</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center w-full sm:h-[60px] h-12 gap-2.5 border-[0.5px] border-blue-800 rounded-2xl cursor-pointer mb-2"
      >
        <img className="flex w-6 h-6" src={google || "/placeholder.svg"} alt="Google" />
        <span className="font-manrope font-semibold text-[16px] leading-[140%] tracking-[0%] uppercase text-gray-900">
          Gmail orqali
        </span>
      </button>
      <p className="text-center text-gray-600 mb-6">yoki</p>
      <form onSubmit={handleSignup}>
        <input
          className="w-full sm:h-[60px] h-12 rounded-[8px] border-[0.5px] border-gray-200 bg-gray-100 outline-none px-4 mb-4"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ismingiz"
          required
        />
        <input
          className="w-full sm:h-[60px] h-12 rounded-[8px] border-[0.5px] border-gray-200 bg-gray-100 outline-none px-4 mb-4"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Gmail kiriting"
          required
        />
        <input
          className="w-full sm:h-[60px] h-12 rounded-[8px] border-[0.5px] border-gray-200 bg-gray-100 outline-none px-4 mb-6"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol"
          required
        />
        <button
          type="submit"
          className="w-full sm:h-16 h-14 rounded-2xl border-[1px] border-blue-700 bg-blue-700 text-gray-50 cursor-pointer font-semibold hover:opacity-80 sm:mb-10 mb-5"
        >
          RO'YXATDAN O'TISH
        </button>
      </form>
      <a className="flex justify-center font-normal text-gray-700 gap-1" href="/login">
        Hisobingiz bormi? <span className="font-semibold text-blue-600">Kirish</span>
      </a>
    </div>
  )

  return isDialog ? content : <div className="login flex justify-center items-center min-h-screen">{content}</div>
}

export default Registr
