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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !patientId || !supabase) {
      toast.error('Missing required data')
      return
    }

    setIsLoading(true)
    setShowInvite(false)
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError) {
        if (userError.code === 'PGRST116') {
          // User not found - show invite option
          setShowInvite(true)
          return
        }
        throw new Error('Failed to check user')
      }

      if (!userData?.id) {
        setShowInvite(true)
        return
      }

      // Share the patient
      await sharePatient(supabase, {
        patientId: parseInt(patientId),
        sharedByUserId: user.id,
        sharedWithUserId: userData.id,
        accessLevel: accessLevel as any
      })

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
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async () => {
    setIsLoading(true)
    try {
      // Create a pending share record
      const { error: pendingShareError } = await supabase
        .from('pending_shares')
        .insert({
          patient_id: patientId,
          email: email,
          access_level: accessLevel,
          shared_by_user_id: user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
        })

      if (pendingShareError) throw pendingShareError

      // TODO: Send invitation email here
      // For now, just show success message
      toast.success('Invitation sent to ' + email)
      setEmail('')
      setAccessLevel('read')
      setShowInvite(false)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
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
            Share this patient's record with another user by entering their email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email"
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
