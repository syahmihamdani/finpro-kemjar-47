import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../utils/api"
import Layout from "./Layout.jsx"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "")

function AssignmentDetail({ user, onLogout }) {
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAssignment()
    if (user.role === 'lecturer' || user.role === 'admin') {
      fetchSubmissions()
    } else {
      fetchMySubmissions()
    }
  }, [id, user.role])

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${id}`)
      setAssignment(response.data)
      setLoading(false)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to load assignment')
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/assignments/${id}/submissions`)
      setSubmissions(response.data)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to load submissions')
    }
  }

  const fetchMySubmissions = async () => {
    try {
      const response = await api.get('/submissions/my')
      const mySubs = response.data.filter(sub => sub.assignment_id === parseInt(id))
      setSubmissions(mySubs)
    } catch (err) {
      // Ignore errors for students
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setMessage('Please select a file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/assignments/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`File uploaded successfully! File path: ${data.file_path}`)
        setFile(null)
        document.getElementById('file-input').value = ''
        fetchMySubmissions()
      } else {
        setMessage(data.error || 'Upload failed')
      }
    } catch (err) {
      setMessage('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return

    try {
      setDeletingId(submissionId)
      await api.delete(`/submissions/${submissionId}`)
      if (user.role === "student") {
        fetchMySubmissions()
      } else {
        fetchSubmissions()
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to delete submission")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="min-h-[40vh] flex items-center justify-center text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
      >
        ← Back to class
      </button>

      {assignment && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {assignment.title}
          </h1>
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            {assignment.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Due:{" "}
              {assignment.due_date &&
                new Date(assignment.due_date).toLocaleString()}
            </span>
            <span>
              Created:{" "}
              {assignment.created_at &&
                new Date(assignment.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* File Upload Section (for students) */}
      {user.role === "student" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Submit assignment
          </h2>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg text-sm ${
                message.includes("successfully")
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="file-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select file
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-gray-700 dark:file:text-gray-100 dark:hover:file:bg-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : "Upload file"}
            </button>
          </form>
        </div>
      )}

      {/* Submissions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {user.role === "student" ? "My submissions" : "All submissions"}
        </h2>

        {submissions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {submission.file_name}
                    </h3>
                    {user.role !== "student" && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Submitted by: {submission.student_name} (
                        {submission.student_email})
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {submission.submitted_at &&
                      new Date(submission.submitted_at).toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-sm items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const relativePath = submission.file_path
                        .replace(/\\/g, "/")
                        .replace(/.*uploads\//, "uploads/")
                      const url = `${BACKEND_URL}/${relativePath}`
                      window.open(url, "_blank", "noopener,noreferrer")
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View file
                  </button>
                  {(user.role === "lecturer" || user.role === "admin") && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmission(submission.id)}
                      disabled={deletingId === submission.id}
                      className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      {deletingId === submission.id ? "Removing..." : "Remove submission"}
                    </button>
                  )}
                </div>

                {submission.grade !== null && (
                  <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-sm">
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Grade:</span>{" "}
                      {submission.grade}/100
                    </p>
                    {submission.feedback && (
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-semibold">Feedback:</span>{" "}
                        {submission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AssignmentDetail

