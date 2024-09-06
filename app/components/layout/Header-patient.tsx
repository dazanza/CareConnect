'use client'

import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from 'react'

export default function Header() {
  const { isLoaded, userId } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isLoaded || !isClient) {
    return null // or a loading spinner
  }

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-2xl font-semibold text-blue-800">Patients</h2>
        {userId && (
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}