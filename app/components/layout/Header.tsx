'use client'

import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useEffect, useState } from 'react'
import { UserNav } from './UserNav'

export default function Header() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // or a loading spinner
  }

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-2xl font-semibold text-blue-800">Dashboard</h2>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <UserNav />
            </>
          ) : (
            <Button asChild>
              <a href="/sign-in">Sign In</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}