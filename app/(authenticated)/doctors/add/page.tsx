'use client'

import { useRouter } from 'next/navigation'
import AddDoctorForm from '@/app/components/AddDoctorForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { appNavigation } from '@/app/lib/navigation'

export default function AddDoctorPage() {
  const router = useRouter()

  const handleBackClick = () => {
    appNavigation.goBack(router, '/doctors')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBackClick} className="mb-4">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Doctors
      </Button>
      <h1 className="text-3xl font-bold mb-6">Add New Doctor</h1>
      <AddDoctorForm />
    </div>
  )
}