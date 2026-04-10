const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockResponses: Record<string, () => unknown> = {
  'POST /api/auth/login': () => ({
    user: {
      name: 'Anna Schmidt',
      email: 'anna@financehub.at',
      accountType: 'Business',
    },
    token: 'eyJhbGciOiJIUzI1NiJ9.mock.financehub',
  }),
  'GET /api/accounts': () => [
    { iban: 'AT44 2011 1285 6789 1234', label: 'Business Account', balance: 87240.50, currency: 'EUR' },
    { iban: 'AT89 1011 0001 2345 6789', label: 'Reserve', balance: 15800.00, currency: 'EUR' },
  ],
  'GET /api/auth/session': () => ({
    accessToken: 'eyJhbGciOiJSUzI1NiJ9.mock.access.financehub',
    sessionId: 'f7d2a8e4-3c1b-4d92-aef6-5b83c0d1e4a2',
  }),
  'GET /api/credentials': () => ({
    credentialToken: 'fh_credential_' + Math.random().toString(36).substring(2, 14),
  }),
  'POST /api/payments': () => ({
    paymentId: 'PAY-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    status: 'processed',
    timestamp: new Date().toISOString(),
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
    await delay(150 + Math.random() * 250)
    const body = handler[1]()
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return originalFetch.call(this, input, init)
}
