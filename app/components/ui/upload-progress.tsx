'use client'

import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

interface UploadProgressProps {
  progress: number
  fileName: string
  status: UploadStatus
  onCancel?: () => void
  onRetry?: () => void
  className?: string
}

/**
 * A reusable component for displaying file upload progress
 * 
 * Features:
 * - Visual progress bar
 * - File name display
 * - Upload status indicator
 * - Cancel button during upload
 * - Retry option on error
 * - Responsive design
 */
export function UploadProgress({
  progress,
  fileName,
  status,
  onCancel,
  onRetry,
  className
}: UploadProgressProps) {
  // Status icon mapping
  const StatusIcon = {
    idle: null,
    uploading: Loader2,
    processing: Loader2,
    complete: CheckCircle,
    error: AlertCircle
  }[status]

  // Status text mapping
  const statusText = {
    idle: 'Ready to upload',
    uploading: 'Uploading...',
    processing: 'Processing...',
    complete: 'Upload complete',
    error: 'Upload failed'
  }[status]

  // Status colors
  const statusColor = {
    idle: 'text-muted-foreground',
    uploading: 'text-blue-600',
    processing: 'text-blue-600',
    complete: 'text-green-600',
    error: 'text-red-600'
  }[status]

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        {/* File name and status */}
        <div className="flex items-center gap-2 min-w-0">
          {StatusIcon && (
            <StatusIcon 
              className={cn(
                'h-4 w-4',
                statusColor,
                (status === 'uploading' || status === 'processing') && 'animate-spin'
              )} 
            />
          )}
          <span className="truncate text-sm">{fileName}</span>
        </div>

        {/* Status text and actions */}
        <div className="flex items-center gap-2">
          <span className={cn('text-sm', statusColor)}>{statusText}</span>
          {status === 'uploading' && onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCancel}
              title="Cancel upload"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {status === 'error' && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(status === 'uploading' || status === 'processing') && (
        <Progress value={progress} className="h-1" />
      )}
    </div>
  )
} 