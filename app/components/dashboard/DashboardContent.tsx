'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'

interface DashboardData {
  patientCount: number
  appointmentCount: number
  upcomingAppointments: Array<{
    id: string
    date: string
    patient: {
      id: string
      name: string
    }
  }>
  recentPatients: Array<{
    id: string
    name: string
    date_of_birth: string
  }>
}

export default function DashboardContent() {
  const { user } = useAuth()
  const { supabase } = useSupabase()

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return null

      const [
        { count: patientCount, error: patientError },
        { count: appointmentCount, error: appointmentError },
        { data: upcomingAppointments, error: upcomingError },
        { data: recentPatients, error: recentError }
      ] = await Promise.all([
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('appointments')
          .select(`
            id,
            date,
            patient:patients (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .gte('date', new Date().toISOString())
          .order('date')
          .limit(5),
        supabase
          .from('patients')
          .select('id, name, date_of_birth')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      if (patientError || appointmentError || upcomingError || recentError) {
        toast.error('Failed to load dashboard data')
        throw new Error('Failed to load dashboard data')
      }

      return {
        patientCount: patientCount || 0,
        appointmentCount: appointmentCount || 0,
        upcomingAppointments: upcomingAppointments || [],
        recentPatients: recentPatients || []
      }
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false
  })

  if (!dashboardData) return null

  return (
    <div className="space-y-6">
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
            {dashboardData.upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-center">
                    <div>
                      <Link href={`/patients/${appointment.patient.id}`}>
                        <Button variant="link" className="p-0 h-auto font-medium">
                          {appointment.patient.name}
                        </Button>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                          {patient.name}
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
