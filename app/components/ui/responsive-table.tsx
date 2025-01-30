"use client"

import * as React from "react"
import { Table } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface Column {
  header: string
  accessorKey: string
  cell?: (value: any) => React.ReactNode
}

interface ResponsiveTableProps {
  columns: Column[]
  data: any[]
  className?: string
  onRowClick?: (row: any) => void
  emptyMessage?: string
  isLoading?: boolean
}

/**
 * A responsive table component that switches to a card layout on mobile devices
 * Handles common table patterns like loading states, empty states, and row clicks
 */
export function ResponsiveTable({
  columns,
  data,
  className,
  onRowClick,
  emptyMessage = "No data available",
  isLoading = false,
}: ResponsiveTableProps) {
  const isMobile = useIsMobile()

  if (isLoading) {
    return (
      <div className="w-full animate-pulse space-y-4">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-20 w-full rounded-md bg-muted" />
        <div className="h-20 w-full rounded-md bg-muted" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors",
              onRowClick && "cursor-pointer hover:bg-accent"
            )}
            onClick={() => onRowClick?.(row)}
          >
            <dl className="space-y-2">
              {columns.map((column) => (
                <div key={column.accessorKey} className="flex justify-between gap-2">
                  <dt className="flex-shrink-0 font-medium">{column.header}</dt>
                  <dd className="text-right text-muted-foreground">
                    {column.cell
                      ? column.cell(row[column.accessorKey])
                      : row[column.accessorKey]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("relative w-full overflow-auto rounded-md border", className)}>
      <Table>
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((column) => (
              <th
                key={column.accessorKey}
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b transition-colors",
                onRowClick && "cursor-pointer hover:bg-accent"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.accessorKey} className="p-4 align-middle">
                  {column.cell ? column.cell(row[column.accessorKey]) : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
} 
