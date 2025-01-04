# Patient Portal

A modern web application for managing patient records and appointments.

## Features

- Secure authentication via Supabase Auth
- Patient management
- Patient sharing with granular access control
- Appointment scheduling
- Medical records tracking
- Real-time updates
- Responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth & Database)
- TanStack Query
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
- patient_shares
- appointments
- medical_records

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 