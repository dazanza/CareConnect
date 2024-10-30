'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Thermometer, Activity, Droplet, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { VitalsChart } from '@/app/components/VitalsChart'
import { parseBloodPressure, formatBloodPressure, transformVitalsForChart } from '@/app/lib/vitals-utils'

interface VitalsData {
  id: string
  date: string
  blood_pressure: string
  heart_rate: number
  temperature: number
  oxygen_level: number
  patient_id: string
}

interface VitalsTrackerProps {
  patientId: string
  initialVitals?: VitalsData[]
}

export function VitalsTracker({ patientId, initialVitals = [] }: VitalsTrackerProps) {
  const { supabase } = useSupabase()
  const [showAddVitals, setShowAddVitals] = useState(false)
  const [vitals, setVitals] = useState<VitalsData[]>(initialVitals)
  const [newVitals, setNewVitals] = useState({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    oxygen_level: ''
  })

  const handleAddVitals = async () => {
    if (!supabase) return

    // Validate blood pressure format
    const bp = parseBloodPressure(newVitals.blood_pressure)
    if (!bp) {
      toast.error('Invalid blood pressure format. Use format: 120/80')
      return
    }

    try {
      const { data, error } = await supabase
        .from('vitals')
        .insert({
          patient_id: patientId,
          blood_pressure: formatBloodPressure(bp),
          heart_rate: parseInt(newVitals.heart_rate),
          temperature: parseFloat(newVitals.temperature),
          oxygen_level: parseInt(newVitals.oxygen_level),
          date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setVitals([data, ...vitals])
      setShowAddVitals(false)
      toast.success('Vitals recorded successfully')
    } catch (error) {
      console.error('Error recording vitals:', error)
      toast.error('Failed to record vitals')
    }
  }

  const getLatestVitals = () => {
    if (vitals.length === 0) return null
    return vitals[0]
  }

  const latestVitals = getLatestVitals()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vitals</CardTitle>
        <Button size="sm" onClick={() => setShowAddVitals(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Vitals
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">Heart Rate</p>
              <p className="text-2xl font-bold">{latestVitals?.heart_rate || '--'}</p>
              <p className="text-xs text-muted-foreground">bpm</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Droplet className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Blood Pressure</p>
              <p className="text-2xl font-bold">{latestVitals?.blood_pressure || '--'}</p>
              <p className="text-xs text-muted-foreground">mmHg</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Temperature</p>
              <p className="text-2xl font-bold">{latestVitals?.temperature || '--'}</p>
              <p className="text-xs text-muted-foreground">°C</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Oxygen Level</p>
              <p className="text-2xl font-bold">{latestVitals?.oxygen_level || '--'}</p>
              <p className="text-xs text-muted-foreground">%</p>
            </div>
          </div>
        </div>
        {vitals.length > 0 && (
          <div className="mt-6">
            <VitalsChart vitals={transformVitalsForChart(vitals)} />
          </div>
        )}
      </CardContent>

      <Dialog open={showAddVitals} onOpenChange={setShowAddVitals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Vitals</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Blood Pressure</label>
              <Input
                placeholder="120/80"
                value={newVitals.blood_pressure}
                onChange={(e) => setNewVitals({ ...newVitals, blood_pressure: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Heart Rate (bpm)</label>
              <Input
                type="number"
                placeholder="72"
                value={newVitals.heart_rate}
                onChange={(e) => setNewVitals({ ...newVitals, heart_rate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Temperature (°C)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="37.0"
                value={newVitals.temperature}
                onChange={(e) => setNewVitals({ ...newVitals, temperature: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Oxygen Level (%)</label>
              <Input
                type="number"
                placeholder="98"
                value={newVitals.oxygen_level}
                onChange={(e) => setNewVitals({ ...newVitals, oxygen_level: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVitals(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVitals}>Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
