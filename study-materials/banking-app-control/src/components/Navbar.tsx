import { Link, useLocation, useNavigate } from 'react-router-dom'

interface NavbarProps {
  onLogout: () => void
}

export default function Navbar({ onLogout }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/transfer', label: 'Transfer' },
    { to: '/settings', label: 'Settings' },
    { to: '/session', label: 'Session' },
  ]

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-xl font-bold tracking-tight">
              🏦 SecureBank
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
