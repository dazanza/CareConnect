'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import toast from 'react-hot-toast'
import { Appointment, Doctor, Patient } from '@/types'
import AddDoctorForm from './AddDoctorForm'

// Define props interface for the AddAppointmentForm component
interface AddAppointmentFormProps {
  onSuccess?: () => void
  patientId?: number
  doctorId?: number
}

// Main component for adding a new appointment
export default function AddAppointmentForm({ onSuccess, patientId, doctorId }: AddAppointmentFormProps) {
  // Initialize Supabase client and router
  const { supabase } = useSupabase()
  const router = useRouter()

  // State variables for form fields and UI control
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<number | null>(patientId || null)
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(doctorId || null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)

  // Fetch doctors and patients data on component mount
  useEffect(() => {
    console.log('AddAppointmentForm mounted, fetching data...')
    console.log('Initial doctorId:', doctorId)
    console.log('Initial patientId:', patientId)
    fetchDoctors()
    if (!patientId) {
      fetchPatients()
    }
  }, [patientId, doctorId])  // Add doctorId to the dependency array

  // Set selected doctor and location when doctorId prop changes
  useEffect(() => {
    if (doctorId) {
      console.log('Setting selected doctor:', doctorId)
      setSelectedDoctor(doctorId)
      const selectedDoctor = doctors.find(d => d.id === doctorId)
      if (selectedDoctor) {
        setLocation(selectedDoctor.address)
      } else {
        console.log('Selected doctor not found in the doctors list')
      }
    }
  }, [doctorId, doctors])

  // Function to fetch doctors from the database
  const fetchDoctors = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    console.log('Fetching doctors...')
    const { data, error } = await supabase.from('doctors').select('*')
    if (error) {
      console.error('Error fetching doctors:', error)
    } else {
      console.log('Fetched doctors:', data)
      setDoctors(data)
    }
  }

  // Function to fetch patients from the database
  const fetchPatients = async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('patients').select('*')
    if (error) {
      console.error('Error fetching patients:', error)
    } else {
      console.log('Fetched patients:', data)
      setPatients(data)
    }
  }

  // Handler for doctor selection change
  const handleDoctorChange = (doctorId: string) => {
    console.log('Doctor selected:', doctorId)
    if (doctorId === 'add_new') {
      setIsAddDoctorOpen(true)
    } else {
      const doctor = doctors.find(d => d.id.toString() === doctorId)
      setSelectedDoctor(Number(doctorId))
      if (doctor) {
        setLocation(doctor.address)
      }
    }
  }

  // Handler for patient selection change
  const handlePatientChange = (patientId: string) => {
    console.log('Patient selected:', patientId)
    setSelectedPatient(Number(patientId))
  }

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      if (!selectedPatient) {
        throw new Error('Please select a patient')
      }

      // Prepare appointment data for insertion
      const appointmentData: Partial<Appointment> = {
        patient_id: selectedPatient,
        doctor_id: selectedDoctor,
        date: `${date}T${time}:00`,
        type,
        location,
        notes,
      }

      // Insert new appointment into the database
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()

      if (error) throw error

      console.log('Appointment added successfully:', data)
      toast.success("Appointment added successfully")

      // Call onSuccess callback or redirect to appointments page
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/appointments')
      }
    } catch (error) {
      console.error('Error adding appointment:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      toast.error("Failed to add appointment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Render the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient selection dropdown */}
      {!patientId && (
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Select onValueChange={handlePatientChange} value={selectedPatient?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {/* Doctor selection dropdown */}
      <div>
        <Label htmlFor="doctor">Doctor</Label>
        <Select onValueChange={handleDoctorChange} value={selectedDoctor?.toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no_doctors" disabled>No doctors available</SelectItem>
            )}
            <SelectItem value="add_new">
              <span className="text-blue-500">+ Add New Doctor</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Date input */}
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      {/* Time input */}
      <div>
        <Label htmlFor="time">Time</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
      {/* Appointment type selection */}
      <div>
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={setType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select appointment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checkup">Check-up</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="treatment">Treatment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Location input */}
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      {/* Notes textarea */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {/* Error message display */}
      {error && <p className="text-red-500">{error}</p>}
      {/* Submit button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Appointment'}
      </Button>

      {/* Dialog for adding a new doctor */}
      <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <AddDoctorForm onSuccess={() => {
            setIsAddDoctorOpen(false)
            fetchDoctors()
          }} />
        </DialogContent>
      </Dialog>
    </form>
  )
}