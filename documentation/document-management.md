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

## Type Safety and Data Transformation

### Data Transformation Patterns

We follow strict type safety patterns when handling database responses:

```typescript
// Safe transformer pattern
function transformData(raw: any): TypedResponse | null {
  if (!raw?.requiredField) return null;
  return {
    // transformed data
  };
}

// Usage with type guards
const validData = rawData
  .map(transformData)
  .filter((item): item is TypedResponse => item !== null);
```

### Base Types and Extensions

Use interface extension for related data types:

```typescript
interface BaseType {
  id: number;
  date: string;
}

interface ExtendedType extends BaseType {
  additionalFields: string;
}
```

### Error Handling

- Always validate database responses before processing
- Transform raw data into typed structures
- Use type guards to ensure type safety
- Handle missing or invalid data gracefully

## Best Practices

1. Always use relative paths in database
2. Generate public URLs only when needed
3. Include proper error handling for upload/download
4. Clean up storage files when deleting records
5. Validate file types and sizes before upload

1. Data Validation
   - Validate all required fields
   - Return null for invalid data
   - Use type guards with filter operations

2. Type Safety
   - Use TypeScript interfaces
   - Extend base types for related data
   - Implement proper type guards

3. Error Handling
   - Check for query errors first
   - Transform data safely
   - Handle edge cases explicitly

4. Code Documentation
   - Document the purpose of interfaces
   - Explain type constraints
   - Note optional fields and their context 