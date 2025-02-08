/**
 * DashboardTimeline Component
 * 
 * A dashboard widget that displays a timeline of medical events for all patients
 * under a user's care. Supports viewing events in aggregate or grouped by patient.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { useSupabase } from '@/app/hooks/useSupabase'
import { TimelineView } from './TimelineView'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ErrorBoundary, withErrorBoundary } from '@/components/ui/error-boundary'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Props for the DashboardTimeline component
 * @param userId - The ID of the currently logged-in user
 */
interface DashboardTimelineProps {
  userId: string
}

function DashboardTimelineComponent({ userId }: DashboardTimelineProps) {
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'all' | 'by-patient'>('all')

  /**
   * Fetches timeline events for all patients under the user's care
   * This includes both directly assigned patients and shared patients
   */
  const fetchAllEvents = useCallback(async () => {
    if (!supabase || !userId) {
      throw new Error('Missing required dependencies for fetching events')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // First get all patients under user's care
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id')
        .or(`user_id.eq.${userId},patient_shares.shared_with_user_id.eq.${userId}`)
        .order('id')

      if (patientsError) throw patientsError

      if (!patients?.length) {
        setEvents([])
        return
      }

      // Then fetch timeline events for all these patients
      const { data: timelineEvents, error: eventsError } = await supabase
        .from('timeline_events')
        .select(`
          *,
          patients!inner (
            id,
            first_name,
            last_name
          )
        `)
        .in('patient_id', patients.map(p => p.id))
        .order('date', { ascending: false })
        .limit(100)

      if (eventsError) throw eventsError

      setEvents(timelineEvents)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch timeline events'
      setError(message)
      throw new Error(message) // This will be caught by the error boundary
    } finally {
      setIsLoading(false)
    }
  }, [supabase, userId])

  // Fetch events on component mount and when dependencies change
  useEffect(() => {
    fetchAllEvents()
  }, [fetchAllEvents])

  // Group events by patient for the by-patient view
  const eventsByPatient = events.reduce((groups, event) => {
    const patientId = event.patient_id
    return {
      ...groups,
      [patientId]: [...(groups[patientId] || []), event]
    }
  }, {} as Record<number, TimelineEvent[]>)

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Medical Timeline</CardTitle>
          <Tabs value={view} onValueChange={(v) => setView(v as 'all' | 'by-patient')}>
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="by-patient">By Patient</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : view === 'all' ? (
          <TimelineView events={events} showPatientName />
        ) : (
          <div className="space-y-8">
            {Object.entries(eventsByPatient).map(([patientId, patientEvents]) => {
              const patient = patientEvents[0]?.patients
              if (!patient) return null

              return (
                <div key={patientId} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <TimelineView events={patientEvents} />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Wrap with error boundary and export
const WrappedDashboardTimeline = withErrorBoundary(
  DashboardTimelineComponent,
  <Alert variant="destructive">
    <AlertDescription>
      Failed to load dashboard timeline. Please try refreshing the page.
    </AlertDescription>
  </Alert>,
  () => window.location.reload()
)

export { WrappedDashboardTimeline as DashboardTimeline } 