'use client'

import { X, AlertCircle, CheckCircle, Loader2, RotateCcw } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

interface UploadProgressProps {
  fileName: string
  progress: number
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
  fileName,
  progress,
  status,
  onCancel,
  onRetry,
  className
}: UploadProgressProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        {/* File name and status */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm">{fileName}</span>
        </div>

        {/* Status text and actions */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {status === 'idle' && 'Ready to upload'}
            {status === 'uploading' && `Uploading... ${Math.round(progress)}%`}
            {status === 'processing' && 'Processing...'}
            {status === 'complete' && 'Upload complete'}
            {status === 'error' && 'Upload failed'}
          </p>
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
              size="icon"
              className="h-6 w-6"
              onClick={onRetry}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(status === 'uploading' || status === 'processing') && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  )
} 