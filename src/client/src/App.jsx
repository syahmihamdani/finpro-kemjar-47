import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import ClassDetail from "./components/ClassDetail"
import AssignmentDetail from "./components/AssignmentDetail"
import CreateClass from "./components/CreateClass.jsx"
import JoinClass from "./components/JoinClass.jsx"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/classes/:id"
        element={user ? <ClassDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/assignments/:id"
        element={user ? <AssignmentDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/classes/create"
        element={
          user
            ? (user.role === "lecturer" || user.role === "admin"
                ? <CreateClass user={user} onLogout={handleLogout} />
                : <Navigate to="/dashboard" />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/classes/join"
        element={
          user
            ? (user.role === "student"
                ? <JoinClass user={user} onLogout={handleLogout} />
                : <Navigate to="/dashboard" />)
            : <Navigate to="/login" />
        }
      />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
