'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format } from 'date-fns'
import { Vitals } from '@/types'

interface VitalsChartProps {
  vitals: Vitals[]
  className?: string
}

export function VitalsChart({ vitals, className }: VitalsChartProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d')
  }

  const formatTooltipDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm')
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{formatTooltipDate(label)}</p>
          {payload.map((pld: any, index: number) => (
            <p
              key={index}
              style={{ color: pld.color }}
              className="text-sm"
            >
              {pld.name}: {pld.value} {pld.unit}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Vitals History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={vitals}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="heart_rate"
                stroke="#ef4444"
                name="Heart Rate"
                unit=" bpm"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="oxygen_level"
                stroke="#22c55e"
                name="Oxygen Level"
                unit="%"
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                name="Temperature"
                unit="°C"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={vitals}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="blood_pressure_systolic"
                stroke="#3b82f6"
                name="Systolic"
                unit=" mmHg"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="blood_pressure_diastolic"
                stroke="#6366f1"
                name="Diastolic"
                unit=" mmHg"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
