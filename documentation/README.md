# Patient Portal

A modern web application for managing patient records, prescriptions, and appointments.

## Features

- Secure authentication via Supabase Auth
- Patient management
- Patient sharing with granular access control
- Doctor management
- Prescription management with multiple medications
- Appointment scheduling
- Medical logs tracking
- Timeline events
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

The application provides comprehensive prescription management:

- Create prescriptions with multiple medications
- Track medication dosages and frequencies
- Connect prescriptions to appointments and logs
- Monitor prescription status and refills
- View prescription history in timeline
- Generate prescription analytics

## Patient Sharing

The application supports sharing patient data with other users:

- Share patients with specific access levels (read/write/admin)
- Time-limited access with expiration dates
- Granular control over shared data
- Real-time notifications for shared access

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