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

interface AddAppointmentFormProps {
  initialData?: Appointment
  mode?: 'create' | 'reschedule'
  onSuccess: () => void
}

export function AddAppointmentForm({ initialData, mode = 'create', onSuccess }: AddAppointmentFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string>(initialData?.patient_id?.toString() || '')
  const [selectedDoctor, setSelectedDoctor] = useState<string>(initialData?.doctor_id?.toString() || '')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)

  useEffect(() => {
    fetchDoctors()
    fetchPatients()
  }, [supabase])

  const fetchDoctors = async () => {
    if (!supabase) return

    try {
      console.log('Fetching doctors...')
      const { data, error } = await supabase.from('doctors').select('*').order('last_name').limit(10)

      if (error) {
        console.error('Error fetching doctors:', error)
      } else {
        console.log('Fetched doctors:', data)
        setDoctors(data)
      }
    } catch (error) {
      console.error('Error in fetchDoctors:', error)
    }
  }

  const fetchPatients = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from('patients').select('*').order('name').limit(10)

      if (error) {
        console.error('Error fetching patients:', error)
      } else {
        setPatients(data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    if (doctorId === 'add_new') {
      setIsAddDoctorOpen(true)
    } else {
      setSelectedDoctor(doctorId)
      const doctor = doctors.find(d => d.id.toString() === doctorId)
      if (doctor) {
        setLocation(doctor.address)
      }
    }
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      if (mode === 'reschedule') {
        await rescheduleAppointment(initialData.id, data)
      } else {
        await createAppointment(data)
      }
      onSuccess()
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialData && (
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Select onValueChange={setSelectedPatient} value={selectedPatient}>
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

      {!initialData && (
        <div>
          <Label htmlFor="doctor">Doctor</Label>
          <Select onValueChange={handleDoctorChange} value={selectedDoctor}>
            <SelectTrigger>
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </SelectItem>
              ))}
              <SelectItem value="add_new">
                <span className="text-blue-500">+ Add New Doctor</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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

      <div>
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={setType} value={type}>
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

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Appointment'}
      </Button>

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