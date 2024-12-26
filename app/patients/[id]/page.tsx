'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Mail, Trash2 } from 'lucide-react'
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
  Doctor, 
  MedicalEvent, 
  Prescription, 
  LabResult,
  Allergy,
  Medication,
  Immunization,
  TimelineEvent,
  PatientDoctor,
  PatientDoctorResponse,
  DoctorOption
} from '@/app/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DialogFooter } from "@/components/ui/dialog"

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [doctors, setDoctors] = useState<DoctorOption[]>([])
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
  const [patientDoctors, setPatientDoctors] = useState<PatientDoctor[]>([])
  const [isAssignDoctorOpen, setIsAssignDoctorOpen] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')

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
      fetchPatientDoctors()
    }
  }, [supabase, params.id])

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
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
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name')
  
      if (error) throw error
      
      const formattedDoctors = data.map(doc => ({
        id: doc.id,
        first_name: doc.first_name,
        last_name: doc.last_name,
        name: `${doc.first_name} ${doc.last_name}`,
        specialization: '',
        contact_number: null,
        email: null,
        address: null,
        user_id: null,
        created_at: new Date().toISOString(),
        assistant: null
      }))
      
      setDoctors(formattedDoctors)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    }
  }

  const fetchPatientDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_doctors')
        .select(`
          id,
          doctor:doctor_id (
            id,
            first_name,
            last_name,
            specialization,
            contact_number,
            email
          )
        `)
        .eq('patient_id', params.id)
  
      if (error) throw error
  
      const formattedDoctors: PatientDoctor[] = (data as any[]).map(item => ({
        id: item.doctor.id,
        name: `${item.doctor.first_name} ${item.doctor.last_name}`,
        specialty: item.doctor.specialization || '',
        phone: item.doctor.contact_number || '',
        email: item.doctor.email || '',
        primary: false
      }))
  
      setPatientDoctors(formattedDoctors)
    } catch (error) {
      console.error('Error fetching patient doctors:', error)
      toast.error('Failed to load patient doctors')
    }
  }

  const fetchMedicalHistory = async () => {
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
      setIsLoading(false)
    }
  }

  const fetchVitals = async () => {
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
    }
  }

  const fetchDocuments = async () => {
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
            clerk_id,
            first_name,
            last_name
          ),
          shared_with:shared_with_user_id (
            clerk_id,
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
  
      const formattedResults: LabResult[] = (data as unknown as Array<{
        id: string;
        test_name: string;
        test_type: string;
        result_value: string;
        reference_range: string;
        unit: string;
        date: string;
        notes: string;
        status: 'normal' | 'abnormal' | 'critical';
        doctor: {
          id: string;
          first_name: string;
          last_name: string;
        };
      }>).map(item => ({
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
    }
  }

  const fetchPrescriptions = async () => {
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
    }
  }

  const fetchAllergies = async () => {
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
    }
  }

  const fetchMedications = async () => {
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
    }
  }

  const fetchImmunizations = async () => {
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
    }
  }

  const fetchTimelineEvents = async () => {
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

        <Card>
          <CardHeader>
            <CardTitle>Assigned Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientDoctors.length === 0 ? (
                <p className="text-muted-foreground">No doctors assigned</p>
              ) : (
                patientDoctors.map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">Dr. {doctor.name}</h4>
                      {doctor.specialty && (
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      )}
                      {doctor.phone && (
                        <p className="text-sm text-muted-foreground">{doctor.phone}</p>
                      )}
                      {doctor.email && (
                        <p className="text-sm text-muted-foreground">{doctor.email}</p>
                      )}
                    </div>
                    {doctor.primary && (
                      <Badge variant="secondary">Primary</Badge>
                    )}
                  </div>
                ))
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsAssignDoctorOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Doctor
              </Button>
            </div>
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
                        Dr. {doctor.first_name} {doctor.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
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
