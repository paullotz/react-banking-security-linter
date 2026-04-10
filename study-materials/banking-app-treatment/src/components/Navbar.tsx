import { Link, useLocation, useNavigate } from 'react-router-dom'

interface NavbarProps {
  onLogout: () => void
}

export default function Navbar({ onLogout }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { to: '/overview', label: 'Overview' },
    { to: '/payments', label: 'Payments' },
    { to: '/preferences', label: 'Preferences' },
    { to: '/security', label: 'Security' },
  ]

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-emerald-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/overview" className="text-xl font-bold tracking-tight">
              &#x1f4c8; FinanceHub
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-emerald-900 text-white'
                      : 'text-emerald-200 hover:bg-emerald-700 hover:text-white'
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
            className="px-4 py-2 text-sm font-medium text-emerald-200 hover:text-white hover:bg-emerald-700 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
