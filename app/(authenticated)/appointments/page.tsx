'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, RefreshCw, Trash2, ArrowUpDown, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { RescheduleAppointmentDialog } from '@/app/components/RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from '@/app/components/CancelAppointmentDialog'
import { AppointmentSkeleton } from '@/app/components/ui/skeletons'
import { AppointmentCalendar } from '@/app/components/AppointmentCalendar'
import type { CalendarAppointment } from '@/app/components/AppointmentCalendar'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Appointment {
  id: number;
  date: string;
  type: string;
  location: string;
  patient_id: number;
  doctor_id: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  notes?: string;
  patients?: {
    id: number;
    first_name: string;
    last_name: string;
    nickname?: string;
  };
  doctors?: {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
  };
}

interface AppointmentResponse {
  id: number;
  date: string;
  type: string;
  location: string;
  patient_id: number;
  doctor_id: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  notes?: string;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    nickname?: string;
  }[];
  doctor: {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
  }[];
}

type SortField = 'patient' | 'doctor' | 'date'
type SortOrder = 'asc' | 'desc'

function AppointmentsContent() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const fetchAppointments = useCallback(async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          location,
          patient:patients!patient_id (
            id, 
            first_name,
            last_name,
            nickname
          ),
          doctor:doctors!doctor_id (
            id, 
            first_name,
            last_name
          )
        `)
        .order('date', { ascending: true })

      if (error) throw error
      
      const transformedData: Appointment[] = transformAppointmentData(data as unknown as AppointmentResponse[])
      
      setAppointments(transformedData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedAppointments = sortAppointments(appointments, sortField, sortOrder)

  const handleReschedule = async (date: string, time: string) => {
    if (!selectedAppointment || !supabase) return

    try {
      const newDateTime = `${date}T${time}:00`
      const { error } = await supabase
        .from('appointments')
        .update({ date: newDateTime })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, date: newDateTime }
          : apt
      ))
      toast.success('Appointment rescheduled successfully')
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast.error('Failed to reschedule appointment')
      throw error
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment || !supabase) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id)

      if (error) throw error

      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id))
      toast.success('Appointment cancelled successfully')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
      throw error
    }
  }

  if (isLoading) {
    return <AppointmentSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('patient')}
                    className="text-sm font-medium"
                  >
                    Patient <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('doctor')}
                    className="text-sm font-medium"
                  >
                    Doctor <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('date')}
                    className="text-sm font-medium"
                  >
                    Date & Time <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No appointments scheduled.
                  </TableCell>
                </TableRow>
              ) : (
                sortedAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="group hover:bg-accent/50 transition-colors">
                    <TableCell>
                      <Link href={`/appointments/${appointment.id}`} className="block">
                        <div className="hover:underline">
                          {appointment.patients?.nickname || appointment.patients?.first_name}
                        </div>
                        {appointment.patients?.nickname && (
                          <div className="text-sm text-muted-foreground">
                            {appointment.patients?.first_name}
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/appointments/${appointment.id}`} className="block">
                        Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/appointments/${appointment.id}`} className="block">
                        <div className="flex flex-col">
                          <span>{format(new Date(appointment.date), 'MMMM d, yyyy')}</span>
                          <span className="text-muted-foreground">
                            {format(new Date(appointment.date), 'h:mm a')}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/appointments/${appointment.id}`} className="block">
                        {appointment.location}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowReschedule(true)
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowCancel(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="lg:col-span-2">
          <AppointmentCalendar
            appointments={transformToCalendarAppointments(appointments)}
            onDateSelect={setSelectedDate}
            className="sticky top-6"
          />
        </div>
      </div>

      {selectedAppointment && (
        <>
          <RescheduleAppointmentDialog
            isOpen={showReschedule}
            onClose={() => {
              setShowReschedule(false)
              setSelectedAppointment(null)
            }}
            appointmentId={selectedAppointment.id}
            onSuccess={(newDate) => {
              if (newDate) {
                handleReschedule(newDate.toISOString(), format(newDate, 'HH:mm'))
              }
            }}
          />
          <CancelAppointmentDialog
            isOpen={showCancel}
            onClose={() => {
              setShowCancel(false)
              setSelectedAppointment(null)
            }}
            appointment={selectedAppointment}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  )
}

function transformAppointmentData(data: AppointmentResponse[]): Appointment[] {
  return data.map(apt => ({
    id: apt.id,
    date: apt.date,
    type: apt.type,
    location: apt.location,
    patient_id: apt.patient_id,
    doctor_id: apt.doctor_id,
    status: apt.status,
    notes: apt.notes,
    patients: apt.patient?.[0] || undefined,
    doctors: apt.doctor?.[0] || undefined
  }))
}

function sortAppointments(appointments: Appointment[], field: SortField, order: SortOrder): Appointment[] {
  return [...appointments].sort((a, b) => {
    switch (field) {
      case 'patient':
        const aName = a.patients?.nickname || a.patients?.first_name || ''
        const bName = b.patients?.nickname || b.patients?.first_name || ''
        return order === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName)
      case 'doctor':
        const aDoc = a.doctors?.first_name || ''
        const bDoc = b.doctors?.first_name || ''
        return order === 'asc' ? aDoc.localeCompare(bDoc) : bDoc.localeCompare(aDoc)
      case 'date':
        return order === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      default:
        return 0
    }
  })
}

const transformToCalendarAppointments = (appointments: Appointment[]): CalendarAppointment[] => {
  return appointments.map(apt => ({
    id: apt.id.toString(),
    date: apt.date,
    patient: {
      id: apt.patient_id.toString(),
      name: apt.patients?.nickname || `${apt.patients?.first_name} ${apt.patients?.last_name}`
    },
    doctor: {
      id: apt.doctor_id.toString(),
      name: `${apt.doctors?.first_name} ${apt.doctors?.last_name}`
    },
    location: apt.location
  }));
};

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentsContent />
    </div>
  )
}
