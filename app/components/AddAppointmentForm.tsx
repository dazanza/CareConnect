'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { convertLocalToUTC, convertUTCToLocal, formatLocalDate } from '@/app/lib/dateUtils';

interface AddAppointmentFormProps {
  onSuccess: (newDate?: Date) => void;
  patientId?: string;
  doctorId?: string;
  initialData?: Appointment | null;
  mode?: 'add' | 'reschedule';
  disablePatientDoctor?: boolean;
}

export function AddAppointmentForm({ 
  onSuccess, 
  patientId, 
  doctorId, 
  initialData, 
  mode = 'add',
  disablePatientDoctor = false
}: AddAppointmentFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)

  const fetchDoctors = useCallback(async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from('doctors').select('*').order('last_name')
      if (error) throw error
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }, [supabase])

  const fetchPatients = useCallback(async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from('patients').select('*').order('last_name')
      if (error) throw error
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }, [supabase])

  const fetchPatientAndDoctor = useCallback(async (patientId: number, doctorId: number) => {
    if (!supabase) return

    try {
      const [patientResult, doctorResult] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('doctors').select('*').eq('id', doctorId).single()
      ])

      if (patientResult.data) {
        setPatients([patientResult.data])
      }
      if (doctorResult.data) {
        setDoctors([doctorResult.data])
      }
    } catch (error) {
      console.error('Error fetching patient/doctor:', error)
    }
  }, [supabase])

  useEffect(() => {
    fetchDoctors()
    fetchPatients()
  }, [fetchDoctors, fetchPatients])

  useEffect(() => {
    if (initialData && mode === 'reschedule') {
      setDate(new Date(initialData.date).toISOString().split('T')[0])
      setTime(new Date(initialData.date).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5))
      setType(initialData.type)
      setLocation(initialData.location)
      setNotes(initialData.notes || '')
      setSelectedPatient(initialData.patient_id.toString())
      setSelectedDoctor(initialData.doctor_id.toString())
      
      fetchPatientAndDoctor(initialData.patient_id, initialData.doctor_id)
    } else {
      if (patientId) setSelectedPatient(patientId)
      if (doctorId) setSelectedDoctor(doctorId)
    }
  }, [initialData, mode, patientId, doctorId, fetchPatientAndDoctor, setDate, setTime, setType, setLocation, setNotes, setSelectedPatient, setSelectedDoctor])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!supabase) {
      setError('Supabase client not available')
      setIsLoading(false)
      return
    }

    const appointmentDate = new Date(`${date}T${time}`)
    const utcDate = convertLocalToUTC(appointmentDate)

    const appointmentData = {
      patient_id: parseInt(selectedPatient),
      doctor_id: parseInt(selectedDoctor),
      date: utcDate,
      type,
      location,
      notes
    }

    try {
      let result
      if (mode === 'reschedule' && initialData) {
        const { data, error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', initialData.id)
          .select()
        if (error) throw error
        result = data[0]
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select()
        if (error) throw error
        result = data[0]
      }

      toast.success(mode === 'reschedule' ? 'Appointment rescheduled successfully' : 'Appointment added successfully')
      onSuccess(new Date(result.date))
    } catch (error) {
      console.error('Error saving appointment:', error)
      setError('Failed to save appointment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="patient">Patient</Label>
        <Select 
          onValueChange={setSelectedPatient} 
          value={selectedPatient}
          disabled={disablePatientDoctor || !!patientId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id.toString()}>
                {patient.first_name} {patient.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="doctor">Doctor</Label>
        <Select 
          onValueChange={handleDoctorChange} 
          value={selectedDoctor}
          disabled={disablePatientDoctor}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        {isLoading ? 'Saving...' : mode === 'add' ? 'Add Appointment' : 'Reschedule Appointment'}
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