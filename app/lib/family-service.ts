import { SupabaseClient } from '@supabase/supabase-js'
import { FamilyGroup, FamilyGroupMembership } from '@/types/family'

export async function createFamilyGroup(
  supabase: SupabaseClient,
  name: string,
  userId: string
): Promise<FamilyGroup> {
  const { data, error } = await supabase
    .from('family_groups')
    .insert([{ name, user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFamilyGroups(
  supabase: SupabaseClient,
  userId: string
): Promise<FamilyGroup[]> {
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Transform the data to match our types
  return data.map(group => ({
    ...group,
    members: group.members.map((m: any) => ({
      id: m.patient.id,
      name: m.patient.name,
      date_of_birth: m.patient.date_of_birth,
      relationship: m.relationship
    }))
  }))
}

export async function addFamilyMember(
  supabase: SupabaseClient,
  params: {
    patientId: number
    familyGroupId: number
    userId: string
    relationship?: string
  }
): Promise<FamilyGroupMembership> {
  const { data, error } = await supabase
    .from('patient_family_group')
    .insert([{
      patient_id: params.patientId,
      family_group_id: params.familyGroupId,
      user_id: params.userId,
      relationship: params.relationship
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFamilyMember(
  supabase: SupabaseClient,
  membershipId: string
) {
  const { error } = await supabase
    .from('patient_family_group')
    .delete()
    .eq('id', membershipId)

  if (error) throw error
}

export async function deleteFamilyGroup(
  supabase: SupabaseClient,
  groupId: number
) {
  const { error } = await supabase
    .from('family_groups')
    .delete()
    .eq('id', groupId)

  if (error) throw error
}
