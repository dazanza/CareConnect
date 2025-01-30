"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { ResponsiveTable } from "@/app/components/ui/responsive-table"
import { LazyComponent } from "@/app/components/ui/lazy-component"
import { OptimizedImage } from "@/app/components/ui/optimized-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSupabase } from "@/app/hooks/useSupabase"
import { useAuth } from "@/app/components/auth/SupabaseAuthProvider"
import { appNavigation } from "@/app/lib/navigation"
import { CardSkeleton } from "@/app/components/ui/skeletons"

// Dynamically import dialog components
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog))
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent))
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogHeader))
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle))
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogDescription))

// Dynamically import AddDoctorForm with loading state
const AddDoctorForm = dynamic(
  () => import("@/app/components/AddDoctorForm"),
  {
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
    ssr: false
  }
)

type SortField = 'name' | 'specialization' | 'lastActive'
type SortOrder = 'asc' | 'desc'

interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
  contact_number: string
  email: string
  address: string
  avatar_url?: string
  last_active?: string
}

function DoctorsContent() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [showAddDoctor, setShowAddDoctor] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    if (!supabase || !user) return
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
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

  const sortedDoctors = [...doctors].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    switch (sortField) {
      case 'name':
        const aName = `${a.first_name} ${a.last_name}`
        const bName = `${b.first_name} ${b.last_name}`
        return aName.localeCompare(bName) * order
      case 'specialization':
        return (a.specialization || '').localeCompare(b.specialization || '') * order
      case 'lastActive':
        if (!a.last_active) return 1
        if (!b.last_active) return -1
        return (new Date(a.last_active).getTime() - new Date(b.last_active).getTime()) * order
      default:
        return 0
    }
  })

  const columns = [
    {
      header: "Doctor",
      accessorKey: "name",
      cell: (value: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            {value.avatar_url ? (
              <OptimizedImage
                src={value.avatar_url}
                alt={`${value.first_name} ${value.last_name}`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback>
                {value.first_name?.[0]}
                {value.last_name?.[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">
              Dr. {value.first_name} {value.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              {value.specialization}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      accessorKey: "contact",
      cell: (value: any) => (
        <div>
          <div className="font-medium">{value.contact_number}</div>
          <div className="text-sm text-muted-foreground">{value.email}</div>
        </div>
      )
    },
    {
      header: "Address",
      accessorKey: "address"
    }
  ]

  const handleDoctorClick = (doctorId: string) => {
    appNavigation.goToDoctor(router, doctorId)
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
        <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
        <Button onClick={() => setShowAddDoctor(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <ResponsiveTable
        columns={columns}
        data={sortedDoctors.map(doctor => ({
          ...doctor,
          name: doctor,
          contact: doctor
        }))}
        isLoading={isLoading}
        onRowClick={(row) => handleDoctorClick(row.id)}
        emptyMessage="No doctors found."
      />

      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the doctor&apos;s information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <AddDoctorForm onSuccess={() => {
            setShowAddDoctor(false)
            fetchDoctors()
          }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DoctorsPage() {
  return (
    <div className="container mx-auto py-6">
      <LazyComponent>
        <DoctorsContent />
      </LazyComponent>
    </div>
  )
}