import { useState } from 'react'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Dark Mode</p>
              <p className="text-sm text-slate-500">Switch between light and dark theme</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Push Notifications</p>
              <p className="text-sm text-slate-500">Receive alerts for transactions and security events</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Language</h2>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-700 mb-1">
              Display Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-slate-800"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Francais</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
