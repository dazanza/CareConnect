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
import { FileText, Plus, AlertCircle, Calendar } from 'lucide-react'
import { toast } from "react-hot-toast"
import { useSupabase } from '@/app/hooks/useSupabase'
import { format } from 'date-fns'

interface LabResult {
  id: string
  test_name: string
  test_type: string
  result_value: string
  reference_range: string
  unit: string
  date: string
  notes: string
  status: 'normal' | 'abnormal' | 'critical'
  doctor_id: string
  patient_id: string
  doctor: {
    id: string
    name: string
  }
}

interface LabResultsManagerProps {
  patientId: string
  doctors: Array<{ id: string; name: string }>
  initialLabResults?: LabResult[]
}

const testTypes = [
  'Blood Test',
  'Urinalysis',
  'Imaging',
  'Biopsy',
  'Culture',
  'Genetic Test',
  'Other'
]

export function LabResultsManager({
  patientId,
  doctors,
  initialLabResults = []
}: LabResultsManagerProps) {
  const { supabase } = useSupabase()
  const [labResults, setLabResults] = useState<LabResult[]>(initialLabResults)
  const [showAddResult, setShowAddResult] = useState(false)
  const [newResult, setNewResult] = useState({
    test_name: '',
    test_type: '',
    result_value: '',
    reference_range: '',
    unit: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    status: 'normal',
    doctor_id: ''
  })

  const handleAddResult = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('lab_results')
        .insert({
          ...newResult,
          patient_id: patientId
        })
        .select('*, doctor:doctors(id, name)')
        .single()

      if (error) throw error

      setLabResults([data, ...labResults])
      setShowAddResult(false)
      toast.success('Lab result added successfully')
    } catch (error) {
      console.error('Error adding lab result:', error)
      toast.error('Failed to add lab result')
    }
  }

  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return 'text-green-500'
      case 'abnormal':
        return 'text-yellow-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lab Results</CardTitle>
        <Button onClick={() => setShowAddResult(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lab Result
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {labResults.length === 0 ? (
            <p className="text-muted-foreground">No lab results found.</p>
          ) : (
            labResults.map((result) => (
              <div
                key={result.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">{result.test_name}</h3>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type: {result.test_type}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Result: {result.result_value} {result.unit} (Reference: {result.reference_range})
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(result.date), 'MMM d, yyyy')}
                </div>
                {result.notes && (
                  <p className="text-sm text-muted-foreground">
                    Notes: {result.notes}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Ordered by Dr. {result.doctor.name}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddResult} onOpenChange={setShowAddResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lab Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Name</label>
              <Input
                value={newResult.test_name}
                onChange={(e) => setNewResult({ ...newResult, test_name: e.target.value })}
                placeholder="Enter test name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Type</label>
              <Select
                value={newResult.test_type}
                onValueChange={(value) => setNewResult({ ...newResult, test_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Result Value</label>
                <Input
                  value={newResult.result_value}
                  onChange={(e) => setNewResult({ ...newResult, result_value: e.target.value })}
                  placeholder="Enter result"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={newResult.unit}
                  onChange={(e) => setNewResult({ ...newResult, unit: e.target.value })}
                  placeholder="e.g., mg/dL"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Reference Range</label>
              <Input
                value={newResult.reference_range}
                onChange={(e) => setNewResult({ ...newResult, reference_range: e.target.value })}
                placeholder="e.g., 70-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={newResult.date}
                onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newResult.status}
                onValueChange={(value: LabResult['status']) => setNewResult({ ...newResult, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newResult.notes}
                onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
                placeholder="Enter any additional notes"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Doctor</label>
              <Select
                value={newResult.doctor_id}
                onValueChange={(value) => setNewResult({ ...newResult, doctor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddResult(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResult}>
              Add Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
