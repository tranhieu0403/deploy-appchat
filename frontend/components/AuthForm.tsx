'use client'

import { useState } from 'react'

interface AuthFormProps {
  onAuthSuccess: (username: string, token: string) => void
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Lấy backend URL từ environment variable hoặc detect tự động
  const getBackendUrl = () => {
    // Ưu tiên dùng NEXT_PUBLIC_API_URL từ Vercel env
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }
    if (typeof window === 'undefined') return 'http://localhost:3001'
    const hostname = window.location.hostname
    // Nếu truy cập qua Radmin VPN IP
    if (hostname.startsWith('26.')) return `http://${hostname}:3001`
    // Mặc định localhost
    return 'http://localhost:3001'
  }
  const API_URL = getBackendUrl()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại')
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      
      onAuthSuccess(data.user.username, data.token)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (registerPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (registerPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      
      onAuthSuccess(data.user.username, data.token)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        {/* Logo và Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ChatApp
          </h1>
          <p className="text-gray-600 text-sm">
            Kết nối và trò chuyện với mọi người
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setError('')
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setError('')
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black placeholder:text-gray-400"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black placeholder:text-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="registerUsername" className="block text-sm font-medium text-gray-700 mb-2">
                Tên người dùng
              </label>
              <input
                id="registerUsername"
                type="text"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                placeholder="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black placeholder:text-gray-400"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="registerEmail"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="your@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="registerPassword"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black placeholder:text-gray-400"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-black placeholder:text-gray-400"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

