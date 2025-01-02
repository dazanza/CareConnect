# Technical Architecture

## System Overview

```mermaid
graph TD
    Client[Client Application] --> Auth[Clerk Auth]
    Client --> API[Next.js API Routes]
    API --> Supabase[Supabase Backend]
    
    subgraph Database
        Supabase --> CoreTables[Core Tables]
        Supabase --> Security[Security Layer]
        Supabase --> Storage[File Storage]
        
        CoreTables --> Patients[Patients]
        CoreTables --> Medical[Medical Records]
        CoreTables --> Timeline[Timeline Events]
        
        Security --> RLS[Row Level Security]
        Security --> Policies[Access Policies]
        Security --> Functions[Security Functions]
    end
    
    subgraph Automation
        Triggers[DB Triggers] --> Notifications[Notifications]
        Triggers --> TimelineUpdates[Timeline Updates]
        Triggers --> Reminders[Appointment Reminders]
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Auth
    participant DB
    
    User->>Client: Request Data
    Client->>Auth: Verify Token
    Auth-->>Client: Token Valid
    Client->>API: Authenticated Request
    API->>DB: Query with RLS
    DB-->>API: Filtered Data
    API-->>Client: Secured Response
    Client-->>User: Display Data
```

## Security Architecture

```mermaid
graph LR
    subgraph Authentication
        Clerk --> JWT[JWT Tokens]
        JWT --> Claims[User Claims]
    end
    
    subgraph Authorization
        Claims --> RLS[Row Level Security]
        RLS --> Policies[Access Policies]
        Policies --> Tables[Database Tables]
    end
    
    subgraph DataAccess
        User --> OwnRecords[Own Records]
        User --> SharedRecords[Shared Records]
        Admin --> AllRecords[All Records]
    end
```

## Database Relations

```mermaid
erDiagram
    PATIENTS ||--o{ MEDICAL_HISTORY : has
    PATIENTS ||--o{ MEDICATIONS : takes
    PATIENTS ||--o{ APPOINTMENTS : schedules
    PATIENTS ||--o{ LAB_RESULTS : receives
    PATIENTS ||--o{ VITALS : tracks
    
    PATIENTS ||--o{ PATIENT_SHARES : shares
    PATIENT_SHARES }|--|| USERS : with
    
    PATIENTS ||--o{ PATIENT_FAMILY_GROUP : belongs_to
    PATIENT_FAMILY_GROUP }|--|| FAMILY_GROUPS : in
    
    TIMELINE_EVENTS ||--o{ MEDICAL_HISTORY : references
    TIMELINE_EVENTS ||--o{ LAB_RESULTS : references
    TIMELINE_EVENTS ||--o{ MEDICATIONS : references
    TIMELINE_EVENTS ||--o{ APPOINTMENTS : references
```

## Security Implementation Details

### Row Level Security (RLS)

All tables implement RLS with these basic patterns:

1. Owner Access:
```sql
CREATE POLICY "Users can manage own data" ON table_name
FOR ALL USING (user_id = requesting_user_id_immutable());
```

2. Shared Access:
```sql
CREATE POLICY "Users can view shared data" ON table_name
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM patient_shares
        WHERE patient_shares.patient_id = table_name.patient_id
        AND patient_shares.shared_with_user_id::text = requesting_user_id_immutable()
        AND patient_shares.access_level = ANY (ARRAY['read', 'write', 'admin'])
        AND (patient_shares.expires_at IS NULL OR patient_shares.expires_at > now())
    )
);
```

3. Admin Access:
```sql
CREATE POLICY "Admins have full access" ON table_name
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id::text = requesting_user_id_immutable()
    )
);
```

### Security Functions

Key security functions include:

1. User Identification:
```sql
CREATE FUNCTION requesting_user_id_immutable()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'email')::text
  );
$$;
```

2. Automated Timeline Updates:
```sql
CREATE FUNCTION create_timeline_event_vitals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.timeline_events (...)
    VALUES (...);
    RETURN NEW;
END;
$$;
``` 