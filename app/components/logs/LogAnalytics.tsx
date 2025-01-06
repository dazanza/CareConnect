import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, subDays } from 'date-fns'

interface Log {
  id: string
  type: string
  created_at: string
  patient: {
    id: string
    first_name: string
    last_name: string
    nickname: string | null
  }
  doctor: {
    id: string
    first_name: string
    last_name: string
  }
}

interface LogAnalyticsProps {
  logs: Log[]
}

export function LogAnalytics({ logs }: LogAnalyticsProps) {
  // Calculate statistics
  const totalLogs = logs.length
  const last30DaysLogs = logs.filter(log => 
    new Date(log.created_at) > subDays(new Date(), 30)
  ).length

  // Count logs by type
  const logsByType = logs.reduce((acc: { [key: string]: number }, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1
    return acc
  }, {})

  // Get most active doctors
  const doctorActivity = logs.reduce((acc: { [key: string]: number }, log) => {
    const doctorName = `Dr. ${log.doctor.first_name} ${log.doctor.last_name}`
    acc[doctorName] = (acc[doctorName] || 0) + 1
    return acc
  }, {})

  const topDoctors = Object.entries(doctorActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>General log statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Total Logs</dt>
              <dd className="text-2xl font-bold">{totalLogs}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last 30 Days</dt>
              <dd className="text-2xl font-bold">{last30DaysLogs}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Logs by Type Card */}
      <Card>
        <CardHeader>
          <CardTitle>Logs by Type</CardTitle>
          <CardDescription>Distribution of log types</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            {Object.entries(logsByType).map(([type, count]) => (
              <div key={type}>
                <dt className="text-sm font-medium text-muted-foreground capitalize">{type}</dt>
                <dd className="text-2xl font-bold">{count}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {/* Most Active Doctors Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Most Active Doctors</CardTitle>
          <CardDescription>Doctors with the most log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {topDoctors.map(([doctor, count]) => (
              <div key={doctor}>
                <dt className="text-sm font-medium text-muted-foreground">{doctor}</dt>
                <dd className="text-2xl font-bold">{count} logs</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
} 