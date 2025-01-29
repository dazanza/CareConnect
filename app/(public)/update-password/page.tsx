'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { appNavigation } from '@/app/lib/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [debug, setDebug] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setDebug({ event, hasSession: !!session })

      if (event === 'PASSWORD_RECOVERY') {
        setCanUpdate(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canUpdate) {
      toast.error('Please wait for password recovery verification')
      return
    }
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      setDebug(prev => ({ ...prev, updatePassword: { data, error } }))

      if (error) throw error

      toast.success('Password updated successfully')
      appNavigation.navigateTo(router, '/sign-in', { 
        showToast: true,
        fallbackRoute: '/'
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Update Password</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {!canUpdate ? 'Verifying password recovery...' : 'Enter your new password below.'}
            </p>
          </div>

          <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              Choose a strong password that you haven&apos;t used before.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !canUpdate}
                className="w-full"
                required
                minLength={6}
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
              type="submit" 
              disabled={isLoading || !canUpdate}
            >
              {isLoading ? 'Updating...' : !canUpdate ? 'Verifying...' : 'Update Password'}
            </Button>
          </form>

          {process.env.NODE_ENV === 'development' && debug && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono overflow-auto">
              <pre>{JSON.stringify(debug, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
