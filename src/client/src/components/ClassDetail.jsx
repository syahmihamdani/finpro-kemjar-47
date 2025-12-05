import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../utils/api"
import Layout from "./Layout.jsx"

function ClassDetail({ user, onLogout }) {
  const { id } = useParams()
  const [classData, setClassData] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [students, setStudents] = useState([])
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    max_submissions: "",
  })
  const [assignmentMessage, setAssignmentMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchClassData()
    fetchAssignments()
    fetchStudents()
  }, [id])

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/classes/${id}`)
      setClassData(response.data)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load class")
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/classes/${id}/assignments`)
      setAssignments(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load assignments")
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/classes/${id}/students`)
      setStudents(response.data)
    } catch (err) {
      // ignore for now; only lecturers/admins really need this
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    setAssignmentMessage("")

    try {
      const response = await api.post(`/classes/${id}/assignments`, newAssignment)
      setAssignmentMessage(`Assignment "${response.data.title}" created.`)
      setNewAssignment({ title: "", description: "", due_date: "", max_submissions: "" })
      fetchAssignments()
    } catch (err) {
      setAssignmentMessage(err.response?.data?.error || "Failed to create assignment")
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
      >
        ← Back to dashboard
      </button>

      {classData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="h-32 w-full mb-4 overflow-hidden rounded-lg">
            <img
              src="https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg"
              alt="Class illustration"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {classData.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {classData.code}
          </p>
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            {classData.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lecturer: {classData.lecturer_name} ({classData.lecturer_email})
          </p>
        </div>
      )}

      {(user.role === "lecturer" || user.role === "admin") && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Create assignment
          </h2>
          {assignmentMessage && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
              {assignmentMessage}
            </p>
          )}
          <form onSubmit={handleCreateAssignment} className="space-y-3">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                placeholder="e.g. Assignment 1: Insecure File Upload"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={newAssignment.description}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                placeholder="Explain what students must do. This is a good place to hint at the vulnerability."
              />
            </div>
            <div>
              <label
                htmlFor="due_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Due date (optional)
              </label>
              <input
                id="due_date"
                type="datetime-local"
                value={newAssignment.due_date}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, due_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="max_submissions"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Submission limit per student (optional)
              </label>
              <input
                id="max_submissions"
                type="number"
                min="1"
                value={newAssignment.max_submissions}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, max_submissions: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                placeholder="Leave empty for unlimited submissions"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Create assignment
            </button>
          </form>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Assignments
          </h2>
          {(user.role === "lecturer" || user.role === "admin") && classData && (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm("Are you sure you want to delete this class? This will remove all assignments and submissions.")) {
                  return
                }
                try {
                  await api.delete(`/classes/${classData.id}`)
                  navigate("/dashboard")
                } catch (err) {
                  setError(err.response?.data?.error || "Failed to delete class")
                }
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Delete class
            </button>
          )}
        </div>
      </div>

      {/* Enrolled students list for lecturer/admin */}
      {(user.role === "lecturer" || user.role === "admin") && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Enrolled students
          </h2>
          {students.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No students enrolled yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {students.map((s) => (
                <li key={s.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {s.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {s.email} · {s.username}
                    </p>
                  </div>
                  <p className="mt-1 sm:mt-0 text-xs text-gray-500 dark:text-gray-400">
                    Enrolled:{" "}
                    {s.enrolled_at && new Date(s.enrolled_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading assignments...
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No assignments found.
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              onClick={() => navigate(`/assignments/${assignment.id}`)}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {assignment.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {assignment.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Due:{" "}
                      {assignment.due_date &&
                        new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    <span>
                      Created:{" "}
                      {assignment.created_at &&
                        new Date(assignment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                  View →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default ClassDetail

