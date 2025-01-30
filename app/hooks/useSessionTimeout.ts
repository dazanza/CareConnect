import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { showToast } from '@/app/lib/toast'

// Session timeout of 1 hour with 5 minute warning
const SESSION_TIMEOUT_MINUTES = 60
const WARNING_MINUTES = 5

interface SessionStatus {
  timeRemaining: number // Minutes remaining in session
  isWarning: boolean // Whether in warning period
  isActive: boolean // Whether user is actively using the app
}

export function useSessionTimeout() {
  const { signOut } = useAuth()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [status, setStatus] = useState<SessionStatus>({
    timeRemaining: SESSION_TIMEOUT_MINUTES,
    isWarning: false,
    isActive: true
  })

  // Convert minutes to milliseconds
  const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000
  const warningMs = WARNING_MINUTES * 60 * 1000

  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
    setStatus(prev => ({
      ...prev,
      isActive: true,
      isWarning: false,
      timeRemaining: SESSION_TIMEOUT_MINUTES
    }))
  }, [])

  // Handle session timeout
  const handleTimeout = useCallback(async () => {
    await signOut()
    showToast.error('Session expired due to inactivity. Please log in again.')
  }, [signOut])

  // Check session status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivity
      const timeLeft = timeoutMs - timeSinceActivity

      // Update time remaining
      const minutesLeft = Math.max(0, Math.floor(timeLeft / 60000))
      
      if (timeLeft <= 0) {
        // Session expired
        handleTimeout()
        clearInterval(interval)
      } else if (timeLeft <= warningMs && !status.isWarning) {
        // Show warning
        setStatus({
          timeRemaining: minutesLeft,
          isWarning: true,
          isActive: true
        })
        showToast.warning('Your session will expire soon. Please save your work.')
      } else {
        // Update status
        setStatus({
          timeRemaining: minutesLeft,
          isWarning: timeLeft <= warningMs,
          isActive: true
        })
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [lastActivity, timeoutMs, warningMs, status.isWarning, handleTimeout])

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      resetTimer()
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [resetTimer])

  return {
    status,
    resetTimer
  }
} 