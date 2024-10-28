'use client'

import { useState } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TimelineEventCardProps {
  event: TimelineEvent
  icon: React.ReactNode
  colorClass: string
}

export function TimelineEventCard({ event, icon, colorClass }: TimelineEventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative pl-10">
      <div className={cn(
        "absolute left-2.5 w-3 h-3 rounded-full mt-1.5 -translate-x-1/2",
        colorClass
      )} />
      
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="text-gray-500 mt-0.5">
              {icon}
            </div>
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {event.description && (
              <p className="text-sm">{event.description}</p>
            )}
            {event.metadata && Object.entries(event.metadata).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                <span>{value?.toString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
