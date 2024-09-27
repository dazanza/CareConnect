'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Stethoscope, Calendar, PlusCircle, UserPlus, FileText, CalendarDays, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PatientsContent from '@/app/components/patients/PatientsContent'
import DoctorsContent from '@/app/components/doctors/DoctorsContent'
import AddPatientForm from '@/app/components/AddPatientForm'
import AddDoctorForm from '@/app/components/AddDoctorForm'
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import AddLogForm from '@/app/components/AddLogForm'

// Define navigation items for the sidebar
const navItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Doctors', icon: Stethoscope, href: '/doctors' },
  { name: 'Appointments', icon: Calendar, href: '/appointments' },
  { name: 'Prescriptions', icon: PlusCircle, href: '/prescriptions' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [isAddLogOpen, setIsAddLogOpen] = useState(false)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)

  const handleMouseEnter = (name: string) => {
    setActivePanel(name)
  }

  const handleMouseLeave = () => {
    setActivePanel(null)
  }

  return (
    <aside className="w-full lg:w-64 bg-white shadow-md">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600">CareConnect</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className={`block px-4 py-2 ${pathname === item.href ? 'text-blue-600 bg-blue-100 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-6 px-4 space-y-2">
        <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
              <CalendarDays className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <AddAppointmentForm onSuccess={() => setIsAddAppointmentOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full text-blue-600 hover:bg-blue-50">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <AddPatientForm onSuccess={() => setIsAddPatientOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full text-blue-600 hover:bg-blue-50">
              <Stethoscope className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <AddDoctorForm onSuccess={() => setIsAddDoctorOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full text-blue-600 hover:bg-blue-50">
              <ClipboardList className="mr-2 h-4 w-4" />
              Add Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Log</DialogTitle>
            </DialogHeader>
            <AddLogForm onSuccess={() => setIsAddLogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  )
}