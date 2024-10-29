'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from '@/app/components/ui/error-boundary'
import { DataLoadingState } from '@/app/components/ui/loading-states'
import { handleError } from '@/app/lib/errorHandling'
import { useAuth } from '@clerk/nextjs'
import { fetchDoctors } from '@/app/lib/dataFetching'

interface DoctorsContentProps {
  onAddDoctor?: () => void;
}

export default function DoctorsContent({ onAddDoctor }: DoctorsContentProps) {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!supabase || !userId) return

    async function loadDoctors() {
      console.log('Starting to load doctors...')
      try {
        setIsLoading(true)
        const data = await fetchDoctors(supabase, { 
          searchTerm,
          limit: 10,
          userId
        })
        console.log('Doctors loaded:', data)
        setDoctors(data)
      } catch (error) {
        handleError(error, 'DoctorsContent')
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctors()
  }, [supabase, searchTerm, userId])

  if (isLoading) {
    return <DataLoadingState isLoading={true} isEmpty={false}>Loading...</DataLoadingState>
  }

  return (
    <ErrorBoundary>
      <div className="p-4">
        <Input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <DataLoadingState
          isLoading={isLoading}
          isEmpty={doctors.length === 0}
          emptyMessage="No doctors found"
        >
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
        </DataLoadingState>
        {onAddDoctor && (
          <Button onClick={onAddDoctor} className="w-full mb-4">
            Add New Doctor
          </Button>
        )}
      </div>
    </ErrorBoundary>
  )
}
