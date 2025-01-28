# Component Documentation

## Layout Components

### Sidebar (`app/components/layout/Sidebar.tsx`)
The main navigation component of the application.

**Features:**
- Collapsible navigation menu
- Quick action buttons
- Patient and doctor sub-menus
- User profile section

**Props:** None

**Usage:**
```tsx
<AppSidebar />
```

### Navbar (`app/components/layout/Navbar.tsx`)
Top navigation bar with user controls and notifications.

**Props:** None

**Usage:**
```tsx
<Navbar />
```

### Layout (`app/components/layout/Layout.tsx`)
Root layout component with notification listener.

**Props:**
```typescript
{
  children: React.ReactNode;
}
```

## Dashboard Components

### DashboardContent (`app/components/dashboard/DashboardContent.tsx`)
Main dashboard view with overview of patient data.

**Features:**
- Appointment calendar
- Recent activity
- Patient statistics
- Quick actions

### UpcomingAppointments (`app/components/dashboard/UpcomingAppointments.tsx`)
Displays upcoming appointments in a list format.

**Props:**
```typescript
{
  appointments: Appointment[];
}
```

## Medical Components

### VitalsChart (`app/components/VitalsChart.tsx`)
Interactive chart for displaying patient vital signs.

**Props:**
```typescript
{
  vitals: Vitals[];
  className?: string;
}
```

### AppointmentCalendar (`app/components/AppointmentCalendar.tsx`)
Calendar view for managing appointments.

**Props:**
```typescript
{
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  className?: string;
}
```

**Features:**
- Date selection
- Appointment indicators
- Hover details for appointments

### AppTodoList (`app/components/AppTodoList.tsx`)
Task management component for medical todos.

**Props:**
```typescript
{
  patientId?: string;
  appointmentId?: string;
  userId?: string;
}
```

**Features:**
- Task creation and completion
- Due date selection
- Patient association
- Filtering options

## UI Components

### Loading States (`app/components/ui/loading-states.tsx`)

#### EmptyState
Displays a message when no data is available.

**Props:**
```typescript
{
  message: string;
}
```

#### DataLoadingState
Handles loading, empty, and data states.

**Props:**
```typescript
{
  isLoading: boolean;
  isEmpty: boolean;
  children: ReactNode;
  emptyMessage?: string;
  SkeletonComponent?: React.ComponentType;
}
```

### Skeletons (`app/components/ui/skeletons.tsx`)
Collection of skeleton loaders for various components.

**Components:**
- `PatientCardSkeleton`
- `AppointmentSkeleton`
- `TodoListSkeleton`

**Usage:**
```tsx
<PatientCardSkeleton />
<AppointmentSkeleton />
<TodoListSkeleton />
```

## Best Practices

### Component Organization
1. Place shared UI components in `components/ui/`
2. Group feature-specific components in their respective directories
3. Use consistent file naming (PascalCase for components)
4. Keep components focused and modular

### Props and Types
1. Define clear prop interfaces
2. Use TypeScript for type safety
3. Document required vs optional props
4. Include prop descriptions in JSDoc comments

### State Management
1. Use hooks for complex state
2. Keep state as local as possible
3. Document state dependencies
4. Handle loading and error states

### Performance
1. Use React.memo for expensive renders
2. Implement proper loading states
3. Use dynamic imports for large components
4. Handle cleanup in useEffect

### Accessibility
1. Include proper ARIA labels
2. Support keyboard navigation
3. Maintain proper contrast ratios
4. Test with screen readers

## Component Development Guidelines

### Creating New Components
1. Start with a clear interface definition
2. Implement proper loading states
3. Add error handling
4. Include accessibility features
5. Document props and usage
6. Add examples

### Modifying Existing Components
1. Maintain backward compatibility
2. Document breaking changes
3. Update tests
4. Update documentation

### Testing Components
1. Write unit tests for logic
2. Test edge cases
3. Include accessibility tests
4. Test loading states
5. Test error handling

# Component Guidelines

## Component Reuse and Standardization

### Core Components
The following components are centralized and should be reused across the application:

1. Error Handling
   - Use `ErrorBoundary` from `@/components/ui/error-boundary`
   - Do NOT create new error boundary components for specific features
   - Customize through props rather than creating new components

2. Date Handling
   - Use `DateRangePicker` from `@/components/ui/date-range-picker`
   - Use `DatePicker` from `@/components/ui/date-picker`
   - Handle type mismatches with proper TypeScript assertions

### Before Creating New Components

1. Check existing components in:
   - `/components/ui/`
   - Feature-specific directories
   - Shared component libraries (shadcn/ui, etc.)

2. Consider:
   - Can an existing component be extended via props?
   - Is this truly unique functionality?
   - Would this duplicate existing code?

3. Document any type assertions or workarounds in component comments 