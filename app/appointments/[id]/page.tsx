'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Appointment } from '@/types'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon, Paperclip as PaperclipIcon, Mic as MicIcon, FileText as FileTextIcon } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

export default function AppointmentDetailsPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [notes, setNotes] = useState('')
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [prevAppointment, setPrevAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [medicalFiles, setMedicalFiles] = useState<{ id: number; file_name: string; file_url: string; file_type: string | null; notes: string | null }[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    async function fetchAppointmentDetails() {
      if (!supabase || !id) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patients (id, name),
            doctors (id, first_name, last_name)
          `)
          .eq('id', id)
          .single()

        if (error) throw error

        setAppointment(data)
        setNotes(data.notes || '')

        // Fetch previous appointment
        const { data: prevData } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', data.doctor_id)
          .lt('date', data.date)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        setPrevAppointment(prevData)

        // Fetch todos
        const { data: todosData } = await supabase
          .from('todos')
          .select('*')
          .eq('appointment_id', id)

        setTodos(todosData || [])
      } catch (error) {
        console.error('Error fetching appointment details:', error)
      } finally {
        setIsLoading(false)
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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        setNotes(prevNotes => prevNotes + ' ' + transcript)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

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

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({ appointment_id: appointment.id, text: newTodo, completed: false })
        .select()
        .single()

      if (error) throw error
      setTodos([...todos, data])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const handleToggleTodo = async (todoId: number) => {
    if (!supabase) return

    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    )

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todos.find(t => t.id === todoId)?.completed })
        .eq('id', todoId)

      if (error) throw error
      setTodos(updatedTodos)
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabase || !appointment || !event.target.files) return

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
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

  if (isLoading) return <div>Loading...</div>
  if (!appointment) return <div>Appointment not found</div>

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
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
                    <p>{format(new Date(appointment.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <p>{format(new Date(appointment.date), 'h:mm a')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5" />
                    <p>{appointment.location}</p>
                  </div>
                  <p>
                    Patient: 
                    <Link href={`/patients/${appointment.patients?.id}`} className="text-blue-600 hover:underline ml-1">
                      {appointment.patients?.name}
                    </Link>
                  </p>
                  <p>
                    Doctor: 
                    <Link href={`/doctors/${appointment.doctors?.id}`} className="text-blue-600 hover:underline ml-1">
                      Dr. {appointment.doctors?.first_name} {appointment.doctors?.last_name}
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
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="New todo item"
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
                {format(new Date(prevAppointment.date), 'MMMM d, yyyy h:mm a')}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}