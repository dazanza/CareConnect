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
- Context: app/(authenticated)/patients/[id]/page.tsx
- Insight: Improved organization of patient details page using tabs
- Application: 
  1. Split content into logical sections (Main and Documents)
  2. Use shadcn-ui Tabs component for better UX
  3. Move DocumentManager to dedicated tab to reduce cognitive load
  4. Add descriptive page header for better navigation context
- Impact: Enhanced user experience through better content organization and reduced information overload
- Related: L040, L041

L044:
- Context: app/patients/[id]/page.tsx
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

L066:
- Context: Database schema and data fetching
- Insight: Correct field names and relationships in Supabase schema
- Application: Update queries to match actual database structure:
  - Use first_name/last_name for doctors
  - Use date_time for vitals instead of created_at
  - Handle patient_doctors relationships correctly
- Impact: Ensures correct data fetching and prevents database errors
- Related: L062, L063

L067:
- Context: /app/components/ui/skeletons organization
- Insight: Skeleton components should be in app directory for Next.js App Router
- Application: Move skeleton components to /app/components/ui/skeletons.tsx
- Impact: Maintains consistent file organization and follows Next.js conventions
- Related: L029

L068:
- Context: /app/appointments/page.tsx
- Insight: Proper handling of nested Supabase query results
- Application: Transform nested data before setting state:  ```typescript
  const transformedData = data.map(apt => ({
    ...apt,
    doctor: {
      id: apt.doctor.id,
      name: `${apt.doctor.first_name} ${apt.doctor.last_name}`
    }
  }))  ```
- Impact: Ensures type safety and correct data structure
- Related: L066

L069:
- Context: /app/patients/[id]/page.tsx
- Insight: Consistent pattern for fetching related data
- Application: Use nested selects with proper field names:  ```typescript
  .select(`
    id,
    doctor:doctor_id (
      id,
      first_name,
      last_name,
      specialization,
      contact_number,
      email
    )
  `)  ```
- Impact: Improves data fetching efficiency and type safety
- Related: L066, L068


L070:
- Context: /app/layout.tsx and /app/components/layout/Sidebar.tsx
- Insight: Fixed layout issues by using proper width constraints and shrink-0
- Application: Use `w-60 shrink-0` on sidebar container and remove fixed positioning
- Impact: Ensures proper sidebar width and prevents content from being pushed right
- Related: L020, L021, L022

Key points:
1. The sidebar width needs to be fixed with `shrink-0` to prevent content shifting
2. Fixed positioning was causing layout issues and should be avoided
3. Content area should be wrapped in a flex container with proper padding
4. Removing duplicate layout components improves maintainability

L071:
Context: /app/components/patients/PatientsContent.tsx and /app/components/doctors/DoctorsContent.tsx
Insight: React Query v5 API changes require gcTime instead of cacheTime
Application: Update query options to use gcTime and proper staleTime settings
Impact: Ensures proper cache management and data freshness
Related: L069, L070

L072:
Context: /app/components/auth/SignOutButton.tsx
Insight: Clerk's signOut needs proper promise handling
Application: Use promise chaining instead of async/await for signOut
Impact: Prevents cookie-related errors during sign-out process
Related: L020, L021

L073:
Context: /app/components/layout/Sidebar.tsx
Insight: Sidebar needs consistent styling and state management
Application: Use Collapsible for expandable sections and proper state management for dialogs
Impact: Improves UX with consistent animations and state handling
Related: L070

L074:
Context: /app/page.tsx
Insight: BentoGrid component provides better feature showcase
Application: Use BentoGrid with consistent gradients and icons for features
Impact: Improves landing page visual appeal and information hierarchy
Related: None

L075:
Context: /app/components/VitalsChart.tsx
Insight: Recharts requires proper module resolution
Application: Update package installation and import structure
Impact: Resolves module resolution errors and ensures chart functionality
Related: None

L076:
- Context: Type organization in /app/types/
- Insight: Types should be organized by domain in separate files and re-exported from index.ts
- Application: Create separate type files (medications.ts, patients.ts, etc.) and use index.ts as a central export point
- Impact: Improves code organization, maintainability, and prevents circular dependencies
- Related: L028, L066

L077:
- Context: Database schema alignment in type definitions
- Insight: Type definitions must exactly match database schema including nullability and field types
- Application: Update interfaces to match database column definitions:
  - Use correct nullable fields based on is_nullable
  - Match data types (integer -> number, text -> string)
  - Include default fields like created_at, updated_at
- Impact: Ensures type safety and prevents runtime errors
- Related: L066, L076

L078:
- Context: Form data types vs database types
- Insight: Form data types should be separate from database entity types
- Application: Create separate interfaces for form data (e.g., MedicationFormData) that only include editable fields
- Impact: Provides better type safety for forms while maintaining database type accuracy
- Related: L077

L079:
- Context: Relationship handling in types
- Insight: Database relationships should be represented as optional nested objects in types
- Application: Add optional nested objects for relationships:  ```typescript
  doctor?: {
    id: number
    first_name: string
    last_name: string
  }  ```
- Impact: Provides type safety for joined queries while maintaining flexibility
- Related: L077, L078

L080:
- Context: Enum-like types in TypeScript
- Insight: Use string literal unions for enum-like types instead of enums
- Application: Define types like:  ```typescript
  type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'patch'  ```
- Impact: Provides better type safety and runtime performance than enums
- Related: L077, L078

L081:
- Context: /app/patients/[id]/page.tsx
- Insight: Patient data fetching should not convert ID types or add extra parsing
- Application: Use direct string ID from params in Supabase query:
  ```typescript
  .from('patients')
  .select('*')
  .eq('id', params.id)
  .single()
  ```
- Impact: Prevents type conversion issues and maintains working data fetching pattern
- Related: L066, L077

L082:
...

L083:
- Context: Migration from Clerk to Supabase Auth
- Insight: Consistent pattern for auth migration across components
- Application: 
  - Replace Clerk's useAuth with Supabase's useAuth from SupabaseAuthProvider
  - Update user ID access from userId to user.id
  - Remove Clerk-specific hooks and imports
- Impact: Ensures consistent authentication handling across the application
- Related: L010, L061

L084:
- Context: /app/lib/dataFetching.ts
- Insight: Proper pattern for Supabase query filters with searchTerm
- Application: Use ilike for main condition and or for additional conditions:
  ```typescript
  query = query
    .ilike('first_field', `%${searchTerm}%`)
    .or(`second_field.ilike.%${searchTerm}%`)
  ```
- Impact: Enables efficient text search across multiple fields
- Related: L062, L066

L085:
- Context: /app/lib/dataFetching.ts
- Insight: Proper structure for cached data fetching with options
- Application: Pass options object with spread operator to maintain type safety:
  ```typescript
  getCachedAppointments(
    supabase: SupabaseClient,
    userId: string,
    options: {
      searchTerm?: string
      limit?: number
      upcoming?: boolean
    } = {}
  )
  ```
- Impact: Ensures type-safe data fetching with optional parameters
- Related: L084, L062

L086: Next.js Route Group Organization
- Context: Organizing public vs authenticated routes
- Insight: Route groups provide clean separation without affecting URL structure
- Application: Used `(public)` and `(authenticated)` groups with middleware control
- Impact: Better code organization and cleaner routing logic
- Related: L087

L087: Middleware Path Control
- Context: Next.js middleware for route protection
- Insight: Middleware can handle both route groups and root paths
- Application:
  - Allow public routes with `path.startsWith('/(public)')`
  - Special case for root path `path === '/'`
  - Redirect authenticated users from public routes
- Impact: Centralized auth control with clean route organization
- Related: L086

L088: Landing Page Bento Box Design Pattern
- Context: Modern landing page layout
- Insight: Bento box grid with hover effects creates engaging UI
- Application: 
  - Grid layout with responsive columns
  - Card hover effects with gradient overlays
  - Color-coded sections for visual hierarchy
  - Consistent spacing and typography
- Impact: More visually appealing and interactive user experience
- Related: L089, L090

L089: Interactive Card Design Patterns
- Context: Feature showcase in landing page
- Insight: Combining multiple hover effects creates engaging interactions
- Application:
  - Layered hover effects (shadow, translation, opacity)
  - Gradient overlays with opacity transitions
  - Icon containers with semi-transparent backgrounds
  - Consistent color themes per feature category
- Impact: Enhanced visual hierarchy and user engagement
- Related: L088

L090: Responsive Typography Scaling
- Context: Landing page text hierarchy
- Insight: Using responsive font size modifiers improves readability
- Application:
  - Gradient text for main headings
  - Size scaling with viewport: sm:text-5xl md:text-6xl lg:text-7xl
  - Consistent text colors for dark/light modes
  - Max-width constraints for readability
- Impact: Better text hierarchy and responsive design
- Related: L088

L091: Next.js Route Group URL Patterns
- Context: Navigation with route groups
- Insight: Route group names in parentheses are for organization only and should not be included in URLs
- Application: Use clean paths in Link components:
  ```typescript
  // Correct:   <Link href="/sign-in">
  // Incorrect: <Link href="/(public)/sign-in">
  ```
- Impact: Prevents 404 errors and maintains clean URLs
- Related: L086, L087

L092: Middleware Path Handling with Route Groups
- Context: Next.js middleware with route groups
- Insight: Middleware should use clean paths without route group prefixes
- Application:
  ```typescript
  // Correct:
  if (path === '/sign-in' || path === '/sign-up') { ... }
  redirectUrl.pathname = '/patients'
  
  // Incorrect:
  if (path.startsWith('/(public)')) { ... }
  redirectUrl.pathname = '/(authenticated)/patients'
  ```
- Impact: Ensures correct routing and prevents 404 errors
- Related: L086, L087, L091

L093: Migrating SSO Users to Password Auth
- Context: Migration from Clerk SSO to Supabase password-based auth
- Insight: Use password reset flow to let users set up passwords
- Application:
  ```typescript
  // Send reset link
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`
  })
  
  // Update password after clicking link
  await supabase.auth.updateUser({
    password: newPassword
  })
  ```
- Impact: Smooth transition for users from SSO to password-based auth
- Related: L083

L094: Form State Management in Next.js
- Context: Sign-in and password reset forms
- Insight: Forms need complete state management and proper event handling
- Application:
  ```typescript
  // Connect form to submit handler
  <form onSubmit={handleSubmit}>
    <Input
      value={state}
      onChange={(e) => setState(e.target.value)}
      disabled={isLoading}
    />
    <Button disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Submit'}
    </Button>
  </form>
  ```
- Impact: Ensures forms work correctly with loading states and validation
- Related: L093

L095: Public Routes in Auth Middleware
- Context: Password reset flow with Next.js middleware
- Insight: Password reset routes must be public but not redirect authenticated users
- Application:
  ```typescript
  // Allow public routes without auth check
  if (path === '/reset-password' || path === '/update-password') {
    return res
  }

  // Only redirect auth users from sign-in/sign-up
  if (session && (path === '/sign-in' || path === '/sign-up')) {
    redirectUrl.pathname = '/patients'
  }
  ```
- Impact: Ensures password reset flow works for both auth and unauth users
- Related: L092, L093

L096: Supabase Email Configuration
- Context: Password reset and email verification flows
- Insight: Supabase requires SMTP configuration for sending emails
- Application:
  - Enable Email provider in Authentication > Providers
  - Configure SMTP in Authentication > Email Templates
  - Options:
    1. Supabase's built-in email (limited)
    2. Custom SMTP (SendGrid, SES, etc.)
  - Required for:
    - Password reset
    - Email verification
    - Magic link auth
- Impact: Enables email-based authentication features
- Related: L093, L095

L097: Supabase Auth URL Configuration
- Context: Password reset and OAuth flows
- Insight: Supabase requires proper Site URL configuration for auth flows
- Application:
  - Set Site URL in Authentication > URL Configuration
  - Must match your app's domain
  - Add development URLs for local testing
  - Example config:
    ```
    Site URL: https://your-domain.com
    Redirect URLs:
    - https://localhost:3000
    - https://dev.your-domain.com
    ```
- Impact: Ensures auth flows and redirects work correctly
- Related: L093, L096

L098: Supabase Email Verification Requirements
- Context: Email-based auth flows (reset password, magic links)
- Insight: Emails only sent to verified users in auth.users table
- Application:
  ```sql
  -- Verify user emails
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    raw_user_meta_data = jsonb_set(
      CASE 
        WHEN raw_user_meta_data IS NULL THEN '{}'::jsonb
        ELSE raw_user_meta_data 
      END,
      '{email_verified}',
      'true'
    )
  WHERE email_confirmed_at IS NULL;
  ```
- Impact: Ensures email-based auth flows work for all users
- Related: L093, L096

L099:
- Context: /app/(authenticated)/patients/[id]/page.tsx
- Insight: Tab-based organization improves content density and navigation
- Application: 
  1. Use shadcn-ui Tabs for content organization
  2. Group related content into logical tabs (Main, Documents)
  3. Add descriptive page header above tabs
  4. Keep primary content in main tab
  5. Move secondary features to dedicated tabs
- Impact: Reduces cognitive load and improves content accessibility while maintaining functionality
- Related: L029, L043

## L099 - Patient Details Page Organization

**Context**: The patient details page contains a lot of information that needs to be organized in a clear and intuitive way.

**Insight**: Using a combination of tabs, grid layouts, and visual hierarchy helps organize complex medical information effectively.

**Application**:
1. Use a prominent header with patient name and quick actions (share, edit)
2. Organize content into logical tabs (main info vs documents)
3. Place most important/frequently accessed info (patient details, vitals) in a 2-column grid at the top
4. Use consistent card styling with clear headers and descriptions
5. Place destructive actions (delete) at the bottom to prevent accidental clicks

**Impact**: Improves information density while maintaining clarity and usability. Makes it easier for healthcare providers to find and manage patient information.

**Related**: L029 (UI Components), L043 (Patient Page Organization)

L100:
- Context: /app/lib/prescriptions.ts
- Insight: Timeline-based event tracking for medical records
- Application: Use timeline events table to track all prescription changes with metadata
- Impact: Provides complete audit trail and history for medical records
- Related: L050, L051

L101:
- Context: /app/components/prescriptions/PrescriptionCard.tsx
- Insight: Reusable medical record display components with conditional patient info
- Application: Create flexible components that can show/hide patient details based on context
- Impact: Improves component reusability across different views (list vs details)
- Related: L029, L045

L102:
- Context: /app/(authenticated)/prescriptions/[id]/page.tsx
- Insight: Soft deletion pattern for medical records
- Application: Use status field ('active', 'discontinued') instead of deleting records
- Impact: Maintains complete medical history while allowing logical deletion
- Related: L100

L103:
- Context: /app/lib/prescriptions.ts
- Insight: Structured approach to medical record updates
- Application: Track reason and metadata for each prescription change
- Impact: Enables detailed audit trails and better decision tracking
- Related: L100, L102

L104:
- Context: /app/lib/prescription-analytics.ts
- Insight: Efficient prescription statistics calculation with single data pass
- Application: Use Map for counting and single forEach loop for multiple metrics
- Impact: Optimizes performance for large prescription datasets
- Related: L100, L101

L105:
- Context: /app/components/prescriptions/PrescriptionAnalytics.tsx
- Insight: Card-based analytics dashboard with consistent metrics display
- Application: 
  - Use grid layout for responsive card arrangement
  - Show key metrics with icons and descriptive text
  - Include trend indicators where relevant
  - Group related metrics together
- Impact: Provides clear overview of prescription data with good visual hierarchy
- Related: L029, L104

L106:
- Context: /app/components/prescriptions/AddPrescriptionForm.tsx
- Insight: Form organization for medical data entry
- Application:
  - Group related fields (patient/doctor selection)
  - Use grid layout for paired fields (dosage/frequency)
  - Implement date validation (end date after start date)
  - Pre-fill related fields when possible
- Impact: Improves data entry efficiency and reduces errors
- Related: L101, L102

L107:
- Context: /app/(authenticated)/doctors/[id]/page.tsx
- Insight: Effective organization of doctor details with appointments and patients
- Application: 
  - Grid layout with doctor info and appointments cards
  - Separate tabs for main info and patients list
  - Clickable appointment rows for better UX
  - Patient nickname display preference over full name
- Impact: Improved user experience and data organization
- Related: L026

L108:
- Context: /app/components/layout/Header.tsx
- Insight: Theme-aware component styling with Tailwind
- Application: 
  - Use bg-background instead of hardcoded colors
  - Apply text-foreground for theme-aware text
  - Use border-border for consistent border colors
  - Remove hardcoded color values
- Impact: Ensures proper theme support and consistent styling across modes
- Related: L029

L109:
- Context: /app/components/layout/Header.tsx
- Insight: Consistent theme token usage across components
- Application: 
  - Use theme tokens (background, foreground, border) consistently
  - Apply same pattern to all layout components
  - Maintain semantic naming for better maintainability
- Impact: Creates cohesive theming system across the application
- Related: L108, L029

L110:
- Context: Supabase RLS and stored procedures for notifications
- Insight: Using SECURITY DEFINER stored procedures to bypass RLS for complex operations
- Application: 
  1. Create stored procedure with SECURITY DEFINER
  2. Handle all related operations (share creation + notification) in single transaction
  3. Return result as JSONB for flexibility
  4. Call procedure using supabase.rpc() from client
- Impact: Resolves RLS policy conflicts while maintaining data integrity and security
- Related: L058, L063

L111:
- Context: Supabase notification system architecture
- Insight: Notifications need atomic creation with their triggering events
- Application:
  1. Create notifications within same transaction as triggering event
  2. Use stored procedures to handle complex notification logic
  3. Return complete operation result including notification status
  4. Handle notification failures gracefully without rolling back main operation
- Impact: Ensures reliable notification delivery while maintaining data consistency
- Related: L057, L110

L112:
- Context: Database column naming and data fetching
- Insight: Database column names must be used exactly as defined in schema
- Application: 
  1. Use `date_time` instead of `recorded_at` for vitals
  2. Use `prescribed_by` instead of `prescribed_at` for prescriptions
  3. Use `date` instead of `event_date` for timeline_events
  4. Use `created_at` for general timestamp ordering
- Impact: Prevents database errors and ensures consistent data access
- Related: L066, L077

L113:
- Context: Supabase join queries and nested selects
- Insight: Nested selects require proper alias and field specification
- Application:
  ```typescript
  .select(`
    *,
    doctor:prescribed_by (
      id,
      first_name,
      last_name,
      specialization
    )
  `)
  ```
- Impact: Ensures proper data fetching with joined tables
- Related: L069, L112

L114:
- Context: Data fetching error handling in React components
- Insight: Error messages should be specific and include error details
- Application:
  ```typescript
  catch (error) {
    console.error('Error fetching prescriptions:', error);
    // Optional: Show user-friendly error toast
    toast.error('Failed to load prescriptions');
  }
  ```
- Impact: Improves debugging and error tracking
- Related: L064, L112

L115:
- Context: Supabase query ordering
- Insight: Order by clauses should use actual column names with proper direction
- Application:
  ```typescript
  .order('date_time', { ascending: false })  // for vitals
  .order('date', { ascending: false })       // for timeline events
  .order('created_at', { ascending: false }) // for general timestamps
  ```
- Impact: Ensures consistent data ordering across the application
- Related: L112, L113

# AI Optimization Codex

## Supabase Relationships

### Foreign Key Joins
```typescript
// OPTIMAL: Use explicit foreign key relationship in select
.from('table')
.select(`
  id,
  related:foreign_key (
    id,
    field1,
    field2
  )
`)

// SUBOPTIMAL: Using separate queries or manual joins
const data = await getMainData()
const related = await getRelatedData()
const combined = data.map(item => ({
  ...item,
  related: related.find(r => r.id === item.foreign_key)
}))
```

### Nullable Relationships
```typescript
// OPTIMAL: Use optional chaining with fallbacks
{relationship?.field || 'Default'}

// SUBOPTIMAL: Direct access or complex conditionals
{relationship && relationship.field ? relationship.field : 'Default'}
```

### Type Safety
```typescript
// OPTIMAL: Define explicit interfaces and use type assertions
interface Relationship {
  id: string
  related: {
    id: string
    field: string
  }
}
setData((response.data as unknown as Relationship[]) || [])

// SUBOPTIMAL: Using any or ignoring types
setData(response.data as any)
```

## State Management

### Related Data Organization
```typescript
// OPTIMAL: Split related data into logical states
const [incoming, setIncoming] = useState<Type1[]>([])
const [outgoing, setOutgoing] = useState<Type2[]>([])

// SUBOPTIMAL: Combining different types in single state
const [data, setData] = useState<(Type1 | Type2)[]>([])
```

### Computed Values
```typescript
// OPTIMAL: Use computed functions for derived state
const getFiltered = () => {
  const all = type === 'a' ? dataA : type === 'b' ? dataB : [...dataA, ...dataB]
  return filter ? all.filter(filterFn) : all
}

// SUBOPTIMAL: Storing derived state
const [filtered, setFiltered] = useState([])
useEffect(() => {
  setFiltered(data.filter(filterFn))
}, [data, filterFn])
```

## UI Patterns

### Data Organization
```typescript
// OPTIMAL: Use tabs for clear data separation
<Tabs defaultValue="main">
  <TabsList>
    <TabsTrigger value="main">Main</TabsTrigger>
    <TabsTrigger value="related">Related</TabsTrigger>
  </TabsList>
  <TabsContent value="main">...</TabsContent>
  <TabsContent value="related">...</TabsContent>
</Tabs>

// SUBOPTIMAL: Long scrolling pages or complex nested views
<div>
  <MainSection />
  <RelatedSection />
  <MoreRelatedSection />
</div>
```

### Relationship Display
```typescript
// OPTIMAL: Clear visual hierarchy with icons
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 text-muted" />
  <span>{primary.name}</span>
  <ArrowIcon className="h-3 w-3" />
  <span>{related.name}</span>
</div>

// SUBOPTIMAL: Text-only or unclear relationships
<div>
  {primary.name} is related to {related.name}
</div>
```

### Loading & Empty States
```typescript
// OPTIMAL: Consistent loading and empty patterns
{isLoading ? (
  <LoadingSpinner />
) : items.length > 0 ? (
  <ItemsList items={items} />
) : (
  <EmptyState message="No items" action={<AddButton />} />
)}

// SUBOPTIMAL: Inconsistent or missing states
{!isLoading && items.map(item => (
  <Item key={item.id} {...item} />
))}
```

L116:
- Context: Supabase foreign key relationships in shared resources
- Insight: Proper foreign key relationship syntax is crucial for complex joins
- Application:
  ```typescript
  // Correct: Use explicit foreign key relationships with aliases
  .from('patient_shares')
  .select(`
    id,
    patient_id,
    shared_by:shared_by_user_id (
      id,
      first_name,
      last_name
    ),
    shared_with:shared_with_user_id (
      id,
      first_name,
      last_name
    )
  `)
  ```
- Impact: Ensures proper data fetching with multiple related tables
- Related: L113, L112

L117:
- Context: Handling nullable relationships in UI
- Insight: Always use optional chaining with fallbacks for relationship fields
- Application:
  ```typescript
  // Correct: Use optional chaining with fallbacks
  Shared by: {share.shared_by?.first_name || 'Unknown'} {share.shared_by?.last_name || ''}
  
  // Incorrect: Direct access can cause runtime errors
  Shared by: {share.shared_by.first_name} {share.shared_by.last_name}
  ```
- Impact: Prevents runtime errors from null/undefined relationship fields
- Related: L114, L116

L118:
- Context: State management for bidirectional relationships
- Insight: Split related data into logical groups for better organization
- Application:
  ```typescript
  // Correct: Separate states for different directions
  const [incomingShares, setIncomingShares] = useState<PatientShare[]>([])
  const [outgoingShares, setOutgoingShares] = useState<PatientShare[]>([])
  
  // Correct: Computed function for filtered/combined data
  const getFilteredShares = () => {
    const shares = filterType === 'shared_by_me' 
      ? outgoingShares 
      : filterType === 'shared_with_me' 
        ? incomingShares 
        : [...incomingShares, ...outgoingShares];
    return searchTerm ? shares.filter(filterFn) : shares;
  }
  ```
- Impact: Improves state management and data organization for complex relationships
- Related: L116, L117

L119:
- Context: UI organization for relationship data
- Insight: Use tabs and clear visual hierarchy for relationship display
- Application:
  ```typescript
  // Correct: Organize with tabs
  <Tabs>
    <TabsTrigger value="patients">Patients</TabsTrigger>
    <TabsTrigger value="files">Files</TabsTrigger>
    <TabsTrigger value="shares">Share Details</TabsTrigger>
  </Tabs>

  // Correct: Clear relationship display
  <div className="flex items-center gap-2">
    <UserPlus className="h-4 w-4" />
    Shared by: {share.shared_by?.first_name || 'Unknown'}
  </div>
  <div className="flex items-center gap-2">
    <UserMinus className="h-4 w-4" />
    Shared with: {share.shared_with?.first_name || 'Unknown'}
  </div>
  ```
- Impact: Improves user experience and data comprehension
- Related: L118, L117

L120:
- Context: /app/components/documents/DocumentManager.tsx
- Insight: Document management component with access control and category organization
- Application:
  1. Use canEdit prop for conditional rendering of upload/delete actions
  2. Organize documents by category with clear visual hierarchy
  3. Provide consistent document actions (view, download, delete)
  4. Handle file uploads with proper storage and database updates
- Impact: Improves document management UX while maintaining proper access control
- Related: L029, L099

L121:
- Context: Access control in UI components
- Insight: Consistent pattern for handling read-only access across components
- Application:
  1. Add canEdit prop with default value of true for backward compatibility
  2. Conditionally render action buttons based on canEdit
  3. Maintain view/download capabilities for read-only access
  4. Keep consistent UI structure regardless of access level
- Impact: Ensures proper access control without degrading user experience
- Related: L120, L029
