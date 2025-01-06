'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus } from 'lucide-react'
import AddLogForm from '@/app/components/AddLogForm'
import { format } from 'date-fns'

interface Log {
  id: string
  patient_id: string
  doctor_id: string
  type: string
  description: string
  created_at: string
  patient: {
    id: string
    first_name: string
    last_name: string
    nickname: string | null
  }
  doctor: {
    id: string
    first_name: string
    last_name: string
  }
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  nickname: string | null
}

interface Doctor {
  id: string
  first_name: string
  last_name: string
}

interface LogListProps {
  logs: Log[]
  patients: Patient[]
  doctors: Doctor[]
}

export function LogList({ logs, patients, doctors }: LogListProps) {
  const [isAddLogOpen, setIsAddLogOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>All Logs</CardTitle>
            <CardDescription>View and manage patient logs</CardDescription>
          </div>
          <Button onClick={() => setIsAddLogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Log
          </Button>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      {log.patient.nickname || `${log.patient.first_name} ${log.patient.last_name}`}
                    </TableCell>
                    <TableCell>
                      Dr. {log.doctor.first_name} {log.doctor.last_name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {log.type}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No logs found</p>
              <Button
                variant="link"
                onClick={() => setIsAddLogOpen(true)}
                className="mt-2"
              >
                Add your first log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Log</DialogTitle>
            <DialogDescription>
              Create a new log entry by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <AddLogForm onSuccess={() => setIsAddLogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
} 