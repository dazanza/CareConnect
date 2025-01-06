'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pill, Calendar, Clock, AlertCircle } from 'lucide-react'
import { addDays } from 'date-fns'

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
  // Calculate statistics
  const stats = {
    byStatus: {
      active: prescriptions.filter(p => p.status === 'active').length,
      completed: prescriptions.filter(p => p.status === 'completed').length,
      discontinued: prescriptions.filter(p => p.status === 'discontinued').length
    },
    expiringPrescriptions: prescriptions.filter(p => {
      if (!p.end_date || p.status !== 'active') return false
      const endDate = new Date(p.end_date)
      const thirtyDaysFromNow = addDays(new Date(), 30)
      return endDate <= thirtyDaysFromNow && endDate >= new Date()
    }).length,
    commonMedications: Object.entries(
      prescriptions.reduce((acc: Record<string, number>, p) => {
        acc[p.medication] = (acc[p.medication] || 0) + 1
        return acc
      }, {})
    )
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([medication, count]) => ({ medication, count: count as number }))
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byStatus.active}</div>
          <p className="text-xs text-muted-foreground">
            active prescriptions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.byStatus.completed}</div>
          <p className="text-xs text-muted-foreground">
            completed prescriptions
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