'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Appointment } from '@/types'

interface CancelAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onCancel: () => void
}

export function CancelAppointmentDialog({
  isOpen,
  onClose,
  appointment,
  onCancel
}: CancelAppointmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to cancel this appointment?</p>
          {appointment && (
            <p className="text-sm text-gray-600 mt-2">
              {appointment.patients?.name} - {new Date(appointment.date).toLocaleDateString()} at{' '}
              {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
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
