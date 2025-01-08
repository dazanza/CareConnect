'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'

export type AccessLevel = 'read' | 'write' | 'admin'

interface PatientShare {
  id: string
  patient_id: string
  shared_by_user_id: string
  shared_with_user_id: string
  access_level: AccessLevel
  created_at: string
  updated_at: string
}

export function usePatientAccess(patientId: string) {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null)

  useEffect(() => {
    async function checkAccess() {
      if (!supabase || !user || !patientId) {
        console.log('Missing required data:', { supabase: !!supabase, user: !!user, patientId })
        setIsLoading(false)
        return
      }

      try {
        console.log('Checking access for patient:', patientId)
        
        // First check if user owns the patient
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('user_id')
          .eq('id', patientId)
          .single()

        if (patientError) {
          console.error('Error fetching patient:', patientError)
          setIsLoading(false)
          return
        }

        console.log('Patient data:', patient)
        console.log('Current user:', user.id)

        if (patient?.user_id === user.id) {
          console.log('User owns patient')
          setCanEdit(true)
          setAccessLevel('admin')
          setIsLoading(false)
          return
        }

        // If not owner, check for shared access
        const { data: shares, error: sharesError } = await supabase
          .from('patient_shares')
          .select('*')
          .eq('patient_id', patientId)
          .eq('shared_with_user_id', user.id)

        if (sharesError) {
          console.error('Error fetching patient shares:', sharesError)
          setAccessLevel(null)
          setCanEdit(false)
          setIsLoading(false)
          return
        }

        console.log('Shares data:', shares)

        const share = shares?.[0]
        if (share) {
          console.log('Found share with access level:', share.access_level)
          setAccessLevel(share.access_level)
          setCanEdit(share.access_level === 'write' || share.access_level === 'admin')
        } else {
          console.log('No share found')
          setAccessLevel(null)
          setCanEdit(false)
        }
      } catch (error) {
        console.error('Error checking patient access:', error)
        setAccessLevel(null)
        setCanEdit(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [supabase, user, patientId])

  return {
    isLoading,
    canEdit,
    accessLevel,
    isOwner: accessLevel === 'admin'
  }
} 