'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, ChevronLeft, MapPin, PlusCircle, RefreshCw, X, FileText, Paperclip, FileUp, Phone, Mail, ArrowRight, UserMinus, Cake, Thermometer, Droplet, Heart, Wind, Pill, Edit, Trash } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

const moodEmojis = [
  { emoji: '😄', label: 'Happy', color: 'bg-[#32CD32]' },
  { emoji: '😊', label: 'Satisfied', color: 'bg-[#FFD700]' },
  { emoji: '😐', label: 'Neutral', color: 'bg-[#D3D3D3]' },
  { emoji: '😔', label: 'Slightly Unhappy', color: 'bg-[#FFA500]' },
  { emoji: '😡', label: 'Angry', color: 'bg-[#FF4500]' },
]

export function PatientDetails() {
  const [sortBy, setSortBy] = useState<'specialty' | 'lastName'>('specialty')
  const [assignedDoctors, setAssignedDoctors] = useState([
    { id: 1, name: 'Dr. Sarah Smith', specialty: 'Cardiologist' },
    { id: 2, name: 'Dr. Michael Johnson', specialty: 'Endocrinologist' },
    { id: 3, name: 'Dr. Alice Lee', specialty: 'Primary Care Physician' },
    { id: 4, name: 'Dr. Robert Brown', specialty: 'Neurologist' },
    { id: 5, name: 'Dr. Emily Chen', specialty: 'Dermatologist' },
  ])
  const [currentMood, setCurrentMood] = useState(moodEmojis[2])
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  const patient = {
    id: '1',
    name: 'John Doe',
    birthdate: new Date(1980, 4, 15), // May 15, 1980
    address: '123 Main St, Anytown, USA 12345',
    phone: '(123) 456-7890',
    email: 'john.doe@example.com',
  }

  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: 'Lisinopril 10mg', dosage: '1 pill daily' },
    { id: 2, name: 'Metformin 500mg', dosage: '2 pills twice daily' },
    { id: 3, name: 'Atorvastatin 20mg', dosage: '1 pill at bedtime' },
  ])

  const appointments = [
    { id: 1, doctor: 'Dr. Smith', specialty: 'Cardiologist', purpose: 'Follow-up', date: new Date(2024, 8, 30), time: '10:00 AM', isUpcoming: true },
    { id: 2, doctor: 'Dr. Johnson', specialty: 'Endocrinologist', purpose: 'Routine Check', date: new Date(2024, 9, 15), time: '2:30 PM', isUpcoming: true },
    { id: 3, doctor: 'Dr. Lee', specialty: 'Primary Care', purpose: 'Annual Physical', date: new Date(2024, 7, 10), time: '9:00 AM', isUpcoming: false },
    { id: 4, doctor: 'Dr. Smith', specialty: 'Cardiologist', purpose: 'Echocardiogram', date: new Date(2024, 6, 22), time: '11:30 AM', isUpcoming: false },
  ]

  const todos = [
    { id: 1, text: 'Schedule follow-up blood test as recommended by Dr. Lee', completed: false },
    { id: 2, text: 'Fill new prescription for blood pressure medication', completed: false },
    { id: 3, text: 'Record daily blood pressure readings for next cardiology appointment', completed: false },
  ]

  const recentDocuments = [
    { id: 1, name: 'Blood Test Results.pdf', url: '#', uploadDate: 'May 15, 2023' },
    { id: 2, name: 'Cardiology Report.pdf', url: '#', uploadDate: 'April 25, 2023' },
    { id: 3, name: 'MRI Scan.pdf', url: '#', uploadDate: 'March 30, 2023' },
    { id: 4, name: 'Prescription History.pdf', url: '#', uploadDate: 'February 15, 2023' },
    { id: 5, name: 'Annual Physical Report.pdf', url: '#', uploadDate: 'January 5, 2023' },
  ]

  const recentNotes = [
    { id: 1, appointmentId: 3, doctor: 'Dr. Lee', date: new Date(2024, 7, 10), purpose: 'Annual Physical', note: 'Patient reports feeling well. Blood pressure is within normal range. Recommended to continue current medication regimen.' },
    { id: 2, appointmentId: 4, doctor: 'Dr. Smith', date: new Date(2024, 6, 22), purpose: 'Echocardiogram', note: 'Echocardiogram results show slight improvement in heart function. Advised patient to maintain current exercise routine and follow up in 3 months.' },
  ]

  const timelineItems = [
    { id: 1, title: "Cardiology Follow-up", date: "June 15, 2023", time: "10:00 AM", description: "Appointment with Dr. Smith to discuss recent test results and adjust treatment plan if necessary.", mood: "😊" },
    { id: 2, title: "Prescription Refill", date: "June 1, 2023", time: "", description: "Monthly refill of Lisinopril 10mg (blood pressure medication).", mood: "😐" },
    { id: 3, title: "Annual Physical", date: "May 10, 2023", time: "9:00 AM", description: "Routine annual physical examination and health check-up with Dr. Lee.", mood: "😄" },
    { id: 4, title: "Echocardiogram", date: "April 22, 2023", time: "11:30 AM", description: "Diagnostic test with Dr. Smith to evaluate heart function and structure.", mood: "😔" },
  ]

  const vitals = {
    bloodPressure: '140/90 mmHg',
    bloodSugar: '130 mg/dL',
    temperature: '99.5°F',
    bloodOxygen: '94%',
  }

  const vitalWarnings = {
    bloodPressure: parseInt(vitals.bloodPressure.split('/')[0]) > 130 || parseInt(vitals.bloodPressure.split('/')[1]) > 80,
    bloodSugar: parseInt(vitals.bloodSugar) > 125,
    temperature: parseFloat(vitals.temperature) > 99.0,
    bloodOxygen: parseInt(vitals.bloodOxygen) < 95,
  }

  const sortedDoctors = [...assignedDoctors].sort((a, b) => {
    if (sortBy === 'specialty') {
      return a.specialty.localeCompare(b.specialty)
    } else {
      const aLastName = a.name.split(' ').pop() || ''
      const bLastName = b.name.split(' ').pop() || ''
      return aLastName.localeCompare(bLastName)
    }
  })

  const removeDoctor = (id: number) => {
    setAssignedDoctors(assignedDoctors.filter(doctor => doctor.id !== id))
  }

  const formatBirthdate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatAppointmentDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const addPrescription = (name: string, dosage: string) => {
    setPrescriptions([...prescriptions, { id: Date.now(), name, dosage }])
  }

  const removePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter(prescription => prescription.id !== id))
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="container mx-auto bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Link href="/patients" className="inline-flex items-center text-white hover:underline transition-colors duration-200">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Patients
            </Link>
            <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
              <PlusCircle className="w-4 h-4 mr-1" />
              New Log
            </Button>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
              <div className="flex items-center mt-2 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{patient.address}</span>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Cake className="w-4 h-4 mr-1" />
                <span>{formatBirthdate(patient.birthdate)}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-xl font-medium flex items-center justify-end">
                <Phone className="w-4 h-4 mr-1" />
                {patient.phone}
              </p>
              <p className="text-lg flex items-center justify-end">
                <Mail className="w-4 h-4 mr-1" />
                {patient.email}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-blue-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`bg-white shadow-md ${currentMood.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-blue-800">Vitals & Mood</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-black" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Pressure</p>
                      <p className="font-medium">{vitals.bloodPressure}</p>
                    </div>
                    {vitalWarnings.bloodPressure && (
                      <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Droplet className="w-5 h-5 mr-2 text-black" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Sugar</p>
                      <p className="font-medium">{vitals.bloodSugar}</p>
                    </div>
                    {vitalWarnings.bloodSugar && (
                      <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Thermometer className="w-5 h-5 mr-2 text-black" />
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="font-medium">{vitals.temperature}</p>
                    </div>
                    {vitalWarnings.temperature && (
                      <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Wind className="w-5 h-5 mr-2 text-black" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Oxygen</p>
                      <p className="font-medium">{vitals.bloodOxygen}</p>
                    </div>
                    {vitalWarnings.bloodOxygen && (
                      <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Today's Mood</p>
                  <div className="flex justify-between">
                    {moodEmojis.map((mood) => (
                      <button
                        key={mood.label}
                        onClick={() => setCurrentMood(mood)}
                        className={`text-3xl ${currentMood.label === mood.label ? 'opacity-100' : 'opacity-50'}`}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Add Readings</Button>
                  <Link href="/patient/vitals-tracking" passHref>
                    <Button variant="outline" className="flex-1">Track Over Time</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-blue-800">To-Do List</CardTitle>
                  <Button variant="ghost" onClick={() => setShowPrescriptionModal(true)}>
                    <Pill className="w-4 h-4 mr-2" />
                    Prescriptions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Add a new todo"
                      className="flex-grow mr-2"
                    />
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Add</Button>
                  </div>
                  <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {todos.map(todo => (
                      <li key={todo.id} className="flex items-center text-base">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          className="mr-2 w-4 h-4 text-blue-500 focus:ring-blue-400"
                        />
                        <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}>{todo.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-white shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-blue-800">Appointments</CardTitle>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Calendar
                      mode="multiple"
                      selected={appointments.map(apt => apt.date)}
                      className="w-full"
                    />
                  </div>
                  <div className="pl-0 md:pl-4">
                    <ul className="space-y-4">
                      {appointments.map(appointment => (
                        <li key={appointment.id} className="flex justify-between items-center hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                          <Link href={`/appointments/${appointment.id}`} className="flex-grow">
                            <div>
                              <p className="font-medium">{`${appointment.purpose} with ${appointment.doctor}`}</p>
                              <p className="text-sm text-muted-foreground">{`${formatAppointmentDate(appointment.date)} at ${appointment.time}`}</p>
                            </div>
                          </Link>
                          {appointment.isUpcoming && (
                            <div className="flex space-x-2">
                              <Button size="icon" variant="outline" className="h-8 w-8 bg-white hover:bg-gray-100 text-blue-600 border-blue-600">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-8 w-8 bg-white hover:bg-gray-100 text-red-600 border-red-600">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-blue-800">Recent Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-4">
                  {recentNotes.map(note => (
                    <li key={note.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{`${note.purpose} with ${note.doctor} on ${formatAppointmentDate(note.date)}`}</p>
                        </div>
                        <Link href={`/appointments/${note.appointmentId}`}>
                          <Button variant="link" className="text-blue-600 hover:text-blue-800">
                            View Appointment
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <p className="text-sm">{note.note}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-blue-800">Assigned Doctors</CardTitle>
                  <Select value={sortBy} onValueChange={(value: 'specialty' | 'lastName') => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specialty">Sort by Specialty</SelectItem>
                      <SelectItem value="lastName">Sort by Last Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {sortedDoctors.slice(0, 4).map(doctor => (
                    <li key={doctor.id} className="flex items-center justify-between space-x-2 p-2 hover:bg-gray-100 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={doctor.name} />
                          <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeDoctor(doctor.id)}
                        className="rounded-full bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700 border-red-200"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-blue-800">Patient Documents</CardTitle>
                <CardDescription>Recent documents and file upload</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Recent Documents</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
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
                      <Link href={`/patients/${patient.id}/documents`} className="inline-flex items-center text-blue-600 hover:underline text-base transition-colors duration-200">
                        <Paperclip className="w-5 h-5 mr-2" />
                        View All Documents
                      </Link>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload New Document</h3>
                    <label className="flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-700 rounded-lg shadow-inner border border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors duration-200">
                      <FileUp className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload or drag and drop</span>
                      <Input
                        type="file"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-blue-800">Patient Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ol className="relative border-l border-gray-200 dark:border-gray-700">
                  {timelineItems.map((item, index) => (
                    <li key={item.id} className="mb-10 ml-4">
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-blue-700"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{item.date} {item.time && `at ${item.time}`}</time>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{item.description}</p>
                      <span className="text-2xl">{item.mood}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Schedule</DialogTitle>
            <DialogDescription>
              Manage your prescriptions and dosages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{prescription.name}</p>
                  <p className="text-sm text-gray-500">{prescription.dosage}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removePrescription(prescription.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              addPrescription("New Medication", "1 pill daily")
            }}>
              Add Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}