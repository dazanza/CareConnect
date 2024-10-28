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
import { AlertTriangle, Plus, Shield, AlertCircle } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { Badge } from "@/components/ui/badge"

interface Allergy {
  id: string
  patient_id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
  date_identified: string
  status: 'active' | 'inactive'
}

interface AllergiesManagerProps {
  patientId: string
  initialAllergies?: Allergy[]
}

const severityColors = {
  mild: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800'
}

export function AllergiesManager({
  patientId,
  initialAllergies = []
}: AllergiesManagerProps) {
  const { supabase } = useSupabase()
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies)
  const [showAddAllergy, setShowAddAllergy] = useState(false)
  const [newAllergy, setNewAllergy] = useState({
    allergen: '',
    reaction: '',
    severity: 'mild' as const,
    notes: '',
    date_identified: new Date().toISOString().split('T')[0],
    status: 'active' as const
  })

  const handleAddAllergy = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('allergies')
        .insert({
          ...newAllergy,
          patient_id: patientId
        })
        .select()
        .single()

      if (error) throw error

      setAllergies([data, ...allergies])
      setShowAddAllergy(false)
      toast.success('Allergy added successfully')
    } catch (error) {
      console.error('Error adding allergy:', error)
      toast.error('Failed to add allergy')
    }
  }

  const toggleAllergyStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('allergies')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setAllergies(allergies.map(allergy =>
        allergy.id === id ? { ...allergy, status: newStatus } : allergy
      ))
      toast.success('Allergy status updated')
    } catch (error) {
      console.error('Error updating allergy status:', error)
      toast.error('Failed to update allergy status')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Allergies</CardTitle>
        <Button onClick={() => setShowAddAllergy(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Allergy
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allergies.length === 0 ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <Shield className="w-5 h-5 mr-2" />
              <p>No known allergies recorded</p>
            </div>
          ) : (
            allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 ${allergy.severity === 'severe' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <h3 className="font-medium">{allergy.allergen}</h3>
                  </div>
                  <Badge variant="secondary" className={severityColors[allergy.severity]}>
                    {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reaction: {allergy.reaction}
                </p>
                {allergy.notes && (
                  <p className="text-sm text-muted-foreground">
                    Notes: {allergy.notes}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Identified: {new Date(allergy.date_identified).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllergyStatus(allergy.id, allergy.status === 'active' ? 'inactive' : 'active')}
                  >
                    {allergy.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddAllergy} onOpenChange={setShowAddAllergy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Allergen</label>
              <Input
                value={newAllergy.allergen}
                onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                placeholder="Enter allergen name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reaction</label>
              <Input
                value={newAllergy.reaction}
                onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                placeholder="Describe the allergic reaction"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={newAllergy.severity}
                onValueChange={(value: 'mild' | 'moderate' | 'severe') => 
                  setNewAllergy({ ...newAllergy, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Identified</label>
              <Input
                type="date"
                value={newAllergy.date_identified}
                onChange={(e) => setNewAllergy({ ...newAllergy, date_identified: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newAllergy.notes}
                onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                placeholder="Add any additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAllergy(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAllergy}>
              Add Allergy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
