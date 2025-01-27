# Document Management System

## Overview

The document management system handles file uploads, storage, and retrieval for patient documents. It uses Supabase Storage for file storage and maintains metadata in the database.

## Components

### DocumentManager

Located at `/app/components/documents/DocumentManager.tsx`, this component provides:
- File upload with category selection
- Document listing and organization
- View/download functionality
- Access control via `canEdit` prop

### Storage Structure

- Bucket: 'documents'
- Path format: `{patientId}/{timestamp}.{extension}`
- Database storage: Relative paths only
- Public URLs: Generated on-demand for view/download

## Database Schema

```sql
create table documents (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id),
  name text not null,
  type text not null,
  size integer not null,
  url text not null,
  category text not null,
  uploaded_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Usage

```typescript
<DocumentManager
  patientId="123"
  initialDocuments={[]}
  canEdit={true}
/>
```

## Security

- Row Level Security (RLS) policies ensure users can only access their documents
- Storage bucket policies align with database RLS
- Public URLs are generated only when needed
- File paths include patient scoping for isolation

## Best Practices

1. Always use relative paths in database
2. Generate public URLs only when needed
3. Include proper error handling for upload/download
4. Clean up storage files when deleting records
5. Validate file types and sizes before upload 