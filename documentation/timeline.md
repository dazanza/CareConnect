# Medical Timeline Documentation

## Overview

The medical timeline is a core feature that provides a chronological view of a patient's medical history. It aggregates different types of medical events (appointments, prescriptions, vital signs, lab results, and notes) into a unified, filterable timeline view.

## Components

### TimelineView (`app/components/medical-history/TimelineView.tsx`)

The main timeline component that handles:
- Displaying events in chronological order
- Filtering events by type
- Searching through events
- Date range selection
- Grouping events by date

Features:
- Real-time search filtering
- Type-based filtering through dropdown
- Quick date range selection (7/30/90 days)
- Custom date range picker
- Responsive design

### TimelineEventCard (`app/components/medical-history/TimelineEventCard.tsx`)

A card component for individual timeline events that:
- Displays event summary (title, date, type)
- Shows type-specific icons and colors
- Provides expandable detailed view
- Renders type-specific metadata
- Supports animations for better UX

### DashboardTimeline (`app/components/medical-history/DashboardTimeline.tsx`)

A dashboard widget that:
- Shows timeline events for all patients under a user's care
- Supports viewing events in aggregate or grouped by patient
- Fetches data from Supabase with proper joins
- Handles loading states

## Data Structure

Timeline events are stored in the database with the following structure:

```typescript
interface TimelineEvent {
  id: string
  patient_id: number
  type: 'appointment' | 'prescription' | 'vitals' | 'lab_result' | 'note'
  date: string
  title: string
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
}
```

Additional type-specific data is stored in related tables and joined when fetching events.

## Usage

### Basic Timeline View
```tsx
// Show timeline for a specific patient
<TimelineView patientId={123} />

// Show timeline for multiple patients with names
<TimelineView events={events} showPatientName />
```

### Dashboard Integration
```tsx
// Show timeline in dashboard for all patients under user's care
<DashboardTimeline userId={currentUser.id} />
```

## Styling

The timeline uses a combination of:
- Tailwind CSS for layout and responsive design
- Shadcn UI components for consistent styling
- Custom color coding for different event types
- Framer Motion for smooth animations

## Performance Considerations

- Events are limited to 100 most recent by default
- Search is debounced to prevent excessive filtering
- Animations are hardware-accelerated
- Type-specific data is loaded through efficient SQL joins 