import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tokens')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tokens?.access) {
      authAPI
        .getProfile()
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        })
        .catch(() => {
          logout()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    const { user: userData, tokens: tokenData } = res.data
    setUser(userData)
    setTokens(tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('tokens', JSON.stringify(tokenData))
    return userData
  }

  const register = async (userData) => {
    const res = await authAPI.register(userData)
    const { user: newUser, tokens: tokenData } = res.data
    setUser(newUser)
    setTokens(tokenData)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('tokens', JSON.stringify(tokenData))
    return newUser
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('user')
    localStorage.removeItem('tokens')
  }

  const isAdmin = user?.role === 'admin'
  const isLecturer = user?.role === 'lecturer'
  const isStudent = user?.role === 'student'

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isLecturer,
        isStudent,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
