import { useState, useEffect } from 'react'
import type { UserProfile } from '../App'

interface OverviewPageProps {
  profile: UserProfile
}

interface Account {
  iban: string
  label: string
  balance: number
  currency: string
}

const recentActivity = [
  { id: 'ACT-301', date: '2026-03-28', description: 'Payroll - March', amount: 5120.00, type: 'credit' },
  { id: 'ACT-302', date: '2026-03-26', description: 'Rent Payment - March', amount: -890.00, type: 'debit' },
  { id: 'ACT-303', date: '2026-03-24', description: 'Grocery - Spar', amount: -67.30, type: 'debit' },
  { id: 'ACT-304', date: '2026-03-22', description: 'Freelance Invoice #47', amount: 2400.00, type: 'credit' },
]

export default function OverviewPage({ profile }: OverviewPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([
    { iban: 'AT44 2011 1283 4567 8901', label: 'Current Account', balance: 15382.45, currency: 'EUR' },
    { iban: 'AT78 1904 3002 9876 5432', label: 'Savings Vault', balance: 42150.00, currency: 'EUR' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          setAccounts(data)
        }
      } catch {
        // use mock data
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-teal-800">Welcome, {profile.displayName}</h1>
        <p className="text-teal-600 mt-1">{profile.plan} Plan Overview</p>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Balance</p>
        <p className="text-3xl font-bold mt-1">
          {loading ? '...' : `€ ${totalBalance.toLocaleString('de-AT', { minimumFractionDigits: 2 })}`}
        </p>
        <p className="text-emerald-200 text-sm mt-2">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Your Accounts</h2>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.iban} className="flex items-center justify-between p-3 rounded-lg bg-teal-50">
                <div>
                  <p className="font-medium text-teal-800">{account.label}</p>
                  <p className="text-xs text-teal-500 font-mono">{account.iban}</p>
                </div>
                <p className="font-semibold text-teal-800">
                  € {account.balance.toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-teal-200">
                  <th className="text-left py-2 text-teal-500 font-medium">Date</th>
                  <th className="text-left py-2 text-teal-500 font-medium">Description</th>
                  <th className="text-right py-2 text-teal-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((act) => (
                  <tr key={act.id} className="border-b border-teal-50">
                    <td className="py-3 text-teal-600">{act.date}</td>
                    <td className="py-3 text-teal-800">{act.description}</td>
                    <td className={`py-3 text-right font-medium ${act.amount >= 0 ? 'text-emerald-600' : 'text-teal-800'}`}>
                      {act.amount >= 0 ? '+' : ''}€ {Math.abs(act.amount).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
