'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/lib/supabase'
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface DoctorsContentProps {
  onAddDoctor?: () => void;
}

export default function DoctorsContent({ onAddDoctor }: DoctorsContentProps) {
  const { supabase } = useSupabase()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchDoctors = async () => {
    if (!supabase) return

    setIsLoading(true)
    try {
      console.log('Fetching doctors...')
      let query = supabase.from('doctors').select('*')
      
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`)
      }
      
      const { data, error } = await query.order('last_name').limit(10)

      if (error) {
        console.error('Error fetching doctors:', error)
      } else {
        console.log('Fetched doctors:', data)
        setDoctors(data)
      }
    } catch (error) {
      console.error('Error in fetchDoctors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [supabase, searchTerm])

  if (isLoading) {
    return <div className="p-4">Loading doctors...</div>
  }

  return (
    <div className="p-4">
      <Input
        type="text"
        placeholder="Search doctors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {doctors.length === 0 ? (
        <div className="text-center mt-8">
          <p className="mb-4">No doctors found.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doctor: any) => (
            <li key={doctor.id}>
              <Link href={`/doctors/${doctor.id}`}>
                <Button variant="ghost" className="w-full justify-start">
                  Dr. {doctor.first_name} {doctor.last_name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {onAddDoctor && (
        <Button onClick={onAddDoctor} className="w-full mb-4">Add New Doctor</Button>
      )}
    </div>
  )
}