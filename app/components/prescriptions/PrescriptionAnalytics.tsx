'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pill, RefreshCcw, Clock, AlertCircle } from 'lucide-react'

interface PrescriptionStats {
  totalPrescriptions: number
  activePrescriptions: number
  upcomingRefills: number
  expiringPrescriptions: number
  byStatus: {
    active: number
    completed: number
    discontinued: number
  }
  commonMedications: Array<{
    medication: string
    count: number
  }>
}

interface PrescriptionAnalyticsProps {
  prescriptions: Array<{
    id: number
    medication: string
    status: 'active' | 'completed' | 'discontinued'
    start_date: string
    end_date?: string
    refills: number
  }>
}

function calculatePrescriptionStats(prescriptions: PrescriptionAnalyticsProps['prescriptions']): PrescriptionStats {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Initialize stats
  const stats: PrescriptionStats = {
    totalPrescriptions: prescriptions.length,
    activePrescriptions: 0,
    upcomingRefills: 0,
    expiringPrescriptions: 0,
    byStatus: {
      active: 0,
      completed: 0,
      discontinued: 0,
    },
    commonMedications: [],
  }

  // Count medications
  const medicationCounts = new Map<string, number>()

  prescriptions.forEach(prescription => {
    // Count by status
    stats.byStatus[prescription.status]++

    // Count active prescriptions
    if (prescription.status === 'active') {
      stats.activePrescriptions++

      // Count prescriptions expiring soon
      if (prescription.end_date) {
        const endDate = new Date(prescription.end_date)
        if (endDate <= thirtyDaysFromNow && endDate >= now) {
          stats.expiringPrescriptions++
        }
      }

      // Count prescriptions needing refills
      if (prescription.refills === 0) {
        stats.upcomingRefills++
      }
    }

    // Count medications
    const count = medicationCounts.get(prescription.medication) || 0
    medicationCounts.set(prescription.medication, count + 1)
  })

  // Get common medications
  stats.commonMedications = Array.from(medicationCounts.entries())
    .map(([medication, count]) => ({ medication, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return stats
}

export function PrescriptionAnalytics({ prescriptions }: PrescriptionAnalyticsProps) {
  const stats = calculatePrescriptionStats(prescriptions)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activePrescriptions}</div>
          <p className="text-xs text-muted-foreground">
            of {stats.totalPrescriptions} total prescriptions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Needs Refill</CardTitle>
          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingRefills}</div>
          <p className="text-xs text-muted-foreground">
            prescriptions with no refills remaining
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringPrescriptions}</div>
          <p className="text-xs text-muted-foreground">
            expiring in the next 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Discontinued</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byStatus.discontinued}</div>
          <p className="text-xs text-muted-foreground">
            discontinued prescriptions
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Common Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.commonMedications.map((med) => (
              <div key={med.medication} className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{med.medication}</p>
                <p className="text-2xl font-bold">{med.count}</p>
                <p className="text-xs text-muted-foreground">prescriptions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 