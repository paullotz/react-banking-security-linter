import { useState } from 'react'

export default function PreferencesPage() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [currency, setCurrency] = useState('EUR')
  const [language, setLanguage] = useState('en')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Preferences</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Display Layout</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLayout('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                layout === 'grid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              Grid View
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                layout === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Currency</h2>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-teal-700 mb-1">
              Default Display Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-teal-800"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CHF">CHF - Swiss Franc</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Language</h2>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-teal-700 mb-1">
              Display Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-teal-800"
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
