'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'

interface RescheduleAppointmentDialogProps {
  isOpen: boolean
  appointmentId: number | string
  onSuccess: (newDate: Date) => void
  onClose: () => void
}

export function RescheduleAppointmentDialog({
  isOpen,
  appointmentId,
  onSuccess,
  onClose
}: RescheduleAppointmentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              if (newDate) {
                onSuccess(newDate)
              }
            }}
            initialFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
