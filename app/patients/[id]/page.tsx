'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Patient {
  id: number;
  name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  address: string;
  medical_history: string;
}

export default function PatientDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPatient() {
      if (!supabase) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setPatient(data)
      } catch (error) {
        console.error('Error fetching patient data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [supabase, id])

  if (isLoading) return <div>Loading...</div>
  if (!patient) return <div>Patient not found</div>

  const formattedDateOfBirth = format(new Date(patient.date_of_birth), 'MMMM d, yyyy')

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{patient.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Date of Birth</dt>
                <dd>{formattedDateOfBirth}</dd>
              </div>
              <div>
                <dt className="font-medium">Contact</dt>
                <dd>{patient.contact_number}</dd>
              </div>
              <div>
                <dt className="font-medium">Address</dt>
                <dd>{patient.address}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{patient.medical_history}</p>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle>Prescription Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add prescription schedule here */}
          <p>Prescription schedule to be added</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add doctors list here */}
          <p>Doctor information to be added</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add appointment history list here */}
          <p>Appointment history to be added</p>
        </CardContent>
      </Card>
    </div>
  )
}