'use client'

import { useEffect, useState } from 'react'
import QuickActions from '@/app/components/dashboard/QuickActions'
import UpcomingAppointments from '@/app/components/dashboard/UpcomingAppointments'
import PrescriptionReminders from '@/app/components/dashboard/PrescriptionReminders'
import { useSupabase } from '@/hooks/useSupabase'

export default function DashboardContent() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;

      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <QuickActions />
      <UpcomingAppointments appointments={appointments} />
      <PrescriptionReminders prescriptions={prescriptions} />
    </div>
  )
}