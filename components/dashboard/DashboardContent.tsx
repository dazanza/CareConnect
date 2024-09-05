'use client'

import { useEffect, useState } from 'react'
import QuickActions from '@/components/dashboard/QuickActions'
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments'
import PrescriptionReminders from '@/components/dashboard/PrescriptionReminders'
import { useSupabase } from '@/hooks/useSupabase'

export default function DashboardContent() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  useEffect(() => {
    async function fetchData() {
      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .limit(5)

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError)
      } else {
        setAppointments(appointmentsData)
      }

      // Fetch prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .order('next_dose', { ascending: true })
        .limit(5)

      if (prescriptionsError) {
        console.error('Error fetching prescriptions:', prescriptionsError)
      } else {
        setPrescriptions(prescriptionsData)
      }
    }

    fetchData()
  }, [supabase])

  return (
    <div className="space-y-6">
      <QuickActions />
      <UpcomingAppointments appointments={appointments} />
      <PrescriptionReminders prescriptions={prescriptions} />
    </div>
  )
}