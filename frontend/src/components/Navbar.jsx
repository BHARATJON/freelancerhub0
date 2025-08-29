import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, Briefcase, LogOut, Settings, Calendar } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import NotificationBar from './NotificationBar'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'freelancer':
        return '/freelancer/dashboard'
      case 'company':
        return '/company/dashboard'
      case 'admin':
        return '/admin/complaints'
      default:
        return '/'
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Freelancer Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated && (
              <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                Home
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Jobs
                </Link>
                <Link to="/scheduled-interviews" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Interviews</span>
                </Link>
                {user?.role === 'company' && (
                  <Link to="/job/post" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Post Job
                  </Link>
                )}
                <NotificationBar />
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {!isAuthenticated && (
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/jobs"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  to="/scheduled-interviews"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Interviews</span>
                </Link>
                {user?.role === 'company' && (
                  <Link
                    to="/job/post"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Job
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 