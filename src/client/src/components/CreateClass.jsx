import { useState } from "react"
import Layout from "./Layout.jsx"
import api from "../utils/api"

function CreateClass({ user, onLogout }) {
  const [form, setForm] = useState({ name: "", description: "" })
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      const response = await api.post("/classes", form)
      setMessage(`Class "${response.data.name}" created with code ${response.data.code}.`)
      setForm({ name: "", description: "" })
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create class")
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Create a new class
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          As a lecturer or admin, you can create classes and share the auto-generated code
          with students so they can join.
        </p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          {message && (
            <p className="text-sm text-blue-600 dark:text-blue-400">{message}</p>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Class name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              placeholder="e.g. Network Security"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              placeholder="Briefly describe what this class is about."
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Create class
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default CreateClass


