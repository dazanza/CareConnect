'use client'

import { useRouter } from 'next/navigation'
import AddPatientForm from '@/app/components/AddPatientForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { appNavigation } from '@/app/lib/navigation'

export default function AddPatientPage() {
  const router = useRouter()

  const handleBackClick = () => {
    appNavigation.goBack(router, '/patients')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBackClick} className="mb-4">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Patients
      </Button>
      <h1 className="text-3xl font-bold mb-6">Add New Patient</h1>
      <AddPatientForm />
    </div>
  )
}