'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Calendar, Clock, MapPin, FileUp, ChevronLeft, Mic, MicOff, FileText, Paperclip, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Appointment {
  id: string
  doctorName: string
  patientName: string
  date: string
  time: string
  location: string
  purpose: string
  notes: string
  previousAppointmentId?: string
}

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

interface Document {
  id: string
  name: string
  uploadDate: string
  url: string
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognitionInstance;
    };
  }
}

export function Page() {
  const { id } = useParams()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([])
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const handleAppointmentUpdate = useCallback(() => {
    if (!appointment) return;
    // ... existing logic ...
  }, [appointment])

  useEffect(() => {
    handleAppointmentUpdate()
  }, [handleAppointmentUpdate])

  useEffect(() => {
    // Fetch appointment data
    const fetchAppointment = async () => {
      // Simulating API call
      const response = await new Promise<Appointment>((resolve) => 
        setTimeout(() => resolve({
          id: id as string,
          doctorName: 'Dr. Jane Smith',
          patientName: 'John Doe',
          date: '2023-06-15',
          time: '02:30 PM',
          location: '123 Medical Center, City, State, ZIP',
          purpose: 'Annual Check-up',
          notes: '',
          previousAppointmentId: 'prev-123'
        }), 500)
      )
      setAppointment(response)
    }

    // Fetch todos
    const fetchTodos = async () => {
      // Simulating API call
      const response = await new Promise<TodoItem[]>((resolve) => 
        setTimeout(() => resolve([
          { id: '1', text: 'Bring medical records', completed: false },
          { id: '2', text: 'Fast for 12 hours before appointment', completed: true },
        ]), 500)
      )
      setTodos(response)
    }

    // Fetch recent documents
    const fetchRecentDocuments = async () => {
      // Simulating API call
      const response = await new Promise<Document[]>((resolve) => 
        setTimeout(() => resolve([
          { id: 'doc1', name: 'Blood Test Results', uploadDate: '2023-06-10', url: '/documents/blood-test.pdf' },
          { id: 'doc2', name: 'X-Ray Report', uploadDate: '2023-06-08', url: '/documents/x-ray.pdf' },
          { id: 'doc3', name: 'Prescription', uploadDate: '2023-06-05', url: '/documents/prescription.pdf' },
        ]), 500)
      )
      setRecentDocuments(response)
    }

    if (id) {
      fetchAppointment();
    }

    fetchTodos()
    fetchRecentDocuments()

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

        if (appointment) {
          setAppointment(prev => prev ? { ...prev, notes: prev.notes + ' ' + transcript } : null)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [id])

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (appointment) {
      setAppointment({ ...appointment, notes: e.target.value })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    console.log('File uploaded:', e.target.files)
  }

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now().toString(), text: newTodo, completed: false }])
      setNewTodo('')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsRecording(!isRecording)
  }

  if (!appointment) {
    return <div>Loading...</div>
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getDaysUntilAppointment = (dateString: string) => {
    const appointmentDate = new Date(dateString)
    const today = new Date()
    const diffTime = appointmentDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilAppointment = getDaysUntilAppointment(appointment.date)

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="container mx-auto bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl">
        <div className="bg-blue-600 text-white p-6">
          <Link href="/appointments" className="inline-flex items-center text-white hover:underline mb-4 transition-colors duration-200">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Appointments
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">{appointment.purpose} with {appointment.doctorName}</h1>
              <h2 className="text-xl font-semibold">{appointment.patientName}</h2>
              <div className="flex items-center mt-2 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{appointment.location}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-xl font-medium">{formatDate(appointment.date)}</p>
              <p className="text-lg">{appointment.time}</p>
              <p className="text-sm mt-1">in {daysUntilAppointment} days</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-white shadow-md">
              <CardHeader className="bg-blue-100">
                <CardTitle className="text-xl font-semibold flex items-center text-blue-800">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Textarea
                      placeholder="Add your notes here..."
                      value={appointment.notes}
                      onChange={handleNotesChange}
                      className="w-full h-64 mb-2 p-3 text-base pr-12 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                    <Button
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "secondary"}
                      size="icon"
                      className="absolute bottom-4 right-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                  {isRecording && <span className="text-sm text-blue-600">Recording...</span>}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => console.log("Set next appointment")}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Set Next Appointment
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="bg-blue-100">
                <CardTitle className="text-xl font-semibold text-blue-800">To-Do List</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="flex mb-4">
                  <Input
                    type="text"
                    placeholder="Add a new todo"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button onClick={handleAddTodo} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Add</Button>
                </div>
                <ul className="space-y-2">
                  {todos.map(todo => (
                    <li key={todo.id} className="flex items-center text-base">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="mr-2 w-4 h-4 text-blue-500 focus:ring-blue-400"
                      />
                      <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}>{todo.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-white shadow-md">
              <CardHeader className="bg-blue-100">
                <CardTitle className="text-xl font-semibold text-blue-800">Recent Documents</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentDocuments.map(doc => (
                    <li key={doc.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          {doc.name}
                        </a>
                        <p className="text-sm text-gray-500">Uploaded: {doc.uploadDate}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Link href={`/patients/${appointment.patientName}/documents`} className="inline-flex items-center text-blue-600 hover:underline text-base transition-colors duration-200">
                    <Paperclip className="w-5 h-5 mr-2" />
                    View All Documents
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="bg-blue-100">
                <CardTitle className="text-xl font-semibold text-blue-800">Upload Files</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <label className="flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg shadow-inner border border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors duration-200">
                  <FileUp className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Click to upload or drag and drop</span>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </CardContent>
            </Card>
          </div>

          {appointment.previousAppointmentId && (
            <div className="mt-6">
              <Link href={`/appointments/${appointment.previousAppointmentId}`} className="text-blue-600 hover:underline text-base transition-colors duration-200">
                View Previous Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}