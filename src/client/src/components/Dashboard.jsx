import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import Layout from "./Layout.jsx"

function Dashboard({ user, onLogout }) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes')
      setClasses(response.data)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load classes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="mb-8">
        <h1 className="mb-1 text-gray-900 dark:text-white">
          Welcome back, {user.full_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Role: <span className="capitalize">{user.role}</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading classes...
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
        ) : classes.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No classes found. {user.role === "lecturer" || user.role === "admin"
            ? "Create your first class to get started from the navbar."
            : "Ask your lecturer for a class code and join from the navbar."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem, index) => {
            const imageIndex = index % 4
            const images = [
              "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
              "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
              "https://images.pexels.com/photos/4383298/pexels-photo-4383298.jpeg",
              "https://images.pexels.com/photos/590021/pexels-photo-590021.jpeg",
            ]
            const imageUrl = images[imageIndex]

            return (
              <button
                key={classItem.id}
                type="button"
                onClick={() => navigate(`/classes/${classItem.id}`)}
                className="text-left bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden group"
              >
                <div className="h-24 w-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Class illustration"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {classItem.code}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {classItem.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Lecturer: {classItem.lecturer_name}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      View →
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

export default Dashboard

