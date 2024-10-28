'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"

interface CancelAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onCancel: () => Promise<void>
  appointmentDate: string
}

export function CancelAppointmentDialog({
  isOpen,
  onClose,
  onCancel,
  appointmentDate,
}: CancelAppointmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = async () => {
    setIsSubmitting(true)
    try {
      await onCancel()
      toast.success('Appointment cancelled successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to cancel appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel the appointment scheduled for {appointmentDate}? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Appointment
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
