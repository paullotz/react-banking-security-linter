import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import PaymentsPage from './pages/PaymentsPage'
import PreferencesPage from './pages/PreferencesPage'
import SecurityPage from './pages/SecurityPage'

export interface UserProfile {
  displayName: string
  email: string
  plan: string
}

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const handleLogin = (p: UserProfile) => {
    setProfile(p)
  }

  const handleLogout = () => {
    setProfile(null)
  }

  return (
    <>
      {profile && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            profile ? <Navigate to="/overview" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/overview"
          element={profile ? <OverviewPage profile={profile} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/payments"
          element={profile ? <PaymentsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/preferences"
          element={profile ? <PreferencesPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/security"
          element={profile ? <SecurityPage /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
