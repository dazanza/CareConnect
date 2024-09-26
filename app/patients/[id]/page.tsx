'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { Doctor, PatientDetails, PatientDoctor, Appointment } from '@/types'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AddAppointmentForm from '@/app/components/AddAppointmentForm'
import { Calendar } from 'lucide-react'
import { fetchAppointments } from '@/app/lib/dataFetching'

export default function PatientDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [assignedDoctors, setAssignedDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase || !id) return

      setIsLoading(true)
      try {
        // Fetch patient details
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single()

        if (patientError) throw patientError
        setPatient(patientData)

        // Fetch all doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*')

        if (doctorsError) throw doctorsError
        setDoctors(doctorsData)

        // Fetch assigned doctors
        const { data: assignedDoctorsData, error: assignedDoctorsError } = await supabase
          .from('patient_doctors')
          .select('doctor_id')
          .eq('patient_id', id)

        if (assignedDoctorsError) throw assignedDoctorsError

        console.log('Assigned doctors data:', assignedDoctorsData)

        // Map assigned doctor IDs to full doctor objects
        const fullAssignedDoctors = assignedDoctorsData
          .map(ad => doctorsData.find(d => d.id === ad.doctor_id))
          .filter(d => d !== undefined) as Doctor[]

        console.log('Full assigned doctors:', fullAssignedDoctors)

        setAssignedDoctors(fullAssignedDoctors)

        // Fetch patient's appointments
        const appointmentsData = await fetchAppointments(supabase, { patientId: id.toString(), upcoming: true })
        setAppointments(appointmentsData)

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load patient data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, id])

  const handleAssignDoctor = async () => {
    if (!selectedDoctor || !id) return

    try {
      const response = await fetch('/api/patient-doctors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          patientId: parseInt(id as string, 10), 
          doctorId: parseInt(selectedDoctor, 10) 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 403) {
          throw new Error('You are not authorized to perform this action')
        }
        throw new Error(`Failed to assign doctor: ${errorData.error || response.statusText}`)
      }

      const newAssignment: PatientDoctor = await response.json()

      const newDoctor = doctors.find(d => d.id === newAssignment.doctor_id)
      if (newDoctor) {
        setAssignedDoctors(prevDoctors => {
          if (!prevDoctors.some(d => d.id === newDoctor.id)) {
            return [...prevDoctors, newDoctor]
          }
          return prevDoctors
        })
      }

      toast.success('Doctor assigned successfully')
      setSelectedDoctor('') // Reset the selected doctor after successful assignment
    } catch (error) {
      console.error('Error assigning doctor:', error)
      toast.error(`Failed to assign doctor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (isLoading) return <DashboardLayout><div>Loading...</div></DashboardLayout>
  if (!patient) return <DashboardLayout><div>Patient not found</div></DashboardLayout>

  const formattedDateOfBirth = format(new Date(patient.date_of_birth), 'MMMM d, yyyy')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Patient Details</h1>
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Appointment</DialogTitle>
              </DialogHeader>
              <AddAppointmentForm 
                patientId={Number(id)} 
                onSuccess={() => setIsAddAppointmentOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

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
              {appointments.length > 0 ? (
                <ul className="space-y-4">
                  {appointments.map((appointment) => (
                    <li key={appointment.id} className="border-b pb-2">
                      <p className="font-semibold">
                        {format(new Date(appointment.date), 'MMMM d, yyyy h:mm a')}
                      </p>
                      <p>Doctor: Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}</p>
                      <p>Type: {appointment.type}</p>
                      <p>Location: {appointment.location}</p>
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
              <CardTitle>Prescription Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add prescription schedule here */}
              <p>Prescription schedule to be added</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedDoctors.length > 0 ? (
                <ul className="space-y-4">
                  {assignedDoctors.map((doctor) => (
                    doctor && doctor.first_name && doctor.last_name ? (
                      <li key={doctor.id} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{`${doctor.first_name[0]}${doctor.last_name[0]}`}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Dr. {doctor.first_name} {doctor.last_name}</p>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div>
                      </li>
                    ) : (
                      <li key={doctor?.id || 'unknown'} className="text-red-500">Invalid doctor data</li>
                    )
                  ))}
                </ul>
              ) : (
                <p>No doctors assigned to this patient.</p>
              )}

              <div className="mt-4 space-y-2">
                <Select onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors
                      .filter(d => !assignedDoctors.some(ad => ad && ad.id === d.id))
                      .map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignDoctor}>Assign Doctor</Button>
              </div>
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
      </div>
    </DashboardLayout>
  )
}