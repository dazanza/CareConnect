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
import type { Vitals } from '@/app/types/vitals'

/**
 * Props for the VitalsChart component
 * @interface VitalsChartProps
 * @property {Vitals[]} vitals - Array of vitals measurements to display in the chart
 * @property {string} [className] - Optional CSS class names for styling
 */
interface VitalsChartProps {
  vitals: Vitals[]
  className?: string
}

/**
 * VitalsChart Component
 * 
 * A responsive line chart component for visualizing patient vital signs over time.
 * Uses recharts library to create interactive and accessible charts.
 * 
 * Features:
 * - Multiple vital sign tracking (BP, HR, temp, O2)
 * - Interactive tooltips
 * - Responsive design
 * - Custom color coding for different vitals
 * - Date formatting on x-axis
 * - Automatic scaling on y-axis
 * - Grid lines for better readability
 * - Legend for identifying different measurements
 * 
 * @component
 * @param {VitalsChartProps} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * <VitalsChart
 *   vitals={patientVitals}
 *   className="h-[300px]"
 * />
 * ```
 */
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
                dataKey="date_time"
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
                dataKey="oxygen_saturation"
                stroke="#22c55e"
                name="Oxygen Saturation"
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
                dataKey="date_time"
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="blood_pressure"
                stroke="#3b82f6"
                name="Blood Pressure"
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
