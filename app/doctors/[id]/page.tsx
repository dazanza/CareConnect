'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doctor, Patient, Appointment } from '@/types'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import { Calendar } from "@/components/ui/calendar"
import Link from 'next/link'
import { fetchAppointments } from '@/app/lib/dataFetching'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@clerk/nextjs'
import { convertUTCToLocal, formatLocalDate } from '@/app/lib/dateUtils'
import { RescheduleAppointmentDialog } from '@/app/components/RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from '@/app/components/CancelAppointmentDialog'
import { ChevronLeft, MapPin, PlusCircle, RefreshCw, Trash2, Phone, Mail, CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react"
import toast from 'react-hot-toast'

export default function DoctorDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    async function fetchData() {
      if (!supabase || !id || !userId) return

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

        console.log('Fetching appointments for doctor:', id, 'and user:', userId)
        const appointmentsData = await fetchAppointments(supabase, userId, { 
          doctorId: id as string,  // Use doctorId instead of patientId
          limit: 5, 
          upcoming: true 
        })
        console.log('Fetched appointments:', appointmentsData)
        setAppointments(appointmentsData)

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load doctor data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, id, userId])

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduleDialogOpen(true)
  }

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelDialogOpen(true)
  }

  const handleRescheduleSuccess = async (newDate: Date) => {
    if (selectedAppointment && userId) {
      try {
        await rescheduleAppointment(supabase, selectedAppointment.id, newDate)
        toast.success('Appointment rescheduled successfully')
        const updatedAppointments = await fetchAppointments(supabase, userId, { 
          doctorId: id as string,  // Change this from patientId to doctorId
          limit: 5, 
          upcoming: true 
        })
        setAppointments(updatedAppointments)
      } catch (error) {
        console.error('Error rescheduling appointment:', error)
        toast.error('Failed to reschedule appointment')
      }
      setIsRescheduleDialogOpen(false)
    }
  }

  const handleCancelSuccess = async () => {
    if (selectedAppointment && userId) {
      try {
        await cancelAppointment(supabase, selectedAppointment.id)
        toast.success('Appointment cancelled successfully')
        const updatedAppointments = await fetchAppointments(supabase, userId, { 
          doctorId: id as string,  // Change this from patientId to doctorId
          limit: 5, 
          upcoming: true 
        })
        setAppointments(updatedAppointments)
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        toast.error('Failed to cancel appointment')
      }
      setIsCancelDialogOpen(false)
    }
  }

  if (isLoading || !doctor) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/doctors" className="inline-flex items-center text-white hover:underline transition-colors duration-200">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Doctors
          </Link>
          <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
            <PlusCircle className="w-4 h-4 mr-1" />
            New Log
          </Button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dr. {doctor.first_name} {doctor.last_name}</h1>
            <div className="flex items-center mt-2 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{doctor.address}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-xl font-medium flex items-center justify-end">
              <Phone className="w-4 h-4 mr-1" />
              {doctor.contact_number}
            </p>
            <p className="text-lg flex items-center justify-end">
              <Mail className="w-4 h-4 mr-1" />
              {doctor.email}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-blue-800">Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              {doctor.assistant && <p><strong>Assistant:</strong> {doctor.assistant}</p>}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">Appointment Calendar</CardTitle>
                <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Schedule Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                    </DialogHeader>
                    <AddAppointmentForm 
                      onSuccess={() => {
                        setIsAddAppointmentOpen(false);
                        fetchAppointments(supabase, userId, { 
                          doctorId: id as string, 
                          limit: 5, 
                          upcoming: true 
                        }).then(setAppointments);
                      }} 
                      doctorId={doctor?.id.toString()}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full"
                    modifiers={{
                      hasAppointment: (date) => appointments.some(
                        (appointment) => new Date(appointment.date).toDateString() === date.toDateString()
                      )
                    }}
                    modifiersStyles={{
                      hasAppointment: { backgroundColor: '#93c5fd', color: '#1e40af' }
                    }}
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex-grow">
                          <Link href={`/appointments/${appointment.id}`} className="block">
                            <div className="font-semibold text-blue-600 hover:text-blue-800">
                              {appointment.patients?.name} {appointment.type} with Dr. {doctor.last_name}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {formatLocalDate(convertUTCToLocal(appointment.date), "MMMM d, yyyy")}
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {formatLocalDate(convertUTCToLocal(appointment.date), "h:mm a")}
                              </div>
                              <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {appointment.location}
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              handleReschedule(appointment);
                            }}
                            className="flex items-center"
                            title="Reschedule"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCancel(appointment);
                            }}
                            className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Cancel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No upcoming appointments.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
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
        </div>
      </div>

      <RescheduleAppointmentDialog
        isOpen={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
        appointmentId={selectedAppointment?.id || 0}
        onSuccess={handleRescheduleSuccess}
      />

      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        appointment={selectedAppointment}
        onCancel={handleCancelSuccess}
      />
    </DashboardLayout>
  )
}