'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from 'react'
import { PatientErrorBoundary } from '@/app/components/error-boundaries/PatientErrorBoundary'

interface Patient {
  id: string
  first_name: string
  last_name: string
  nickname: string | null
}

interface PatientShare {
  patient: Patient
}

interface DatabasePatient {
  id: string
  first_name: string
  last_name: string
  nickname: string | null
}

interface DatabasePatientShareResponse {
  patient_id: string
  patient: Patient
}

export default function PatientsContent() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [sortBy, setSortBy] = useState<'name' | 'nickname'>('name')

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ['patients', user?.id, sortBy],
    queryFn: async () => {
      if (!supabase || !user?.id) return []
      
      // Get both direct and shared patients
      const [directResult, sharedResult] = await Promise.all([
        // Get direct patients
        supabase
          .from('patients')
          .select('id, first_name, last_name, nickname')
          .eq('user_id', user.id),

        // Get shared patients through patient_shares
        supabase
          .from('patient_shares')
          .select(`
            patient_id,
            patient:patients!inner (
              id,
              first_name,
              last_name,
              nickname
            )
          `)
          .eq('shared_with_user_id', user.id)
      ]);

      if (directResult.error) {
        toast.error('Failed to load direct patients')
        throw directResult.error
      }

      if (sharedResult.error) {
        toast.error('Failed to load shared patients')
        throw sharedResult.error
      }

      // Combine and deduplicate patients
      const directPatients = (directResult.data || []) as Patient[]
      
      // Handle the nested patient data structure from the join
      const sharedPatients = (sharedResult.data || []).map(row => {
        const patientData = row.patient as unknown as Patient
        return {
          patient_id: row.patient_id,
          patient: patientData
        }
      }) as DatabasePatientShareResponse[]

      const extractedSharedPatients = sharedPatients.map(share => share.patient)

      // Use a Map to deduplicate by ID
      const patientMap = new Map<string, Patient>()
      directPatients.forEach(patient => patientMap.set(patient.id, patient))
      extractedSharedPatients.forEach(patient => {
        if (!patientMap.has(patient.id)) {
          patientMap.set(patient.id, patient)
        }
      })

      return Array.from(patientMap.values())
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  const sortedPatients = [...patients].sort((a, b) => {
    if (sortBy === 'name') {
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    } else {
      // For nickname sorting, fall back to full name if nickname is null
      const nicknameA = a.nickname || `${a.first_name} ${a.last_name}`
      const nicknameB = b.nickname || `${b.first_name} ${b.last_name}`
      return nicknameA.localeCompare(nicknameB)
    }
  })

  return (
    <PatientErrorBoundary>
      <div className="space-y-2">
        <Select value={sortBy} onValueChange={(value: 'name' | 'nickname') => setSortBy(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="nickname">Sort by Nickname</SelectItem>
          </SelectContent>
        </Select>

        <ul className="space-y-1">
          {sortedPatients.map((patient) => (
            <li key={patient.id}>
              <Link href={`/patients/${patient.id}`}>
                <Button variant="ghost" className="w-full justify-start">
                  {sortBy === 'name' ? 
                    `${patient.first_name} ${patient.last_name}` :
                    (patient.nickname || `${patient.first_name} ${patient.last_name}`)}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PatientErrorBoundary>
  )
}
