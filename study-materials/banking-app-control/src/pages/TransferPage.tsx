import { useState } from 'react'

export default function TransferPage() {
  const [recipientIban, setRecipientIban] = useState('')
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
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
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIban, amount: numAmount, reference }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Transfer of €${numAmount.toFixed(2)} to ${recipientIban} initiated successfully.` })
        setRecipientIban('')
        setAmount('')
        setReference('')
      } else {
        setMessage({ type: 'error', text: 'Transfer failed. Please check the details and try again.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Unable to connect to the server. Please try again later.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Wire Transfer</h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 mb-1">
              Recipient IBAN
            </label>
            <input
              id="recipient"
              type="text"
              value={recipientIban}
              onChange={(e) => setRecipientIban(e.target.value)}
              placeholder="AT00 0000 0000 0000 0000"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
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
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-slate-700 mb-1">
              Reference
            </label>
            <textarea
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Payment reference (optional)"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Send Transfer'}
          </button>
        </form>
      </div>
    </div>
  )
}
