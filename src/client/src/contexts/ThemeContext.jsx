import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  // Initialize from localStorage and apply class to <html>
  useEffect(() => {
    const stored = localStorage.getItem("learnify_theme")
    if (stored === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("learnify_theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("learnify_theme", "light")
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}


