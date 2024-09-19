'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AddPatientForm from '@/app/components/AddPatientForm'

export default function QuickActions() {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Add Patient</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <AddPatientForm onSuccess={() => setIsAddPatientOpen(false)} />
          </DialogContent>
        </Dialog>
        <Button className="w-full">Schedule Appointment</Button>
      </div>
    </div>
  )
}