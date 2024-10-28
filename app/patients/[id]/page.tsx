'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { MedicalHistoryTimeline } from '@/app/components/MedicalHistoryTimeline'
import { AddMedicalHistoryForm } from '@/app/components/AddMedicalHistoryForm'
import { PatientCardSkeleton } from '@/components/ui/skeleton'
import { VitalsTracker } from '@/app/components/VitalsTracker'
import { DocumentManager } from '@/components/documents/DocumentManager'
import { PrescriptionManager } from '@/app/components/PrescriptionManager'
import { LabResultsManager } from '@/app/components/LabResultsManager'
import { AllergiesManager } from '@/app/components/AllergiesManager'
import { MedicationsTracker } from '@/app/components/MedicationsTracker'
import { ImmunizationTracker } from '@/app/components/ImmunizationTracker'
import { BillingManager } from '@/app/components/BillingManager'
import { PatientShares } from '@/components/patients/PatientShares'
import { Separator } from '@/components/ui/separator'
import { TimelineView } from '@/components/medical-history/TimelineView'
import { getPatientTimeline } from '@/lib/timeline-service'

interface Doctor {
  id: string
  name: string
}

interface MedicalEvent {
  id: string
  date: string
  type: 'appointment' | 'prescription' | 'diagnosis' | 'test'
  title: string
  description: string
  doctor: {
    id: string
    name: string
  }
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
  category: 'lab_result' | 'prescription' | 'imaging' | 'other'
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: number
  start_date: string
  end_date: string
  instructions: string
  doctor_id: string
  patient_id: string
  status: 'active' | 'completed' | 'cancelled'
  doctor: {
    id: string
    name: string
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

interface Allergy {
  id: string
  patient_id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
  date_identified: string
  status: 'active' | 'inactive'
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  instructions: string
  status: 'active' | 'discontinued' | 'completed'
  reason_for_discontinuation?: string
  side_effects?: string
  adherence_rate?: number
  doctor_id: string
  patient_id: string
  doctor: {
    id: string
    name: string
  }
}

interface Immunization {
  id: string
  vaccine_name: string
  vaccine_type: string
  dose_number: number
  date_administered: string
  next_due_date: string | null
  administered_by: string
  batch_number: string
  manufacturer: string
  location: string
  notes: string
  status: 'completed' | 'scheduled' | 'overdue'
  side_effects?: string
  patient_id: string
  doctor_id: string
  doctor: {
    id: string
    name: string
  }
}

interface Bill {
  id: string
  date: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  insurance_claim_id?: string
  payment_method?: string
  payment_date?: string
  patient_id: string
  service_id: string
  service: {
    name: string
    code: string
  }
}

interface TimelineEvent {
  id: string
  patient_id: number
  user_id: string
  type: 'appointment' | 'prescription' | 'vitals' | 'lab_result' | 'note'
  date: string
  title: string
  description: string | null
  metadata: Record<string, any> | null
  created_by: string
  created_at: string
  appointment_id?: number
  prescription_id?: number
  vitals_id?: number
  lab_result_id?: number
}

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [medicalHistory, setMedicalHistory] = useState<MedicalEvent[]>([])
  const [showAddHistory, setShowAddHistory] = useState(false)
  const [initialVitals, setInitialVitals] = useState<[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [immunizations, setImmunizations] = useState<Immunization[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    if (supabase && params.id) {
      fetchPatientData()
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
      fetchBills()
    }
  }, [supabase, params.id])

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setPatient(data)
    } catch (error) {
      console.error('Error fetching patient:', error)
      toast.error('Failed to load patient data')
    }
  }

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name')

      if (error) throw error
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    }
  }

  const fetchMedicalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select(`
          id,
          date,
          type,
          title,
          description,
          doctor:doctors(id, name)
        `)
        .eq('patient_id', params.id)
        .order('date', { ascending: false })

      if (error) throw error
      setMedicalHistory(data)
    } catch (error) {
      console.error('Error fetching medical history:', error)
      toast.error('Failed to load medical history')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVitals = async () => {
    try {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', params.id)
        .order('date', { ascending: false })

      if (error) throw error
      setInitialVitals(data)
    } catch (error) {
      console.error('Error fetching vitals:', error)
      toast.error('Failed to load vitals data')
    }
  }

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', params.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    }
  }

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctor:doctors(id, name)
        `)
        .eq('patient_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrescriptions(data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      toast.error('Failed to load prescriptions')
    }
  }

  const fetchLabResults = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select(`
          *,
          doctor:doctors(id, name)
        `)
        .eq('patient_id', params.id)
        .order('date', { ascending: false })

      if (error) throw error
      setLabResults(data)
    } catch (error) {
      console.error('Error fetching lab results:', error)
      toast.error('Failed to load lab results')
    }
  }

  const fetchAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', params.id)
        .order('date_identified', { ascending: false })

      if (error) throw error
      setAllergies(data)
    } catch (error) {
      console.error('Error fetching allergies:', error)
      toast.error('Failed to load allergies')
    }
  }

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select(`
          *,
          doctor:doctors(id, name)
        `)
        .eq('patient_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedications(data)
    } catch (error) {
      console.error('Error fetching medications:', error)
      toast.error('Failed to load medications')
    }
  }

  const fetchImmunizations = async () => {
    try {
      const { data, error } = await supabase
        .from('immunizations')
        .select(`
          *,
          doctor:doctors(id, name)
        `)
        .eq('patient_id', params.id)
        .order('date_administered', { ascending: false })

      if (error) throw error
      setImmunizations(data)
    } catch (error) {
      console.error('Error fetching immunizations:', error)
      toast.error('Failed to load immunizations')
    }
  }

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          service:services(name, code)
        `)
        .eq('patient_id', params.id)
        .order('date', { ascending: false })

      if (error) throw error
      setBills(data)
    } catch (error) {
      console.error('Error fetching bills:', error)
      toast.error('Failed to load bills')
    }
  }

  const fetchTimelineEvents = async () => {
    try {
      const data = await getPatientTimeline(supabase, parseInt(params.id))
      setTimelineEvents(data)
    } catch (error) {
      console.error('Error fetching timeline:', error)
      toast.error('Failed to load timeline')
    }
  }

  if (isLoading) {
    return <PatientCardSkeleton />
  }

  if (!patient) {
    return <div>Patient not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{patient.name}</h1>
        <Button onClick={() => setShowAddHistory(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medical Record
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}</p>
              <p><strong>Contact:</strong> {patient.phone}</p>
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Address:</strong> {patient.address}</p>
            </div>
          </CardContent>
        </Card>

        <MedicalHistoryTimeline 
          events={medicalHistory}
          className="lg:col-span-1"
        />

        <VitalsTracker 
          patientId={params.id as string}
          initialVitals={initialVitals}
        />

        <DocumentManager 
          patientId={params.id as string}
          initialDocuments={documents}
        />

        <PrescriptionManager
          patientId={params.id as string}
          doctors={doctors}
          initialPrescriptions={prescriptions}
        />

        <LabResultsManager
          patientId={params.id as string}
          doctors={doctors}
          initialLabResults={labResults}
        />

        <AllergiesManager
          patientId={params.id as string}
          initialAllergies={allergies}
        />

        <MedicationsTracker
          patientId={params.id as string}
          doctors={doctors}
          initialMedications={medications}
        />

        <ImmunizationTracker
          patientId={params.id as string}
          doctors={doctors}
          initialImmunizations={immunizations}
        />

        <BillingManager
          patientId={params.id as string}
          initialBills={bills}
        />

        <Card>
          <CardHeader>
            <CardTitle>Patient Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientShares 
              patientId={parseInt(params.id)} 
              patientName={patient?.name || ''} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineView patientId={parseInt(params.id)} />
          </CardContent>
        </Card>
      </div>

      <AddMedicalHistoryForm
        isOpen={showAddHistory}
        onClose={() => setShowAddHistory(false)}
        patientId={params.id as string}
        doctors={doctors}
        onSuccess={() => {
          fetchMedicalHistory()
          setShowAddHistory(false)
        }}
      />
    </div>
  )
}
