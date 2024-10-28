'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'

interface RescheduleAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: number
  onSuccess: (newDate: Date) => void
}

export function RescheduleAppointmentDialog({
  isOpen,
  onClose,
  appointmentId,
  onSuccess
}: RescheduleAppointmentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleReschedule = () => {
    if (date) {
      onSuccess(date)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            initialFocus
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!date}>
              Reschedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
