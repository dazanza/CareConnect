'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { PrescriptionCard, Prescription } from '@/app/components/prescriptions/PrescriptionCard'
import { fetchPrescriptions } from '@/app/lib/prescriptions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function PrescriptionsPage() {
  const { supabase } = useSupabase()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    loadPrescriptions()
  }, [supabase, statusFilter, selectedDate])

  async function loadPrescriptions() {
    if (!supabase) return

    try {
      setIsLoading(true)
      const options: Parameters<typeof fetchPrescriptions>[1] = {}
      
      if (statusFilter !== 'all') {
        options.status = statusFilter
      }

      if (selectedDate) {
        options.startDate = selectedDate.toISOString()
      }

      const data = await fetchPrescriptions(supabase, options)
      setPrescriptions(data)
    } catch (error) {
      console.error('Error loading prescriptions:', error)
      toast.error('Failed to load prescriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        prescription.medication.toLowerCase().includes(searchLower) ||
        prescription.patient.name.toLowerCase().includes(searchLower) ||
        (prescription.patient.nickname?.toLowerCase().includes(searchLower)) ||
        prescription.doctor.name.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
        <Button asChild>
          <Link href="/prescriptions/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Prescription
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No prescriptions found
              </div>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  showPatient
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 