'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useParams, useRouter } from 'next/navigation'
import { format, differenceInYears, startOfDay, endOfDay, isToday } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { Doctor, PatientDetails, PatientDoctor, Appointment } from '@/types'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import toast from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import { fetchAppointments } from '@/app/lib/dataFetching'
import Link from 'next/link'
import { Calendar } from "@/components/ui/calendar"
import { AlertTriangle, Calendar as CalendarIcon, ChevronLeft, MapPin, PlusCircle, RefreshCw, X, FileText, Paperclip, FileUp, Phone, Mail, ArrowRight, UserMinus, Cake, Thermometer, Droplet, Heart, Wind, Pill, Edit, Trash, Clock as ClockIcon, MapPin as MapPinIcon } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { convertUTCToLocal, convertLocalToUTC, formatLocalDate } from '@/app/lib/dateUtils';
import { RescheduleAppointmentDialog } from '@/app/components/RescheduleAppointmentDialog'
import { CancelAppointmentDialog } from '@/app/components/CancelAppointmentDialog'
import { useAuth } from '@clerk/nextjs'
import AppTodoList from '@/app/components/AppTodoList'

const moodEmojis = [
  { emoji: '😄', label: 'Happy', color: 'bg-[#32CD32]' },
  { emoji: '😊', label: 'Satisfied', color: 'bg-[#FFD700]' },
  { emoji: '😐', label: 'Neutral', color: 'bg-[#D3D3D3]' },
  { emoji: '😔', label: 'Slightly Unhappy', color: 'bg-[#FFA500]' },
  { emoji: '😡', label: 'Angry', color: 'bg-[#FF4500]' },
]

// Add this schema for vitals form validation
const vitalsSchema = z.object({
  blood_pressure: z.string().optional(),
  blood_sugar: z.number().int().min(0).max(1000).optional(),
  heart_rate: z.number().int().min(0).max(300).optional(),
  temperature: z.number().min(30).max(45).optional(),
  mood: z.string().optional(),
  oxygen_saturation: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type VitalsFormValues = z.infer<typeof vitalsSchema>;

export default function PatientDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [assignedDoctors, setAssignedDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentMood, setCurrentMood] = useState(moodEmojis.find(mood => mood.label === 'Neutral') || moodEmojis[2])
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [sortBy, setSortBy] = useState<'specialty' | 'lastName'>('specialty')
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [latestVitals, setLatestVitals] = useState<any>(null)
  const [showVitalsReadings, setShowVitalsReadings] = useState(false)
  const [latestVitalsTime, setLatestVitalsTime] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const recentDocuments = [
    { id: 1, name: 'Blood Test Results.pdf', url: '#', uploadDate: 'May 15, 2023' },
    { id: 2, name: 'Cardiology Report.pdf', url: '#', uploadDate: 'April 25, 2023' },
    { id: 3, name: 'MRI Scan.pdf', url: '#', uploadDate: 'March 30, 2023' },
    { id: 4, name: 'Prescription History.pdf', url: '#', uploadDate: 'February 15, 2023' },
    { id: 5, name: 'Annual Physical Report.pdf', url: '#', uploadDate: 'January 5, 2023' },
  ]

  const recentNotes = [
    { id: 1, appointmentId: 3, doctor: 'Dr. Lee', date: new Date(2024, 7, 10), purpose: 'Annual Physical', note: 'Patient reports feeling well. Blood pressure is within normal range. Recommended to continue current medication regimen.' },
    { id: 2, appointmentId: 4, doctor: 'Dr. Smith', date: new Date(2024, 6, 22), purpose: 'Echocardiogram', note: 'Echocardiogram results show slight improvement in heart function. Advised patient to maintain current exercise routine and follow up in 3 months.' },
  ]

  const timelineItems = [
    { id: 1, title: "Cardiology Follow-up", date: "June 15, 2023", time: "10:00 AM", description: "Appointment with Dr. Smith to discuss recent test results and adjust treatment plan if necessary.", mood: "😊" },
    { id: 2, title: "Prescription Refill", date: "June 1, 2023", time: "", description: "Monthly refill of Lisinopril 10mg (blood pressure medication).", mood: "😐" },
    { id: 3, title: "Annual Physical", date: "May 10, 2023", time: "9:00 AM", description: "Routine annual physical examination and health check-up with Dr. Lee.", mood: "😄" },
    { id: 4, title: "Echocardiogram", date: "April 22, 2023", time: "11:30 AM", description: "Diagnostic test with Dr. Smith to evaluate heart function and structure.", mood: "😔" },
  ]

  const vitals = {
    bloodPressure: '140/90 mmHg',
    bloodSugar: '130 mg/dL',
    temperature: '99.5°F',
    bloodOxygen: '94%',
  }

  const vitalWarnings = {
    bloodPressure: parseInt(vitals.bloodPressure.split('/')[0]) > 130 || parseInt(vitals.bloodPressure.split('/')[1]) > 80,
    bloodSugar: parseInt(vitals.bloodSugar) > 125,
    temperature: parseFloat(vitals.temperature) > 99.0,
    bloodOxygen: parseInt(vitals.bloodOxygen) < 95,
  }

  const vitalsForm = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      blood_pressure: '',
      heart_rate: undefined,
      temperature: undefined,
      mood: currentMood.label, // Set the default mood to the current mood
      oxygen_saturation: undefined,
      notes: '',
    },
  });

  // Update the form when currentMood changes
  useEffect(() => {
    vitalsForm.setValue('mood', currentMood.label);
  }, [currentMood, vitalsForm]);

  const fetchLatestVitals = async (patientId: string) => {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .gte('date_time', convertLocalToUTC(startOfToday))
      .lte('date_time', convertLocalToUTC(endOfToday))
      .order('date_time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest vitals:', error);
      setLatestVitals(null);
      setShowVitalsReadings(false);
      setLatestVitalsTime(null);
      setCurrentMood(moodEmojis.find(mood => mood.label === 'Neutral') || moodEmojis[2]);
      return null;
    }

    if (data) {
      const localDateTime = convertUTCToLocal(data.date_time);
      setLatestVitals({ ...data, date_time: localDateTime });
      setShowVitalsReadings(true);
      setLatestVitalsTime(localDateTime);

      // Update currentMood based on fetched data
      if (data.mood) {
        const matchedMood = moodEmojis.find(mood => mood.label === data.mood);
        if (matchedMood) {
          setCurrentMood(matchedMood);
        }
      }
    } else {
      setLatestVitals(null);
      setShowVitalsReadings(false);
      setLatestVitalsTime(null);
      setCurrentMood(moodEmojis.find(mood => mood.label === 'Neutral') || moodEmojis[2]);
    }

    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase || !id || !userId) return

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

        // Map assigned doctor IDs to full doctor objects
        const fullAssignedDoctors = assignedDoctorsData
          .map(ad => doctorsData.find(d => d.id === ad.doctor_id))
          .filter(d => d !== undefined) as Doctor[]

        setAssignedDoctors(fullAssignedDoctors)

        // Fetch appointments
        const appointmentsData = await fetchAppointments(supabase, userId, { 
          patientId: id as string, 
          limit: 5, 
          upcoming: true 
        })
        setAppointments(appointmentsData)

        // Fetch latest vitals
        const latestVitalsData = await fetchLatestVitals(id as string);
        setLatestVitals(latestVitalsData);

        console.log('Vitals after fetching:', latestVitalsData); // Add this line
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load patient data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, id, userId])

  useEffect(() => {
    if (supabase && id) {
      fetchAppointments(supabase, userId, { 
        patientId: id as string, 
        limit: 5, 
        upcoming: true 
      }).then(setAppointments);
    }
  }, [supabase, id]);

  const handleAssignDoctor = async () => {
    if (!selectedDoctor || !patient) return

    try {
      const { error } = await supabase
        .from('patient_doctors')
        .insert({ patient_id: patient.id, doctor_id: parseInt(selectedDoctor) })

      if (error) throw error

      const newDoctor = doctors.find(d => d.id === parseInt(selectedDoctor))
      if (newDoctor) {
        setAssignedDoctors([...assignedDoctors, newDoctor])
      }

      setSelectedDoctor('')
      toast.success('Doctor assigned successfully')
    } catch (error) {
      console.error('Error assigning doctor:', error)
      toast.error('Failed to assign doctor')
    }
  }

  const removeDoctor = async (doctorId: number) => {
    if (!patient) return

    try {
      const { error } = await supabase
        .from('patient_doctors')
        .delete()
        .eq('patient_id', patient.id)
        .eq('doctor_id', doctorId)

      if (error) throw error

      setAssignedDoctors(assignedDoctors.filter(d => d.id !== doctorId))
      toast.success('Doctor removed successfully')
    } catch (error) {
      console.error('Error removing doctor:', error)
      toast.error('Failed to remove doctor')
    }
  }

  const formatAppointmentDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy')
  }

  const calculateAge = (dateOfBirth: Date) => {
    return differenceInYears(new Date(), dateOfBirth)
  }

  const onVitalsSubmit = async (values: VitalsFormValues) => {
    if (!patient) return;

    const utcDateTime = convertLocalToUTC(new Date());

    const { data, error } = await supabase
      .from('vitals')
      .insert({
        patient_id: patient.id,
        date_time: utcDateTime,
        ...values,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding vitals:', error);
      toast.error('Failed to add vitals');
    } else {
      toast.success('Vitals added successfully');
      setShowVitalsModal(false);
      fetchLatestVitals(patient.id.toString());
    }
  };

  const handleRescheduleSuccess = async (newDate: Date) => {
    if (selectedAppointment && userId) {
      try {
        await rescheduleAppointment(supabase, selectedAppointment.id, newDate)
        toast.success('Appointment rescheduled successfully')
        const updatedAppointments = await fetchAppointments(supabase, userId, { 
          patientId: id as string, 
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

  const handleCancel = async () => {
    if (selectedAppointment && userId) {
      try {
        await cancelAppointment(supabase, selectedAppointment.id)
        toast.success('Appointment cancelled successfully')
        const updatedAppointments = await fetchAppointments(supabase, userId, { 
          patientId: id as string, 
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

  if (isLoading || !patient) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/patients" className="inline-flex items-center text-white hover:underline transition-colors duration-200">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Patients
          </Link>
          <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
            <PlusCircle className="w-4 h-4 mr-1" />
            New Log
          </Button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{patient?.name}</h1>
            <div className="flex items-center mt-2 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{patient?.address}</span>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Cake className="w-4 h-4 mr-1" />
              <span>
                {patient?.date_of_birth
                  ? `${format(new Date(patient.date_of_birth), 'MMMM d, yyyy')} (${calculateAge(new Date(patient.date_of_birth))} years old)`
                  : 'N/A'}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-xl font-medium flex items-center justify-end">
              <Phone className="w-4 h-4 mr-1" />
              {patient?.contact_number}
            </p>
            <p className="text-lg flex items-center justify-end">
              <Mail className="w-4 h-4 mr-1" />
              {patient?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vitals & Mood Card */}
          <Card className={`bg-white shadow-md ${currentMood.color}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-blue-800">Vitals & Mood</CardTitle>
                {latestVitalsTime && (
                  <span className="text-sm text-gray-500">
                    as of {formatLocalDate(latestVitalsTime, 'h:mm a')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-black" />
                  <div>
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <p className="font-medium">{showVitalsReadings ? latestVitals?.blood_pressure : '--'}</p>
                  </div>
                  {showVitalsReadings && latestVitals?.blood_pressure && parseInt(latestVitals.blood_pressure.split('/')[0]) > 130 && (
                    <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                  )}
                </div>
                <div className="flex items-center">
                  <Droplet className="w-5 h-5 mr-2 text-black" />
                  <div>
                    <p className="text-sm text-gray-500">Blood Sugar</p>
                    <p className="font-medium">{showVitalsReadings && latestVitals?.blood_sugar ? `${latestVitals.blood_sugar} mg/dL` : '--'}</p>
                  </div>
                  {showVitalsReadings && latestVitals?.blood_sugar && latestVitals.blood_sugar > 125 && (
                    <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                  )}
                </div>
                <div className="flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-black" />
                  <div>
                    <p className="text-sm text-gray-500">Temperature</p>
                    <p className="font-medium">{showVitalsReadings && latestVitals?.temperature ? `${latestVitals.temperature}°C` : '--'}</p>
                  </div>
                  {showVitalsReadings && latestVitals?.temperature && latestVitals.temperature > 37.5 && (
                    <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                  )}
                </div>
                <div className="flex items-center">
                  <Wind className="w-5 h-5 mr-2 text-black" />
                  <div>
                    <p className="text-sm text-gray-500">Oxygen Saturation</p>
                    <p className="font-medium">{showVitalsReadings && latestVitals?.oxygen_saturation ? `${latestVitals.oxygen_saturation}%` : '--'}</p>
                  </div>
                  {showVitalsReadings && latestVitals?.oxygen_saturation && latestVitals.oxygen_saturation < 95 && (
                    <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                  )}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">Today's Mood</p>
                <div className="flex justify-between">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => {
                        setCurrentMood(mood);
                        vitalsForm.setValue('mood', mood.label);
                      }}
                      className={`text-2xl ${currentMood.label === mood.label ? 'opacity-100' : 'opacity-50'}`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => setShowVitalsModal(true)}>
                  {showVitalsReadings ? 'Update' : 'Add'} Readings
                </Button>
                <Link href={`/patients/${id}/vitals`} passHref>
                  <Button variant="outline" className="flex-1 text-sm">Vitals History</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Todo List */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-0 h-full">
              <AppTodoList patientId={id as string} userId={userId} />
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card className="md:col-span-2 bg-white shadow-md w-full max-w-none">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-blue-800">Appointments</CardTitle>
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
                          patientId: id as string, 
                          limit: 5, 
                          upcoming: true 
                        }).then(setAppointments);
                      }} 
                      patientId={patient?.id.toString()}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Calendar
                    mode="multiple"
                    selected={appointments.map(apt => new Date(apt.date))}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <Link 
                        key={appointment.id} 
                        href={`/appointments/${appointment.id}`} 
                        className="block w-full"
                      >
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg mb-2">
                              {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} with Dr. {appointment.doctors?.last_name}
                            </h3>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <CalendarIcon className="w-4 h-4" />
                                <p>{formatLocalDate(convertUTCToLocal(appointment.date), 'MMMM d, yyyy')}</p>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ClockIcon className="w-4 h-4" />
                                <p>{formatLocalDate(convertUTCToLocal(appointment.date), 'h:mm a')}</p>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPinIcon className="w-4 h-4" />
                                <p>{appointment.location}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedAppointment(appointment);
                                setIsRescheduleDialogOpen(true);
                              }}
                              className="flex items-center"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedAppointment(appointment);
                                setIsCancelDialogOpen(true);
                              }}
                              className="flex items-center"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p>No upcoming appointments.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-blue-800">Recent Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ul className="space-y-4">
                {recentNotes.map(note => (
                  <li key={note.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{`${note.purpose} with ${note.doctor} on ${formatAppointmentDate(note.date)}`}</p>
                      </div>
                      <Link href={`/appointments/${note.appointmentId}`}>
                        <Button variant="link" className="text-blue-600 hover:text-blue-800">
                          View Appointment
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <p className="text-sm">{note.note}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-blue-800">Assigned Doctors</CardTitle>
                <Select value={sortBy} onValueChange={(value: 'specialty' | 'lastName') => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specialty">Sort by Specialty</SelectItem>
                    <SelectItem value="lastName">Sort by Last Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {assignedDoctors.map(doctor => (
                  <li key={doctor.id} className="flex items-center justify-between space-x-2 p-2 hover:bg-gray-100 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={`${doctor.first_name} ${doctor.last_name}`} />
                        <AvatarFallback>{`${doctor.first_name[0]}${doctor.last_name[0]}`}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Dr. {doctor.first_name} {doctor.last_name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => removeDoctor(doctor.id)}
                      className="rounded-full bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700 border-red-200"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
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

          <Card className="bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-blue-800">Patient Documents</CardTitle>
              <CardDescription>Recent documents and file upload</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recent Documents</h3>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {recentDocuments.map(doc => (
                      <li key={doc.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        <div>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                            {doc.name}
                          </a>
                          <p className="text-sm text-gray-500">Uploaded: {doc.uploadDate}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link href={`/patients/${patient.id}/documents`} className="inline-flex items-center text-blue-600 hover:underline text-base transition-colors duration-200">
                      <Paperclip className="w-5 h-5 mr-2" />
                      View All Documents
                    </Link>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upload New Document</h3>
                  <label className="flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg shadow-inner border border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors duration-200">
                    <FileUp className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <Input
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-white shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-blue-800">Patient Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ol className="relative border-l border-gray-200 dark:border-gray-700">
                {timelineItems.map((item, index) => (
                  <li key={item.id} className="mb-10 ml-4">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-blue-700"></div>
                    <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{item.date} {item.time && `at ${item.time}`}</time>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{item.description}</p>
                    <span className="text-2xl">{item.mood}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Vitals Modal */}
      <Dialog open={showVitalsModal} onOpenChange={setShowVitalsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vitals</DialogTitle>
            <DialogDescription>
              Enter the patient's current vital signs.
            </DialogDescription>
          </DialogHeader>
          <Form {...vitalsForm}>
            <form onSubmit={vitalsForm.handleSubmit(onVitalsSubmit)} className="space-y-4">
              <FormField
                control={vitalsForm.control}
                name="blood_pressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 120/80" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vitalsForm.control}
                name="heart_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heart Rate (bpm)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vitalsForm.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.1" 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vitalsForm.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          {moodEmojis.map((mood) => (
                            <SelectItem key={mood.label} value={mood.label}>
                              {mood.emoji} {mood.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vitalsForm.control}
                name="oxygen_saturation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oxygen Saturation (%)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vitalsForm.control}
                name="blood_sugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Sugar (mg/dL)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={vitalsForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Vitals</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
        onCancel={handleCancel}
      />
    </DashboardLayout>
  )
}