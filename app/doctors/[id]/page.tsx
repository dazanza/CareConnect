'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doctor } from '@/types'

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  contact_number: string;
  email: string;
  address: string;
}

export default function DoctorDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDoctor() {
      if (!supabase) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setDoctor(data)
      } catch (error) {
        console.error('Error fetching doctor data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctor()
  }, [supabase, id])

  if (isLoading) return <div>Loading...</div>
  if (!doctor) return <div>Doctor not found</div>

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dr. {doctor.first_name} {doctor.last_name}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Specialization</dt>
              <dd>{doctor.specialization}</dd>
            </div>
            <div>
              <dt className="font-medium">Contact</dt>
              <dd>{doctor.contact_number}</dd>
            </div>
            <div>
              <dt className="font-medium">Email</dt>
              <dd>{doctor.email}</dd>
            </div>
            <div>
              <dt className="font-medium">Address</dt>
              <dd>{doctor.address}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add upcoming appointments list here */}
          <p>Upcoming appointments to be added</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add patients list here */}
          <p>Patients list to be added</p>
        </CardContent>
      </Card>

      {/* Add more cards for other doctor-related information as needed */}
    </div>
  )
}