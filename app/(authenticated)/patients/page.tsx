"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ArrowUpDown } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ResponsiveTable } from "@/app/components/ui/responsive-table"
import { LazyComponent } from "@/app/components/ui/lazy-component"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSupabase } from "@/app/hooks/useSupabase"
import { useAuth } from "@/app/components/auth/SupabaseAuthProvider"
import { appNavigation } from "@/app/lib/navigation"
import { PatientCardSkeleton } from "@/app/components/ui/skeletons"

// Dynamically import dialog components
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog))
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent))
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogHeader))
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle))
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogDescription))

// Dynamically import AddPatientForm with loading state
const AddPatientForm = dynamic(
  () => import("@/app/components/AddPatientForm"),
  {
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
    ssr: false // Disable server-side rendering for this component
  }
)

type SortField = 'name' | 'dob' | 'lastVisit'
type SortOrder = 'asc' | 'desc'

interface Patient {
  id: string
  first_name: string
  last_name: string
  nickname?: string
  date_of_birth: string
  last_visit?: string
  avatar_url?: string
}

function PatientsContent() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [showAddPatient, setShowAddPatient] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    if (!supabase || !user) return
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
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

  const sortedPatients = [...patients].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    switch (sortField) {
      case 'name':
        const aName = a.nickname || `${a.first_name} ${a.last_name}`
        const bName = b.nickname || `${b.first_name} ${b.last_name}`
        return aName.localeCompare(bName) * order
      case 'dob':
        return (new Date(a.date_of_birth).getTime() - new Date(b.date_of_birth).getTime()) * order
      case 'lastVisit':
        if (!a.last_visit) return 1
        if (!b.last_visit) return -1
        return (new Date(a.last_visit).getTime() - new Date(b.last_visit).getTime()) * order
      default:
        return 0
    }
  })

  const columns = [
    {
      header: "Patient",
      accessorKey: "name",
      cell: (value: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src={value.avatar_url || ''}
              alt={value.first_name || ''}
            />
            <AvatarFallback>
              {value.first_name?.[0]}
              {value.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {value.nickname || `${value.first_name} ${value.last_name}`}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Date of Birth",
      accessorKey: "date_of_birth",
      cell: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      header: "Last Visit",
      accessorKey: "last_visit",
      cell: (value: string) => value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ]

  const handlePatientClick = (patientId: string) => {
    appNavigation.goToPatient(router, patientId)
  }

  if (isLoading) {
    return <PatientCardSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <Button onClick={() => setShowAddPatient(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <ResponsiveTable
        columns={columns}
        data={sortedPatients.map(patient => ({
          ...patient,
          name: patient // Pass the full patient object for the name cell
        }))}
        isLoading={isLoading}
        onRowClick={(row) => handlePatientClick(row.id)}
        emptyMessage="No patients found."
      />

      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient&apos;s information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <AddPatientForm onSuccess={() => {
            setShowAddPatient(false)
            fetchPatients()
          }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PatientsPage() {
  return (
    <div className="container mx-auto py-6">
      <LazyComponent>
        <PatientsContent />
      </LazyComponent>
    </div>
  )
}