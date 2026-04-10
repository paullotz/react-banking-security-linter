import { useState, useEffect } from 'react'
import type { UserSession } from '../App'

interface DashboardPageProps {
  session: UserSession
}

interface Account {
  iban: string
  label: string
  balance: number
  currency: string
}

const mockTransactions = [
  { id: 'TXN-001', date: '2026-03-28', description: 'Salary - March', amount: 4850.00, type: 'credit' },
  { id: 'TXN-002', date: '2026-03-27', description: 'Electric Bill - Wiener Stadtwerke', amount: -127.45, type: 'debit' },
  { id: 'TXN-003', date: '2026-03-25', description: 'Transfer to Anna M.', amount: -500.00, type: 'debit' },
]

export default function DashboardPage({ session }: DashboardPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([
    { iban: 'AT61 1904 3002 3457 3241', label: 'Main Checking', balance: 12453.87, currency: 'EUR' },
    { iban: 'AT25 2011 1285 5432 7654', label: 'Savings', balance: 34200.00, currency: 'EUR' },
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
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {session.name}</h1>
        <p className="text-slate-500 mt-1">{session.accountType} Account Overview</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 text-white">
        <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Balance</p>
        <p className="text-3xl font-bold mt-1">
          {loading ? '...' : `€ ${totalBalance.toLocaleString('de-AT', { minimumFractionDigits: 2 })}`}
        </p>
        <p className="text-blue-200 text-sm mt-2">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Label</th>
                  <th className="text-left py-2 text-slate-500 font-medium">IBAN</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.iban} className="border-b border-slate-100">
                    <td className="py-3 text-slate-800 font-medium">{account.label}</td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{account.iban}</td>
                    <td className="py-3 text-right text-slate-800 font-medium">
                      € {account.balance.toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Description</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-600">{txn.date}</td>
                    <td className="py-3 text-slate-800">{txn.description}</td>
                    <td className={`py-3 text-right font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-slate-800'}`}>
                      {txn.amount >= 0 ? '+' : ''}€ {Math.abs(txn.amount).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
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
