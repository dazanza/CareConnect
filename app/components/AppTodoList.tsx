'use client'

import React, { useState, useEffect, Suspense } from "react"
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
import { Todo } from '@/types'
import { toast } from "react-hot-toast"
import { TodoListSkeleton } from "@/app/components/ui/skeletons"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useAuth } from '@clerk/nextjs'
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"

type AppTodoListProps = {
  patientId?: string
  appointmentId?: string
  userId?: string
}

interface PatientOption {
  id: number
  name: string
}

export default function AppTodoList({ patientId, appointmentId, userId }: AppTodoListProps) {
  const { supabase } = useSupabase()
  const { userId: clerkUserId } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    patientId ? parseInt(patientId) : null
  )

  useEffect(() => {
    if (!supabase || !clerkUserId) return
    fetchTodos()
    fetchPatients()
  }, [supabase, patientId, appointmentId, clerkUserId])

  const fetchTodos = async () => {
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
        .eq('user_id', clerkUserId)
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
  }

  const fetchPatients = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .order('name')

      if (error) throw error
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to load patients')
    }
  }

  const addTask = async () => {
    if (!supabase || newTask.trim() === "") return

    const task = {
      text: newTask,
      completed: false,
      patient_id: selectedPatientId || (patientId ? parseInt(patientId) : null),
      appointment_id: appointmentId ? parseInt(appointmentId) : null,
      user_id: clerkUserId,
      due_date: dueDate?.toISOString(),
    }

    const { data, error } = await supabase
      .from('todos')
      .insert(task)
      .select('*, patients(name)')
      .single()

    if (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add todo')
    } else {
      const newTodo = {
        ...data,
        patientName: data.patients?.name || 'N/A'
      }
      setTodos([newTodo, ...todos])
      setNewTask("")
      setDueDate(undefined)
      if (!patientId) setSelectedPatientId(null) // Reset selection if not in patient context
      toast.success('Todo added successfully')
    }
  }

  const toggleComplete = async (id: number) => {
    const todoToUpdate = todos.find(todo => todo.id === id)
    if (!todoToUpdate || !supabase) return

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todoToUpdate.completed })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
      toast.error('Failed to update todo')
    } else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ))
      toast.success('Todo updated successfully')
    }
  }

  const deleteTask = async (id: number) => {
    if (!supabase) return

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
      toast.error('Failed to delete todo')
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
      toast.success('Todo deleted successfully')
    }
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm">{error.message}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              setError(null)
              fetchTodos()
            }}
          >
            Try Again
          </Button>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <Suspense fallback={<TodoListSkeleton />}>
      <div className="w-full h-full p-4 space-y-4">
        <h2 className="text-2xl font-bold">Todo List</h2>
        {isLoading ? (
          <p>Loading todos...</p>
        ) : clerkUserId ? (
          <>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Add a new task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-grow"
              />
              {!patientId && ( // Only show patient selector if not in patient context
                <Select
                  value={selectedPatientId?.toString()}
                  onValueChange={(value) => setSelectedPatientId(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No patient</SelectItem>
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
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-10 px-0 justify-center",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={addTask} className="w-10 px-0 justify-center">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
              <h3 className="text-lg font-semibold">Tasks</h3>
              {todos.filter(todo => !todo.completed).length === 0 ? (
                <p className="text-muted-foreground">No active todos.</p>
              ) : (
                todos
                  .filter(todo => !todo.completed)
                  .map((todo) => (
                    <div key={todo.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleComplete(todo.id)}
                      />
                      <div className="flex-grow">
                        <span className={cn(todo.completed && "line-through text-muted-foreground")}>
                          {todo.text}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          Patient: {todo.patientName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {todo.due_date && (
                          <span className="text-muted-foreground">
                            Due: {format(new Date(todo.due_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </>
        ) : (
          <p>Please log in to view your todo list.</p>
        )}
      </div>
    </Suspense>
  )
}
