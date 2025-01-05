'use client'

import { format } from 'date-fns'
import { Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Prescription } from './PrescriptionCard'

interface TimelineEvent {
  id: string
  type: string
  title: string
  description?: string
  date: string
  metadata?: {
    old_value?: any
    new_value?: any
    reason?: string
  }
}

interface PrescriptionHistoryProps {
  prescription: Prescription
  events: TimelineEvent[]
  className?: string
}

export function PrescriptionHistory({ prescription, events, className = '' }: PrescriptionHistoryProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  function getEventBadgeVariant(type: string) {
    switch (type) {
      case 'created':
        return 'default'
      case 'updated':
        return 'secondary'
      case 'discontinued':
        return 'destructive'
      case 'refilled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Prescription History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="w-20 flex-shrink-0 text-sm text-muted-foreground">
                  {format(new Date(event.date), 'MMM d')}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getEventBadgeVariant(event.type)}>
                        {event.type}
                      </Badge>
                      <span className="text-sm font-medium">{event.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'h:mm a')}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  {event.metadata && (
                    <div className="text-sm bg-muted/50 rounded-md p-2 space-y-1">
                      {event.metadata.reason && (
                        <p className="text-muted-foreground">
                          Reason: {event.metadata.reason}
                        </p>
                      )}
                      {event.metadata.old_value && (
                        <p className="text-muted-foreground line-through">
                          {JSON.stringify(event.metadata.old_value)}
                        </p>
                      )}
                      {event.metadata.new_value && (
                        <p className="text-foreground">
                          {JSON.stringify(event.metadata.new_value)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 