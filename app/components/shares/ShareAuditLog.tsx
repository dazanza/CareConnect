/**
 * Component for displaying share audit logs with filtering and pagination
 */
'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import type { ShareAuditLog } from '@/types/shares'

interface ShareAuditLogProps {
  /** Optional share ID to filter by */
  shareId?: string
  /** CSS class name */
  className?: string
}

/**
 * Formats a date string in a consistent way
 */
const formatDate = (date: string) => format(new Date(date), 'PPp')

/**
 * Component for displaying and filtering share audit logs
 */
export function ShareAuditLog({ shareId, className }: ShareAuditLogProps) {
  // Filter state
  const [action, setAction] = useState<string>('')
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [page, setPage] = useState(1)
  const limit = 20

  // Fetch audit logs
  const { data, isLoading, error } = useQuery({
    queryKey: ['shareAuditLogs', shareId, action, fromDate, toDate, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (shareId) params.set('shareId', shareId)
      if (action) params.set('action', action)
      if (fromDate) params.set('from', fromDate.toISOString())
      if (toDate) params.set('to', toDate.toISOString())

      const res = await fetch(`/api/shares/audit?${params}`)
      if (!res.ok) throw new Error('Failed to fetch audit logs')
      return res.json()
    }
  })

  // Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  if (error) {
    return <div>Error loading audit logs</div>
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="modified">Modified</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, 'PP') : 'From date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, 'PP') : 'To date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Audit log table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              data?.logs?.map((log: ShareAuditLog) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                  <TableCell className="capitalize">{log.action}</TableCell>
                  <TableCell>{log.changed_by_user_id}</TableCell>
                  <TableCell>
                    {log.action === 'created' ? (
                      'Share created'
                    ) : log.action === 'revoked' ? (
                      'Share revoked'
                    ) : (
                      <pre className="text-sm">
                        {JSON.stringify(
                          {
                            from: log.previous_state,
                            to: log.new_state
                          },
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to{' '}
            {Math.min(page * limit, data.pagination.total)} of{' '}
            {data.pagination.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === data.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 