import { useState } from 'react'

export default function SecurityPage() {
  const [statusMessage, setStatusMessage] = useState('')

  const refreshAuthentication = async () => {
    setStatusMessage('')
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const payload = await response.json()
        localStorage.setItem('accessToken', payload.accessToken)
        localStorage.setItem('sessionRef', payload.sessionId)
        setStatusMessage('Authentication tokens refreshed and stored successfully.')
      } else {
        setStatusMessage('Failed to refresh authentication.')
      }
    } catch {
      setStatusMessage('Network error while refreshing authentication.')
    }
  }

  const recoverCredentials = async () => {
    setStatusMessage('')
    try {
      const response = await fetch('/api/credentials')
      if (response.ok) {
        const result = await response.json()
        localStorage.setItem('credentialToken', result.credentialToken)
        setStatusMessage('Credentials recovered and stored successfully.')
      } else {
        setStatusMessage('Failed to recover credentials.')
      }
    } catch {
      setStatusMessage('Network error while recovering credentials.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Security Center</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-teal-800 mb-4">Security Status</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-teal-100">
              <td className="py-3 text-teal-500 font-medium w-1/3">Session Reference</td>
              <td className="py-3 text-teal-800 font-mono text-xs">f7d2a8e4-3c1b-4d92-aef6-5b83c0d1e4a2</td>
            </tr>
            <tr className="border-b border-teal-100">
              <td className="py-3 text-teal-500 font-medium">Last Activity</td>
              <td className="py-3 text-teal-800">{new Date().toLocaleString('de-AT')}</td>
            </tr>
            <tr>
              <td className="py-3 text-teal-500 font-medium">Status</td>
              <td className="py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-teal-800 mb-2">Refresh Authentication</h2>
          <p className="text-sm text-teal-500 mb-4">Fetch and persist your current access token and session reference to local storage.</p>
          <button
            type="button"
            onClick={refreshAuthentication}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Refresh Tokens
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-teal-800 mb-2">Recover Credentials</h2>
          <p className="text-sm text-teal-500 mb-4">Restore credential access using a credential token stored in local storage.</p>
          <button
            type="button"
            onClick={recoverCredentials}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Recover Credentials
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {statusMessage}
        </div>
      )}
    </div>
  )
}
