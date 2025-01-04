'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Syringe, Plus, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { format, addMonths } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import { Doctor } from '@/types'

interface Immunization {
  id: string
  vaccine_name: string
  vaccine_type: string
  dose_number: number
  date_administered: string
  next_due_date: string | null
  administered_by: string
  batch_number: string
  manufacturer: string
  location: string
  notes: string
  status: 'completed' | 'scheduled' | 'overdue'
  side_effects?: string
  patient_id: string
  doctor_id: string
  doctor?: {
    id: string
    first_name: string
    last_name: string
  }
}

interface ImmunizationTrackerProps {
  patientId: string
  doctors: Doctor[]
  initialImmunizations?: Immunization[]
}

const vaccineTypes = [
  'COVID-19',
  'Influenza',
  'Tetanus',
  'MMR',
  'Hepatitis B',
  'HPV',
  'Other'
]

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800'
}

export function ImmunizationTracker({
  patientId,
  doctors,
  initialImmunizations = []
}: ImmunizationTrackerProps) {
  const { supabase } = useSupabase()
  const [immunizations, setImmunizations] = useState<Immunization[]>(initialImmunizations)
  const [showAddImmunization, setShowAddImmunization] = useState(false)
  const [newImmunization, setNewImmunization] = useState<{
    vaccine_name: string
    vaccine_type: string
    dose_number: number
    date_administered: string
    next_due_date: string | null
    administered_by: string
    batch_number: string
    manufacturer: string
    location: string
    notes: string
    doctor_id: string
  }>({
    vaccine_name: '',
    vaccine_type: '',
    dose_number: 1,
    date_administered: format(new Date(), 'yyyy-MM-dd'),
    next_due_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    administered_by: '',
    batch_number: '',
    manufacturer: '',
    location: '',
    notes: '',
    doctor_id: ''
  })

  const handleAddImmunization = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('immunizations')
        .insert({
          ...newImmunization,
          patient_id: parseInt(patientId),
          doctor_id: parseInt(newImmunization.doctor_id),
          status: 'completed'
        })
        .select(`
          *,
          doctor:doctors (
            id,
            first_name,
            last_name
          )
        `)
        .single()

      if (error) throw error

      setImmunizations([data, ...immunizations])
      setShowAddImmunization(false)
      setNewImmunization({
        vaccine_name: '',
        vaccine_type: '',
        dose_number: 1,
        date_administered: format(new Date(), 'yyyy-MM-dd'),
        next_due_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
        administered_by: '',
        batch_number: '',
        manufacturer: '',
        location: '',
        notes: '',
        doctor_id: ''
      })
      toast.success('Immunization added successfully')
    } catch (error) {
      console.error('Error adding immunization:', error)
      toast.error('Failed to add immunization')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Immunizations</CardTitle>
        <Button onClick={() => setShowAddImmunization(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Immunization
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {immunizations.length === 0 ? (
            <p className="text-muted-foreground">No immunizations recorded.</p>
          ) : (
            immunizations.map((immunization) => (
              <div
                key={immunization.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Syringe className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">{immunization.vaccine_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Type: {immunization.vaccine_type} • Dose {immunization.dose_number}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusColors[immunization.status]}>
                    {immunization.status.charAt(0).toUpperCase() + immunization.status.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Administered: {format(new Date(immunization.date_administered), 'MMM d, yyyy')}
                  </div>
                  {immunization.next_due_date && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Next Due: {format(new Date(immunization.next_due_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Batch: {immunization.batch_number} • {immunization.manufacturer}</p>
                  <p>Location: {immunization.location}</p>
                  <p>Administered by: {immunization.administered_by}</p>
                  {immunization.notes && (
                    <div className="flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {immunization.notes}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Recorded by Dr. {immunization.doctor?.first_name} {immunization.doctor?.last_name}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddImmunization} onOpenChange={setShowAddImmunization}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Immunization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vaccine Name</label>
              <Input
                value={newImmunization.vaccine_name}
                onChange={(e) => setNewImmunization({ ...newImmunization, vaccine_name: e.target.value })}
                placeholder="Enter vaccine name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Vaccine Type</label>
              <Select
                value={newImmunization.vaccine_type}
                onValueChange={(value) => setNewImmunization({ ...newImmunization, vaccine_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vaccine type" />
                </SelectTrigger>
                <SelectContent>
                  {vaccineTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Dose Number</label>
                <Input
                  type="number"
                  value={newImmunization.dose_number}
                  onChange={(e) => setNewImmunization({ ...newImmunization, dose_number: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date Administered</label>
                <Input
                  type="date"
                  value={newImmunization.date_administered}
                  onChange={(e) => setNewImmunization({ ...newImmunization, date_administered: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Administered By</label>
              <Input
                value={newImmunization.administered_by}
                onChange={(e) => setNewImmunization({ ...newImmunization, administered_by: e.target.value })}
                placeholder="Name of healthcare provider"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Batch Number</label>
                <Input
                  value={newImmunization.batch_number}
                  onChange={(e) => setNewImmunization({ ...newImmunization, batch_number: e.target.value })}
                  placeholder="Enter batch number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Manufacturer</label>
                <Input
                  value={newImmunization.manufacturer}
                  onChange={(e) => setNewImmunization({ ...newImmunization, manufacturer: e.target.value })}
                  placeholder="Enter manufacturer"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={newImmunization.location}
                onChange={(e) => setNewImmunization({ ...newImmunization, location: e.target.value })}
                placeholder="Where was it administered?"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newImmunization.notes}
                onChange={(e) => setNewImmunization({ ...newImmunization, notes: e.target.value })}
                placeholder="Any additional notes"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Recording Doctor</label>
              <Select
                value={newImmunization.doctor_id}
                onValueChange={(value) => setNewImmunization({ ...newImmunization, doctor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.first_name} {doctor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddImmunization(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddImmunization}>
              Add Immunization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
