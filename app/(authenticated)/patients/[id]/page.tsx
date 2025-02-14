'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Mail, Trash2, Pencil, UserMinus, UserPlus, Share2, MoreHorizontal, MessageSquare, ChevronLeft } from 'lucide-react'
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
import { SharePatientDialog } from '@/app/components/patients/SharePatientDialog'
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
  DialogDescription,
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
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import ErrorBoundary from '@/app/components/ErrorBoundary'
import Link from 'next/link'
import { Textarea } from "@/components/ui/textarea"
import { usePatientAccess } from '@/app/hooks/usePatientAccess'
import { PatientErrorBoundary } from '@/app/components/error-boundaries/PatientErrorBoundary'
import { appNavigation } from '@/app/lib/navigation'

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

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  type: string
  date: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  doctor: {
    id: string
    first_name: string
    last_name: string
  }
}

interface PatientDetailsPageProps {
  params: { id: string }
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { canEdit, isLoading: isLoadingAccess } = usePatientAccess(params.id)
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)

  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [noteText, setNoteText] = useState('')

  const [isAddMedicalHistoryOpen, setIsAddMedicalHistoryOpen] = useState(false)

  const fetchPatientData = useCallback(async () => {
    if (!supabase || !params.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, params.id]);

  const fetchAllergies = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('patient_id', params.id);
      if (error) throw error;
      setAllergies(data || []);
    } catch (error) {
      console.error('Error fetching allergies:', error);
    }
  }, [supabase, params.id]);

  const fetchMedications = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', params.id);
      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  }, [supabase, params.id]);

  const fetchImmunizations = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('immunizations')
        .select('*')
        .eq('patient_id', params.id);
      if (error) throw error;
      setImmunizations(data || []);
    } catch (error) {
      console.error('Error fetching immunizations:', error);
    }
  }, [supabase, params.id]);

  const fetchMedicalHistory = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', params.id);
      if (error) throw error;
      setMedicalHistory(data || []);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  }, [supabase, params.id]);

  const fetchVitals = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', params.id)
        .order('date_time', { ascending: false });
      if (error) throw error;
      setInitialVitals(data || []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
    }
  }, [supabase, params.id]);

  const fetchAppointments = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .eq('patient_id', params.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [supabase, params.id]);

  const fetchDoctors = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, [supabase, params.id, user?.id]);

  const fetchPatientDoctors = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('patient_doctors')
        .select('*, doctors(*)')
        .eq('patient_id', params.id);
      if (error) throw error;
      setPatientDoctors(data || []);
    } catch (error) {
      console.error('Error fetching patient doctors:', error);
    }
  }, [supabase, params.id]);

  const fetchDocuments = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', params.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, [supabase, params.id]);

  const fetchPrescriptions = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctor:prescribed_by (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .eq('patient_id', params.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  }, [supabase, params.id]);

  const fetchTimelineEvents = useCallback(async () => {
    if (!supabase || !params.id) return;
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('patient_id', params.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setTimelineEvents(data || []);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    }
  }, [supabase, params.id]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  useEffect(() => {
    if (patient) {
      fetchAllergies();
      fetchAppointments();
      fetchDoctors();
      fetchDocuments();
      fetchImmunizations();
      fetchMedicalHistory();
      fetchMedications();
      fetchPatientDoctors();
      fetchPrescriptions();
      fetchTimelineEvents();
      fetchVitals();
    }
  }, [
    patient,
    fetchAllergies,
    fetchAppointments,
    fetchDoctors,
    fetchDocuments,
    fetchImmunizations,
    fetchMedicalHistory,
    fetchMedications,
    fetchPatientDoctors,
    fetchPrescriptions,
    fetchTimelineEvents,
    fetchVitals
  ]);

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

  const handleAddNote = async () => {
    if (!supabase || !selectedAppointment || !noteText.trim()) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          notes: noteText.trim() 
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, notes: noteText.trim() }
          : apt
      ))

      toast.success('Note added successfully')
      setIsAddNoteOpen(false)
      setNoteText('')
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    }
  }

  const handleCancelAppointment = async () => {
    if (!supabase || !selectedAppointment) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      // Update local state
      setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id))
      
      toast.success('Appointment cancelled successfully')
      setIsCancelDialogOpen(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error('Failed to cancel appointment')
    }
  }

  const handleBackClick = () => {
    appNavigation.goBack(router, '/patients')
  }

  const handleAppointmentClick = (appointmentId: string) => {
    appNavigation.goToAppointment(router, appointmentId, { showToast: true })
  }

  const handleDoctorClick = (doctorId: string) => {
    appNavigation.goToDoctor(router, doctorId, { showToast: true })
  }

  const handlePrescriptionClick = (prescriptionId: string) => {
    appNavigation.navigateTo(router, `/prescriptions/${prescriptionId}`, { showToast: true })
  }

  const handleMedicalHistoryClick = (event: MedicalEvent) => {
    switch (event.type) {
      case 'appointment':
        handleAppointmentClick(event.id)
        break
      case 'prescription':
        handlePrescriptionClick(event.id)
        break
      // Add other types as needed
    }
  }

  if (isLoading) {
    return <PatientCardSkeleton />
  }

  if (!patient) {
    return <div>Patient not found</div>
  }

  return (
    <PatientErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBackClick} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {patient.first_name} {patient.last_name}
                  {patient.nickname && ` (${patient.nickname})`}
                </h1>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground">
                Manage patient information, medical records, and documents
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="main" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="main" className="flex-1 sm:flex-none">Main</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 sm:flex-none">Documents</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 sm:flex-none">Medical History</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-6 mt-0">
            {/* Patient Info and Vitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Info Card */}
              <Card className="bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Patient Information</CardTitle>
                    <CardDescription>Basic patient details and contact information</CardDescription>
                  </div>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="font-medium">Date of Birth</dt>
                      <dd className="text-muted-foreground">
                        {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {' '}
                        ({Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / 31557600000)} years)
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="font-medium">Gender</dt>
                      <dd className="text-muted-foreground capitalize">{patient.gender}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="font-medium">Contact Number</dt>
                      <dd className="flex items-center gap-2 text-muted-foreground">
                        {patient.contact_number}
                      </dd>
                    </div>
                    {patient.email && (
                      <div className="flex items-center justify-between">
                        <dt className="font-medium">Email</dt>
                        <dd className="flex items-center gap-2 text-muted-foreground">
                          {patient.email}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <dt className="font-medium">Address</dt>
                      <dd className="text-muted-foreground text-right">{patient.address}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Vitals Card */}
              <VitalsTracker patientId={params.id} initialVitals={initialVitals} canEdit={canEdit} />
            </div>

            {/* Upcoming Appointments and Prescriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Appointments Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div>
                      {isLoadingAppointments ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-[250px] bg-muted animate-pulse rounded" />
                              <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-[250px] bg-muted animate-pulse rounded" />
                              <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        </div>
                      ) : appointments.length > 0 ? (
                        <Table>
                          <TableBody>
                            {appointments.map((appointment) => (
                              <TableRow key={appointment.id}>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    className="p-0 h-auto font-normal hover:no-underline w-full text-left"
                                    onClick={() => handleAppointmentClick(appointment.id)}
                                  >
                                    {appointment.doctor ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}` : 'No doctor assigned'} on {format(new Date(appointment.date), "MMMM d, yyyy")} at {format(new Date(appointment.date), "h:mm a")}
                                    {appointment.notes && (
                                      <div className="mt-1 text-sm text-muted-foreground">
                                        Note: {appointment.notes}
                                      </div>
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleAppointmentClick(appointment.id)}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit Appointment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => {
                                          setSelectedAppointment(appointment)
                                          setIsCancelDialogOpen(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Cancel Appointment
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <p>No upcoming appointments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prescriptions Card */}
              <PrescriptionManager 
                patientId={params.id} 
                doctors={doctors}
                initialPrescriptions={prescriptions}
                canEdit={canEdit}
              />
            </div>

            {/* Rest of the cards */}
            <TimelineView timeline={timelineEvents} isLoading={isLoadingTimeline} />

            {/* Assigned Doctors Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Assigned Doctors</CardTitle>
                  <CardDescription>Manage doctors assigned to this patient</CardDescription>
                </div>
                {canEdit && (
                  <Button variant="default" onClick={() => setIsAssignDoctorOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Doctor
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingPatientDoctors ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : patientDoctors.length > 0 ? (
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:text-primary"
                            onClick={() => handleSort('name')}
                          >
                            Name {sortConfig.key === 'name' && (
                              <span className="ml-2">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:text-primary"
                            onClick={() => handleSort('specialization')}
                          >
                            Specialization {sortConfig.key === 'specialization' && (
                              <span className="ml-2">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedDoctors.map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell className="font-medium">
                              <Button
                                variant="ghost"
                                className="p-0 h-auto font-normal hover:no-underline w-full text-left"
                                onClick={() => handleDoctorClick(doctor.id.toString())}
                              >
                                Dr. {doctor.first_name} {doctor.last_name}
                              </Button>
                            </TableCell>
                            <TableCell>{doctor.specialization}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUnassignDoctor(doctor.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                    <p>No doctors assigned yet</p>
                    {canEdit && (
                      <Button
                        variant="link"
                        onClick={() => setIsAssignDoctorOpen(true)}
                        className="mt-2 text-primary hover:text-primary/90"
                      >
                        Assign a doctor
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <AllergiesManager 
              patientId={params.id} 
              initialAllergies={allergies.map(allergy => ({
                ...allergy,
                severity: allergy.severity as 'mild' | 'moderate' | 'severe'
              }))}
              canEdit={canEdit}
            />
            <MedicationsTracker 
              patientId={params.id} 
              doctors={doctors}
              initialMedications={medications}
              canEdit={canEdit}
            />
            <ImmunizationTracker 
              patientId={params.id} 
              doctors={doctors}
              initialImmunizations={immunizations.map(immunization => ({
                ...immunization,
                doctor_id: immunization.doctor?.id || ''
              }))}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 mt-0">
            <DocumentManager patientId={params.id} initialDocuments={documents} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Medical History Timeline</h2>
              {canEdit && (
                <Button onClick={() => setIsAddMedicalHistoryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {medicalHistory.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(event.date), 'MMMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-normal hover:no-underline"
                        onClick={() => handleDoctorClick(event.doctor.id)}
                      >
                        Dr. {event.doctor.first_name} {event.doctor.last_name}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{event.description}</p>
                    {event.type === 'appointment' && (
                      <Button
                        variant="link"
                        className="mt-2 p-0"
                        onClick={() => handleAppointmentClick(event.id)}
                      >
                        View Appointment Details
                      </Button>
                    )}
                    {event.type === 'prescription' && (
                      <Button
                        variant="link"
                        className="mt-2 p-0"
                        onClick={() => handlePrescriptionClick(event.id)}
                      >
                        View Prescription Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Button at Bottom */}
        {canEdit && (
          <div className="flex justify-end pt-6">
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmName(patient.first_name + ' ' + patient.last_name)
                setIsDeleteConfirmOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Patient
            </Button>
          </div>
        )}

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
              <Button variant="default" onClick={handleAssignDoctor}>
                Assign Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Patient Modal */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Patient Access</DialogTitle>
              <DialogDescription>
                Grant other healthcare providers access to this patient&apos;s records
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <SharePatientDialog
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                  patientId={params.id}
                  onSuccess={() => {
                    fetchPatientShares()
                    setIsShareModalOpen(false)
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note to Appointment</DialogTitle>
              <DialogDescription>
                Add a note to this appointment. The note will be visible in the appointment details.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddNoteOpen(false)
                setNoteText('')
                setSelectedAppointment(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Appointment Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCancelDialogOpen(false)
                setSelectedAppointment(null)
              }}>
                No, keep appointment
              </Button>
              <Button variant="destructive" onClick={handleCancelAppointment}>
                Yes, cancel appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PatientErrorBoundary>
  )
}
