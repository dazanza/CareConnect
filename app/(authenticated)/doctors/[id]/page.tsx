'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'

export default function DoctorPage() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const params = useParams()
  const doctorId = params.id as string

  const { data: doctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      if (!supabase || !user?.id) return null

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .eq('user_id', user.id.toString())
        .single()

      if (error) {
        toast.error('Failed to load doctor')
        throw error
      }

      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  if (!doctor) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Dr. {doctor.first_name} {doctor.last_name}
      </h1>
      <div className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Specialty</h2>
          <p>{doctor.specialty}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <p>Email: {doctor.email}</p>
          <p>Phone: {doctor.phone}</p>
        </div>
      </div>
    </div>
  )
}