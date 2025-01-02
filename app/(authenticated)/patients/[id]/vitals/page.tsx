'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { convertUTCToLocal, formatLocalDate } from '@/app/lib/dateUtils';

const moodColors = {
  'Happy': '#32CD32',
  'Satisfied': '#FFD700',
  'Neutral': '#D3D3D3',
  'Slightly Unhappy': '#FFA500',
  'Angry': '#FF4500',
}

const moodOrder = ['Happy', 'Satisfied', 'Neutral', 'Slightly Unhappy', 'Angry']

const formatXAxis = (tickItem: string) => {
  const date = new Date(tickItem)
  return formatLocalDate(date, 'MMM d')
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label)
    return (
      <div className="bg-white p-4 rounded shadow-md border border-gray-200">
        <p className="font-bold">{formatLocalDate(date, 'MMMM d, yyyy')}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>
            {pld.name}: {pld.value} {pld.unit}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const BloodPressureChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <XAxis dataKey="date" tickFormatter={formatXAxis} />
      <YAxis domain={[60, 180]} />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="bloodPressureSystolic" stroke="#8884d8" strokeWidth={2} dot={{ r: 6 }} name="Systolic" unit="mmHg" />
      <Line type="monotone" dataKey="bloodPressureDiastolic" stroke="#82ca9d" strokeWidth={2} dot={{ r: 6 }} name="Diastolic" unit="mmHg" />
    </LineChart>
  </ResponsiveContainer>
)

const VitalChart = ({ data, dataKeys, colors, unit, name }: { data: any[], dataKeys: string[], colors: string[], unit: string, name: string }) => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      {dataKeys.map((key, index) => (
        <defs key={key}>
          <linearGradient id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={colors[index]} stopOpacity={0}/>
          </linearGradient>
        </defs>
      ))}
      <XAxis dataKey="date" tickFormatter={formatXAxis} />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      {dataKeys.map((key, index) => (
        <Area key={key} type="monotone" dataKey={key} stroke={colors[index]} fillOpacity={1} fill={`url(#color${key})`} name={name} unit={unit} />
      ))}
    </AreaChart>
  </ResponsiveContainer>
)

const MoodChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <XAxis dataKey="date" tickFormatter={formatXAxis} />
      <YAxis domain={['dataMin', 'dataMax']} ticks={moodOrder} type="category" />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} dot={{ r: 6 }} />
    </LineChart>
  </ResponsiveContainer>
)

export default function VitalsTrackingPage() {
  const { id } = useParams()
  const { supabase } = useSupabase()
  const [vitalsData, setVitalsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVitalsData = async () => {
      if (!supabase || !id) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('vitals')
          .select('*')
          .eq('patient_id', id)
          .order('date_time', { ascending: true })

        if (error) throw error

        const formattedData = data.map((item: any) => ({
          date: convertUTCToLocal(item.date_time),
          bloodPressureSystolic: item.blood_pressure ? parseInt(item.blood_pressure.split('/')[0]) : null,
          bloodPressureDiastolic: item.blood_pressure ? parseInt(item.blood_pressure.split('/')[1]) : null,
          bloodSugar: item.blood_sugar,
          temperature: item.temperature,
          bloodOxygen: item.oxygen_saturation,
          mood: item.mood,
        }))

        setVitalsData(formattedData)
      } catch (error) {
        console.error('Error fetching vitals data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVitalsData()
  }, [supabase, id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="container mx-auto bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/patients/${id}`} className="inline-flex items-center text-white hover:underline transition-colors duration-200">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Patient Details
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Vitals & Mood Tracking</h1>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure (mmHg)</CardTitle>
              </CardHeader>
              <CardContent>
                <BloodPressureChart data={vitalsData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blood Sugar (mg/dL)</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalChart 
                  data={vitalsData} 
                  dataKeys={["bloodSugar"]}
                  colors={["#ffc658"]}
                  unit="mg/dL" 
                  name="Blood Sugar"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature (°C)</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalChart 
                  data={vitalsData} 
                  dataKeys={["temperature"]}
                  colors={["#ff7300"]}
                  unit="°C" 
                  name="Temperature"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blood Oxygen (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalChart 
                  data={vitalsData} 
                  dataKeys={["bloodOxygen"]}
                  colors={["#0088FE"]}
                  unit="%" 
                  name="Blood Oxygen"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodChart data={vitalsData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}