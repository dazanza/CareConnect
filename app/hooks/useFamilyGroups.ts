import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from '@clerk/nextjs'
import { FamilyGroup } from '@/types/family'
import { getFamilyGroups } from '@/lib/family-service'
import { toast } from 'react-hot-toast'

export function useFamilyGroups() {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (supabase && userId) {
      fetchFamilyGroups()
    }
  }, [supabase, userId])

  async function fetchFamilyGroups() {
    try {
      setIsLoading(true)
      const data = await getFamilyGroups(supabase, userId)
      setFamilyGroups(data)
    } catch (error) {
      console.error('Error fetching family groups:', error)
      toast.error('Failed to load family groups')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    familyGroups,
    isLoading,
    refetch: fetchFamilyGroups
  }
}
