import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AddPrescriptionModal } from '@/app/components/prescriptions/AddPrescriptionModal'

export const dynamic = 'force-dynamic'

export default async function PrescriptionsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch patients and doctors for the form
  const { data: patients } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    .eq('user_id', session.user.id)
    .is('deleted_at', null)
    .order('first_name')

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, first_name, last_name')
    .eq('user_id', session.user.id)
    .order('first_name')

  // Fetch recent appointments and logs
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, date, title')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(10)

  const { data: logs } = await supabase
    .from('logs')
    .select('id, date, title')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(10)

  const formattedPatients = patients?.map(patient => ({
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
  })) || []

  const formattedDoctors = doctors?.map(doctor => ({
    id: doctor.id,
    name: `${doctor.first_name} ${doctor.last_name}`,
  })) || []

  const formattedAppointments = appointments?.map(appointment => ({
    id: appointment.id,
    date: appointment.date,
    title: appointment.title,
  })) || []

  const formattedLogs = logs?.map(log => ({
    id: log.id,
    date: log.date,
    title: log.title,
  })) || []

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage and track prescriptions
          </p>
        </div>
        <AddPrescriptionModal 
          patients={formattedPatients}
          doctors={formattedDoctors}
          appointments={formattedAppointments}
          logs={formattedLogs}
        />
      </div>
      {/* Rest of the prescriptions list */}
    </div>
  )
} 