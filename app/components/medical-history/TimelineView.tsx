/**
 * TimelineView Component
 * 
 * A comprehensive timeline view that displays medical events in chronological order.
 * Supports filtering, searching, and date range selection.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Stethoscope, 
  Filter,
  Search
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
import { getPatientTimeline } from '@/app/lib/timeline-service'
import { format, startOfDay, endOfDay, subDays, addDays, isToday, isYesterday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { debounce } from 'lodash'

/**
 * Interface for component props
 * @param patientId - Optional ID to show events for a specific patient
 * @param events - Optional pre-fetched events array
 * @param showPatientName - Whether to display patient names in events
 */
interface TimelineViewProps {
  patientId?: number  // Optional now since we might show multiple patients
  events?: TimelineEvent[]  // Optional events array
  showPatientName?: boolean  // Whether to show patient name in events
}

/**
 * Mapping of event types to their corresponding icons
 */
const eventIcons = {
  appointment: Calendar,
  prescription: Pill,
  vitals: Activity,
  lab_result: FileText,
  note: Stethoscope,
}

/**
 * Mapping of event types to their background colors
 */
const eventColors = {
  appointment: 'bg-blue-500',
  prescription: 'bg-purple-500',
  vitals: 'bg-green-500',
  lab_result: 'bg-orange-500',
  note: 'bg-gray-500',
}

/**
 * Helper function to group events by date
 * @param events - Array of timeline events
 * @returns Record with dates as keys and arrays of events as values
 */
function groupEventsByDate(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  return events.reduce((groups, event) => {
    const date = format(new Date(event.date), 'yyyy-MM-dd')
    return {
      ...groups,
      [date]: [...(groups[date] || []), event]
    }
  }, {} as Record<string, TimelineEvent[]>)
}

/**
 * Helper function to format date headers with relative dates (Today, Yesterday)
 * @param dateStr - Date string to format
 * @returns Formatted date string
 */
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

/**
 * TimelineView Component
 * Displays a filterable, searchable timeline of medical events
 */
export function TimelineView({ patientId, events: initialEvents, showPatientName = false }: TimelineViewProps) {
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['appointment', 'prescription', 'vitals', 'lab_result', 'note'])
  )
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [isLoading, setIsLoading] = useState(!initialEvents)

  const fetchTimelineEvents = useCallback(async () => {
    // If events are provided, use those instead of fetching
    if (initialEvents) {
      setEvents(initialEvents)
      return
    }

    if (!supabase || !patientId) return;
    try {
      setIsLoading(true)
      const data = await getPatientTimeline(supabase, patientId, {
        types: Array.from(selectedTypes),
        startDate: startOfDay(dateRange.from),
        endDate: endOfDay(dateRange.to)
      })
      setEvents(data)
    } catch (error) {
      console.error('Error fetching timeline:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, patientId, selectedTypes, dateRange, initialEvents])

  useEffect(() => {
    fetchTimelineEvents()
  }, [fetchTimelineEvents])

  // Update events when initialEvents changes
  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents)
    }
  }, [initialEvents])

  // Filter events based on search query
  useEffect(() => {
    const filtered = events.filter(event => {
      const searchString = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(searchString) ||
        (event.description?.toLowerCase().includes(searchString)) ||
        (event.metadata && Object.values(event.metadata).some(value => 
          value?.toString().toLowerCase().includes(searchString)
        ))
      )
    })
    setFilteredEvents(filtered)
  }, [events, searchQuery])

  const toggleEventType = (type: string) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }

  const handleQuickDateSelect = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date()
    })
  }

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value)
  }, 300)

  const groupedEvents = groupEventsByDate(filteredEvents)
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Medical Timeline</h2>
        {!initialEvents && ( // Only show filters if we're fetching our own events
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search timeline..."
                className="pl-8"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect(7)}
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect(30)}
            >
              Last 30 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect(90)}
            >
              Last 90 days
            </Button>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Events
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="relative">
              <div className="sticky top-0 z-10 mb-4 ml-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {formatDateHeader(date)}
                </h3>
              </div>
              <div className="space-y-6">
                {groupedEvents[date].map((event) => {
                  const Icon = eventIcons[event.type]
                  return (
                    <TimelineEventCard
                      key={event.id}
                      event={event}
                      icon={<Icon className="w-5 h-5" />}
                      colorClass={eventColors[event.type]}
                      showPatientName={showPatientName}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
