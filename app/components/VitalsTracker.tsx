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
import { createTimelineEvent } from '@/app/lib/timeline'

interface VitalsData {
  id: string
  date_time: string
  blood_pressure: string
  heart_rate: number
  temperature: number
  oxygen_saturation: number
  blood_sugar?: number
  patient_id: string
}

interface VitalsTrackerProps {
  patientId: string
  initialVitals?: VitalsData[]
  canEdit?: boolean
  showBloodSugar?: boolean
}

export function VitalsTracker({ patientId, initialVitals = [], canEdit = true, showBloodSugar = false }: VitalsTrackerProps) {
  const { supabase } = useSupabase()
  const [showAddVitals, setShowAddVitals] = useState(false)
  const [vitals, setVitals] = useState<VitalsData[]>(initialVitals)
  const [newVitals, setNewVitals] = useState({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    oxygen_saturation: '',
    blood_sugar: ''
  })

  const handleAddVitals = async () => {
    if (!supabase) return

    // Validate blood pressure format
    if (!newVitals.blood_pressure || typeof newVitals.blood_pressure !== 'string') {
      toast.error('Blood pressure is required')
      return
    }

    // Parse blood pressure
    const parsedBp = parseBloodPressure(newVitals.blood_pressure)
    if (!parsedBp) {
      toast.error('Invalid blood pressure format. Use format: 120/80')
      return
    }

    try {
      // Format vitals data for insertion
      const vitalsToInsert = {
        patient_id: parseInt(patientId),
        blood_pressure: `${parsedBp.systolic}/${parsedBp.diastolic}`,
        heart_rate: parseInt(newVitals.heart_rate),
        temperature: parseFloat(newVitals.temperature),
        oxygen_saturation: parseInt(newVitals.oxygen_saturation),
        blood_sugar: newVitals.blood_sugar ? parseInt(newVitals.blood_sugar) : null,
        date_time: new Date().toISOString()
      }

      // Insert vitals
      const { data: vitalsData, error: vitalsError } = await supabase
        .from('vitals')
        .insert([vitalsToInsert])
        .select()
        .single()

      if (vitalsError) throw vitalsError

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Create timeline event using stored procedure
      const { error: timelineError } = await supabase
        .rpc('create_timeline_event', {
          p_patient_id: parseInt(patientId),
          p_type: 'vitals',
          p_date: new Date().toISOString(),
          p_title: 'Vitals Recorded',
          p_description: `Blood Pressure: ${parsedBp.systolic}/${parsedBp.diastolic} mmHg, Heart Rate: ${vitalsToInsert.heart_rate} bpm, Temperature: ${vitalsToInsert.temperature}°C, Oxygen Level: ${vitalsToInsert.oxygen_saturation}%${vitalsToInsert.blood_sugar ? `, Blood Sugar: ${vitalsToInsert.blood_sugar} mg/dL` : ''}`,
          p_vitals_id: vitalsData.id,
          p_user_id: user.id,
          p_created_by: user.id
        })

      if (timelineError) throw timelineError

      setVitals([vitalsData, ...vitals])
      setShowAddVitals(false)
      setNewVitals({
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        oxygen_saturation: '',
        blood_sugar: ''
      })
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
        {canEdit && (
          <Button size="sm" onClick={() => setShowAddVitals(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Vitals
          </Button>
        )}
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
              <p className="text-2xl font-bold">{latestVitals?.oxygen_saturation || '--'}</p>
              <p className="text-xs text-muted-foreground">%</p>
            </div>
          </div>
          {showBloodSugar && (
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Blood Sugar</p>
                <p className="text-2xl font-bold">{latestVitals?.blood_sugar || '--'}</p>
                <p className="text-xs text-muted-foreground">mg/dL</p>
              </div>
            </div>
          )}
        </div>
        {vitals.length > 0 && (
          <div className="mt-6">
            <VitalsChart vitals={transformVitalsForChart(vitals, 'blood_pressure')} />
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
                value={newVitals.oxygen_saturation}
                onChange={(e) => setNewVitals({ ...newVitals, oxygen_saturation: e.target.value })}
              />
            </div>
            {showBloodSugar && (
              <div className="grid gap-2">
                <label>Blood Sugar (mg/dL)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newVitals.blood_sugar}
                  onChange={(e) => setNewVitals({ ...newVitals, blood_sugar: e.target.value })}
                />
              </div>
            )}
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
