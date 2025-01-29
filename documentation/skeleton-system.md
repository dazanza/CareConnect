# Skeleton Loading System

## Overview

The skeleton loading system provides a consistent way to show loading states across the application. It uses a combination of base components and specialized skeletons for different UI patterns.

## Base Components

### Skeleton
The foundational component that provides the basic animation and styling:

```tsx
<Skeleton className="h-4 w-4" />
```

### Common Sizes
Standardized sizes for consistent UI:

```typescript
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
}
```

### Base Layout Skeletons
- `TableRowSkeleton`: For table rows
- `CardSkeleton`: For card layouts

## Specialized Skeletons

### Patient-Related
- `PatientCardSkeleton`: Patient card displays
- `PatientDetailsSkeleton`: Patient detail pages
- `PatientListSkeleton`: Patient list views

### Appointment-Related
- `AppointmentSkeleton`: Appointment lists
- `AppointmentCalendarSkeleton`: Calendar views

### Medical Records
- `MedicalRecordsSkeleton`: Medical record lists
- `TimelineEventsSkeleton`: Timeline views
- `PrescriptionDetailsSkeleton`: Prescription details
- `PrescriptionListSkeleton`: Prescription lists

### Documents
- `DocumentListSkeleton`: Document lists
- `SharedResourcesSkeleton`: Shared resource views

### Tasks
- `TodoListSkeleton`: Todo list views

## Usage Patterns

### With Loading States
```tsx
function MyComponent() {
  const { data, isLoading } = useQuery(...)
  
  if (isLoading) {
    return <PatientListSkeleton />
  }
  
  return <PatientList data={data} />
}
```

### With Suspense
```tsx
<Suspense fallback={<PatientCardSkeleton />}>
  <PatientCard />
</Suspense>
```

### With DataLoadingState
```tsx
<DataLoadingState
  isLoading={isLoading}
  isEmpty={data.length === 0}
  SkeletonComponent={PatientListSkeleton}
>
  <PatientList data={data} />
</DataLoadingState>
```

## Best Practices

1. Use Consistent Sizing
   - Always use `SKELETON_SIZES` for standard elements
   - Match the actual component's dimensions

2. Follow Responsive Design
   - Use responsive classes (e.g., md:grid-cols-2)
   - Match the actual component's breakpoints

3. Match Component Layout
   - Mirror the actual component's structure
   - Include all major visual elements

4. Use TypeScript
   - Add proper types for props
   - Use interfaces for complex skeletons

5. Add Documentation
   - Include JSDoc comments
   - Document any special behavior

## Implementation Example

```tsx
/**
 * Skeleton loader for patient details page
 */
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
      {/* Additional skeleton elements */}
    </div>
  )
}
```

## File Structure

```
app/
  components/
    ui/
      skeleton.tsx       # Base skeleton component
      skeletons.tsx     # All skeleton variants
      loading-states.tsx # Loading state wrapper
```

## Future Improvements

1. Animation Variants
   - Add different animation styles
   - Support custom animations

2. Theme Integration
   - Better dark mode support
   - Custom color schemes

3. Performance
   - Optimize for large lists
   - Reduce layout shifts 