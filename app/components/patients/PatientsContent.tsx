'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { useSupabase } from '@/app/hooks/useSupabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from 'react-hot-toast'

interface Patient {
  id: string
  name: string
}

export default function PatientsContent() {
  const { userId } = useAuth()
  const { supabase } = useSupabase()

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', userId],
    queryFn: async () => {
      if (!supabase || !userId) return []
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) {
        toast.error('Failed to load patients')
        throw error
      }

      return data
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
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
