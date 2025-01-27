# Project Structure

## Directory Tree
```
.
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── reset-password/
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   │   └── [id]/
│   │   ├── doctors/
│   │   │   └── [id]/
│   │   ├── prescriptions/
│   │   │   └── [id]/
│   │   ├── appointments/
│   │   ├── logs/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── prescriptions/
│   │   ├── appointments/
│   │   └── logs/
│   ├── components/
│   │   ├── ui/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── prescriptions/
│   │   ├── appointments/
│   │   ├── logs/
│   │   ├── timeline/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   │   ├── validation/
│   │   │   ├── appointment-validation.ts   # Appointment validation logic
│   │   │   └── types.ts                    # Shared validation types
│   │   └── transforms/
│   │   │   └── data-transforms.ts          # Data transformation utilities
│   ├── types/
│   │   ├── base.ts                         # Base type definitions
│   │   ├── doctor.ts                       # Doctor-specific types
│   │   └── patient.ts                      # Patient-specific types
│   └── utils/
│       └── type-guards.ts                  # Type guard utilities
├── documentation/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── API.md
│   └── CONTRIBUTING.md
├── __tests__/
│   ├── components/
│   ├── utils/
│   ├── api/
│   └── e2e/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Root Directory

- `.env.example` - Example environment variables file
- `.env.local` - Local environment variables (gitignored)
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration

## App Directory (`/app`)

### Core App Structure
- `layout.tsx` - Root layout component with providers
- `page.tsx` - Landing page component
- `error.tsx` - Global error boundary
- `loading.tsx` - Global loading state
- `not-found.tsx` - 404 page

### Authentication (`/app/(auth)`)
- `sign-in/page.tsx` - Sign in page
- `sign-up/page.tsx` - Sign up page
- `reset-password/page.tsx` - Password reset page

### Main Application (`/app/(authenticated)`)
- `layout.tsx` - Authenticated layout with navigation
- `dashboard/page.tsx` - Main dashboard
- `patients/page.tsx` - Patient list page
- `patients/[id]/page.tsx` - Individual patient details
- `doctors/page.tsx` - Doctor list page
- `doctors/[id]/page.tsx` - Individual doctor details
- `prescriptions/page.tsx` - Prescription list page
- `prescriptions/[id]/page.tsx` - Prescription details
- `appointments/page.tsx` - Appointments management
- `logs/page.tsx` - Medical logs management
- `settings/page.tsx` - User settings

### API Routes (`/app/api`)
- `auth/[...route]/route.ts` - Authentication endpoints
- `patients/route.ts` - Patient management endpoints
- `doctors/route.ts` - Doctor management endpoints
- `prescriptions/route.ts` - Prescription management endpoints
- `appointments/route.ts` - Appointment management endpoints
- `medical-records/route.ts` - Medical records endpoints
- `logs/route.ts` - Medical logs endpoints

## Components (`/app/components`)

### UI Components (`/app/components/ui`)
- `button.tsx` - Reusable button component
- `card.tsx` - Card container component
- `dialog.tsx` - Modal dialog component
- `input.tsx` - Form input components
- `select.tsx` - Dropdown select component
- `table.tsx` - Table components
- `calendar.tsx` - Calendar components
- `form.tsx` - Form components

### Patient Components (`/app/components/patients`)
- `PatientList.tsx` - Patient list display
- `PatientCard.tsx` - Patient summary card
- `PatientDetails.tsx` - Detailed patient information
- `PatientForm.tsx` - Patient creation/editing form
- `PatientShares.tsx` - Patient sharing management

### Doctor Components (`/app/components/doctors`)
- `DoctorList.tsx` - Doctor list display
- `DoctorCard.tsx` - Doctor summary card
- `DoctorForm.tsx` - Doctor creation/editing form

### Medical Records Components (`/app/components/medical-records`)
- `MedicalRecordList.tsx` - Medical records list
- `MedicalRecordForm.tsx` - Record creation/editing
- `RecordViewer.tsx` - Record viewing component

### Prescription Components (`/app/components/prescriptions`)
- `PrescriptionList.tsx` - Prescription list display
- `PrescriptionCard.tsx` - Prescription summary card
- `AddPrescriptionModal.tsx` - Prescription creation modal
- `PrescriptionDetails.tsx` - Detailed prescription view
- `PrescriptionAnalytics.tsx` - Prescription analytics

### Appointment Components (`/app/components/appointments`)
- `AppointmentList.tsx` - Appointment list display
- `AppointmentCard.tsx` - Appointment summary card
- `AppointmentForm.tsx` - Appointment creation/editing

### Log Components (`/app/components/logs`)
- `LogList.tsx` - Medical logs list
- `LogForm.tsx` - Log creation/editing
- `LogViewer.tsx` - Log viewing component

### Timeline Components (`/app/components/timeline`)
- `Timeline.tsx` - Timeline display
- `TimelineEvent.tsx` - Timeline event component

### Layout Components (`/app/components/layout`)
- `Header.tsx` - Application header
- `Sidebar.tsx` - Navigation sidebar
- `Footer.tsx` - Application footer

## Utilities (`/app/lib`)

### Core Utilities
- `supabase.ts` - Supabase client configuration
- `auth.ts` - Authentication utilities
- `api.ts` - API utility functions
- `date.ts` - Date formatting utilities

### Feature Utilities
- `prescriptions.ts` - Prescription management utilities
- `patient-sharing.ts` - Patient sharing logic
- `notifications.ts` - Notification handling
- `validation.ts` - Form validation utilities
- `formatting.ts` - Data formatting utilities

## Types (`/app/types`)

- `index.ts` - Central export point for all types
- `database.ts` - Database schema types
- `forms.ts` - Form-specific types and schemas
- `api.ts` - API request/response types
- `components.ts` - Component prop types
- `prescriptions.ts` - Prescription-related types
- `appointments.ts` - Appointment-related types
- `patients.ts` - Patient-related types
- `doctors.ts` - Doctor-related types
- `timeline.ts` - Timeline-related types
- `speech.ts` - Web Speech API type definitions

### Type Organization
- Domain-specific types in separate files
- Clear separation between form and database types
- Consistent naming conventions
- Proper relationship handling

## Components (`/app/components`)

### Form Components
- Proper cleanup in useEffect hooks
- Type-safe event handlers
- Consistent prop types
- Clear separation of concerns

### Enhanced Components
- Speech recognition integration
- Real-time data updates
- Proper error handling
- Loading state management

## Hooks (`/app/hooks`)

- `useAuth.ts` - Authentication hook
- `useSupabase.ts` - Supabase client hook
- `usePatient.ts` - Patient data management
- `useDoctor.ts` - Doctor data management
- `usePrescription.ts` - Prescription management
- `useAppointments.ts` - Appointment management
- `useLogs.ts` - Medical logs management
- `useTimeline.ts` - Timeline management

## Documentation (`/documentation`)

- `README.md` - Project overview and setup
- `ARCHITECTURE.md` - System architecture details
- `PROJECT_STRUCTURE.md` - This file
- `API.md` - API documentation
- `CONTRIBUTING.md` - Contribution guidelines

## Tests (`/__tests__`)

- `components/` - Component tests
- `utils/` - Utility function tests
- `api/` - API endpoint tests
- `e2e/` - End-to-end tests

## Public Assets (`/public`)

- `images/` - Static images
- `icons/` - Application icons
- `fonts/` - Custom fonts
- `favicon.ico` - Site favicon

## Type Safety and Validation

### Directory Structure

```
app/
├── lib/
│   ├── validation/
│   │   ├── appointment-validation.ts   # Appointment validation logic
│   │   └── types.ts                    # Shared validation types
│   │   └── transforms/
│   │       └── data-transforms.ts          # Data transformation utilities
│   ├── types/
│   │   ├── base.ts                         # Base type definitions
│   │   ├── doctor.ts                       # Doctor-specific types
│   │   └── patient.ts                      # Patient-specific types
│   └── utils/
│       └── type-guards.ts                  # Type guard utilities
```

### Type Organization

1. Base Types
   - Located in `types/base.ts`
   - Contain shared properties
   - Used as foundation for extended types

2. Extended Types
   - Organized by domain (doctor.ts, patient.ts)
   - Extend base types with specific fields
   - Include validation rules

3. Validation Logic
   - Centralized in `lib/validation`
   - Separate files for different domains
   - Reusable validation utilities

4. Transformers
   - Located in `lib/transforms`
   - Handle data transformation
   - Implement type safety

### Implementation Guidelines

1. Type Definitions
   - Use interfaces for extendable types
   - Keep types focused and minimal
   - Document type constraints

2. Validation
   - Implement domain-specific validation
   - Use shared validation utilities
   - Handle edge cases explicitly

3. Transformers
   - Safe data transformation
   - Null handling
   - Type guard implementation 