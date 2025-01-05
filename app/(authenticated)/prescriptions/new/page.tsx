import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AddPrescriptionForm } from '@/components/prescriptions/AddPrescriptionForm'

export const dynamic = 'force-dynamic'

export default async function NewPrescriptionPage() {
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

  const formattedPatients = patients?.map(patient => ({
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
  })) || []

  const formattedDoctors = doctors?.map(doctor => ({
    id: doctor.id,
    name: `${doctor.first_name} ${doctor.last_name}`,
  })) || []

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Prescription</h1>
        <p className="text-muted-foreground">
          Create a new prescription by filling out the form below
        </p>
      </div>
      <AddPrescriptionForm 
        patients={formattedPatients}
        doctors={formattedDoctors}
      />
    </div>
  )
} 