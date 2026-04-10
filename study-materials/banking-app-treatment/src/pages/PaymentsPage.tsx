import { useState } from 'react'

export default function PaymentsPage() {
  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount greater than 0.' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payee, amount: numAmount, memo }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Payment of €${numAmount.toFixed(2)} to ${payee} submitted successfully.` })
        setPayee('')
        setAmount('')
        setMemo('')
      } else {
        setMessage({ type: 'error', text: 'Payment failed. Please check the details and try again.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Unable to connect to the server. Please try again later.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-teal-800 mb-6">Send Payment</h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="payee" className="block text-sm font-medium text-teal-700 mb-1">
              Payee Name or IBAN
            </label>
            <input
              id="payee"
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="AT00 0000 0000 0000 0000"
              required
              className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-teal-800"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-teal-700 mb-1">
              Amount (EUR)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-teal-800"
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-teal-700 mb-1">
              Memo
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment memo (optional)"
              rows={3}
              className="w-full px-4 py-2.5 border border-teal-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-teal-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Send Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
