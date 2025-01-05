'use client'

import { format } from 'date-fns'
import { Calendar, Clock, User, UserRound, Pill, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export interface Prescription {
  id: number
  medication: string
  dosage: string
  frequency: string
  start_date: string
  end_date?: string
  duration?: string
  refills: number
  status: string
  notes?: string
  patient: {
    id: number
    name: string
    nickname?: string
  }
  doctor: {
    id: number
    name: string
  }
}

interface PrescriptionCardProps {
  prescription: Prescription
  showPatient?: boolean
  className?: string
}

export function PrescriptionCard({ prescription, showPatient = false, className = '' }: PrescriptionCardProps) {
  const isActive = prescription.status === 'active'
  const hasRefills = prescription.refills > 0
  
  return (
    <Card className={`${className} hover:bg-accent/50 transition-colors`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              <Link href={`/prescriptions/${prescription.id}`} className="hover:underline">
                {prescription.medication}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Pill className="h-4 w-4" />
              {prescription.dosage} • {prescription.frequency}
            </CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {prescription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {showPatient && (
          <div className="flex items-center gap-2 text-sm">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <Link href={`/patients/${prescription.patient.id}`} className="hover:underline">
              {prescription.patient.nickname || prescription.patient.name}
            </Link>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <Link href={`/doctors/${prescription.doctor.id}`} className="hover:underline">
            Dr. {prescription.doctor.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            Started {format(new Date(prescription.start_date), 'MMM d, yyyy')}
            {prescription.end_date && ` • Ends ${format(new Date(prescription.end_date), 'MMM d, yyyy')}`}
          </span>
        </div>
        {hasRefills && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span>{prescription.refills} refill{prescription.refills !== 1 ? 's' : ''} remaining</span>
          </div>
        )}
        {prescription.notes && (
          <p className="text-sm text-muted-foreground mt-2">{prescription.notes}</p>
        )}
      </CardContent>
    </Card>
  )
} 