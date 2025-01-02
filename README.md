# Medical Records Management System

A secure, multi-user medical records management system built with Next.js, TypeScript, and Supabase.

## Core Features

### Patient Management
- Create and manage patient profiles
- Track patient demographics and basic information
- Secure sharing of patient records with other users
- Family group management for related patients

### Medical Records
- Medical history tracking
- Allergy management
- Immunization records
- Vital signs monitoring
- Lab results tracking
- Medication management
- Document storage and management

### Appointment System
- Schedule and manage appointments
- Automatic appointment reminders
- Doctor-patient relationship tracking

### Timeline & Notifications
- Chronological medical event timeline
- Real-time notifications for:
  - Upcoming appointments
  - Medication reminders
  - Lab results
  - Record sharing

## Security Features

### Row Level Security (RLS)
All tables are protected by RLS policies ensuring:
- Users can only access their own data
- Shared records are accessible based on explicit permissions
- Admin users have appropriate elevated access

### Data Sharing
- Granular access control with read/write/admin permissions
- Time-based access expiration
- Pending share invitations system
- Family group sharing capabilities

### User Authentication
- Secure authentication via Clerk
- Role-based access control
- Admin user management

## Technical Architecture

### Database Schema

#### Core Tables
- `patients`: Patient demographic and basic information
- `medical_history`: Chronological medical events
- `medications`: Medication tracking
- `allergies`: Allergy records
- `immunizations`: Vaccination records
- `lab_results`: Laboratory test results
- `vitals`: Patient vital signs
- `appointments`: Medical appointments

#### Sharing & Access Control
- `patient_shares`: Record sharing permissions
- `pending_shares`: Share invitations
- `family_groups`: Family relationship management
- `admin_users`: Administrative access control

#### Supporting Features
- `documents`: Medical file storage
- `notes`: Clinical notes and voice recordings
- `timeline_events`: Aggregated medical timeline
- `notifications`: System notifications
- `todos`: Task management

### Security Implementation

#### Row Level Security Policies
- Owner access: Full CRUD operations on owned records
- Shared access: Read or write based on explicit permissions
- Admin access: System-wide management capabilities
- Time-based access: Automatic expiration of shared access

#### Functions & Triggers
- `requesting_user_id()`: Secure user identification
- `update_updated_at_column()`: Automatic timestamp management
- `create_appointment_reminder()`: Automated notifications
- `create_timeline_event_*()`: Automated timeline updates
- `cleanup_old_notifications()`: System maintenance

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- Supabase CLI
- Clerk account

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
```bash
cp .env.example .env.local
```
4. Initialize Supabase:
```bash
supabase init
supabase start
```
5. Run migrations:
```bash
supabase db push
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Security Considerations

### Data Protection
- All medical data is encrypted at rest
- Secure transmission via HTTPS
- Regular security audits
- Automated cleanup of sensitive data

### Access Control
- Principle of least privilege
- Time-limited access tokens
- Audit logging of access
- Secure password policies

### Compliance
- HIPAA-aligned security practices
- Data privacy protection
- Secure data sharing protocols
- Audit trail maintenance

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests. 