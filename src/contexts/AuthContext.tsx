import React, { createContext, useContext, useState, useEffect } from 'react'

type UserRole = 'admin' | 'staff' | 'contact' | null

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchToContact: (contact: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('payforms_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.includes('staff') ? 'Staff Member' : 'Admin User',
      role: email.includes('staff') ? 'staff' : 'admin',
      organizationId: 'org_1'
    }
    
    setUser(mockUser)
    localStorage.setItem('payforms_user', JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('payforms_user')
  }

  const switchToContact = (contact: User) => {
    setUser(contact)
    localStorage.setItem('payforms_user', JSON.stringify(contact))
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      switchToContact
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth(allowedRoles: UserRole[]) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return 'loading'
  if (!user) return 'unauthenticated'
  if (!allowedRoles.includes(user.role)) return 'unauthorized'
  return 'authorized'
}

export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === 'admin'
}

export function useIsStaff() {
  const { user } = useAuth()
  return user?.role === 'staff' || user?.role === 'admin'
}
