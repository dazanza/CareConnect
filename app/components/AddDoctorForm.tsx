'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'react-hot-toast'
import { useAuth } from "@clerk/nextjs"
import { Doctor } from '@/types'
import { useQueryClient } from '@tanstack/react-query'

interface AddDoctorFormProps {
  onSuccess?: () => void
}

export default function AddDoctorForm({ onSuccess }: AddDoctorFormProps) {
  const { supabase } = useSupabase()
  const { userId: clerkUserId } = useAuth()
  const queryClient = useQueryClient()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [assistant, setAssistant] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      if (!clerkUserId) {
        throw new Error('User not authenticated')
      }

      const doctorData: Partial<Doctor> = {
        first_name: firstName,
        last_name: lastName,
        specialization,
        contact_number: contactNumber,
        address,
        created_at: new Date().toISOString(),
        user_id: clerkUserId.toString(),
      }

      if (email) doctorData.email = email
      if (assistant) doctorData.assistant = assistant

      const { data, error } = await supabase
        .from('doctors')
        .insert(doctorData)
        .select()

      if (error) throw error

      // Invalidate and refetch doctors query
      queryClient.invalidateQueries({ queryKey: ['doctors'] })

      toast.success("Doctor added successfully")

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/doctors')
      }
    } catch (error) {
      console.error('Error adding doctor:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      toast.error("Failed to add doctor. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="assistant">Assistant (Optional)</Label>
          <Input
            id="assistant"
            value={assistant}
            onChange={(e) => setAssistant(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Doctor'}
        </Button>
      </div>
    </form>
  )
}