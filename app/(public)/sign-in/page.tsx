'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/app/components/ui/skeleton'
import { appNavigation } from '@/app/lib/navigation'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, user, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      appNavigation.navigateTo(router, '/dashboard', { 
        showToast: true,
        fallbackRoute: '/'
      })
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error?.message || 'Invalid email or password')
      setIsLoading(false)
    }
  }

  const handleSignUpClick = () => {
    appNavigation.navigateTo(router, '/sign-up', { showToast: true })
  }

  const handleResetPasswordClick = () => {
    appNavigation.navigateTo(router, '/reset-password', { showToast: true })
  }

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-6 p-4">
          <div className="space-y-2 text-center">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (user) {
    return null
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in to your account
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
          </form>
          <div className="flex flex-col space-y-2">
            <Button variant="ghost" onClick={handleSignUpClick}>
              Don't have an account? Sign up
            </Button>
            <Button variant="ghost" onClick={handleResetPasswordClick}>
              Forgot your password?
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 