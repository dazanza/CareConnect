'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import PatientList from '@/app/components/patients/PatientList'
import PatientSearch from '@/app/components/patients/PatientSearch'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AddPatientForm from '@/app/components/AddPatientForm'

export default function PatientsContent() {
  const { supabase, isLoading: isSupabaseLoading } = useSupabase()
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)

  const fetchPatients = async () => {
    if (isSupabaseLoading || !supabase) return

    setIsLoading(true)
    try {
      let query = supabase.from('patients').select('*')
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      
      const { data, error } = await query.order('name')

      if (error) {
        console.error('Error fetching patients:', error)
      } else {
        setPatients(data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isSupabaseLoading) {
      fetchPatients()
    }
  }, [supabase, searchTerm, isSupabaseLoading])

  const handleAddPatientSuccess = () => {
    setIsAddPatientOpen(false)
    fetchPatients()
  }

  if (isSupabaseLoading || isLoading) {
    return <div>Loading patients...</div>
  }

  return (
    <div>
      <PatientSearch onSearch={setSearchTerm} />
      {patients.length === 0 ? (
        <div className="text-center mt-8">
          <p className="mb-4">No patients found. Would you like to add a new patient?</p>
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 text-white p-2 rounded">Add New Patient</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <AddPatientForm onSuccess={handleAddPatientSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          <PatientList patients={patients} />
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 text-white p-2 rounded mt-4">Add New Patient</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <AddPatientForm onSuccess={handleAddPatientSuccess} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}