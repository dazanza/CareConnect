'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from 'react-hot-toast'

interface Patient {
  id: string
  name: string
}

export default function PatientsContent() {
  const { user } = useAuth()
  const { supabase } = useSupabase()

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return []
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id.toString())
        .order('name')

      if (error) {
        toast.error('Failed to load patients')
        throw error
      }

      return data
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  })

  return (
    <ul className="space-y-1">
      {patients.map((patient) => (
        <li key={patient.id}>
          <Link href={`/patients/${patient.id}`}>
            <Button variant="ghost" className="w-full justify-start">
              {patient.name}
            </Button>
          </Link>
        </li>
      ))}
    </ul>
  )
}
