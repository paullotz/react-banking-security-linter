const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockResponses: Record<string, (url: string, options?: RequestInit) => unknown> = {
  'POST /api/auth/login': () => ({
    user: {
      name: 'Max Mustermann',
      email: 'max@securebank.at',
      accountType: 'Premium',
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
  }),
  'GET /api/accounts': () => [
    { iban: 'AT61 1904 3002 3457 3241', label: 'Main Checking', balance: 12453.87, currency: 'EUR' },
    { iban: 'AT25 2011 1285 5432 7654', label: 'Savings', balance: 34200.00, currency: 'EUR' },
  ],
  'POST /api/transfer': () => ({
    transactionId: 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    status: 'completed',
    timestamp: new Date().toISOString(),
  }),
  'GET /api/auth/token': () => ({
    sessionId: 'a3f8c2d1-7b4e-4a91-bc56-e82f1d09a3c7',
    token: 'eyJhbGciOiJIUzI1NiJ9.mock.auth.token',
  }),
  'GET /api/account/token': () => ({
    refreshToken: 'eyJhbGciOiJIUzI1NiJ9.mock.refresh.token',
    expiresIn: 3600,
  }),
}

const originalFetch = window.fetch

window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url
  const method = init?.method || 'GET'
  const key = `${method} ${url}`

  const handler = Object.entries(mockResponses).find(([pattern]) => {
    const [pMethod, pUrl] = pattern.split(' ')
    return method === pMethod && url.startsWith(pUrl)
  })

  if (handler) {
    await delay(200 + Math.random() * 300)
    const body = handler[1](url, init)
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return originalFetch.call(this, input, init)
}
