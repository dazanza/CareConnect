'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Stethoscope, Calendar, PlusCircle, UserPlus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PatientsContent from '@/app/components/patients/PatientsContent'
import DoctorsContent from '@/app/components/doctors/DoctorsContent'
import AddPatientForm from '@/app/components/AddPatientForm'
import AddDoctorForm from '@/app/components/AddDoctorForm'
import AddAppointmentForm from '@/app/components/AddAppointmentForm'
import AddLogForm from '@/app/components/AddLogForm'

// Define navigation items for the sidebar
const navItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Doctors', icon: Stethoscope, href: '/doctors' },
  { name: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
  { name: 'Prescriptions', icon: PlusCircle, href: '/dashboard/prescriptions' },
]

export default function Sidebar() {
  const pathname = usePathname()
  // State to manage active panel and dialog open states
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [isAddLogOpen, setIsAddLogOpen] = useState(false)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)

  // Handlers for mouse enter and leave events to show/hide panels
  const handleMouseEnter = (name: string) => {
    setActivePanel(name)
  }

  const handleMouseLeave = () => {
    setActivePanel(null)
  }

  return (
    <div className="relative">
      <aside className="bg-gray-100 w-64 min-h-screen p-4">
        <nav className="mt-6">
          {/* Render navigation items */}
          {navItems.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              <Link href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start px-4 py-2 text-sm"
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            </div>
          ))}
          
          {/* Quick action buttons */}
          <div className="mt-6 border-t pt-6">
            {/* Add Patient Dialog */}
            <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start px-4 py-2 text-sm mb-2">
                  <UserPlus className="mr-3 h-4 w-4" />
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

            {/* Add Doctor Dialog */}
            <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start px-4 py-2 text-sm mb-2">
                  <Stethoscope className="mr-3 h-4 w-4" />
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

            {/* Add Log Dialog */}
            <Dialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start px-4 py-2 text-sm">
                  <FileText className="mr-3 h-4 w-4" />
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
        </nav>
        
        {/* Add Appointment Button */}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setIsAddAppointmentOpen(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Add Appointment
          </Button>
        </div>

        {/* Add Appointment Dialog */}
        <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <AddAppointmentForm onSuccess={() => setIsAddAppointmentOpen(false)} />
          </DialogContent>
        </Dialog>
      </aside>

      {/* Sliding panels */}
      <div 
        className={`absolute top-0 left-64 h-full transition-transform duration-300 ease-in-out transform ${
          activePanel ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Conditional rendering of Patients panel */}
        {activePanel === 'Patients' && (
          <div 
            className="w-64 h-full bg-white shadow-lg"
            onMouseEnter={() => handleMouseEnter('Patients')}
            onMouseLeave={handleMouseLeave}
          >
            <PatientsContent onAddPatient={() => setIsAddPatientOpen(true)} />
          </div>
        )}
        {/* Conditional rendering of Doctors panel */}
        {activePanel === 'Doctors' && (
          <div 
            className="w-64 h-full bg-white shadow-lg"
            onMouseEnter={() => handleMouseEnter('Doctors')}
            onMouseLeave={handleMouseLeave}
          >
            <DoctorsContent onAddDoctor={() => setIsAddDoctorOpen(true)} />
          </div>
        )}
      </div>
    </div>
  )
}