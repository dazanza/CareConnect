'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculatePrescriptionStats } from '@/lib/prescription-analytics'
import { Pill, RefreshCcw, Clock, AlertCircle } from 'lucide-react'

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
            {stats.commonMedications.map((med, index) => (
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