'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, CalendarIcon, Search } from 'lucide-react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().optional(),
  refills: z.number().min(0).default(0),
  notes: z.string().optional(),
})

const prescriptionFormSchema = z.object({
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date().optional(),
  patient_id: z.number({
    required_error: 'Patient is required',
  }),
  prescribed_by: z.number({
    required_error: 'Doctor is required',
  }),
  appointment_id: z.number().optional(),
  log_id: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'completed', 'discontinued']).default('active'),
})

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>

interface AddPrescriptionModalProps {
  patients?: Array<{
    id: number
    name: string
    nickname?: string
  }>
  doctors?: Array<{
    id: number
    name: string
  }>
  appointments?: Array<{
    id: number
    date: string
    title: string
  }>
  logs?: Array<{
    id: number
    date: string
    title: string
  }>
  open?: boolean
  setOpen?: (open: boolean) => void
  form?: UseFormReturn<PrescriptionFormValues>
  initialData?: PrescriptionFormValues
}

export function AddPrescriptionModal({ 
  patients = [], 
  doctors = [],
  appointments = [],
  logs = [],
  open,
  setOpen,
  form: externalForm,
  initialData
}: AddPrescriptionModalProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{ id: number, name: string, strength?: string, form?: string }>>([])
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null)

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      medications: [{ name: '', dosage: '', frequency: '', refills: 0 }],
      status: 'active'
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medications'
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        start_date: new Date(initialData.start_date),
        end_date: initialData.end_date ? new Date(initialData.end_date) : undefined
      })
    }
  }, [initialData, form])

  async function onSubmit(data: PrescriptionFormValues) {
    try {
      setIsLoading(true)

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create prescription')
      }

      toast.success('Prescription created successfully')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating prescription:', error)
      toast.error('Failed to create prescription')
    } finally {
      setIsLoading(false)
    }
  }

  async function searchMedications(query: string) {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      console.log('Searching for:', query);
      const { data, error } = await supabase
        .from('prescriptions')
        .select('id, medication_name')
        .ilike('medication_name', `%${query}%`)
        .order('medication_name')
        .limit(10)

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform the results to match our interface
      const transformedData = data.map(med => ({
        id: med.id,
        name: med.medication_name
      }))
      
      console.log('Search results:', transformedData);
      setSearchResults(transformedData || [])
    } catch (error) {
      console.error('Error searching medications:', error)
      setSearchResults([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[1000px] h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Add New Prescription</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.nickname || patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prescribed_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              Dr. {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Appointment (Optional)</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {appointments.map((appointment) => (
                            <SelectItem key={appointment.id} value={appointment.id.toString()}>
                              {format(new Date(appointment.date), 'PPP')} - {appointment.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="log_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Log (Optional)</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select log" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {logs.map((log) => (
                            <SelectItem key={log.id} value={log.id.toString()}>
                              {format(new Date(log.date), 'PPP')} - {log.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isLoading}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isLoading}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Medications</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', dosage: '', frequency: '', refills: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medication
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[25%]">Medication</TableHead>
                        <TableHead className="w-[20%]">Dosage</TableHead>
                        <TableHead className="w-[20%]">Frequency</TableHead>
                        <TableHead className="w-[10%]">Refills</TableHead>
                        <TableHead className="w-[20%]">Notes</TableHead>
                        <TableHead className="w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`medications.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Enter medication name..."
                                        value={field.value}
                                        onChange={(e) => {
                                          field.onChange(e.target.value);
                                          searchMedications(e.target.value);
                                        }}
                                        onFocus={() => setActiveSearchIndex(index)}
                                        className="w-full"
                                      />
                                      {activeSearchIndex === index && searchResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg">
                                          <Command>
                                            <CommandGroup heading="Suggestions">
                                              {searchResults.map((med) => (
                                                <CommandItem
                                                  key={med.id}
                                                  value={med.name}
                                                  onSelect={() => {
                                                    field.onChange(med.name);
                                                    setActiveSearchIndex(null);
                                                    setSearchResults([]);
                                                  }}
                                                >
                                                  <span>{med.name}</span>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </Command>
                                        </div>
                                      )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`medications.${index}.dosage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      className="h-8"
                                      placeholder="e.g., 500mg"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`medications.${index}.frequency`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      className="h-8"
                                      placeholder="e.g., Once daily"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`medications.${index}.refills`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="h-8"
                                      type="number"
                                      min={0}
                                      disabled={isLoading}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`medications.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      className="h-8"
                                      placeholder="Optional notes"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={fields.length === 1}
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Enter any additional notes"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Prescription'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 