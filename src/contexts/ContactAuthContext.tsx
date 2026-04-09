import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { contactAuthService, type Contact } from '@/services/contactAuthService'

interface ContactAuthContextType {
  contact: Contact | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, organizationSubdomain?: string) => Promise<void>
  logout: () => Promise<void>
  refreshContact: () => Promise<void>
  error: string | null
  clearError: () => void
}

const ContactAuthContext = createContext<ContactAuthContextType | undefined>(undefined)

const STORAGE_KEY = 'pf_contact'

export function ContactAuthProvider({ children }: { children: React.ReactNode }) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContactFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as Contact
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    return null
  }, [])

  const refreshContact = useCallback(async () => {
    try {
      const data = await contactAuthService.getMe()
      setContact(data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      setContact(null)
      localStorage.removeItem(STORAGE_KEY)
      throw err
    }
  }, [])

  useEffect(() => {
    const stored = loadContactFromStorage()
    if (stored) {
      setContact(stored)
      refreshContact()
        .catch(() => {
          // If refresh fails, keep stored but clear on next render
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [loadContactFromStorage, refreshContact])

  const login = useCallback(async (email: string, password: string, organizationSubdomain?: string) => {
    setError(null)
    setIsLoading(true)
    
    try {
      await contactAuthService.login({
        email,
        password,
        organization_subdomain: organizationSubdomain,
      })
      
      const contactData = await contactAuthService.getMe()
      setContact(contactData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactData))
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await contactAuthService.logout()
    } finally {
      setContact(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <ContactAuthContext.Provider value={{
      contact,
      isLoading,
      isAuthenticated: !!contact,
      login,
      logout,
      refreshContact,
      error,
      clearError,
    }}>
      {children}
    </ContactAuthContext.Provider>
  )
}

export function useContactAuth() {
  const context = useContext(ContactAuthContext)
  if (context === undefined) {
    throw new Error('useContactAuth must be used within a ContactAuthProvider')
  }
  return context
}