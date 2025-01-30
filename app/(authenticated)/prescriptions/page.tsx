"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { ResponsiveTable } from "@/app/components/ui/responsive-table"
import { LazyComponent } from "@/app/components/ui/lazy-component"
import { OptimizedImage } from "@/app/components/ui/optimized-image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSupabase } from "@/app/hooks/useSupabase"
import { useAuth } from "@/app/components/auth/SupabaseAuthProvider"
import { appNavigation } from "@/app/lib/navigation"

// Dynamically import dialog components
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog))
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent))
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogHeader))
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle))
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogDescription))

// Dynamically import AddPrescriptionForm with loading state
const AddPrescriptionForm = dynamic(
  () => import("@/app/components/prescriptions/AddPrescriptionForm").then(mod => mod.AddPrescriptionForm),
  {
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
    ssr: false
  }
)

type SortField = 'patient' | 'doctor' | 'date'
type SortOrder = 'asc' | 'desc'

interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  date: string
  medications: {
    name: string
    dosage: string
    frequency: string
    refills: number
  }[]
  notes?: string
  patient?: {
    id: string
    first_name: string
    last_name: string
    nickname?: string
    avatar_url?: string
  }
  doctor?: {
    id: string
    first_name: string
    last_name: string
    specialization: string
  }
}

function PrescriptionsContent() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Array<{ id: number; name: string; nickname?: string }>>([])
  const [doctors, setDoctors] = useState<Array<{ id: number; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showAddPrescription, setShowAddPrescription] = useState(false)

  useEffect(() => {
    fetchPrescriptions()
    fetchPatientsAndDoctors()
  }, [])

  const fetchPatientsAndDoctors = async () => {
    if (!supabase || !user) return
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        supabase
          .from('patients')
          .select('id, first_name, last_name, nickname')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('first_name'),
        supabase
          .from('doctors')
          .select('id, first_name, last_name')
          .eq('user_id', user.id)
          .order('first_name')
      ])

      if (patientsResponse.error) throw patientsResponse.error
      if (doctorsResponse.error) throw doctorsResponse.error

      setPatients(
        (patientsResponse.data || []).map(p => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          nickname: p.nickname
        }))
      )

      setDoctors(
        (doctorsResponse.data || []).map(d => ({
          id: d.id,
          name: `${d.first_name} ${d.last_name}`
        }))
      )
    } catch (error) {
      console.error('Error fetching patients and doctors:', error)
    }
  }

  const fetchPrescriptions = async () => {
    if (!supabase || !user) return
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients (
            id,
            first_name,
            last_name,
            nickname,
            avatar_url
          ),
          doctor:doctors (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .order('date', { ascending: false })

      if (error) throw error
      setPrescriptions(data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    switch (sortField) {
      case 'patient':
        const aName = a.patient?.nickname || `${a.patient?.first_name} ${a.patient?.last_name}`
        const bName = b.patient?.nickname || `${b.patient?.first_name} ${b.patient?.last_name}`
        return (aName || '').localeCompare(bName || '') * order
      case 'doctor':
        const aDoc = `${a.doctor?.first_name} ${a.doctor?.last_name}`
        const bDoc = `${b.doctor?.first_name} ${b.doctor?.last_name}`
        return (aDoc || '').localeCompare(bDoc || '') * order
      case 'date':
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order
      default:
        return 0
    }
  })

  const columns = [
    {
      header: "Patient",
      accessorKey: "patient",
      cell: (value: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            {value?.avatar_url ? (
              <OptimizedImage
                src={value.avatar_url}
                alt={`${value.first_name} ${value.last_name}`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback>
                {value?.first_name?.[0]}
                {value?.last_name?.[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">
              {value?.nickname || `${value?.first_name} ${value?.last_name}`}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Doctor",
      accessorKey: "doctor",
      cell: (value: any) => (
        <div>
          <div className="font-medium">
            Dr. {value?.first_name} {value?.last_name}
          </div>
          <div className="text-sm text-muted-foreground">
            {value?.specialization}
          </div>
        </div>
      )
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (value: string) => format(new Date(value), "MMMM d, yyyy")
    },
    {
      header: "Medications",
      accessorKey: "medications",
      cell: (value: any[]) => (
        <div className="space-y-1">
          {value.map((med, i) => (
            <div key={i} className="text-sm">
              {med.name} - {med.dosage} ({med.frequency})
            </div>
          ))}
        </div>
      )
    }
  ]

  const handlePrescriptionClick = (prescriptionId: string) => {
    router.push(`/prescriptions/${prescriptionId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
        <Button onClick={() => setShowAddPrescription(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Prescription
        </Button>
      </div>

      <ResponsiveTable
        columns={columns}
        data={sortedPrescriptions}
        isLoading={isLoading}
        onRowClick={(row) => handlePrescriptionClick(row.id)}
        emptyMessage="No prescriptions found."
      />

      <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Prescription</DialogTitle>
            <DialogDescription>
              Enter the prescription details below.
            </DialogDescription>
          </DialogHeader>
          <AddPrescriptionForm 
            patients={patients} 
            doctors={doctors}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PrescriptionsPage() {
  return (
    <div className="container mx-auto py-6">
      <LazyComponent>
        <PrescriptionsContent />
      </LazyComponent>
    </div>
  )
} 