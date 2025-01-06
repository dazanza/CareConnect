import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AddPrescriptionModal } from '@/app/components/prescriptions/AddPrescriptionModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrescriptionList } from '@/app/components/prescriptions/PrescriptionList'
import { PrescriptionAnalytics } from '@/app/components/prescriptions/PrescriptionAnalytics'

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
    .select('id, first_name, last_name, nickname')
    .eq('user_id', session.user.id)
    .is('deleted_at', null)
    .order('first_name')

  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, first_name, last_name')
    .eq('user_id', session.user.id)
    .order('first_name')

  // Fetch prescriptions with related data
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      *,
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
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const formattedPatients = patients?.map(patient => ({
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    nickname: patient.nickname
  })) || []

  const formattedDoctors = doctors?.map(doctor => ({
    id: doctor.id,
    name: `${doctor.first_name} ${doctor.last_name}`,
  })) || []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage and track prescriptions
          </p>
        </div>
        <AddPrescriptionModal 
          patients={formattedPatients}
          doctors={formattedDoctors}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Active Prescriptions</CardTitle>
                <CardDescription>
                  Currently active prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {prescriptions?.filter(p => p.status === 'active').length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Patients</CardTitle>
                <CardDescription>
                  Patients with prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(prescriptions?.map(p => p.patient_id)).size || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prescribing Doctors</CardTitle>
                <CardDescription>
                  Active prescribing doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(prescriptions?.map(p => p.doctor_id)).size || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <PrescriptionList 
            prescriptions={prescriptions || []}
            showPatient
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PrescriptionAnalytics prescriptions={prescriptions || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 