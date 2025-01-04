'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from 'react'

interface Patient {
  id: string
  first_name: string
  last_name: string
  nickname: string | null
}

export default function PatientsContent() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [sortBy, setSortBy] = useState<'name' | 'nickname'>('name')

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', user?.id, sortBy],
    queryFn: async () => {
      if (!supabase || !user?.id) return []
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, nickname')
        .eq('user_id', user.id.toString())
        .order(sortBy === 'name' ? 'first_name' : 'nickname', { nullsFirst: false })

      if (error) {
        toast.error('Failed to load patients')
        throw error
      }

      return data
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
  )
}
