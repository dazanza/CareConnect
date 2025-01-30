'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from "date-fns"
import { Calendar, Clock, MapPin, RefreshCw, Trash2, ArrowUpDown, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { ResponsiveTable } from "@/app/components/ui/responsive-table"
import { LazyComponent } from "@/app/components/ui/lazy-component"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/app/components/auth/SupabaseAuthProvider"
import { useSupabase } from "@/app/hooks/useSupabase"
import { appNavigation } from "@/app/lib/navigation"
import { AppointmentSkeleton } from "@/app/components/ui/skeletons"
import { AppointmentCalendarEnhanced } from "@/app/components/AppointmentCalendarEnhanced"
import type { CalendarAppointment } from '@/app/components/AppointmentCalendarEnhanced'
import { RescheduleAppointmentDialog } from '@/app/components/RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from '@/app/components/CancelAppointmentDialog'
import { AppointmentErrorBoundary } from '@/app/components/error-boundaries/AppointmentErrorBoundary'
import Link from 'next/link'

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
    avatar_url?: string;
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
    avatar_url?: string;
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
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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
            nickname,
            avatar_url
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

  const handleAppointmentClick = (appointmentId: string) => {
    appNavigation.goToAppointment(router, appointmentId, { showToast: true })
  }

  const columns = [
    {
      header: "Patient",
      accessorKey: "patients",
      cell: (value: any) => (
        <Button
          variant="ghost"
          className="p-0 h-auto font-normal hover:no-underline w-full text-left"
          onClick={() => handleAppointmentClick(value.id.toString())}
        >
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src={value?.avatar_url || ''}
                alt={value?.first_name || ''}
              />
              <AvatarFallback>
                {value?.first_name?.[0]}
                {value?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {value?.nickname || `${value?.first_name} ${value?.last_name}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {value?.type}
              </div>
            </div>
          </div>
        </Button>
      )
    },
    {
      header: "Doctor",
      accessorKey: "doctors",
      cell: (value: any) => (
        <div className="flex items-center">
          <div>
            <div className="font-medium">
              Dr. {value?.first_name} {value?.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              {value?.specialization}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Date & Time",
      accessorKey: "date",
      cell: (value: string) => (
        <div>
          <div className="font-medium">
            {format(new Date(value), "MMMM d, yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(value), "h:mm a")}
          </div>
        </div>
      )
    },
    {
      header: "Location",
      accessorKey: "location"
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (value: string) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              const apt = appointments.find(a => a.id.toString() === value)
              setSelectedAppointment(apt || null)
              setShowReschedule(true)
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              const apt = appointments.find(a => a.id.toString() === value)
              setSelectedAppointment(apt || null)
              setShowCancel(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

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
          <ResponsiveTable
            columns={columns}
            data={sortedAppointments}
            isLoading={isLoading}
            onRowClick={(row) => handleAppointmentClick(row.id.toString())}
            emptyMessage="No appointments scheduled."
          />
        </div>

        <div className="lg:col-span-2">
          <LazyComponent>
            <AppointmentCalendarEnhanced
              appointments={transformToCalendarAppointments(appointments)}
              onDateSelect={setSelectedDate}
              defaultView="month"
            />
          </LazyComponent>
        </div>
      </div>

      {showReschedule && selectedAppointment && (
        <RescheduleAppointmentDialog
          appointmentId={selectedAppointment.id}
          isOpen={showReschedule}
          onClose={() => {
            setShowReschedule(false)
            setSelectedAppointment(null)
          }}
          onSuccess={() => {
            setShowReschedule(false)
            setSelectedAppointment(null)
            fetchAppointments()
          }}
        />
      )}

      {showCancel && selectedAppointment && (
        <CancelAppointmentDialog
          appointment={selectedAppointment}
          isOpen={showCancel}
          onClose={() => {
            setShowCancel(false)
            setSelectedAppointment(null)
          }}
          onCancel={handleCancel}
        />
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

function transformToCalendarAppointments(appointments: Appointment[]): CalendarAppointment[] {
  return appointments.map(apt => ({
    id: apt.id.toString(),
    date: apt.date,
    patient: {
      id: apt.patients?.id.toString() || '',
      name: apt.patients?.nickname || `${apt.patients?.first_name} ${apt.patients?.last_name}`
    },
    doctor: {
      id: apt.doctors?.id.toString() || '',
      name: `Dr. ${apt.doctors?.first_name} ${apt.doctors?.last_name}`
    },
    location: apt.location,
    type: apt.type || 'Consultation'
  }))
}

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <LazyComponent>
        <AppointmentErrorBoundary>
          <AppointmentsContent />
        </AppointmentErrorBoundary>
      </LazyComponent>
    </div>
  )
}
