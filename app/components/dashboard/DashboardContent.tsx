'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface DashboardData {
  patientCount: number
  appointmentCount: number
  upcomingAppointments: Array<{
    id: string
    date: string
    type: string
    notes?: string
    patient: {
      id: string
      first_name: string
      last_name: string
    }
    doctor: {
      id: string
      first_name: string
      last_name: string
    }
  }>
  recentPatients: Array<{
    id: string
    first_name: string
    last_name: string
    date_of_birth: string
  }>
}

export default function DashboardContent() {
  const { user } = useAuth()
  const { supabase } = useSupabase()

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return null

      try {
        // Get patient count
        const { data: patients, error: patientError } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id.toString())

        if (patientError) throw patientError

        // Get appointment count
        const { data: appointments, error: appointmentError } = await supabase
          .from('appointments')
          .select('id')
          .eq('user_id', user.id.toString())

        if (appointmentError) throw appointmentError

        // Get upcoming appointments
        const { data: upcomingAppointments, error: upcomingError } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            type,
            notes,
            patient:patients (
              id,
              first_name,
              last_name,
              nickname
            ),
            doctor:doctors (
              id,
              first_name,
              last_name
            )
          `)
          .eq('user_id', user.id.toString())
          .gte('date', new Date().toISOString())
          .order('date')
          .limit(5)

        if (upcomingError) throw upcomingError

        console.log('Upcoming appointments:', upcomingAppointments)

        // Get recent patients
        const { data: recentPatients, error: recentError } = await supabase
          .from('patients')
          .select('id, first_name, last_name, date_of_birth')
          .eq('user_id', user.id.toString())
          .order('first_name')
          .limit(5)

        if (recentError) throw recentError

        return {
          patientCount: patients?.length || 0,
          appointmentCount: appointments?.length || 0,
          upcomingAppointments: upcomingAppointments || [],
          recentPatients: recentPatients || []
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Failed to load dashboard data')
        throw error
      }
    },
    enabled: !!user?.id && !!supabase,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load dashboard data. Please try refreshing the page.
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="space-y-6 mx-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.patientCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.appointmentCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="md:col-span-3">
                {dashboardData.upcomingAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <p>No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center">
                        <div>
                          <Link href={`/appointments/${appointment.id}`}>
                            <Button variant="link" className="p-0 h-auto font-medium">
                              {(appointment.patient as any).nickname || `${(appointment.patient as any).first_name} ${(appointment.patient as any).last_name}`} with Dr. {(appointment.doctor as any).first_name} {(appointment.doctor as any).last_name} on {format(new Date(appointment.date), "MMMM d, yyyy")} at {format(new Date(appointment.date), "h:mm a")}
                            </Button>
                          </Link>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Note: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Calendar 
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border px-4 py-3"
                  modifiers={{
                    appointment: dashboardData.upcomingAppointments.map(apt => new Date(apt.date))
                  }}
                  modifiersStyles={{
                    appointment: {
                      backgroundColor: "hsl(142.1 76.2% 36.3%)",
                      color: "white",
                      borderRadius: "0"
                    }
                  }}
                  classNames={{
                    months: "space-y-4",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex justify-between mb-2",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full justify-between mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    day_range_end: "day-range-end",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground hover:bg-accent/90",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible"
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const dayAppointments = dashboardData.upcomingAppointments.filter(
                        apt => new Date(apt.date).toDateString() === date.toDateString()
                      )
                      
                      return dayAppointments.length > 0 ? (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="w-full h-full flex items-center justify-center cursor-pointer">
                              {date.getDate()}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Appointments on {format(date, "MMMM d, yyyy")}</h4>
                              {dayAppointments.map(apt => (
                                <Link key={apt.id} href={`/appointments/${apt.id}`} className="block hover:underline">
                                  <div className="text-sm">
                                    {(apt.patient as any).nickname || `${(apt.patient as any).first_name} ${(apt.patient as any).last_name}`} with Dr. {(apt.doctor as any).first_name} {(apt.doctor as any).last_name} at {format(new Date(apt.date), "h:mm a")}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {date.getDate()}
                        </div>
                      )
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No patients added yet</p>
            ) : (
              <div className="space-y-2">
                {dashboardData.recentPatients.map((patient) => (
                  <div key={patient.id} className="flex justify-between items-center">
                    <div>
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="link" className="p-0 h-auto font-medium">
                          {`${patient.first_name} ${patient.last_name}`}
                        </Button>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Born {format(new Date(patient.date_of_birth), 'PP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
