"use client"

import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  className?: string
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = () => {
    signOut().then(() => {
      // Only redirect after signOut completes
      router.push("/")
      router.refresh()
    }).catch((error) => {
      console.error('Error signing out:', error)
    })
  }

  return (
    <Button 
      variant="ghost" 
      className={className}
      onClick={handleSignOut}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign out
    </Button>
  )
}