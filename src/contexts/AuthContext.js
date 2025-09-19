'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { customAuth } from '../lib/custom-auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user, error } = await customAuth.getCurrentUser()
        if (error) {
          setError(error)
        } else {
          setUser(user)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'ravenai_token') {
        if (e.newValue) {
          // Token was added, verify it
          customAuth.getCurrentUser().then(({ user, error }) => {
            if (error) {
              setUser(null)
            } else {
              setUser(user)
            }
          })
        } else {
          // Token was removed
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signUp = async (email, name, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await customAuth.signUp(email, name, password)
      if (result.success) {
        setUser(result.user)
        return { success: true, data: result.data }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await customAuth.signIn(email, password)
      if (result.success) {
        setUser(result.user)
        return { success: true, data: result.data }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await customAuth.signOut()
      if (result.success) {
        setUser(null)
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (email, oldPassword, newPassword) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await customAuth.updatePassword(email, oldPassword, newPassword)
      if (result.success) {
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updatePassword,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
