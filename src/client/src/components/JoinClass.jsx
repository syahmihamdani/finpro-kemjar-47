import { useState } from "react"
import Layout from "./Layout.jsx"
import api from "../utils/api"

function JoinClass({ user, onLogout }) {
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      await api.post("/classes/join", { code })
      setMessage(`Joined class with code ${code}.`)
      setCode("")
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to join class")
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Join a class
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter the class code provided by your lecturer to enroll in the class.
        </p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          {message && (
            <p className="text-sm text-blue-600 dark:text-blue-400">{message}</p>
          )}

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Class code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              placeholder="e.g. NETS123"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Join class
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default JoinClass


