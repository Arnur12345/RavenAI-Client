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
        console.log('AuthContext: Getting initial session...')
        const { user, error } = await customAuth.getCurrentUser()
        console.log('AuthContext: Initial session result:', { user: !!user, error })
        
        if (error) {
          console.log('AuthContext: Error getting user:', error)
          setError(error)
          setUser(null)
        } else if (user) {
          console.log('AuthContext: User found:', user.email)
          setUser(user)
          setError(null)
        } else {
          console.log('AuthContext: No user found')
          setUser(null)
        }
      } catch (err) {
        console.error('AuthContext: Exception getting initial session:', err)
        setError(err.message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'ravenai_token' || e.key === 'ravenai_user') {
        console.log('AuthContext: Storage changed:', { key: e.key, hasNewValue: !!e.newValue })
        if (e.key === 'ravenai_token' && e.newValue) {
          // Token was added, verify it
          customAuth.getCurrentUser().then(({ user, error }) => {
            if (error) {
              console.log('AuthContext: Token verification failed:', error)
              setUser(null)
            } else {
              console.log('AuthContext: Token verified, user:', user?.email)
              setUser(user)
            }
          })
        } else if (e.key === 'ravenai_token' && !e.newValue) {
          // Token was removed
          console.log('AuthContext: Token removed, logging out')
          setUser(null)
        } else if (e.key === 'ravenai_user' && e.newValue) {
          // User data was updated
          try {
            const user = JSON.parse(e.newValue)
            console.log('AuthContext: User data updated:', user.email)
            setUser(user)
          } catch (error) {
            console.log('AuthContext: Failed to parse user data')
          }
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
