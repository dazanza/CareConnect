'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, ArrowLeft } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debug, setDebug] = useState<any>(null)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebug(null)

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      })

      setDebug({ data, error, timestamp: new Date().toISOString(), type: 'reset_password' })
      console.log('Reset password response:', { data, error })

      if (error) throw error

      toast.success(
        'If an account exists with this email, you will receive a password reset link.',
        { duration: 6000 }
      )
      setEmail('')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link 
            href="/sign-in"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
            <p className="text-sm text-gray-500">
              Can&apos;t remember your password? Enter your email below and we&apos;ll send you a reset link.
            </p>
          </div>

          <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              We'll send you a secure link to reset your password.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <Input
                id="email"
                placeholder="name@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
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