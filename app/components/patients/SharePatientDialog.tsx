'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { sharePatient } from '@/app/lib/patient-sharing'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SharePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  onSuccess: () => void
}

export function SharePatientDialog({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: SharePatientDialogProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState('read')
  const [isLoading, setIsLoading] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !patientId || !supabase) {
      toast.error('Missing required data')
      return
    }

    setIsLoading(true)
    setShowInvite(false)
    setError(null)
    try {
      // Check if user exists using our API endpoint
      const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check user')
      }

      if (!data.exists) {
        setShowInvite(true)
        setIsLoading(false)
        return
      }

      // Share the patient
      const result = await sharePatient(supabase, {
        patientId: parseInt(patientId),
        sharedByUserId: user.id,
        sharedWithUserId: data.userId,
        accessLevel: accessLevel as any
      })

      if (!result || !result.id) {
        throw new Error('Failed to share patient - no share ID returned')
      }

      toast.success('Patient shared successfully')
      setEmail('')
      setAccessLevel('read')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error sharing patient:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while sharing the patient'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          patientId,
          accessLevel,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      toast.success('Invitation sent to ' + email)
      setEmail('')
      setAccessLevel('read')
      setShowInvite(false)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error sending invitation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Patient Record</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you&apos;d like to share this patient&apos;s record with.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter user&apos;s email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessLevel">Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showInvite && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This email is not registered. Would you like to send an invitation?
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            {showInvite ? (
              <Button 
                type="button" 
                onClick={handleInvite}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sharing...' : 'Share Patient'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
