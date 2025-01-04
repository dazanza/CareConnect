'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Mail, Trash2, Pencil, UserMinus, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { MedicalHistoryTimeline } from '@/app/components/MedicalHistoryTimeline'
import { AddMedicalHistoryForm } from '@/app/components/AddMedicalHistoryForm'
import { PatientCardSkeleton } from '@/app/components/ui/skeletons'
import { VitalsTracker } from '@/app/components/VitalsTracker'
import { DocumentManager } from '@/app/components/documents/DocumentManager'
import { PrescriptionManager } from '@/app/components/PrescriptionManager'
import { AllergiesManager } from '@/app/components/AllergiesManager'
import { MedicationsTracker } from '@/app/components/MedicationsTracker'
import { ImmunizationTracker } from '@/app/components/ImmunizationTracker'
import { PatientShares } from '@/app/components/patients/PatientShares'
import { Separator } from '@/components/ui/separator'
import { TimelineView } from '@/app/components/medical-history/TimelineView'
import { getPatientTimeline } from '@/app/lib/timeline-service'
import { 
  MedicalDocument, 
  DoctorOption,
  PatientDoctor,
  TimelineEvent
} from '@/app/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { AppointmentsList } from '@/app/components/AppointmentsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  contact_number: string | null
  email: string | null
  created_at: string
  address: string
  user_id: string
}

interface MedicalEvent {
  id: string
  date: string
  type: 'test' | 'appointment' | 'prescription' | 'diagnosis'
  title: string
  description: string
  doctor_id: string
  doctor: {
    id: string
    first_name: string
    last_name: string
  }
}

interface Allergy {
  id: string
  patient_id: string
  allergen: string
  reaction: string
  severity: string
  date_identified: string
  notes?: string
  status: 'active' | 'inactive'
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string
  notes?: string
  patient_id: string
  doctor_id: string
  created_at: string
  doctor: {
    id: string
    first_name: string
    last_name: string
  }
  instructions: string
  status: 'active' | 'discontinued'
}

interface Immunization {
  id: string
  patient_id: string
  vaccine_name: string
  vaccine_type: string
  dose_number: number
  date_administered: string
  next_due_date: string | null
  administered_by: string
  batch_number: string
  manufacturer: string
  location: string
  notes?: string
  status: 'completed' | 'scheduled' | 'overdue'
  side_effects?: string
  doctor: {
    id: string
    first_name: string
    last_name: string
  }
}

interface Prescription {
  id: string
  patient_id: string
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string
  notes?: string
  doctor_id: string
  created_at: string
  status: 'active' | 'completed' | 'cancelled'
  doctor?: {
    id: string
    first_name: string
    last_name: string
  }
}

interface DatabaseDoctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
}

interface AssignedDoctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
}

interface PatientDoctorResponse {
  doctors: {
    id: number
    first_name: string
    last_name: string
    specialization: string
  }
}

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [medicalHistory, setMedicalHistory] = useState<MedicalEvent[]>([])
  const [showAddHistory, setShowAddHistory] = useState(false)
  const [initialVitals, setInitialVitals] = useState<any[]>([])
  const [documents, setDocuments] = useState<MedicalDocument[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [immunizations, setImmunizations] = useState<Immunization[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [patientDoctors, setPatientDoctors] = useState<AssignedDoctor[]>([])
  const [isAssignDoctorOpen, setIsAssignDoctorOpen] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'specialization', direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  })

  // Add loading states for each data type
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingVitals, setIsLoadingVitals] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false)
  const [isLoadingAllergies, setIsLoadingAllergies] = useState(false)
  const [isLoadingMedications, setIsLoadingMedications] = useState(false)
  const [isLoadingImmunizations, setIsLoadingImmunizations] = useState(false)
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false)
  const [isLoadingPatientDoctors, setIsLoadingPatientDoctors] = useState(false)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Primary useEffect for patient data
  useEffect(() => {
    if (supabase && params.id) {
      fetchPatientData()
    }
  }, [supabase, params.id])

  // Secondary useEffect for related data, only runs after patient is loaded
  useEffect(() => {
    if (supabase && params.id && patient) {
      fetchTimelineEvents()
      fetchDoctors()
      fetchMedicalHistory()
      fetchVitals()
      fetchDocuments()
      fetchPrescriptions()
      fetchAllergies()
      fetchMedications()
      fetchImmunizations()
      fetchPatientDoctors()
    }
  }, [supabase, params.id, patient])

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id.toString())
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        throw new Error('Patient not found')
      }

      setPatient(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching patient:', error)
      toast.error('Failed to load patient data')
      setIsLoading(false)
    }
  }

  const fetchDoctors = async () => {
    setIsLoadingDoctors(true)
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('first_name')

      if (error) throw error
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const fetchPatientDoctors = async () => {
    setIsLoadingPatientDoctors(true)
    try {
      const { data, error } = await supabase
        .from('patient_doctors')
        .select(`
          doctors (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .eq('patient_id', parseInt(params.id))

      if (error) {
        console.error('Error fetching patient doctors:', error)
        return
      }

      // Type assertion for the response data
      const responseData = data as unknown as PatientDoctorResponse[]
      const formattedDoctors: AssignedDoctor[] = responseData.map(item => ({
        id: item.doctors.id,
        first_name: item.doctors.first_name,
        last_name: item.doctors.last_name,
        specialization: item.doctors.specialization
      }))

      setPatientDoctors(formattedDoctors)
    } catch (error) {
      console.error('Error fetching patient doctors:', error)
      toast.error('Failed to load assigned doctors')
    } finally {
      setIsLoadingPatientDoctors(false)
    }
  }

  const fetchMedicalHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('medical_history')
        .select(`
          id,
          date,
          type,
          title,
          description,
          doctor_id,
          doctor:doctors(
            id,
            first_name,
            last_name
          )
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false })

      if (error) throw error

      const formattedHistory = data.map(item => ({
        id: item.id,
        date: item.date,
        type: item.type,
        title: item.title,
        description: item.description,
        doctor_id: item.doctor_id,
        doctor: item.doctor
      }))

      setMedicalHistory(formattedHistory)
    } catch (error) {
      console.error('Error fetching medical history:', error)
      toast.error('Failed to load medical history')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const fetchVitals = async () => {
    setIsLoadingVitals(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_time', { ascending: false })

      if (error) throw error
      setInitialVitals(data)
    } catch (error) {
      console.error('Error fetching vitals:', error)
      toast.error('Failed to load vitals data')
    } finally {
      setIsLoadingVitals(false)
    }
  }

  const fetchDocuments = async () => {
    setIsLoadingDocuments(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const fetchPatientShares = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_shares')
        .select(`
          id,
          access_level,
          expires_at,
          shared_by:shared_by_user_id (
            id,
            first_name,
            last_name
          ),
          shared_with:shared_with_user_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('patient_id', params.id)
  
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching patient shares:', error)
      toast.error('Failed to load patient shares')
      return []
    }
  }

  const fetchPrescriptions = async () => {
    setIsLoadingPrescriptions(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('start_date', { ascending: false })

      if (error) throw error
      setPrescriptions(data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      toast.error('Failed to load prescriptions')
    } finally {
      setIsLoadingPrescriptions(false)
    }
  }

  const fetchAllergies = async () => {
    setIsLoadingAllergies(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_identified', { ascending: false })

      if (error) throw error
      setAllergies(data)
    } catch (error) {
      console.error('Error fetching allergies:', error)
      toast.error('Failed to load allergies')
    } finally {
      setIsLoadingAllergies(false)
    }
  }

  const fetchMedications = async () => {
    setIsLoadingMedications(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('medications')
        .select(`
          *,
          doctor:doctors(
            id,
            first_name,
            last_name
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedications(data)
    } catch (error) {
      console.error('Error fetching medications:', error)
      toast.error('Failed to load medications')
    } finally {
      setIsLoadingMedications(false)
    }
  }

  const fetchImmunizations = async () => {
    setIsLoadingImmunizations(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('immunizations')
        .select(`
          *,
          doctor:doctors(
            id,
            first_name,
            last_name
          )
        `)
        .eq('patient_id', patientId)
        .order('date_administered', { ascending: false })

      if (error) throw error
      setImmunizations(data)
    } catch (error) {
      console.error('Error fetching immunizations:', error)
      toast.error('Failed to load immunizations')
    } finally {
      setIsLoadingImmunizations(false)
    }
  }

  const fetchTimelineEvents = async () => {
    setIsLoadingTimeline(true)
    try {
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { data, error } = await supabase
        .from('timeline_events')
        .select(`
          id,
          patient_id,
          user_id,
          type,
          date,
          title,
          description,
          metadata,
          created_by,
          created_at,
          appointment_id,
          prescription_id,
          vitals_id,
          lab_result_id
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false })

      if (error) throw error
      setTimelineEvents(data as TimelineEvent[])
    } catch (error) {
      console.error('Error fetching timeline:', error)
      toast.error('Failed to load timeline')
    } finally {
      setIsLoadingTimeline(false)
    }
  }

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) {
      toast.error('Please select a doctor')
      return
    }

    try {
      const { error } = await supabase
        .from('patient_doctors')
        .insert({
          patient_id: parseInt(params.id),
          doctor_id: parseInt(selectedDoctorId),
        })

      if (error) throw error

      toast.success('Doctor assigned successfully')
      fetchPatientDoctors() // Refresh the list
      setIsAssignDoctorOpen(false)
      setSelectedDoctorId('')
    } catch (error) {
      console.error('Error assigning doctor:', error)
      toast.error('Failed to assign doctor')
    }
  }

  const handleSort = (key: 'name' | 'specialization') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortedDoctors = [...patientDoctors].sort((a: AssignedDoctor, b: AssignedDoctor) => {
    if (sortConfig.key === 'name') {
      const nameA = `${a.first_name} ${a.last_name}`
      const nameB = `${b.first_name} ${b.last_name}`
      return sortConfig.direction === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    } else {
      return sortConfig.direction === 'asc'
        ? a.specialization.localeCompare(b.specialization)
        : b.specialization.localeCompare(a.specialization)
    }
  })

  const handleDeletePatient = async () => {
    if (deleteConfirmName !== `${patient.first_name} ${patient.last_name}`) {
      toast.error('Please type the patient name correctly to confirm deletion')
      return
    }

    setIsDeleting(true)
    try {
      // Soft delete the patient
      const { error: updateError } = await supabase
        .from('patients')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'deleted'
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      toast.success('Patient deleted successfully')
      setIsDeleteConfirmOpen(false)
      setIsEditModalOpen(false)
      // Redirect to patients list after a short delay
      setTimeout(() => {
        window.location.href = '/patients'
      }, 2000)
    } catch (error) {
      console.error('Error deleting patient:', error)
      toast.error('Failed to delete patient')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUnassignDoctor = async (doctorId: number) => {
    try {
      const { error } = await supabase
        .from('patient_doctors')
        .delete()
        .eq('patient_id', parseInt(params.id))
        .eq('doctor_id', doctorId)

      if (error) throw error

      toast.success('Doctor unassigned successfully')
      fetchPatientDoctors() // Refresh the list
    } catch (error) {
      console.error('Error unassigning doctor:', error)
      toast.error('Failed to unassign doctor')
    }
  }

  if (isLoading) {
    return <PatientCardSkeleton />
  }

  if (!patient) {
    return <div>Patient not found</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        <p className="text-muted-foreground">
          Manage patient information, medical records, and documents
        </p>
      </div>

      <Tabs defaultValue="main" className="space-y-6">
        <TabsList>
          <TabsTrigger value="main">Main</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Patient Information</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      setDeleteConfirmName(patient.first_name + ' ' + patient.last_name)
                      setIsDeleteConfirmOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    {patient.nickname && (
                      <p className="text-sm text-gray-500">
                        Nickname: {patient.nickname}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p>{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="capitalize">{patient.gender}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <p>{patient.contact_number}</p>
                    </div>
                  </div>
                  {patient.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <p>{patient.email}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{patient.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentsList 
                  userId={user?.id} 
                  patientId={params.id}
                  limit={5}
                  upcoming={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Assigned Doctors Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Assigned Doctors</CardTitle>
                <CardDescription>Manage doctors assigned to this patient</CardDescription>
              </div>
              <Button onClick={() => setIsAssignDoctorOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Doctor
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPatientDoctors ? (
                <div>Loading doctors...</div>
              ) : patientDoctors.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Select
                      value={sortConfig.key}
                      onValueChange={(value: 'name' | 'specialization') => 
                        handleSort(value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="specialization">Sort by Specialty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4">
                    {sortedDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialization}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUnassignDoctor(doctor.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No doctors assigned yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rest of the components */}
          <VitalsTracker patientId={params.id} initialVitals={initialVitals} />
          <TimelineView timeline={timelineEvents} isLoading={isLoadingTimeline} />
          <PatientShares 
            patientId={params.id} 
            patientName={`${patient.first_name} ${patient.last_name}`}
          />
          <PrescriptionManager 
            patientId={params.id} 
            doctors={doctors}
            initialPrescriptions={prescriptions}
          />
          <AllergiesManager 
            patientId={params.id} 
            initialAllergies={allergies.map(allergy => ({
              ...allergy,
              severity: allergy.severity as 'mild' | 'moderate' | 'severe'
            }))}
          />
          <MedicationsTracker 
            patientId={params.id} 
            doctors={doctors}
            initialMedications={medications}
          />
          <ImmunizationTracker 
            patientId={params.id} 
            doctors={doctors}
            initialImmunizations={immunizations.map(immunization => ({
              ...immunization,
              doctor_id: immunization.doctor?.id || ''
            }))}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentManager patientId={params.id} initialDocuments={documents} />
        </TabsContent>
      </Tabs>

      {/* Assign Doctor Dialog */}
      <Dialog open={isAssignDoctorOpen} onOpenChange={setIsAssignDoctorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Doctor</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors
                  .filter(doctor => !patientDoctors.find(pd => pd.id === doctor.id))
                  .map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDoctorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDoctor}>
              Assign Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
