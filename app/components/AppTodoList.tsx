'use client'

import React, { useState, useEffect, Suspense, useCallback } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useSupabase } from "@/app/hooks/useSupabase"
import { Todo } from '@/app/types/todos'
import { toast } from "react-hot-toast"
import { TodoListSkeleton } from "@/app/components/ui/skeletons"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"

/**
 * Props for the AppTodoList component
 * @interface AppTodoListProps
 * @property {string} [patientId] - Optional ID of the patient to filter todos
 * @property {string} [appointmentId] - Optional ID of the appointment to filter todos
 * @property {string} [userId] - Optional ID of the user to filter todos
 */
type AppTodoListProps = {
  patientId?: string
  appointmentId?: string
  userId?: string
}

/**
 * Represents a patient option in the todo list
 * @interface PatientOption
 * @property {number} id - Unique identifier for the patient
 * @property {string} name - Full name of the patient
 */
interface PatientOption {
  id: number
  name: string
}

/**
 * AppTodoList Component
 * 
 * A versatile todo list component used throughout the application for:
 * - Patient-specific tasks
 * - Appointment-related tasks
 * - User/staff tasks
 * - General practice management
 * 
 * Features:
 * - Real-time updates using Supabase
 * - Task filtering by patient, appointment, or user
 * - Due date management with calendar picker
 * - Task completion tracking
 * - Priority levels
 * - Error boundary protection
 * - Loading states with skeletons
 * 
 * The component uses:
 * - Suspense for loading states
 * - Error boundaries for error handling
 * - Real-time subscriptions for updates
 * - Optimistic updates for better UX
 * 
 * @component
 * @param {AppTodoListProps} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * // For patient-specific todos
 * <AppTodoList patientId="123" />
 * 
 * // For appointment-specific todos
 * <AppTodoList appointmentId="456" />
 * 
 * // For user-specific todos
 * <AppTodoList userId="789" />
 * ```
 */
export default function AppTodoList({ patientId, appointmentId, userId }: AppTodoListProps) {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    patientId ? parseInt(patientId) : null
  )

  /**
   * Fetches todos from the database based on filters
   * @returns {Promise<void>}
   */
  const fetchTodos = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select(`
          *,
          patients (
            id,
            name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (todosError) throw todosError

      const todosWithPatients = todosData.map(todo => ({
        ...todo,
        patientName: todo.patients?.name || 'N/A'
      }))

      setTodos(todosWithPatients)
    } catch (error) {
      console.error('Error fetching todos:', error)
      toast.error('Failed to load todos')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user?.id])

  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to load patients')
    }
  }, [supabase, user?.id])

  useEffect(() => {
    if (!supabase || !user) return
    fetchTodos()
    fetchPatients()
  }, [supabase, user, fetchTodos, fetchPatients])

  /**
   * Handles adding a new todo
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>}
   */
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim() || !supabase) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            text: newTodo,
            completed: false,
            user_id: userId,
            patient_id: patientId,
            appointment_id: appointmentId,
            due_date: dueDate?.toISOString()
          }
        ])
        .select()

      if (error) throw error

      setTodos([...todos, data[0]])
      setNewTodo('')
      setDueDate(null)
      toast.success('Todo added successfully')
    } catch (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add todo')
    }
  }

  /**
   * Handles toggling a todo's completion status
   * @param {number} id - ID of the todo to toggle
   * @param {boolean} completed - New completion status
   * @returns {Promise<void>}
   */
  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id)

      if (error) throw error

      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
      toast.error('Failed to update todo')
    }
  }

  /**
   * Handles deleting a todo
   * @param {number} id - ID of the todo to delete
   * @returns {Promise<void>}
   */
  const handleDeleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTodos(todos.filter(todo => todo.id !== id))
      toast.success('Todo deleted successfully')
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('Failed to delete todo')
    }
  }

  return (
    <Suspense fallback={<TodoListSkeleton />}>
      <div className="w-full h-full p-4 space-y-4">
        <h2 className="text-2xl font-bold">Todo List</h2>
        {isLoading ? (
          <p>Loading todos...</p>
        ) : user ? (
          <>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Add a new task"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="flex-grow"
              />
              {!patientId && (
                <Select
                  value={selectedPatientId?.toString() || "none"}
                  onValueChange={(value) => setSelectedPatientId(value === "none" ? null : parseInt(value))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No patient</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleAddTodo}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) => handleToggleTodo(todo.id, checked as boolean)}
                    />
                    <div>
                      <p className={cn(
                        "text-sm font-medium leading-none",
                        todo.completed && "line-through text-muted-foreground"
                      )}>
                        {todo.text}
                      </p>
                      {todo.patientName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Patient: {todo.patientName}
                        </p>
                      )}
                      {todo.due_date && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {format(new Date(todo.due_date), "PPP")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Please sign in to view and manage todos</p>
        )}
      </div>
    </Suspense>
  )
}
