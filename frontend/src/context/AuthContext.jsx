import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

// Static user since auth is removed
const staticUser = {
  id: 1,
  username: 'JUUKO',
  email: 'juuko@cloudresourcehub.com',
  role: 'admin',
  is_superuser: true,
}

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider
      value={{
        user: staticUser,
        tokens: null,
        loading: false,
        login: async () => staticUser,
        register: async () => staticUser,
        logout: () => {},
        isAdmin: true,
        isLecturer: false,
        isStudent: false,
        isAuthenticated: true,
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
