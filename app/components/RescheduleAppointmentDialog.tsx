'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "react-hot-toast"

interface RescheduleAppointmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onReschedule: (date: string, time: string) => Promise<void>
  currentDate?: string
  currentTime?: string
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00"
]

export function RescheduleAppointmentDialog({
  isOpen,
  onClose,
  onReschedule,
  currentDate,
  currentTime
}: RescheduleAppointmentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(currentDate ? new Date(currentDate) : undefined)
  const [time, setTime] = useState<string | undefined>(currentTime)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReschedule = async () => {
    if (!date || !time) {
      toast.error('Please select both date and time')
      return
    }

    setIsSubmitting(true)
    try {
      await onReschedule(format(date, 'yyyy-MM-dd'), time)
      toast.success('Appointment rescheduled successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to reschedule appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </div>
          <div className="grid gap-2">
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time">
                  {time ? (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  ) : (
                    "Select time"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!date || !time || isSubmitting}
          >
            {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
