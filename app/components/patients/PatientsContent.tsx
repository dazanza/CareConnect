'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface PatientsContentProps {
  onAddPatient?: () => void;
}

export default function PatientsContent({ onAddPatient }: PatientsContentProps) {
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
      
      const { data, error } = await query.order('name').limit(10)

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
    return <div className="p-4">Loading patients...</div>
  }

  return (
    <div className="p-4">
      <Input
        type="text"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {patients.length === 0 ? (
        <div className="text-center mt-8">
          <p className="mb-4">No patients found.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {patients.map((patient: any) => (
            <li key={patient.id}>
              <Link href={`/patients/${patient.id}`}>
                <Button variant="ghost" className="w-full justify-start">
                  {patient.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {onAddPatient && (
        <Button onClick={onAddPatient} className="w-full mb-4">Add New Patient</Button>
      )}
    </div>
  )
}