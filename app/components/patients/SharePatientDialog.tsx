'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { sharePatient, AccessLevel } from '@/app/lib/patient-sharing'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

interface SharePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: number
  patientName: string
}

export function SharePatientDialog({
  isOpen,
  onClose,
  patientId,
  patientName
}: SharePatientDialogProps) {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('read')
  const [expiresAt, setExpiresAt] = useState<Date | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  async function handleShare() {
    if (!supabase || !userId || !email) return

    try {
      setIsLoading(true)

      // First, get the user ID for the email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        toast.error('User not found')
        return
      }

      await sharePatient(supabase, {
        patientId,
        sharedByUserId: userId,
        sharedWithUserId: userData.id,
        accessLevel,
        expiresAt
      })

      toast.success(`Successfully shared ${patientName} with ${email}`)
      onClose()
    } catch (error) {
      console.error('Error sharing patient:', error)
      toast.error('Failed to share patient')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {patientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Share with (email)
            </label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Access Level
            </label>
            <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as AccessLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Can Edit</SelectItem>
                <SelectItem value="admin">Full Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Expires (optional)
            </label>
            <Calendar
              mode="single"
              selected={expiresAt}
              onSelect={setExpiresAt}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={!email || isLoading}
            >
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
