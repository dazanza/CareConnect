# Care Connect

A modern web application for family members and caregivers to track patient care, prescriptions, and appointments.

## Features

- Secure authentication via Supabase Auth
- Patient tracking and management
- Collaborative care with granular access control
- Care provider/doctor tracking
- Basic prescription tracking
- Appointment scheduling and reminders
- Medical logs and notes
- Care timeline events
- Real-time updates
- Responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth & Database)
- TanStack Query
- React Hook Form
- Zod
- Shadcn UI
- Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Authentication

The application uses Supabase Auth for user authentication. Features include:

- Email/Password authentication
- Protected routes
- Session management
- Automatic redirects

## Prescription Management

The application provides basic prescription tracking:

- Record prescriptions from medical providers
- Track medication names and dosage instructions
- Link prescriptions to appointments and medical logs
- View prescription history in timeline
- Track prescription status (active/completed/discontinued)

## Patient Sharing

The application supports collaborative care between family members and caregivers:

- Share patient access with other caregivers (read/write/admin)
- Time-limited access for temporary caregivers
- Granular control over shared information
- Real-time notifications for care updates

## Database Schema

The application uses Supabase as its database. Key tables include:

- users (auth.users)
- patients
- doctors
- prescription_groups
- prescriptions
- timeline_events
- patient_shares
- appointments
- logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Type Safety

The application emphasizes strong type safety:

- Comprehensive TypeScript interfaces
- Strict database schema alignment
- Form-specific type definitions
- Web Speech API type definitions
- Proper handling of relationships
- Clear separation of concerns

## Form Handling

The application uses a robust form handling system:

- React Hook Form for state management
- Zod schemas for validation
- Type-safe form submissions
- Proper cleanup patterns
- Consistent error handling
- Real-time validation

## Enhanced Features

- Speech recognition for note taking
- Real-time data updates
- Proper error handling
- Loading state management
- Type-safe API integration 