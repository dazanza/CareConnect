'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { DoctorList } from './DoctorList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function DoctorsContent() {
  const { userId } = useAuth()
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDoctors() {
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', userId)

        if (error) throw error
        setDoctors(data || [])
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [userId])

  if (isLoading) return <div>Loading doctors...</div>

  return <DoctorList doctors={doctors} />
}