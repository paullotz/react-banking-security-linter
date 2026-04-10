import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { UserProfile } from '../App'

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callback')
  const [destination, setDestination] = useState<string | null>(null)

  useEffect(() => {
    if (callbackUrl) {
      setDestination(callbackUrl)
    }
  }, [callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userProfile: UserProfile = {
          displayName: data.displayName || 'Alex Weber',
          email: email,
          plan: data.plan || 'Professional',
        }
        onLogin(userProfile)

        if (destination) {
          navigate(destination)
        } else {
          navigate('/overview')
        }
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } catch {
      setError('Unable to connect to the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">&#x1f4c8;</div>
          <h1 className="text-2xl font-bold text-emerald-800">FinanceHub</h1>
          <p className="text-emerald-600 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teal-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@financehub.io"
                required
                className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-teal-800"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-teal-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-teal-800"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-teal-500">
            <p>Demo: use any email and password to log in</p>
          </div>
        </div>
      </div>
    </div>
  )
}
