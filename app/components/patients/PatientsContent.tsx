'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import PatientList from '@/app/components/patients/PatientList'
import PatientSearch from '@/app/components/patients/PatientSearch'
import Link from 'next/link'

export default function PatientsContent() {
  const { supabase } = useSupabase()
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPatients = async () => {
    if (!supabase) return

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
    fetchPatients()
  }, [supabase, searchTerm])

  if (isLoading) {
    return <div>Loading patients...</div>
  }

  return (
    <div>
      <PatientSearch onSearch={setSearchTerm} />
      {patients.length === 0 ? (
        <div className="text-center mt-8">
          <p className="mb-4">No patients found. Would you like to add a new patient?</p>
          <Link href="/patients/add" className="bg-blue-500 text-white p-2 rounded">
            Add New Patient
          </Link>
        </div>
      ) : (
        <>
          <PatientList patients={patients} />
          <Link href="/patients/add" className="bg-green-500 text-white p-2 rounded mt-4 inline-block">
            Add New Patient
          </Link>
        </>
      )}
    </div>
  )
}