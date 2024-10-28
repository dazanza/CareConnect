'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Appointment } from '@/types'

interface CancelAppointmentDialogProps {
  isOpen: boolean
  appointment: Appointment | null
  onCancel: () => void
  onClose: () => void
}

export function CancelAppointmentDialog({
  isOpen,
  appointment,
  onCancel,
  onClose
}: CancelAppointmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
        </DialogHeader>
        <p className="py-4">Are you sure you want to cancel this appointment?</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Appointment
          </Button>
          <Button variant="destructive" onClick={onCancel}>
            Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
