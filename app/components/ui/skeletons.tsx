import * as React from "react"
import { Skeleton } from "./skeleton"

/**
 * Common skeleton sizes for consistent UI loading states
 */
const SKELETON_SIZES = {
  icon: "h-4 w-4",
  text: {
    xs: "h-3",
    sm: "h-4",
    base: "h-5",
    lg: "h-6",
    xl: "h-8"
  },
  button: {
    sm: "h-8",
    base: "h-9",
    lg: "h-10"
  }
} as const

/**
 * Base layout skeletons
 */

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Skeleton className={SKELETON_SIZES.icon} />
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Skeleton className={SKELETON_SIZES.text.lg} />
      <Skeleton className={SKELETON_SIZES.text.base} />
      <Skeleton className={SKELETON_SIZES.text.sm} />
    </div>
  )
}

/**
 * Patient-related skeletons
 */

export function PatientCardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}

export function PatientDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className={SKELETON_SIZES.text.xl} />
          <Skeleton className={SKELETON_SIZES.text.base} />
        </div>
        <div className="flex gap-2">
          <Skeleton className={SKELETON_SIZES.button.lg} />
          <Skeleton className={SKELETON_SIZES.button.lg} />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className={SKELETON_SIZES.text.lg} />
          <div className="space-y-2">
            <Skeleton className={SKELETON_SIZES.text.base} />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className={SKELETON_SIZES.text.lg} />
          <div className="space-y-2">
            <Skeleton className={SKELETON_SIZES.text.base} />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PatientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Appointment-related skeletons
 */

export function AppointmentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className={SKELETON_SIZES.text.base} />
                <Skeleton className={SKELETON_SIZES.text.sm} />
              </div>
              <Skeleton className={SKELETON_SIZES.button.base} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AppointmentCalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <div className="flex gap-2">
          <Skeleton className={SKELETON_SIZES.button.base} />
          <Skeleton className={SKELETON_SIZES.button.base} />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  )
}

/**
 * Medical record-related skeletons
 */

export function MedicalRecordsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className={SKELETON_SIZES.text.base} />
              <Skeleton className={SKELETON_SIZES.text.sm} />
              <Skeleton className={SKELETON_SIZES.text.sm} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Timeline and activity skeletons
 */

export function TimelineEventsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <div className="flex gap-2">
          <Skeleton className={SKELETON_SIZES.button.lg} />
          <Skeleton className={SKELETON_SIZES.button.lg} />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-grow">
                <Skeleton className={SKELETON_SIZES.text.base} />
                <Skeleton className={SKELETON_SIZES.text.sm} />
                <Skeleton className={SKELETON_SIZES.text.sm} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Document and file skeletons
 */

export function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-1">
                  <Skeleton className={SKELETON_SIZES.text.base} />
                  <Skeleton className={SKELETON_SIZES.text.sm} />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Task and todo skeletons
 */

export function TodoListSkeleton() {
  return (
    <div className="w-full p-4 space-y-4">
      <div className="space-y-3">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className={SKELETON_SIZES.icon} />
            <Skeleton className={SKELETON_SIZES.text.base + " flex-grow"} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Prescription-related skeletons
 */

export function PrescriptionDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className={SKELETON_SIZES.text.lg} />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className={SKELETON_SIZES.text.lg} />
          <div className="space-y-2">
            <Skeleton className={SKELETON_SIZES.text.base} />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PrescriptionListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <Skeleton className={SKELETON_SIZES.button.lg} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className={SKELETON_SIZES.text.base} />
              <Skeleton className={SKELETON_SIZES.text.sm} />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className={SKELETON_SIZES.text.sm + " w-24"} />
                <Skeleton className={SKELETON_SIZES.button.sm} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Shared resources skeletons
 */

export function SharedResourcesSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className={SKELETON_SIZES.text.xl} />
        <div className="flex gap-4">
          <Skeleton className="w-64 h-10" />
          <Skeleton className="w-[180px] h-10" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-grow">
                  <Skeleton className={SKELETON_SIZES.text.base} />
                  <Skeleton className={SKELETON_SIZES.text.sm} />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className={SKELETON_SIZES.text.sm} />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
