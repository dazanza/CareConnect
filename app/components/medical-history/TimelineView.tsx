'use client'

import { useState, useEffect } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Stethoscope, 
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { TimelineEventCard } from './TimelineEventCard'
import { useSupabase } from '@/app/hooks/useSupabase'
import { getPatientTimeline } from '@/lib/timeline-service'

interface TimelineViewProps {
  patientId: number
}

const eventIcons = {
  appointment: Calendar,
  prescription: Pill,
  vitals: Activity,
  lab_result: FileText,
  note: Stethoscope,
}

const eventColors = {
  appointment: 'bg-blue-500',
  prescription: 'bg-purple-500',
  vitals: 'bg-green-500',
  lab_result: 'bg-orange-500',
  note: 'bg-gray-500',
}

export function TimelineView({ patientId }: TimelineViewProps) {
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['appointment', 'prescription', 'vitals', 'lab_result', 'note'])
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (supabase && patientId) {
      fetchTimeline()
    }
  }, [supabase, patientId, selectedTypes])

  async function fetchTimeline() {
    try {
      setIsLoading(true)
      const data = await getPatientTimeline(supabase, patientId, {
        types: Array.from(selectedTypes)
      })
      setEvents(data)
    } catch (error) {
      console.error('Error fetching timeline:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEventType = (type: string) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Medical Timeline</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter Events
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={selectedTypes.has('appointment')}
              onCheckedChange={() => toggleEventType('appointment')}
            >
              Appointments
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedTypes.has('prescription')}
              onCheckedChange={() => toggleEventType('prescription')}
            >
              Prescriptions
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedTypes.has('vitals')}
              onCheckedChange={() => toggleEventType('vitals')}
            >
              Vitals
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedTypes.has('lab_result')}
              onCheckedChange={() => toggleEventType('lab_result')}
            >
              Lab Results
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedTypes.has('note')}
              onCheckedChange={() => toggleEventType('note')}
            >
              Notes
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {events.map((event) => {
            const Icon = eventIcons[event.type]
            return (
              <TimelineEventCard
                key={event.id}
                event={event}
                icon={<Icon className="w-5 h-5" />}
                colorClass={eventColors[event.type]}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
