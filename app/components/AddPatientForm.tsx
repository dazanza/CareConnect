'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/lib/supabase'

interface AddPatientFormProps {
  onSuccess?: () => void
}

export default function AddPatientForm({ onSuccess }: AddPatientFormProps) {
  const { supabase } = useSupabase()
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    address: '',
    medical_history: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(formData)
        .select()

      if (error) throw error

      console.log('Patient added successfully:', data)

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/patients')
      }
    } catch (error) {
      console.error('Error adding patient:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="name" className="block mb-1">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="date_of_birth" className="block mb-1">Date of Birth</label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="gender" className="block mb-1">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact_number" className="block mb-1">Contact Number</label>
        <input
          type="tel"
          id="contact_number"
          name="contact_number"
          value={formData.contact_number}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="address" className="block mb-1">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="medical_history" className="block mb-1">Medical History</label>
        <textarea
          id="medical_history"
          name="medical_history"
          value={formData.medical_history}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows={4}
        ></textarea>
      </div>
      <button 
        type="submit" 
        className="bg-green-500 text-white p-2 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Adding...' : 'Add Patient'}
      </button>
    </form>
  )
}