'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment, Todo } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon, Paperclip as PaperclipIcon, Mic as MicIcon, FileText as FileTextIcon, Plus, ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import { rescheduleAppointment, cancelAppointment } from "@/app/lib/appointments"
import { convertUTCToLocal, convertLocalToUTC, formatLocalDate } from '@/app/lib/dateUtils';
import { toast } from 'react-hot-toast'
import { AddPrescriptionModal } from '@/app/components/prescriptions/AddPrescriptionModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AppointmentErrorBoundary } from '@/app/components/error-boundaries/AppointmentErrorBoundary'

interface SpeechRecognitionEvent extends Event {
  results: {
    item(index: number): {
      item(index: number): {
        transcript: string;
      };
    };
    length: number;
    isFinal: boolean;
  }[];
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognitionInstance;
    };
  }
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  nickname?: string;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface ExtendedAppointment extends Appointment {
  patients?: Patient;
  doctors?: Doctor;
  user_id: string;
}

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  refills: number;
  notes?: string;
}

const prescriptionFormSchema = z.object({
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string().optional(),
    refills: z.number(),
    notes: z.string().optional()
  })),
  start_date: z.date(),
  end_date: z.date().optional(),
  patient_id: z.number(),
  prescribed_by: z.number(),
  appointment_id: z.number(),
  log_id: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'discontinued', 'completed'])
})

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>

interface AddAppointmentFormProps {
  onSuccess?: (newDate?: Date) => void;
  patientId?: string;
  doctorId?: string;
  initialData?: ExtendedAppointment;
  mode?: 'add' | 'reschedule';
  disablePatientDoctor?: boolean;
}

export default function AppointmentDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [appointment, setAppointment] = useState<ExtendedAppointment | null>(null)
  const [notes, setNotes] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newTodoDueDate, setNewTodoDueDate] = useState<string | null>(null)
  const [prevAppointment, setPrevAppointment] = useState<ExtendedAppointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [medicalFiles, setMedicalFiles] = useState<{ id: number; file_name: string; file_url: string; file_type: string | null; notes: string | null }[]>([])
  const recognitionRef = useRef<any>(null)
  const [isSetNextAppointmentOpen, setIsSetNextAppointmentOpen] = useState(false)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      medications: [{ name: '', dosage: '', frequency: '', refills: 0 }],
      status: 'active'
    }
  })

  useEffect(() => {
    async function fetchAppointmentDetails() {
      if (!supabase || !id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (id, first_name, last_name, nickname),
            doctors (id, first_name, last_name, specialization)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Convert UTC date to local date
        if (data) {
          console.log('Appointment data:', data);
          console.log('Patient data:', data.patients);
          console.log('Patient nickname:', data.patients?.nickname);
          const localDate = convertUTCToLocal(data.date);
          setAppointment({ ...data, date: localDate });
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAppointmentDetails()
  }, [supabase, id])

  useEffect(() => {
    async function fetchMedicalFiles() {
      if (!supabase || !appointment) return

      try {
        const { data, error } = await supabase
          .from('medical_files')
          .select('*')
          .eq('patient_id', appointment.patient_id)

        if (error) throw error

        const filesWithUrls = await Promise.all(data.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('medical-files')
            .getPublicUrl(file.file_url)

          return { ...file, file_url: publicUrl }
        }))

        setMedicalFiles(filesWithUrls)
      } catch (error) {
        console.error('Error fetching medical files:', error)
      }
    }

    fetchMedicalFiles()
  }, [supabase, appointment])

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i].item(0).item(0).transcript + ' ';
          }
        }

        setNotes(prevNotes => {
          const newNotes = prevNotes.trim() + ' ' + finalTranscript.trim();
          return newNotes.trim();
        });
      };

      recognitionRef.current.onerror = (event: Event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const fetchTodos = useCallback(async () => {
    if (!supabase || !appointment) return

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('appointment_id', appointment.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
      toast.error('Failed to load todos')
    } else {
      setTodos(data)
    }
  }, [supabase, appointment])

  useEffect(() => {
    if (appointment) {
      fetchTodos()
    }
  }, [appointment, fetchTodos])

  const handleSaveNotes = async () => {
    if (!supabase || !appointment) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ notes })
        .eq('id', appointment.id)

      if (error) throw error
      alert('Notes saved successfully')
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Failed to save notes')
    }
  }

  const handleAddTodo = async () => {
    if (!supabase || !appointment || !newTodo.trim()) return

    const newTodoItem: Partial<Todo> = {
      text: newTodo.trim(),
      completed: false,
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      due_date: newTodoDueDate,
      user_id: appointment.user_id // Assuming the appointment has a user_id field
    }

    const { data, error } = await supabase
      .from('todos')
      .insert(newTodoItem)
      .select()

    if (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add todo')
    } else {
      setTodos([data[0], ...todos])
      setNewTodo('')
      setNewTodoDueDate(null)
      toast.success('Todo added successfully')
    }
  }

  const handleToggleTodo = async (id: number) => {
    const todoToUpdate = todos.find(todo => todo.id === id)
    if (!todoToUpdate) return

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todoToUpdate.completed })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
      toast.error('Failed to update todo')
    } else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ))
      toast.success('Todo updated successfully')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabase || !appointment || !event.target.files) return

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${appointment.patient_id}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('medical-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: insertData, error: insertError } = await supabase
        .from('medical_files')
        .insert({
          patient_id: appointment.patient_id,
          file_name: file.name,
          file_url: filePath,
          file_type: file.type,
          upload_date: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { data: { publicUrl } } = supabase
        .storage
        .from('medical-files')
        .getPublicUrl(filePath)

      setMedicalFiles([...medicalFiles, { ...insertData, file_url: publicUrl }])
      alert('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    }
  }

  const handleToggleDictation = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsRecording(!isRecording)
  }

  const handleSetNextAppointment = () => {
    setIsSetNextAppointmentOpen(true)
  }

  const closeRescheduleDialog = () => {
    setIsRescheduleDialogOpen(false)
  }

  const closeCancelDialog = () => {
    setIsCancelDialogOpen(false)
  }

  const handleRescheduleSuccess = (newDate: Date) => {
    if (!appointment) return;
    setAppointment({
      ...appointment,
      date: newDate.toISOString()
    });
    setIsRescheduleDialogOpen(false);
  };

  const handleCancelAppointment = async () => {
    if (!supabase || !appointment) return

    try {
      await cancelAppointment(supabase, appointment.id.toString())
      closeCancelDialog()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!appointment) return <div>Appointment not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentErrorBoundary>
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(true)}>
                Reschedule
              </Button>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)}>
                Cancel Appointment
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">General Information</h2>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5" />
                    <p>{formatLocalDate(new Date(appointment.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <p>{formatLocalDate(new Date(appointment.date), 'h:mm a')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5" />
                    <p>{appointment.location}</p>
                  </div>
                  <p>
                    Patient: 
                    <Link href={`/patients/${appointment.patients?.id}`} className="text-blue-600 hover:underline ml-1">
                      {appointment.patients?.nickname || `${appointment.patients?.first_name} ${appointment.patients?.last_name}`}
                    </Link>
                  </p>
                  <p>
                    Doctor: 
                    <Link href={`/doctors/${appointment.doctors?.id}`} className="text-blue-600 hover:underline ml-1">
                      Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name} ({appointment.doctors?.specialization})
                    </Link>
                  </p>
                  <p>Purpose: {appointment.type}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">To-Do List</h2>
                <div className="space-y-2 mb-4">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id)}
                      />
                      <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
                      {todo.due_date && (
                        <span className="text-sm text-gray-500">
                          Due: {format(new Date(todo.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="New todo item"
                  />
                  <Input
                    type="date"
                    value={newTodoDueDate || ''}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                  />
                  <Button onClick={handleAddTodo}>Add</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mb-2"
                rows={10}
              />
              <div className="flex space-x-2">
                <Button onClick={handleSaveNotes}>Save Notes</Button>
                <Button onClick={handleToggleDictation} variant={isRecording ? "destructive" : "secondary"}>
                  <MicIcon className="w-4 h-4 mr-2" />
                  {isRecording ? 'Stop Dictation' : 'Start Dictation'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Files</CardTitle>
            </CardHeader>
            <CardContent>
              {medicalFiles.length > 0 ? (
                <ul className="space-y-2">
                  {medicalFiles.map((file) => (
                    <li key={file.id} className="flex items-center space-x-2">
                      <FileTextIcon className="w-4 h-4" />
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {file.file_name}
                      </a>
                      {file.file_type && <span className="text-sm text-gray-500">({file.file_type})</span>}
                      {file.notes && <span className="text-sm text-gray-500"> - {file.notes}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No medical files found for this patient.</p>
              )}
              <Input type="file" onChange={handleFileUpload} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <Input type="file" onChange={handleFileUpload} />
              {/* You might want to add a list of uploaded files here */}
            </CardContent>
          </Card>
        </div>

        {prevAppointment && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Previous Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/appointments/${prevAppointment.id}`} className="text-blue-600 hover:underline">
                {formatLocalDate(new Date(prevAppointment.date), 'MMMM d, yyyy h:mm a')}
              </Link>
            </CardContent>
          </Card>
        )}

        <Dialog open={isSetNextAppointmentOpen} onOpenChange={setIsSetNextAppointmentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set Next Appointment</DialogTitle>
            </DialogHeader>
            <AddAppointmentForm
              patientId={appointment.patient_id.toString()}
              doctorId={appointment.doctor_id.toString()}
              onSuccess={() => {
                setIsSetNextAppointmentOpen(false)
                // Optionally, refresh the appointments list or add other logic here
              }}
            />
          </DialogContent>
        </Dialog>

        <div className="mt-4 space-x-2">
          <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Reschedule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogDescription>
                  Please select a new date and time for this appointment.
                </DialogDescription>
              </DialogHeader>
              <AddAppointmentForm 
                initialData={appointment} 
                mode="reschedule"
                onSuccess={(newDate) => {
                  if (!newDate || !appointment) return;
                  setAppointment({
                    ...appointment,
                    date: newDate.toISOString()
                  });
                  setIsRescheduleDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Cancel Appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Appointment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={closeCancelDialog}>No, keep appointment</Button>
                <Button variant="destructive" onClick={handleCancelAppointment}>Yes, cancel appointment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppointmentErrorBoundary>
    </div>
  )
}