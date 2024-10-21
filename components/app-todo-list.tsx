"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, User, Stethoscope, Calendar, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

type Task = {
  id: string
  title: string
  completed: boolean
  dueDate?: Date
  doctor?: string
  event?: string
  patient?: string
}

type TodoListProps = {
  initialTasks?: Task[]
}

export const TodoList: React.FC<TodoListProps> = ({ initialTasks = [] }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTask, setNewTask] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [doctor, setDoctor] = useState("")
  const [event, setEvent] = useState("")
  const [patient, setPatient] = useState("")

  const addTask = () => {
    if (newTask.trim() !== "") {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        dueDate,
        doctor: doctor || undefined,
        event: event || undefined,
        patient: patient || undefined,
      }
      setTasks([...tasks, task])
      setNewTask("")
      setDueDate(undefined)
      setDoctor("")
      setEvent("")
      setPatient("")
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-background shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold">Todo List</h2>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-grow"
        />
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
        <Select onValueChange={setDoctor}>
          <SelectTrigger className="w-10 px-0 justify-center">
            <SelectValue placeholder={<Stethoscope className="h-4 w-4" />} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dr-smith">Dr. Smith</SelectItem>
            <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
            <SelectItem value="dr-williams">Dr. Williams</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setEvent}>
          <SelectTrigger className="w-10 px-0 justify-center">
            <SelectValue placeholder={<Calendar className="h-4 w-4" />} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checkup">Checkup</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="procedure">Procedure</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setPatient}>
          <SelectTrigger className="w-10 px-0 justify-center">
            <SelectValue placeholder={<User className="h-4 w-4" />} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="john-doe">John Doe</SelectItem>
            <SelectItem value="jane-smith">Jane Smith</SelectItem>
            <SelectItem value="bob-johnson">Bob Johnson</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={addTask} className="w-10 px-0 justify-center">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-semibold">Tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet. Add a task to get started!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2 p-2 border rounded">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleComplete(task.id)}
              />
              <span className={cn("flex-grow", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </span>
              <div className="flex items-center space-x-1">
                {task.dueDate && (
                  <span className="text-sm text-muted-foreground">
                    {format(task.dueDate, "MMM d")}
                  </span>
                )}
                {task.doctor && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                {task.event && <Calendar className="h-4 w-4 text-muted-foreground" />}
                {task.patient && <User className="h-4 w-4 text-muted-foreground" />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoList

// Sample tasks for demonstration
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Annual checkup with Dr. Smith",
    completed: false,
    dueDate: new Date("2024-03-15"),
    doctor: "Dr. Smith",
    event: "Checkup",
    patient: "John Doe"
  },
  {
    id: "2",
    title: "Blood test at the lab",
    completed: false,
    dueDate: new Date("2024-03-20"),
    event: "Test",
    patient: "Jane Smith"
  },
  {
    id: "3",
    title: "Follow-up appointment",
    completed: true,
    doctor: "Dr. Johnson",
    patient: "Bob Johnson"
  },
]

// Usage example
export const TodoListExample: React.FC = () => {
  return (
    <div className="p-4">
      <TodoList initialTasks={sampleTasks} />
    </div>
  )
}