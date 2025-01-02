'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface FamilyGroup {
  id: string
  name: string
  created_at: string
}

export default function FamilyGroupList() {
  const { user } = useAuth()
  const { supabase } = useSupabase()

  const { data: familyGroups = [] } = useQuery({
    queryKey: ['family-groups', user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return []

      const { data, error } = await supabase
        .from('family_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        toast.error('Failed to load family groups')
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
      {familyGroups.map((group) => (
        <li key={group.id}>
          <Link href={`/family-groups/${group.id}`}>
            <Button variant="ghost" className="w-full justify-start">
              {group.name}
            </Button>
          </Link>
        </li>
      ))}
    </ul>
  )
}
