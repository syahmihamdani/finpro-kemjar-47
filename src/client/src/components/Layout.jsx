import { useNavigate, Link } from "react-router-dom"
import { Moon, Sun, LogOut, Home, PlusCircle, LogIn } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext.jsx"

function Layout({ user, onLogout, children }) {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top navigation bar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 group"
            >
              <img
                src="/learnify_logo.png"
                alt="Learnify"
                className="w-9 h-9 object-contain"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold leading-tight">
                  Learnify
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  Secure E-Learning
                </span>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {user?.role === "student" && (
                <Link
                  to="/classes/join"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Join class</span>
                </Link>
              )}

              {(user?.role === "lecturer" || user?.role === "admin") && (
                <Link
                  to="/classes/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Create class</span>
                </Link>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout


