import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Export both the base Skeleton and the specific skeleton components
export { Skeleton }

// Export specific skeleton components
export const TodoListSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
  )
}

export const AppointmentSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

export const PatientCardSkeleton = () => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </div>
  )
}
