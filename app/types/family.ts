export interface FamilyGroup {
  id: number
  name: string
  user_id: string
  created_at: string
  updated_at: string
  members: FamilyMember[]
}

export interface FamilyMember {
  id: number
  name: string
  date_of_birth: string
  relationship?: string
}

export interface FamilyGroupMembership {
  id: string
  patient_id: number
  family_group_id: number
  relationship?: string
  user_id: string
  created_at: string
}
