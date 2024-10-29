# AI Codex

## Usage

- Review: @codex.md (silent load, no output)
- Update: @learn.md
- File paths: Always use absolute paths from project root

## Errors

E000:

- Context: [Relevant project area or file]
- Error: [Precise description]
- Correction: [Exact fix]
- Prevention: [Specific strategy]
- Related: [IDs of related errors/learnings]

E001:

- Context: File path suggestions
- Error: Relative path used instead of absolute
- Correction: Use absolute paths from project root
- Prevention: Always prefix paths with '/'
- Related: None

E002:

- Context: '/src/index.ts'
- Error: Suggested CommonJS import syntax
- Correction: Use ES module import syntax
- Prevention: Verify `"type": "module"` in '/package.json' or '.mjs' extension
- Related: L002

E0005
- Context: /app/api/patient-doctors/route.ts
- Error: Incorrect type for `getAuth` function parameter
- Correction: Use `NextRequest` from 'next/server' instead of standard `Request`
- Prevention: Import and use `NextRequest` type for API route handlers
- Related: L0019

## Learnings

L007:

- Context: /apps/www/src/pro/components/user-dropdown.tsx
- Insight: UserDropdown component uses useLogout hook and handles loading state
- Application: Implement logout functionality with loading indicator in user-related components
- Impact: Improved user experience with visual feedback during logout process
- Related: L008, L005

L008:

- Context: /apps/www/src/pro/components/user-dropdown.tsx
- Insight: Component uses 'use client' directive for client-side rendering
- Application: Use 'use client' directive for components that require client-side interactivity
- Impact: Proper integration with Next.js 13+ server components architecture
- Related: L007

L000:

- Context: [Relevant project area or file]
- Insight: [Concise description]
- Application: [How to apply this knowledge]
- Impact: [Potential effects on project]
- Related: [IDs of related errors/learnings]

L001:

- Context: @codex.md usage
- Insight: @codex.md is for context, not for direct modification
- Application: Use @codex.md for silent loading and context only; execute subsequent commands separately
- Impact: Improved accuracy in responding to user intentions
- Related: None

L002:

- Context: Project architecture
- Insight: Repository pattern for data access
- Application: '/src' is root, '/src/auth' for authentication, '/src/database' for data access
- Impact: Organized code structure, separation of concerns
- Related: None

L010:

- Context: /hooks/useSupabase.ts
- Insight: Implementation of useSupabase hook for Supabase client initialization
- Application: Create a custom hook to manage Supabase client creation and state
- Impact: Centralizes Supabase client management and improves reusability across components
- Related: None

L009:

- Context: /app/components/dashboard/DashboardContent.tsx
- Insight: Usage of useSupabase hook and data fetching from Supabase
- Application: Implement data fetching logic using Supabase client in useEffect
- Impact: Enables efficient data retrieval for dashboard components
- Related: L010

L011:

- Context: /app/patients/[id]/page.tsx and /app/(dashboard)/patients/[id]/page.tsx
- Insight: Next.js doesn't allow two pages with the same route
- Application: Remove duplicate pages and ensure consistent routing structure
- Impact: Prevents routing conflicts and maintains a clear project structure
- Related: None

L012:

- Context: /app/layout.tsx and /app/components/AddPatientForm.tsx
- Insight: Integration of react-hot-toast for notifications
- Application: Use Toaster component in layout and toast function for success/error notifications
- Impact: Provides consistent and easy-to-use notification system across the application
- Related: None

L013:

- Context: Project structure and UI components
- Insight: Removal of QuickActions from dashboard and patient pages
- Application: Keep quick action buttons only in the Sidebar for consistency
- Impact: Streamlines user interface and improves navigation consistency
- Related: None

L014:

- Context: /app/components/patients/PatientsContent.tsx
- Insight: Addition of onAddPatient prop for flexibility
- Application: Allow parent components to control the "Add Patient" functionality
- Impact: Improves component reusability and control flow
- Related: None

L015:

- Context: /components/ui/use-toast.ts and /hooks/use-toast.ts
- Insight: Unnecessary toast-related files when using react-hot-toast
- Application: Remove these files when switching to react-hot-toast
- Impact: Reduces confusion and potential conflicts in toast implementation
- Related: L012

L016:

- Context: /app/doctors/[id]/page.tsx
- Insight: Duplicate Doctor interface declaration causing linter errors
- Application: Remove local Doctor interface and use the one imported from '@/types'
- Impact: Resolves linter errors and maintains consistent type definitions across the application
- Related: None

L017:

- Context: Clerk authentication in client-side components
- Insight: Sign-out process causing server-side errors in client context
- Application: Implement client-side sign-out handling using Clerk's useClerk hook
- Impact: Prevents errors during sign-out and improves user experience
- Related: None

L018:

- Context: /app/components/layout/Header.tsx
- Insight: Need for custom sign-out handling to avoid server-side errors
- Application: Use Clerk's useClerk hook for sign-out functionality
- Impact: Resolves sign-out errors and provides smoother authentication flow
- Related: L017

L0019
- Context: Authentication in Next.js API routes with Clerk
- Insight: Clerk's `getAuth` function requires a `NextRequest` object in API routes
- Application: Import `NextRequest` from 'next/server' and use it as the parameter type for API route handlers
- Impact: Ensures proper authentication handling in Next.js API routes when using Clerk
- Related: E0005

L020:

- Context: Layout structure and Sidebar component
- Insight: The Sidebar component is causing layout issues when used in multiple layouts
- Application: Refactor the layout structure to use a single, consistent layout for authenticated pages
- Impact: Improves UI consistency and prevents layout conflicts
- Related: None

L021:

- Context: /app/dashboard/layout.tsx and /app/layout.tsx
- Insight: Duplicate layout components causing potential conflicts
- Application: Consolidate layouts into a single, hierarchical structure
- Impact: Reduces redundancy and improves maintainability of the layout system
- Related: L020

L022:

- Context: /app/components/layout/Sidebar.tsx
- Insight: Sliding panel functionality may be interfering with overall layout
- Application: Consider alternative UI patterns for displaying additional content, such as modals or expandable sections
- Impact: Improves user experience and reduces layout complexity
- Related: L020

L023:

- Context: Authentication flow in layout components
- Insight: Authentication components are duplicated across different layouts
- Application: Centralize authentication handling in a single, high-level component
- Impact: Improves consistency of authentication UI and reduces code duplication
- Related: L021

L024:

- Context: /app/components/AddLogForm.tsx
- Insight: Implementation of a reusable form component for adding logs
- Application: Use this component in various parts of the application where log entries need to be added
- Impact: Improves consistency in log entry creation and reduces code duplication
- Related: L013

L025:

- Context: /app/lib/dataFetching.ts
- Insight: Centralized function for fetching appointments with various filtering options
- Application: Use this function across the application for consistent appointment data retrieval
- Impact: Improves code maintainability and ensures consistent data fetching logic
- Related: L009, L010

L026:

- Context: /app/components/dashboard/UpcomingAppointments.tsx
- Insight: Reusable component for displaying upcoming appointments
- Application: Use this component in dashboard and other relevant pages to show appointment information
- Impact: Ensures consistent display of appointment data across the application
- Related: L025

L027:

- Context: /app/patients/[id]/page.tsx and /app/doctors/[id]/page.tsx
- Insight: Similar structure for displaying patient and doctor details, including assigned relationships and appointments
- Application: Consider creating shared components for common elements like appointment lists and assigned doctors/patients
- Impact: Reduces code duplication and improves maintainability
- Related: L025, L026

L028:

- Context: /types/index.ts
- Insight: Comprehensive type definitions for various entities in the application
- Application: Use these types consistently across the application to ensure type safety
- Impact: Improves code quality, reduces runtime errors, and enhances developer experience
- Related: None

L029:

- Context: Overall application structure
- Insight: Consistent use of Shadcn UI components and Tailwind CSS for styling
- Application: Continue using these tools for new components and pages to maintain design consistency
- Impact: Ensures a cohesive user interface and speeds up development process
- Related: None

L030:

- Context: /app/appointments/[id]/page.tsx
- Insight: Implementation of "Set Next Appointment" button with green styling
- Application: Use Tailwind CSS classes for styling buttons and implement dialog for scheduling next appointment
- Impact: Improves user experience by providing a quick way to schedule follow-up appointments
- Related: L029, L026

L032:

Context: app/patients/[id]/page.tsx
Insight: Correct field names for patient data in the database
Application: Updated patient information display to use correct field names:
- 'date_of_birth' instead of 'birthdate'
- 'contact_number' instead of 'phone'
- 'name' as a single field instead of separate 'first_name' and 'last_name'
Impact: Ensures accurate data retrieval and display of patient information
Related: None

L033:

- Context: app/patients/[id]/page.tsx
- Insight: Implementation of vitals form with Zod schema validation
- Application: Use Zod for form validation and React Hook Form for form state management
- Impact: Improves data integrity and user experience when adding patient vitals
- Related: L029

L034:

- Context: app/components/AddAppointmentForm.tsx
- Insight: Removal of initialData references and implementation of dynamic doctor selection
- Application: Use state to manage form fields and implement conditional rendering for adding new doctors
- Impact: Enhances flexibility of the appointment form and allows for adding new doctors on the fly
- Related: L025, L026

L035:

- Context: app/lib/dataFetching.ts
- Insight: Centralized function for fetching appointments with doctor information
- Application: Use this function to retrieve appointments with associated doctor details across the application
- Impact: Ensures consistent data fetching and reduces duplication of database queries
- Related: L025, L026, L027

L036:

- Context: /app/components/AppTodoList.tsx
- Insight: Efficient handling of related data (patients) in Supabase queries for todo list
- Application: Use nested selects in Supabase queries to fetch related data in a single query
- Impact: Improves data retrieval efficiency and reduces the need for additional queries
- Related: L010, L025

L037:
- Context: app/lib/dataFetching.ts
- Insight: Unified appointment fetching function with flexible options
- Application: Use this function for fetching appointments across different components
- Impact: Improves code reusability and consistency in appointment data retrieval
- Related: L025, L026, L035

L038:
- Context: app/components/dashboard/DashboardContent.tsx, app/patients/[id]/page.tsx, app/doctors/[id]/page.tsx
- Insight: Consistent implementation of appointment fetching and display
- Application: Use the fetchAppointments function with appropriate options for each context
- Impact: Ensures uniform appointment handling across different pages
- Related: L037, L025, L026

L039:
- Context: app/patients/[id]/page.tsx, app/doctors/[id]/page.tsx
- Insight: Implementation of rescheduling and cancellation functionality
- Application: Use handleRescheduleSuccess and handleCancel functions for appointment management
- Impact: Provides consistent user experience for appointment modifications
- Related: L037, L038

L040:
- Context: app/doctors/[id]/page.tsx
- Insight: Integration of doctor-specific information and assigned patients
- Application: Fetch and display doctor details and assigned patients alongside appointments
- Impact: Offers a comprehensive view of a doctor's profile and responsibilities
- Related: L038, L039

L041:
- Context: app/components/dashboard/DashboardContent.tsx, app/doctors/[id]/page.tsx
- Insight: Unified appointment display and interaction across different views
- Application: Use consistent UI components for appointments in both dashboard and doctor-specific pages
- Impact: Improves user experience with a standardized interface for appointment management
- Related: L037, L038, L040

L042:
- Context: app/components/dashboard/DashboardContent.tsx, app/doctors/[id]/page.tsx
- Insight: Implementation of icon-based action buttons for appointments
- Application: Use icon buttons for reschedule and cancel actions to save space and improve visual clarity
- Impact: Enhances UI density and provides clear visual cues for appointment actions
- Related: L041

L043:
- Context: app/components/dashboard/DashboardContent.tsx, app/doctors/[id]/page.tsx
- Insight: Integration of calendar view with appointment list
- Application: Display a calendar alongside the appointment list to provide date context and selection
- Impact: Improves date-based navigation and visualization of appointment schedules
- Related: L041, L042

L044:
- Context: app/doctors/[id]/page.tsx
- Insight: Display of assigned patients in doctor's profile
- Application: Show a list of patients assigned to a doctor to provide an overview of their patient load
- Impact: Facilitates better patient management and quick access to patient information from the doctor's view
- Related: L040, L041

L045:
- Context: /app/patients/[id]/page.tsx
- Insight: Comprehensive patient details page with multiple health management components
- Application: Organize patient data into distinct components for vitals, documents, prescriptions, etc.
- Impact: Improves code organization and maintainability while providing a complete patient overview
- Related: L029, L032

L046:
- Context: /app/components/BillingManager.tsx
- Insight: Implementation of billing system with payment tracking and status management
- Application: Use status-based UI indicators and proper financial data handling
- Impact: Enables accurate financial tracking and billing management
- Related: L029, L045

L047:
- Context: /app/components/ImmunizationTracker.tsx
- Insight: Vaccine scheduling and tracking with automatic next due date calculation
- Application: Implement date-based calculations for recurring medical events
- Impact: Ensures proper immunization scheduling and patient follow-up
- Related: L045, L046

L048:
- Context: /app/components/VitalsTracker.tsx
- Insight: Real-time vitals monitoring with data visualization
- Application: Use charts and visual indicators for medical data representation
- Impact: Improves data interpretation and trend analysis
- Related: L045, L033

L049:
- Context: /app/lib/db/schema organization
- Insight: Modular schema definitions for different medical entities
- Application: Separate schema files for different aspects of the medical system
- Impact: Improves database schema management and maintainability
- Related: L028, L045

L050:
Context: /app/lib/timeline-service.ts and /app/types/timeline.ts
Insight: Implementation of timeline events with related data fetching
Application: Use nested selects in Supabase queries to fetch related data for timeline events
Impact: Provides comprehensive timeline view with associated medical data
Related: L037, L038

L051:
Context: /app/components/medical-history/TimelineView.tsx
Insight: Implementation of filterable timeline with event type categories
Application: Use dropdown menu for filtering and consistent color coding for event types
Impact: Improves user experience by allowing focused view of specific event types
Related: L050

L052:
Context: /supabase/migrations/20240312_medical_records.sql
Insight: Structured approach to medical records with RLS policies
Application: Create tables with proper relationships and security policies
Impact: Ensures data integrity and proper access control for medical records
Related: L049

L053:
Context: /app/components/medical-history/TimelineEventCard.tsx
Insight: Expandable card design for timeline events
Application: Use collapsible sections for detailed event information
Impact: Provides clean interface while allowing access to detailed information
Related: L051, L029

L054:
Context: /supabase/migrations/20240312_timeline_triggers.sql
Insight: Automated timeline event creation through database triggers
Application: Create triggers for various medical events to maintain timeline
Impact: Ensures consistent timeline updates across the application
Related: L052, L050

L057:
- Context: /app/components/notifications/NotificationListener.tsx
- Insight: Real-time notification system using Supabase's realtime subscriptions
- Application: Subscribe to database changes and show toast notifications
- Impact: Provides immediate user feedback for important system events
- Related: L053, L054

L058:
- Context: /supabase/migrations/20240312_medical_rls_policies.sql
- Insight: Comprehensive RLS policies with shared access control
- Application: Use RLS with patient_shares table for granular access control
- Impact: Ensures data security while allowing flexible sharing
- Related: L052, L055

L059:
- Context: /app/components/medical-history/TimelineView.tsx
- Insight: Unified timeline view for all patient-related events
- Application: Combine different event types with consistent UI and filtering
- Impact: Provides clear chronological view of patient history
- Related: L050, L051

L060:
- Context: /supabase/migrations/20240312_timeline_triggers.sql
- Insight: Automated timeline event generation using database triggers
- Application: Create timeline entries automatically for various medical events
- Impact: Maintains consistent timeline without manual intervention
- Related: L054, L059

L061:
- Context: /app/hooks/useSupabase.ts
- Insight: Protected property access in Supabase client should be avoided
- Application: Use auth.setSession instead of modifying rest.headers directly
- Impact: Prevents TypeScript errors and maintains proper encapsulation
- Related: L010

L062:
- Context: /app/lib/dataFetching.ts
- Insight: Consistent pattern for data fetching with user_id filtering
- Application: Use filter('user_id', 'eq', userId) for text-based user ID comparison
- Impact: Resolves UUID casting issues and maintains consistent data access patterns
- Related: L025, L035

L063:
- Context: Supabase RLS policies
- Insight: RLS policies should handle text-based user IDs consistently
- Application: Remove UUID casting in RLS policies and use text comparison
- Impact: Prevents type conversion errors and simplifies access control
- Related: L062

L064:
- Context: /app/components/patients/PatientsContent.tsx and /app/components/doctors/DoctorsContent.tsx
- Insight: Consistent error handling and loading state patterns
- Application: Use DataLoadingState component and handleError utility consistently
- Impact: Provides uniform user experience during data loading and error states
- Related: L029

L065:
- Context: /types/supabase.ts
- Insight: Database types should match actual column types exactly
- Application: Use string type for user_id fields instead of UUID
- Impact: Ensures type safety and prevents runtime type errors
- Related: L028, L062