import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../utils/api"
import Layout from "./Layout.jsx"

function FileViewer({ user, onLogout }) {
  const [searchParams] = useSearchParams()
  const [filePath, setFilePath] = useState(searchParams.get('path') || '')
  const [includePath, setIncludePath] = useState(searchParams.get('include') || '')
  const [fileContent, setFileContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (filePath || includePath) {
      fetchFile()
    }
  }, [])

  const fetchFile = async () => {
    setLoading(true)
    setError('')
    setFileContent('')

    try {
      let response
      if (includePath) {
        // Use LFI endpoint
        response = await api.get(`/files/include?include=${encodeURIComponent(includePath)}`)
      } else {
        // Use regular file view endpoint
        response = await api.get(`/files/view?path=${encodeURIComponent(filePath)}`)
      }
      
      setFileContent(response.data.content)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load file')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchFile()
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
          File viewer
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="file-path"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              File path (relative to server)
            </label>
            <input
              id="file-path"
              type="text"
              value={filePath}
              onChange={(e) => {
                setFilePath(e.target.value)
                setIncludePath("")
              }}
              placeholder="uploads/filename.txt or ../../../etc/passwd"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            OR
          </div>

          <div>
            <label
              htmlFor="include-path"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Include path (LFI – for uploaded files)
            </label>
            <input
              id="include-path"
              type="text"
              value={includePath}
              onChange={(e) => {
                setIncludePath(e.target.value)
                setFilePath("")
              }}
              placeholder="malicious.php or shell.jsp"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!filePath && !includePath)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "View file"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            LFI attack examples
          </h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>
              Path traversal:{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800/60 px-1 rounded">
                ../../../etc/passwd
              </code>
            </li>
            <li>
              Include uploaded file:{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800/60 px-1 rounded">
                malicious.php
              </code>
            </li>
            <li>
              Windows path:{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800/60 px-1 rounded">
                ..\..\..\windows\system32\drivers\etc\hosts
              </code>
            </li>
          </ul>
        </div>
      </div>

      {/* File Content Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {fileContent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            File content
          </h2>
          <pre className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-lg overflow-auto max-h-96 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
            <code>{fileContent}</code>
          </pre>
        </div>
      )}
    </Layout>
  )
}

export default FileViewer

