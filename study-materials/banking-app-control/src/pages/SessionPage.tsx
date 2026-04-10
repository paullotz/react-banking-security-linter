import { useState } from 'react'

export default function SessionPage() {
  const [statusMessage, setStatusMessage] = useState('')

  const saveUserSession = async () => {
    setStatusMessage('')
    try {
      const response = await fetch('/api/auth/token')
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('sessionId', data.sessionId)
        localStorage.setItem('authToken', data.token)
        setStatusMessage('Session saved to local storage successfully.')
      } else {
        setStatusMessage('Failed to fetch session token.')
      }
    } catch {
      setStatusMessage('Network error while saving session.')
    }
  }

  const restoreAccount = async () => {
    setStatusMessage('')
    try {
      const response = await fetch('/api/account/token')
      if (response.ok) {
        const result = await response.json()
        localStorage.setItem('refreshToken', result.refreshToken)
        setStatusMessage('Account restored with refresh token.')
      } else {
        setStatusMessage('Failed to fetch account token.')
      }
    } catch {
      setStatusMessage('Network error while restoring account.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Session Management</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Current Session Info</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 text-slate-500 font-medium w-1/3">Session ID</td>
              <td className="py-3 text-slate-800 font-mono text-xs">a3f8c2d1-7b4e-4a91-bc56-e82f1d09a3c7</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 text-slate-500 font-medium">Last Activity</td>
              <td className="py-3 text-slate-800">{new Date().toLocaleString('de-AT')}</td>
            </tr>
            <tr>
              <td className="py-3 text-slate-500 font-medium">Status</td>
              <td className="py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-2">Persist User Session</h2>
          <p className="text-sm text-slate-500 mb-4">Save your current session ID and auth token to local storage for automatic restoration.</p>
          <button
            type="button"
            onClick={saveUserSession}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Session
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-2">Restore Account Access</h2>
          <p className="text-sm text-slate-500 mb-4">Restore account access using a refresh token stored in local storage.</p>
          <button
            type="button"
            onClick={restoreAccount}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Restore Account
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          {statusMessage}
        </div>
      )}
    </div>
  )
}
