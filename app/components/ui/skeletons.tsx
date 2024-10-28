import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentSkeleton() {
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

export function PatientCardSkeleton() {
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

export function TodoListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
  )
}
