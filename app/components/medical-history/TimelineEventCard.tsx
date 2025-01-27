/**
 * TimelineEventCard Component
 * 
 * A card component that displays a single timeline event with expandable details.
 * Supports different types of medical events (appointments, prescriptions, vitals, etc.)
 * with type-specific metadata rendering.
 */

'use client'

import { useState } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Clock, MapPin, User, FileText, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Props for the TimelineEventCard component
 * @param event - The timeline event to display
 * @param icon - React node representing the event type icon
 * @param colorClass - Tailwind CSS class for the event type color
 * @param showPatientName - Whether to display the patient's name
 */
interface TimelineEventCardProps {
  event: TimelineEvent
  icon: React.ReactNode
  colorClass: string
  showPatientName?: boolean
}

export function TimelineEventCard({ event, icon, colorClass, showPatientName = false }: TimelineEventCardProps) {
  // State for managing the expanded/collapsed state of the card
  const [isExpanded, setIsExpanded] = useState(false)

  /**
   * Renders event-specific metadata based on the event type
   * Handles different layouts for appointments, prescriptions, lab results, and vitals
   */
  const renderMetadata = () => {
    switch (event.type) {
      case 'appointment':
        return event.appointments ? (
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(event.date), 'h:mm a')}</span>
            </div>
            {event.appointments.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.appointments.location}</span>
              </div>
            )}
            {event.appointments.type && (
              <Badge variant="secondary">
                {event.appointments.type}
              </Badge>
            )}
          </div>
        ) : null

      case 'prescription':
        return event.prescriptions ? (
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Medication:</span>
              <span>{event.prescriptions.medication}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Dosage:</span>
              <span>{event.prescriptions.dosage}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Frequency:</span>
              <span>{event.prescriptions.frequency}</span>
            </div>
          </div>
        ) : null

      case 'lab_result':
        return event.lab_results ? (
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={
                event.lab_results.status === 'normal' ? 'secondary' :
                event.lab_results.status === 'abnormal' ? 'outline' :
                'destructive'
              }>
                {event.lab_results.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Result:</span>
              <span>
                {event.lab_results.result_value} {event.lab_results.unit}
              </span>
            </div>
          </div>
        ) : null

      case 'vitals':
        return event.vitals ? (
          <div className="grid gap-2">
            {event.vitals.blood_pressure && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Blood Pressure:</span>
                <span>{event.vitals.blood_pressure}</span>
              </div>
            )}
            {event.vitals.heart_rate && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Heart Rate:</span>
                <span>{event.vitals.heart_rate} bpm</span>
              </div>
            )}
            {event.vitals.temperature && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Temperature:</span>
                <span>{event.vitals.temperature}°F</span>
              </div>
            )}
            {event.vitals.oxygen_saturation && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                <span className="font-medium">O2 Saturation:</span>
                <span>{event.vitals.oxygen_saturation}%</span>
              </div>
            )}
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="relative pl-10"
    >
      {/* Timeline dot indicator */}
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
              {showPatientName && event.patients && (
                <p className="text-sm text-muted-foreground">
                  {event.patients.first_name} {event.patients.last_name}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {format(new Date(event.date), 'h:mm a')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </Button>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              {event.description && (
                <p className="text-sm">{event.description}</p>
              )}
              {renderMetadata()}
              {event.metadata && Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                  <span>{value?.toString()}</span>
                </div>
              ))}
              <div className="text-xs text-muted-foreground">
                Created {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
