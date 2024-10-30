'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { fetchPatients } from '@/app/lib/dataFetching'
import { handleError } from '@/app/lib/errorHandling'
import { DataLoadingState } from '@/app/components/ui/loading-states'
import { PatientCardSkeleton } from '@/app/components/ui/skeletons'
import { ErrorBoundary } from '@/app/components/ui/error-boundary'

interface PatientsContentProps {
  onAddPatient?: () => void
}

export default function PatientsContent({ onAddPatient }: PatientsContentProps) {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!supabase || !userId) return

    async function loadPatients() {
      try {
        setIsLoading(true)
        const data = await fetchPatients(supabase, { 
          searchTerm,
          limit: 10,
          userId
        })
        console.log('Patients loaded:', data)
        setPatients(data)
      } catch (error) {
        handleError(error, 'PatientsContent')
      } finally {
        setIsLoading(false)
      }
    }

    loadPatients()
  }, [supabase, searchTerm, userId])

  return (
    <ErrorBoundary>
      <div className="p-4">
        <Input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <DataLoadingState
          isLoading={isLoading}
          isEmpty={patients.length === 0}
          SkeletonComponent={PatientCardSkeleton}
          emptyMessage="No patients found"
        >
          <ul className="space-y-2">
            {patients.map((patient: any) => (
              <li key={patient.id}>
                <Link href={`/patients/${patient.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    {patient.name}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </DataLoadingState>
        {onAddPatient && (
          <Button onClick={onAddPatient} className="w-full mb-4">
            Add New Patient
          </Button>
        )}
      </div>
    </ErrorBoundary>
  )
}
