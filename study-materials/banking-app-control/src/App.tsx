export interface UserSession {
  name: string;
  email: string;
  accountType: string;
}

import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransferPage from './pages/TransferPage'
import SettingsPage from './pages/SettingsPage'
import SessionPage from './pages/SessionPage'

function App() {
  const [session, setSession] = useState<UserSession | null>(null)

  const handleLogin = (s: UserSession) => {
    setSession(s)
  }

  const handleLogout = () => {
    setSession(null)
  }

  return (
    <BrowserRouter>
      {session && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            session ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={session ? <DashboardPage session={session} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/transfer"
          element={session ? <TransferPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={session ? <SettingsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/session"
          element={session ? <SessionPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
