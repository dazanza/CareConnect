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
│   │   ├── appointments/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── appointments/
│   │   └── medical-records/
│   ├── components/
│   │   ├── ui/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── medical-records/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   └── types/
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
- `appointments/page.tsx` - Appointments management
- `settings/page.tsx` - User settings

### API Routes (`/app/api`)
- `auth/[...route]/route.ts` - Authentication endpoints
- `patients/route.ts` - Patient management endpoints
- `appointments/route.ts` - Appointment management endpoints
- `medical-records/route.ts` - Medical records endpoints

## Components (`/app/components`)

### UI Components (`/app/components/ui`)
- `button.tsx` - Reusable button component
- `card.tsx` - Card container component
- `dialog.tsx` - Modal dialog component
- `input.tsx` - Form input components
- `select.tsx` - Dropdown select component

### Patient Components (`/app/components/patients`)
- `PatientList.tsx` - Patient list display
- `PatientCard.tsx` - Patient summary card
- `PatientDetails.tsx` - Detailed patient information
- `PatientForm.tsx` - Patient creation/editing form
- `PatientShares.tsx` - Patient sharing management

### Appointment Components (`/app/components/appointments`)
- `AppointmentList.tsx` - Appointment list display
- `AppointmentCard.tsx` - Appointment summary card
- `AppointmentForm.tsx` - Appointment creation/editing

### Medical Records (`/app/components/medical-records`)
- `MedicalRecordList.tsx` - Medical records list
- `MedicalRecordForm.tsx` - Record creation/editing
- `RecordViewer.tsx` - Record viewing component

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
- `patient-sharing.ts` - Patient sharing logic
- `notifications.ts` - Notification handling
- `validation.ts` - Form validation utilities
- `formatting.ts` - Data formatting utilities

## Types (`/app/types`)

- `index.ts` - Shared TypeScript interfaces
- `supabase.ts` - Supabase-specific types
- `api.ts` - API request/response types
- `components.ts` - Component prop types

## Hooks (`/app/hooks`)

- `useAuth.ts` - Authentication hook
- `useSupabase.ts` - Supabase client hook
- `usePatient.ts` - Patient data management
- `useAppointments.ts` - Appointment management
- `useMedicalRecords.ts` - Medical records management

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