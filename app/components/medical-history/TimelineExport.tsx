/**
 * TimelineExport Component
 * 
 * Handles exporting timeline events to different formats (PDF, CSV)
 * with customizable date ranges and event type filtering.
 */

'use client'

import { useState } from 'react'
import { TimelineEvent } from '@/types/timeline'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileDown } from 'lucide-react'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'

interface TimelineExportProps {
  events: TimelineEvent[]
  patientName?: string
}

export function TimelineExport({ events, patientName }: TimelineExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Formats timeline events into CSV format
   */
  const exportToCSV = () => {
    setIsExporting(true)
    try {
      const headers = ['Date', 'Type', 'Title', 'Description', 'Details']
      const rows = events.map(event => {
        const details = getEventDetails(event)
        return [
          format(new Date(event.date), 'yyyy-MM-dd HH:mm:ss'),
          event.type,
          event.title,
          event.description || '',
          details
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `medical_timeline${patientName ? `_${patientName}` : ''}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Timeline exported to CSV successfully')
    } catch (error) {
      console.error('Error exporting to CSV:', error)
      toast.error('Failed to export timeline to CSV')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Exports timeline events to PDF format
   */
  const exportToPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(16)
      doc.text('Medical Timeline', 14, 15)
      
      if (patientName) {
        doc.setFontSize(12)
        doc.text(`Patient: ${patientName}`, 14, 25)
      }
      
      doc.setFontSize(10)
      doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, patientName ? 35 : 25)

      // Group events by type for better organization
      const eventsByType = events.reduce((acc, event) => {
        if (!acc[event.type]) {
          acc[event.type] = []
        }
        acc[event.type].push(event)
        return acc
      }, {} as Record<string, TimelineEvent[]>)

      let yOffset = patientName ? 45 : 35

      // Add each event type section
      Object.entries(eventsByType).forEach(([type, typeEvents]) => {
        // Add section header
        yOffset += 10
        doc.setFontSize(12)
        doc.text(type.charAt(0).toUpperCase() + type.slice(1) + 's', 14, yOffset)
        yOffset += 5

        // Add events table
        const tableRows = typeEvents.map(event => [
          format(new Date(event.date), 'MMM d, yyyy h:mm a'),
          event.title,
          getEventDetails(event)
        ])

        autoTable(doc, {
          startY: yOffset,
          head: [['Date', 'Title', 'Details']],
          body: tableRows,
          margin: { left: 14 },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 50 },
            2: { cellWidth: 'auto' }
          }
        })

        yOffset = (doc as any).lastAutoTable.finalY + 10

        // Add new page if needed
        if (yOffset > 270) {
          doc.addPage()
          yOffset = 20
        }
      })

      // Save the PDF
      doc.save(`medical_timeline${patientName ? `_${patientName}` : ''}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('Timeline exported to PDF successfully')
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error('Failed to export timeline to PDF')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Gets formatted details string based on event type
   */
  const getEventDetails = (event: TimelineEvent): string => {
    switch (event.type) {
      case 'appointment':
        return event.appointments 
          ? `Type: ${event.appointments.type}, Location: ${event.appointments.location}`
          : ''
      
      case 'prescription':
        return event.prescriptions
          ? `Medication: ${event.prescriptions.medication}, Dosage: ${event.prescriptions.dosage}, Frequency: ${event.prescriptions.frequency}`
          : ''
      
      case 'vitals':
        return event.vitals
          ? `BP: ${event.vitals.blood_pressure}, HR: ${event.vitals.heart_rate}, Temp: ${event.vitals.temperature}, O2: ${event.vitals.oxygen_saturation}`
          : ''
      
      case 'lab_result':
        return event.lab_results
          ? `Test: ${event.lab_results.test_name}, Result: ${event.lab_results.result_value} ${event.lab_results.unit}, Status: ${event.lab_results.status}`
          : ''
      
      default:
        return event.metadata ? JSON.stringify(event.metadata) : ''
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <FileDown className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <Download className="w-4 h-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
