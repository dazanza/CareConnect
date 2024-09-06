'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export default function AddDoctorPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctors, setSelectedDoctors] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDoctors() {
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('name')

        if (error) throw error
        setDoctors(data)
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [supabase])

  const handleDoctorToggle = (doctorId: number) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    )
  }

  const handleSubmit = async () => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('patient_doctors')
        .upsert(
          selectedDoctors.map(doctorId => ({
            patient_id: Number(id),
            doctor_id: doctorId
          }))
        )

      if (error) throw error
      router.push(`/patients/${id}`)
    } catch (error) {
      console.error('Error adding doctors:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Doctors</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {doctors.map(doctor => (
            <li key={doctor.id} className="flex items-center space-x-2">
              <Checkbox
                id={`doctor-${doctor.id}`}
                checked={selectedDoctors.includes(doctor.id)}
                onCheckedChange={() => handleDoctorToggle(doctor.id)}
              />
              <label htmlFor={`doctor-${doctor.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {doctor.name} - {doctor.specialty}
              </label>
            </li>
          ))}
        </ul>
        <Button onClick={handleSubmit} className="mt-4">
          Add Selected Doctors
        </Button>
      </CardContent>
    </Card>
  )
}