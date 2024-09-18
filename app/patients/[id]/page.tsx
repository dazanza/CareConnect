'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Patient } from '@/types'

interface Patient {
  id: number;
  name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  address: string;
  medical_history: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image_url: string;
}

export default function PatientDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])

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

  useEffect(() => {
    async function fetchDoctors() {
      if (!supabase || !patient) return

      try {
        const { data, error } = await supabase
          .from('patient_doctors')
          .select('doctors(*)')
          .eq('patient_id', patient.id)

        if (error) throw error
        setDoctors(data.map((item: any) => item.doctors))
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    fetchDoctors()
  }, [supabase, patient])

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
          {doctors.length > 0 ? (
            <ul className="space-y-4">
              {doctors.map((doctor) => (
                <li key={doctor.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={doctor.image_url} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No doctors assigned to this patient.</p>
          )}
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