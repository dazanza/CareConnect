'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Mail, Trash2, Pencil } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { MedicalHistoryTimeline } from '@/app/components/MedicalHistoryTimeline'
import { AddMedicalHistoryForm } from '@/app/components/AddMedicalHistoryForm'
import { PatientCardSkeleton } from '@/app/components/ui/skeletons'
import { VitalsTracker } from '@/app/components/VitalsTracker'
import { DocumentManager } from '@/app/components/documents/DocumentManager'
import { PrescriptionManager } from '@/app/components/PrescriptionManager'
import { LabResultsManager } from '@/app/components/LabResultsManager'
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

interface Doctor {
  id: string
  first_name: string
  last_name: string
  name: string
  specialization: string
  contact_number: string | null
  email: string | null
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

interface LabResult {
  id: string
  test_name: string
  test_type: string
  result_value: string
  reference_range: string
  unit: string
  date: string
  notes: string
  status: 'normal' | 'abnormal' | 'critical'
  doctor_id: string
  patient_id: string
  doctor: {
    id: string
    name: string
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

interface PatientDoctorJoin {
  doctor_id: string
  doctors: DatabaseDoctor
}

interface AssignedDoctor {
  id: string
  first_name: string
  last_name: string
  specialization: string
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
  const [labResults, setLabResults] = useState<LabResult[]>([])
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
  const [isLoadingLabResults, setIsLoadingLabResults] = useState(false)
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
      fetchLabResults()
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
          doctor_id,
          doctors (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .eq('patient_id', params.id)
        .returns<PatientDoctorJoin[]>()

      if (error) throw error

      if (!data) {
        setPatientDoctors([])
        return
      }

      const formattedDoctors: AssignedDoctor[] = data.map(item => ({
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

  const fetchLabResults = async () => {
    setIsLoadingLabResults(true)
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select(`
          id,
          test_name,
          test_type,
          result_value,
          reference_range,
          unit,
          date,
          notes,
          status,
          doctor:doctor_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('patient_id', params.id)
        .order('date', { ascending: false })

      if (error) throw error

      const formattedResults: LabResult[] = data.map(item => ({
        id: item.id,
        test_name: item.test_name,
        test_type: item.test_type,
        result_value: item.result_value,
        reference_range: item.reference_range,
        unit: item.unit,
        date: item.date,
        notes: item.notes,
        status: item.status,
        doctor_id: item.doctor.id,
        patient_id: params.id,
        doctor: {
          id: item.doctor.id,
          name: `${item.doctor.first_name} ${item.doctor.last_name}`
        }
      }))

      setLabResults(formattedResults)
    } catch (error) {
      console.error('Error fetching lab results:', error)
      toast.error('Failed to load lab results')
    } finally {
      setIsLoadingLabResults(false)
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
      const patientId = parseInt(params.id)
      if (isNaN(patientId)) {
        throw new Error('Invalid patient ID')
      }

      const { error } = await supabase
        .from('patient_doctors')
        .insert({
          patient_id: patientId,
          doctor_id: selectedDoctorId,
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

  if (isLoading) {
    return <PatientCardSkeleton />
  }

  if (!patient) {
    return <div>Patient not found</div>
  }

  return (
    <div className="flex-1">
      <header className="bg-white border-b">
        <div className="py-4 pl-6">
          <h2 className="text-2xl font-semibold text-blue-800">Patient Details</h2>
        </div>
      </header>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">
            {patient.first_name} {patient.last_name}
            {patient.nickname && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                ({patient.nickname})
              </span>
            )}
          </h1>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={() => setShowAddHistory(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Medical Record
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-lg font-semibold text-blue-950">Patient Information</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 hover:bg-blue-50"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <dl className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-3 text-sm">
                <dt className="font-medium text-blue-950/70">Date of Birth</dt>
                <dd>{new Date(patient.date_of_birth).toLocaleDateString()}</dd>
                
                <dt className="font-medium text-blue-950/70">Contact</dt>
                <dd className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  {patient.contact_number}
                </dd>
                
                <dt className="font-medium text-blue-950/70">Email</dt>
                <dd className="flex items-center gap-2 break-all">
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                  {patient.email}
                </dd>
                
                <dt className="font-medium text-blue-950/70">Address</dt>
                <dd className="break-words">{patient.address}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-lg font-semibold text-blue-950">Assigned Doctors</CardTitle>
              <Button 
                onClick={() => setIsAssignDoctorOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Assign Doctor
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      Name {sortConfig.key === 'name' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('specialization')}
                    >
                      Specialty {sortConfig.key === 'specialization' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDoctors.map((doctor: AssignedDoctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>{doctor.first_name} {doctor.last_name}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                    </TableRow>
                  ))}
                  {sortedDoctors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No doctors assigned
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <MedicalHistoryTimeline 
            events={medicalHistory} 
            className="lg:col-span-2"
          />

          <VitalsTracker
            patientId={params.id}
            initialVitals={initialVitals}
          />

          <DocumentManager
            patientId={params.id}
            initialDocuments={documents}
          />

          <PrescriptionManager
            patientId={params.id}
            doctors={doctors}
            initialPrescriptions={prescriptions}
          />

          <LabResultsManager
            patientId={params.id}
            doctors={doctors}
            initialLabResults={labResults}
          />

          <AllergiesManager
            patientId={params.id}
            initialAllergies={allergies}
          />

          <MedicationsTracker
            patientId={params.id}
            doctors={doctors}
            initialMedications={medications}
          />

          <ImmunizationTracker
            patientId={params.id}
            doctors={doctors}
            initialImmunizations={immunizations}
          />
        </div>

        <AddMedicalHistoryForm
          isOpen={showAddHistory}
          onClose={() => setShowAddHistory(false)}
          patientId={params.id}
          doctors={doctors}
          onSuccess={fetchMedicalHistory}
        />

        <Dialog open={isAssignDoctorOpen} onOpenChange={setIsAssignDoctorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Doctor</label>
                <Select
                  value={selectedDoctorId}
                  onValueChange={setSelectedDoctorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors
                      .filter(doc => !patientDoctors.some(pd => pd.id === doc.id))
                      .map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    {doctors.length === 0 && (
                      <SelectItem value="" disabled>No doctors available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDoctorOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAssignDoctor}>
                Assign Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Patient Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              try {
                const { error } = await supabase
                  .from('patients')
                  .update({
                    first_name: formData.get('first_name'),
                    last_name: formData.get('last_name'),
                    nickname: formData.get('nickname'),
                    date_of_birth: formData.get('date_of_birth'),
                    contact_number: formData.get('contact_number'),
                    email: formData.get('email'),
                    address: formData.get('address'),
                  })
                  .eq('id', params.id)

                if (error) throw error
                
                toast.success('Patient information updated')
                fetchPatientData() // Refresh the data
                setIsEditModalOpen(false)
              } catch (error) {
                console.error('Error updating patient:', error)
                toast.error('Failed to update patient information')
              }
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      name="first_name"
                      defaultValue={patient.first_name}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      name="last_name"
                      defaultValue={patient.last_name}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nickname</label>
                  <input
                    name="nickname"
                    defaultValue={patient.nickname}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    defaultValue={patient.date_of_birth}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Number</label>
                  <input
                    name="contact_number"
                    defaultValue={patient.contact_number}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={patient.email}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    defaultValue={patient.address}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Delete Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Warning: This action cannot be undone</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• All patient data will be archived</li>
                  <li>• Medical records will be preserved for compliance</li>
                  <li>• Associated appointments will be cancelled</li>
                  <li>• Patient access will be revoked immediately</li>
                </ul>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-600">
                  Type patient's full name to confirm: {patient.first_name} {patient.last_name}
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full p-2 border border-red-200 rounded-md"
                  placeholder="Type full name to confirm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePatient}
                disabled={deleteConfirmName !== `${patient.first_name} ${patient.last_name}` || isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-pulse">Deleting</span>
                    <span className="ml-1 animate-pulse">...</span>
                  </>
                ) : (
                  'Permanently Delete Patient'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
