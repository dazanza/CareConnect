# Document System Migration Plan

## Overview

This document outlines the comprehensive plan for enhancing the CareConnect document management system. The migration will improve access management, preview capabilities, and overall system robustness while building upon existing version control functionality.

## Current System

### Database Schema
```sql
-- Main documents table
documents (
  id uuid primary key default uuid_generate_v4(),
  patient_id integer NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  url text NOT NULL,
  category text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  current_version integer default 1,
  version_count integer default 1
);

-- Existing version control table
document_versions (
  id uuid NOT NULL default uuid_generate_v4(),
  document_id uuid,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  size integer NOT NULL,
  created_by uuid,
  created_at timestamp with time zone default now(),
  comment text,
  metadata jsonb
);

-- Access control table
document_access (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid NOT NULL references documents(id),
  user_id uuid NOT NULL,
  access_level document_access_level NOT NULL,
  granted_by uuid NOT NULL,
  granted_at timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  UNIQUE(document_id, user_id)
);

-- Audit log table
document_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid NOT NULL references documents(id),
  user_id uuid NOT NULL,
  action document_audit_action NOT NULL,
  action_timestamp timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  metadata jsonb,
  ip_address text,
  user_agent text
);
```

### Current Storage Structure
```
documents/
  ├── {patientId}/
  │   └── {timestamp}.{extension}
```

### Existing Features
+ Version control with metadata
+ Basic file storage
+ Patient-document association
+ User tracking
+ Document categorization

### Current Limitations
- Limited access control
- No preview generation
- Basic storage organization
- No audit trail for access
- Limited file type validation
- No automatic preview generation

## Migration Plan

### Phase 1: Access Control Enhancement

#### New Tables
```sql
-- Document access control table
CREATE TABLE document_access (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id),
  user_id uuid references auth.users(id),
  access_level text NOT NULL CHECK (access_level IN ('view', 'edit', 'admin')),
  granted_by uuid references auth.users(id) NOT NULL,
  granted_at timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  UNIQUE(document_id, user_id)
);

-- Document preview cache table
CREATE TABLE document_previews (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id),
  version_number integer NOT NULL,
  preview_type text NOT NULL CHECK (preview_type IN ('thumbnail', 'pdf_preview', 'web_view')),
  preview_url text NOT NULL,
  generated_at timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  expires_at timestamp with time zone NOT NULL,
  size integer NOT NULL,
  status text NOT NULL default 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  UNIQUE(document_id, version_number, preview_type)
);

-- Document audit log
CREATE TABLE document_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id),
  user_id uuid references auth.users(id),
  action text NOT NULL,
  action_timestamp timestamp with time zone NOT NULL default timezone('utc'::text, now()),
  metadata jsonb,
  ip_address text,
  user_agent text
);
```

### Phase 2: Storage Structure Enhancement

#### New Structure
```
documents/
  ├── {patientId}/
  │   ├── originals/
  │   │   └── {documentId}/
  │   │       ├── v1_{timestamp}.{extension}
  │   │       └── v2_{timestamp}.{extension}
  │   ├── previews/
  │   │   └── {documentId}/
  │   │       ├── thumbnail.{extension}
  │   │       ├── preview.pdf
  │   │       └── web_view.html
  │   └── temp/
  │       └── {uploadId}.{extension}
```

### Phase 3: Service Layer Implementation

#### Access Control Service
```typescript
interface AccessControl {
  grantAccess(documentId: string, userId: string, level: AccessLevel): Promise<void>;
  revokeAccess(documentId: string, userId: string): Promise<void>;
  listAccess(documentId: string): Promise<DocumentAccess[]>;
  checkAccess(documentId: string, userId: string): Promise<AccessLevel>;
  updateAccess(documentId: string, userId: string, level: AccessLevel): Promise<void>;
  getAccessAudit(documentId: string): Promise<DocumentAuditLog[]>;
}
```

#### Preview Service
```typescript
interface PreviewService {
  generatePreviews(documentId: string): Promise<DocumentPreviews>;
  getPreview(documentId: string, type: PreviewType): Promise<string>;
  invalidatePreview(documentId: string): Promise<void>;
  checkPreviewStatus(documentId: string): Promise<PreviewStatus>;
  regeneratePreview(documentId: string, type: PreviewType): Promise<void>;
}
```

## Implementation Timeline

### Week 1: Access Control Infrastructure
- [ ] Document access table creation
- [ ] Access control service implementation
- [ ] RLS policy updates
- [ ] Access audit logging

### Week 2: Preview System
- [ ] Preview table creation
- [ ] Preview generation service
- [ ] Storage structure updates
- [ ] Preview caching system

### Week 3: Storage & File Processing
- [ ] Storage reorganization
- [ ] File type validation
- [ ] Automatic preview generation
- [ ] Chunked upload support

### Week 4: UI Components
- [ ] Access management interface
- [ ] Preview components
- [ ] File upload improvements
- [ ] Progress tracking

### Week 5: Testing & Security
- [ ] Access control testing
- [ ] Preview system testing
- [ ] Performance testing
- [ ] Security audit

## Migration Scripts

### Access Control Migration
```sql
-- Step 1: Create access control table
BEGIN;
  CREATE TABLE document_access (...);
  
  -- Set up initial access for document owners
  INSERT INTO document_access (document_id, user_id, access_level, granted_by)
  SELECT id, user_id, 'admin', user_id
  FROM documents;
COMMIT;

-- Step 2: Create audit logging
BEGIN;
  CREATE TABLE document_audit_logs (...);
  
  -- Create audit trigger
  CREATE OR REPLACE FUNCTION audit_document_access()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO document_audit_logs (
      document_id, user_id, action, metadata
    ) VALUES (
      NEW.document_id,
      auth.uid(),
      TG_OP,
      jsonb_build_object('access_level', NEW.access_level)
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER document_access_audit
  AFTER INSERT OR UPDATE OR DELETE ON document_access
  FOR EACH ROW EXECUTE FUNCTION audit_document_access();
COMMIT;
```

### Preview System Migration
```sql
-- Step 1: Create preview table
BEGIN;
  CREATE TABLE document_previews (...);
  
  -- Create preview status enum
  CREATE TYPE preview_status AS ENUM ('pending', 'processing', 'completed', 'failed');
  
  -- Add preview trigger
  CREATE OR REPLACE FUNCTION queue_document_preview()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO document_previews (
      document_id,
      version_number,
      preview_type
    ) VALUES (
      NEW.id,
      1,
      'thumbnail'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER document_preview_queue
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION queue_document_preview();
COMMIT;
```

### Storage Migration
```typescript
async function migrateStorage() {
  // 1. Create new directory structure
  // 2. Move existing files to versioned structure
  // 3. Generate initial previews
  // 4. Update database records
  // 5. Verify migration
  // 6. Clean up old structure
}
```

## Rollback Plan

### Database Rollback
```sql
-- Revert schema changes if needed
DROP TABLE IF EXISTS document_audit_logs;
DROP TABLE IF EXISTS document_previews;
DROP TABLE IF EXISTS document_access;
```

### Storage Rollback
```typescript
async function rollbackStorage() {
  // 1. Verify backup exists
  // 2. Restore original structure
  // 3. Clean up new structure
}
```

## Security Considerations

1. Access Control
   - Row Level Security (RLS) policies
   - Role-based access control
   - Audit logging
   - Session management
   - IP tracking
   - User agent validation

2. Storage Security
   - Encrypted storage
   - Secure file paths
   - Temporary URL generation
   - File type validation
   - Size limits
   - Malware scanning

3. API Security
   - Rate limiting
   - Request validation
   - Error handling
   - Authentication checks
   - CORS policies
   - Request signing

## Performance Optimization

1. Preview Generation
   - Async processing
   - Queue management
   - Size optimization
   - Format selection
   - Caching strategy
   - CDN integration

2. Storage Access
   - CDN integration
   - Compression
   - Chunked uploads
   - Streaming downloads
   - Cache headers
   - Range requests

3. Database Queries
   - Indexing strategy
   - Query optimization
   - Connection pooling
   - Cache invalidation
   - Materialized views
   - Partitioning

## Monitoring & Maintenance

1. System Health
   - Storage usage
   - Database performance
   - Cache hit rates
   - Error rates
   - Preview generation stats
   - Queue metrics

2. User Activity
   - Access patterns
   - Preview usage
   - Download patterns
   - Upload metrics
   - Error tracking
   - Performance metrics

3. Security Events
   - Access attempts
   - Permission changes
   - File modifications
   - System alerts
   - IP tracking
   - Audit log analysis

## Version Information
Version: 1.1.0
Last Updated: March 2024
Status: Draft 

## Access Control Implementation

### Component Architecture
The access control system is implemented using a modular component architecture:

1. **GrantAccessDialog**
   - Handles user selection with search
   - Access level selection (view/edit/admin)
   - Optional expiration date
   - Error handling and validation

2. **UserSearchInput**
   - Debounced search functionality
   - Recent users list
   - Role-based suggestions
   - User details display

3. **DocumentAccessPanel**
   - Lists current access grants
   - Manages access levels
   - Handles access revocation
   - Shows expiration status

4. **DocumentAuditLog**
   - Displays chronological audit trail
   - Action filtering and grouping
   - Infinite scroll support
   - Detailed action metadata

### Type Safety
```typescript
// Access level types
type AccessLevel = 'view' | 'edit' | 'admin';

// Audit action types
type DocumentAuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'download'
  | 'grant_access'
  | 'revoke_access'
  | 'update_access';

// Access record type
interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  accessLevel: AccessLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}

// Audit log type
interface DocumentAuditLog {
  id: string;
  documentId: string;
  userId: string;
  action: DocumentAuditAction;
  actionTimestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

### Performance Optimizations

1. **User Search**
   - Debounced input handling
   - Cached recent users
   - Role-based suggestions
   - Optimistic updates

2. **Audit Logging**
   - Infinite scroll implementation
   - Efficient data fetching
   - Materialized views for aggregations
   - Indexed audit trails

3. **Access Checks**
   - Cached access levels
   - Optimistic UI updates
   - Background revalidation
   - Efficient RLS policies

### Security Measures

1. **Row Level Security**
```sql
-- Document access policy
CREATE POLICY "document_access_policy" ON documents
  USING (
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = documents.id
      AND user_id = auth.uid()
      AND access_level IN ('view', 'edit', 'admin')
      AND (expires_at IS NULL OR expires_at > now())
      AND revoked_at IS NULL
    )
  );

-- Audit log policy
CREATE POLICY "audit_log_policy" ON document_audit_logs
  USING (
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = document_audit_logs.document_id
      AND user_id = auth.uid()
      AND access_level = 'admin'
      AND (expires_at IS NULL OR expires_at > now())
      AND revoked_at IS NULL
    )
  );
```

2. **Access Validation**
   - Server-side validation
   - Expiration checks
   - Role-based restrictions
   - Audit trail enforcement

### Mobile Considerations

1. **Offline Support**
   - Cached access levels
   - Queued access changes
   - Background sync
   - Conflict resolution

2. **UI Adaptations**
   - Mobile-optimized dialogs
   - Touch-friendly controls
   - Responsive layouts
   - Loading states

## Migration Steps

1. Schema Updates
   - Add access control tables
   - Create audit log tables
   - Add necessary indexes
   - Setup RLS policies

2. Component Implementation
   - Build UI components
   - Implement hooks
   - Add type definitions
   - Write tests

3. Data Migration
   - Transfer existing permissions
   - Generate audit history
   - Validate access records
   - Update references

4. Testing & Validation
   - Unit tests
   - Integration tests
   - Security testing
   - Performance testing

## Rollback Plan

1. Schema Rollback
   - Revert table changes
   - Restore old permissions
   - Remove new indexes

2. Code Rollback
   - Revert components
   - Remove new types
   - Restore old logic

3. Data Restoration
   - Restore from backup
   - Validate integrity
   - Check permissions 