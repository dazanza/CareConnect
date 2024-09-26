'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useParams } from 'next/navigation'
import { format } from 'date-fns' // Add this import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doctor, Patient, Appointment } from '@/types' // Add Appointment to the import
import Sidebar from '@/app/components/layout/Sidebar'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AddAppointmentForm from '@/app/components/AddAppointmentForm'
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon } from 'lucide-react'
import Link from 'next/link'
import { fetchAppointments } from '@/app/lib/dataFetching'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DoctorDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !id) return

      setIsLoading(true)
      try {
        // Fetch doctor details
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', id)
          .single()

        if (doctorError) throw doctorError
        setDoctor(doctorData)

        // Fetch assigned patients
        const { data: patientDoctorsData, error: patientDoctorsError } = await supabase
          .from('patient_doctors')
          .select('patient_id')
          .eq('doctor_id', id)

        if (patientDoctorsError) throw patientDoctorsError

        const patientIds = patientDoctorsData.map(pd => pd.patient_id)

        if (patientIds.length > 0) {
          const { data: patientsData, error: patientsError } = await supabase
            .from('patients')
            .select('*')
            .in('id', patientIds)

          if (patientsError) throw patientsError
          setAssignedPatients(patientsData)
        }

        // Fetch doctor's appointments
        const appointmentsData = await fetchAppointments(supabase, { doctorId: id.toString(), upcoming: true })
        setAppointments(appointmentsData)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, id])

  if (isLoading) return <div>Loading...</div>
  if (!doctor) return <div>Doctor not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctor Details</h1>
        <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            {doctor && (
              <AddAppointmentForm 
                doctorId={doctor.id} 
                onSuccess={() => {
                  setIsAddAppointmentOpen(false)
                  // Optionally, refresh the appointments list here
                }} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
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
                    <dd>{doctor.email || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Address</dt>
                    <dd>{doctor.address}</dd>
                  </div>
                  {doctor.assistant && (
                    <div>
                      <dt className="font-medium">Assistant</dt>
                      <dd>{doctor.assistant}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <ul className="space-y-4">
                    {appointments.map((appointment) => (
                      <li key={appointment.id} className="border-b pb-2">
                        <Link href={`/appointments/${appointment.id}`} className="block hover:bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4" />
                            <p className="font-semibold">
                              {format(new Date(appointment.date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <ClockIcon className="w-4 h-4" />
                            <p>{format(new Date(appointment.date), 'h:mm a')}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPinIcon className="w-4 h-4" />
                            <p>{appointment.location}</p>
                          </div>
                          <p className="mt-2">
                            Patient: {appointment.patients?.id ? (
                              <Link href={`/patients/${appointment.patients.id}`} className="text-blue-600 hover:underline">
                                {appointment.patients?.name || 'N/A'}
                              </Link>
                            ) : (
                              appointment.patients?.name || 'N/A'
                            )}
                          </p>
                          <p>Type: {appointment.type}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assigned Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedPatients.length > 0 ? (
                  <ul className="space-y-4">
                    {assignedPatients.map((patient) => (
                      <li key={patient.id} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link href={`/patients/${patient.id}`} className="font-medium hover:underline">
                            {patient.name}
                          </Link>
                          <p className="text-sm text-gray-500">{patient.contact_number}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No patients assigned to this doctor.</p>
                )}
              </CardContent>
            </Card>

            {/* Add more cards for other doctor-related information as needed */}
          </div>
        </div>
      </div>
    </div>
  )
}