"use client"

import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  className?: string
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const { signOut } = useAuth()

  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => signOut()}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}