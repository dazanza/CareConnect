'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export default function AddPatientForm() {
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    address: '',
    medical_history: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()
  const { userId } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !userId) return

    setIsLoading(true)
    try {
      const patientData = {
        ...formData,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Patient added successfully:', data)
      router.push('/patients')
    } catch (error) {
      console.error('Error adding patient:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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