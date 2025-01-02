import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { toast } from 'react-hot-toast'

interface FamilyGroup {
  id: string
  name: string
  created_at: string
  members: Array<{
    id: string
    name: string
    date_of_birth: string
    relationship?: string
  }>
}

export function useFamilyGroups() {
  const { user } = useAuth()
  const { supabase } = useSupabase()

  return useQuery({
    queryKey: ['family-groups', user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return []

      const { data, error } = await supabase
        .from('family_groups')
        .select(`
          *,
          members:patient_family_group(
            patient:patients(
              id,
              name,
              date_of_birth
            ),
            relationship
          )
        `)
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        toast.error('Failed to load family groups')
        throw error
      }

      return data.map((group: any) => ({
        ...group,
        members: group.members.map((m: any) => ({
          id: m.patient.id,
          name: m.patient.name,
          date_of_birth: m.patient.date_of_birth,
          relationship: m.relationship
        }))
      }))
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  })
}
