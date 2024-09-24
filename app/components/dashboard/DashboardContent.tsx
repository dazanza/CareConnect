'use client'

import { useEffect, useState } from 'react'
import UpcomingAppointments from './UpcomingAppointments'
import PrescriptionReminders from './PrescriptionReminders'
import { useSupabase } from '@/hooks/useSupabase'
import { Appointment, Prescription } from '@/types'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AddAppointmentForm from '@/app/components/AddAppointmentForm'

export default function DashboardContent() {
  const { supabase } = useSupabase()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!supabase) return

      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, patients(name), doctors(first_name, last_name)')
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingAppointments appointments={appointments} />
        <PrescriptionReminders prescriptions={prescriptions} />
      </div>
      <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
        <DialogTrigger asChild>
          <Button>Schedule Appointment</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <AddAppointmentForm onSuccess={() => setIsAddAppointmentOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}