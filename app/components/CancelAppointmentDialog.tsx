import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Appointment } from '@/types'

interface CancelAppointmentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  onCancel: () => void
}

export function CancelAppointmentDialog({
  isOpen,
  onOpenChange,
  appointment,
  onCancel
}: CancelAppointmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>No, keep appointment</Button>
          <Button variant="destructive" onClick={onCancel}>Yes, cancel appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}