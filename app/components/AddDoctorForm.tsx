'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

interface AddDoctorFormProps {
  onSuccess?: () => void
}

export default function AddDoctorForm({ onSuccess }: AddDoctorFormProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialty: '',
    email: '',
    phone: '',
    address: '',
    assistant: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('doctors').insert([
        {
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          specialization: formData.specialty,
          email: formData.email,
          contact_number: formData.phone,
          address: formData.address,
          assistant: formData.assistant,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      
      toast.success('Doctor added successfully')
      onSuccess?.()
      setFormData({
        firstName: '',
        lastName: '',
        specialty: '',
        email: '',
        phone: '',
        address: '',
        assistant: '',
      })
    } catch (error) {
      console.error('Error adding doctor:', error)
      toast.error('Failed to add doctor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
            placeholder="Enter last name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="specialty">Specialty <span className="text-red-500">*</span></Label>
        <Input
          id="specialty"
          value={formData.specialty}
          onChange={(e) =>
            setFormData({ ...formData, specialty: e.target.value })
          }
          required
          placeholder="Enter specialty"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="assistant">Assistant</Label>
        <Input
          id="assistant"
          value={formData.assistant}
          onChange={(e) => setFormData({ ...formData, assistant: e.target.value })}
          placeholder="Enter assistant name"
        />
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Doctor'}
      </Button>
    </form>
  )
}