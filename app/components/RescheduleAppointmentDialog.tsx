'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/app/hooks/useSupabase'
import { rescheduleAppointment } from '@/app/lib/appointment-actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface RescheduleAppointmentDialogProps {
  isOpen: boolean
  appointmentId: number | string
  onSuccess: () => void
  onClose: () => void
}

export function RescheduleAppointmentDialog({
  isOpen,
  appointmentId,
  onSuccess,
  onClose
}: RescheduleAppointmentDialogProps) {
  const { supabase } = useSupabase()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReschedule = async () => {
    if (!date) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await rescheduleAppointment(supabase, appointmentId, date)
      
      if (result.success) {
        onSuccess()
      } else {
        setError(result.message || 'Failed to reschedule appointment')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error rescheduling appointment:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            disabled={(date) => date < new Date()} // Disable past dates
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={!date || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                'Reschedule'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
