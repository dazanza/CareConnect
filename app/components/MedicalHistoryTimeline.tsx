'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, FileText, Pill, Stethoscope } from 'lucide-react'

interface MedicalEvent {
  id: string
  date: string
  type: 'appointment' | 'prescription' | 'diagnosis' | 'test'
  title: string
  description: string
  doctor: {
    id: string
    name: string
  }
}

interface MedicalHistoryTimelineProps {
  events: MedicalEvent[]
  className?: string
}

const eventIcons = {
  appointment: Stethoscope,
  prescription: Pill,
  diagnosis: Activity,
  test: FileText,
}

const eventColors = {
  appointment: 'bg-blue-100 text-blue-800',
  prescription: 'bg-green-100 text-green-800',
  diagnosis: 'bg-purple-100 text-purple-800',
  test: 'bg-orange-100 text-orange-800',
}

export function MedicalHistoryTimeline({ events, className }: MedicalHistoryTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Medical History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {sortedEvents.map((event) => {
              const Icon = eventIcons[event.type]
              return (
                <div key={event.id} className="relative pl-8 pb-8">
                  <div className="absolute left-0 top-0 h-full w-px bg-border">
                    <div className="absolute top-0 left-0 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-background bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <Badge variant="secondary" className={eventColors[event.type]}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-sm text-muted-foreground">Dr. {event.doctor.name}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
