'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { 
  Home, 
  Users, 
  Stethoscope, 
  Calendar, 
  PlusCircle, 
  FileText, 
  CalendarDays, 
  ClipboardList,
  Settings,
  LayoutDashboard,
  ChevronRight,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import PatientsContent from '@/app/components/patients/PatientsContent'
import DoctorsContent from '@/app/components/doctors/DoctorsContent'
import AddPatientForm from '@/app/components/AddPatientForm'
import AddDoctorForm from '@/app/components/AddDoctorForm'
import { AddAppointmentForm } from '@/app/components/AddAppointmentForm'
import AddLogForm from '@/app/components/AddLogForm'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar"
import { cn } from '@/lib/utils'

export default function AppSidebar() {
  const pathname = usePathname()
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [isAddLogOpen, setIsAddLogOpen] = useState(false)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <SidebarProvider defaultOpen>
      <div className="w-60 h-screen">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="border-b border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-xl text-blue-600">CareConnect</span>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton 
                    isActive={pathname === '/dashboard'}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-blue-50 hover:text-blue-600",
                      pathname === '/dashboard' && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <Collapsible
                open={openItem === 'patients'}
                onOpenChange={() => setOpenItem(openItem === 'patients' ? null : 'patients')}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    isActive={pathname === '/patients'}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-blue-50 hover:text-blue-600",
                      pathname === '/patients' && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Patients</span>
                    <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${openItem === 'patients' ? 'rotate-90' : ''}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-4 pr-2 py-2 mt-1 bg-blue-50/50 rounded-md">
                    <PatientsContent />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={openItem === 'doctors'}
                onOpenChange={() => setOpenItem(openItem === 'doctors' ? null : 'doctors')}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    isActive={pathname === '/doctors'}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-blue-50 hover:text-blue-600",
                      pathname === '/doctors' && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span>Doctors</span>
                    <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${openItem === 'doctors' ? 'rotate-90' : ''}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-4 pr-2 py-2 mt-1 bg-blue-50/50 rounded-md">
                    <DoctorsContent />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <SidebarMenuItem>
                <Link href="/appointments" passHref>
                  <SidebarMenuButton 
                    isActive={pathname === '/appointments'}
                    tooltip="Appointments"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Appointments</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/prescriptions" passHref>
                  <SidebarMenuButton 
                    isActive={pathname === '/prescriptions'}
                    tooltip="Prescriptions"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Prescriptions</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarGroup className="mt-auto border-t border-border">
            <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-muted-foreground">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 p-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsAddAppointmentOpen(true)}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Add Appointment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsAddPatientOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsAddDoctorOpen(true)}
                >
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Add Doctor
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsAddLogOpen(true)}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Add Log
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/settings" passHref>
                    <SidebarMenuButton 
                      isActive={pathname === '/settings'}
                      tooltip="Settings"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
      </div>

      {/* Dialogs */}
      <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <AddAppointmentForm onSuccess={() => setIsAddAppointmentOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <AddPatientForm onSuccess={() => setIsAddPatientOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the doctor's information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <AddDoctorForm onSuccess={() => setIsAddDoctorOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Log</DialogTitle>
            <DialogDescription>
              Create a new log entry by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <AddLogForm onSuccess={() => setIsAddLogOpen(false)} />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}