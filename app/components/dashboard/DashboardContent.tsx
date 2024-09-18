'use client'

import { useEffect, useState } from 'react'
import QuickActions from './QuickActions'
import UpcomingAppointments from './UpcomingAppointments'
import PrescriptionReminders from './PrescriptionReminders'
import { useSupabase } from '@/hooks/useSupabase'  // Change this line
import { Appointment, Prescription } from '@/types'

export default function DashboardContent() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!supabase) return

      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .limit(5)

        if (appointmentsError) throw appointmentsError
        setAppointments(appointmentsData)

        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .order('next_dose', { ascending: true })
          .limit(5)

        if (prescriptionsError) throw prescriptionsError
        setPrescriptions(prescriptionsData)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [supabase])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <QuickActions />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingAppointments appointments={appointments} />
        <PrescriptionReminders prescriptions={prescriptions} />
      </div>
    </div>
  )
}