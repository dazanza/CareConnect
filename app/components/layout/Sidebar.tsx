'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Stethoscope, Calendar, PlusCircle, UserPlus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PatientsContent from '@/app/components/patients/PatientsContent'
import AddPatientForm from '@/app/components/AddPatientForm'

const navItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Doctors', icon: Stethoscope, href: '/doctors' },
  { name: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
  { name: 'Prescriptions', icon: PlusCircle, href: '/dashboard/prescriptions' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [isAddLogOpen, setIsAddLogOpen] = useState(false)

  const handleMouseEnter = (name: string) => {
    setActivePanel(name)
  }

  const handleMouseLeave = () => {
    setActivePanel(null)
  }

  return (
    <div className="flex">
      <aside className="w-64 border-r bg-white">
        <nav className="mt-6">
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
          
          <div className="mt-6 border-t pt-6">
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
                {/* Add Doctor form component here */}
                <p>Add Doctor form to be implemented</p>
              </DialogContent>
            </Dialog>

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
                {/* Add Log form component here */}
                <p>Add Log form to be implemented</p>
              </DialogContent>
            </Dialog>
          </div>
        </nav>
      </aside>
      {activePanel === 'Patients' && (
        <div 
          className="w-64 border-r bg-white shadow-lg"
          onMouseEnter={() => handleMouseEnter('Patients')}
          onMouseLeave={handleMouseLeave}
        >
          <PatientsContent onAddPatient={() => setIsAddPatientOpen(true)} />
        </div>
      )}
    </div>
  )
}