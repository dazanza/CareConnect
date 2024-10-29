import { ReactNode } from 'react'
import { Skeleton } from './skeleton'

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center p-4">
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

interface DataLoadingStateProps {
  isLoading: boolean
  isEmpty: boolean
  children: ReactNode
  emptyMessage?: string
  SkeletonComponent?: React.ComponentType
}

export function DataLoadingState({ 
  isLoading, 
  isEmpty, 
  children,
  emptyMessage = 'No data found',
  SkeletonComponent = Skeleton 
}: DataLoadingStateProps) {
  if (isLoading) {
    return <SkeletonComponent />
  }
  
  if (isEmpty) {
    return <EmptyState message={emptyMessage} />
  }
  
  return <>{children}</>
} 