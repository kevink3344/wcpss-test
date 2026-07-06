import { useEffect, useState } from 'react'

type DbStatus = {
  connected: boolean
  message: string
}

export default function App() {
  const [status, setStatus] = useState<DbStatus | null>(null)

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data: DbStatus) => setStatus(data))
      .catch(() => setStatus({ connected: false, message: 'Could not reach server' }))
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">WCPSS Test</h1>
      </header>
      <main className="main">
        {status && (
          <div className={`status-badge ${status.connected ? 'status-connected' : 'status-disconnected'}`}>
            <span className="status-dot" />
            {status.message}
          </div>
        )}
      </main>
    </div>
  )
}
