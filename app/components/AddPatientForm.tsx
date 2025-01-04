'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

interface AddPatientFormProps {
  onSuccess?: () => void
}

export default function AddPatientForm({ onSuccess }: AddPatientFormProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    contactNumber: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('patients').insert([
        {
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          nickname: formData.nickname,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          email: formData.email,
          contact_number: formData.contactNumber,
          address: formData.address,
        },
      ])

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      
      toast.success('Patient added successfully')
      onSuccess?.()
      setFormData({
        firstName: '',
        lastName: '',
        nickname: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        contactNumber: '',
        address: '',
      })
    } catch (error) {
      console.error('Error adding patient:', error)
      toast.error('Failed to add patient')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 bg-white p-4 rounded-lg shadow-sm">
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
            className="w-full"
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
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname <span className="text-red-500">*</span></Label>
        <Input
          id="nickname"
          value={formData.nickname}
          onChange={(e) =>
            setFormData({ ...formData, nickname: e.target.value })
          }
          required
          placeholder="Enter nickname"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address (optional)"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Phone Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            placeholder="Enter phone number (optional)"
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address (optional)"
          className="w-full"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Patient'}
        </Button>
      </div>
    </form>
  )
}