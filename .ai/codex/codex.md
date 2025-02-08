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

E003:

- Context: Database schema alignment
- Error: Mismatched types between schema and TypeScript interfaces
- Correction: Update interfaces to exactly match database schema
- Prevention: Always verify schema before creating interfaces
- Related: L077, L078

E004:

- Context: Component prop types
- Error: Missing required prop types in component interfaces
- Correction: Add all required props to component interfaces
- Prevention: Document and type all props before implementation
- Related: L078, L079

E005:

- Context: Form submission types
- Error: Incorrect form data structure for API endpoints
- Correction: Create separate form submission interfaces
- Prevention: Define API types before implementing forms
- Related: L078, L156

E006:

- Context: Toast notification implementation
- Error: Inconsistent toast usage across components
- Correction: Implement standardized toast utility
- Prevention: Use centralized toast utility for all notifications
- Related: L261, L262

E007:

- Context: Next.js configuration
- Error: Deprecated experimental.serverActions configuration
- Correction: Remove experimental.serverActions as it's now default in Next.js 14
- Prevention: Keep up with Next.js documentation for deprecated features
- Related: L276, L277

E008:

- Context: React dependency resolution
- Error: Conflicting peer dependencies with @react-email/components
- Correction: Use --legacy-peer-deps for development environment
- Prevention: Check peer dependencies before adding new packages
- Related: L276, L278

## Learnings

L251:

- Context: Share analytics implementation
- Insight: Proper pattern for tracking share usage and metrics
- Application: Create dedicated analytics service with proper types
- Impact: Enables accurate tracking and reporting of share usage
- Related: L104, L105

L252:

- Context: Document versioning system
- Insight: Efficient storage and retrieval of document versions
- Application: Use metadata table for version tracking
- Impact: Maintains complete document history without duplication
- Related: L249, L250

L253:

- Context: Security monitoring implementation
- Insight: Comprehensive security logging and monitoring
- Application: Track all security-related events with proper context
- Impact: Improves security auditing and incident response
- Related: L110, L111

L254:

- Context: Performance optimization patterns
- Insight: Consistent approach to optimizing components
- Application: Use React.memo and proper dependency management
- Impact: Reduces unnecessary re-renders and improves performance
- Related: L247, L248

L255:

- Context: Testing strategy implementation
- Insight: Comprehensive testing approach for all features
- Application: Combine unit, integration, and E2E tests effectively
- Impact: Ensures proper test coverage and reliability
- Related: None

L256:

- Context: Infrastructure monitoring
- Insight: Proper monitoring of system health and performance
- Application: Implement comprehensive monitoring solution
- Impact: Enables proactive issue detection and resolution
- Related: L253, L254

L257:

- Context: Database optimization
- Insight: Query optimization and indexing strategies
- Application: Create proper indexes and optimize complex queries
- Impact: Improves database performance and reduces load
- Related: L112, L113

L258:

- Context: Component library organization
- Insight: Proper structure for shared component library
- Application: Organize components by domain and functionality
- Impact: Improves component discoverability and reuse
- Related: L029, L250

L259:

- Context: Error handling patterns
- Insight: Consistent error handling across application
- Application: Create centralized error handling system
- Impact: Improves error reporting and user experience
- Related: L114, L253

L260:

- Context: State management patterns
- Insight: Efficient state management with proper types
- Application: Use appropriate state management for each case
- Impact: Improves application stability and maintainability
- Related: L247, L248

L261:

- Context: Toast notification standardization
- Insight: Centralized toast management improves consistency
- Application: Create showToast utility with type-safe methods
- Impact: Ensures consistent user feedback across application
- Related: E006, L262

L262:

- Context: Component toast migration
- Insight: Systematic approach to updating toast implementations
- Application: Update all components to use standardized toast
- Impact: Reduces code duplication and improves maintainability
- Related: E006, L261

L263:

- Context: MedicationManager component
- Insight: Proper database schema alignment for medications
- Application: Update component to match database structure
- Impact: Ensures data consistency and type safety
- Related: E003, L077

L264:

- Context: Form data typing
- Insight: Separate interfaces for form and database types
- Application: Create specific interfaces for form state
- Impact: Improves type safety in form handling
- Related: L078, E005

L265:

- Context: Medication management system
- Insight: Comprehensive approach to medication tracking
- Application: Implement full CRUD with proper types and validation
- Impact: Enables accurate medication tracking and monitoring
- Related: L263, L264

L266:

- Context: Medication form validation
- Insight: Proper validation for medication data
- Application: Use Zod schema for type-safe validation
- Impact: Ensures data integrity and proper error handling
- Related: L264, E005

L267:

- Context: Medication component architecture
- Insight: Separation of concerns in medication management
- Application: Split into manager and form components
- Impact: Improves maintainability and reusability
- Related: L258, L263

L268:

- Context: Medication data relationships
- Insight: Proper handling of medication relationships
- Application: Implement proper foreign key relationships
- Impact: Maintains data consistency across the system
- Related: L257, L263

L276:

- Context: Next.js 14 configuration
- Insight: Server Actions are now available by default
- Application: Remove experimental.serverActions from next.config.js
- Impact: Cleaner configuration and better maintainability
- Related: E007, L277

L277:

- Context: Next.js configuration validation
- Insight: Next.js strictly validates config object types
- Application: Use proper type structure for experimental features
- Impact: Prevents runtime errors from misconfigured options
- Related: E007, L276

L278:

- Context: React dependency management
- Insight: Modern npm peer dependency resolution can be too strict
- Application: Use --legacy-peer-deps for complex React ecosystems
- Impact: Enables development while maintaining package compatibility
- Related: E008, L279

L279:

- Context: Package deprecation handling
- Insight: Several core packages showing deprecation warnings
- Application: Plan migration path for deprecated packages
- Impact: Maintains long-term project maintainability
- Related: L278, E008

## Type Safety Patterns

### Safe Database Response Transformation

## Database Optimization Patterns

### Materialized Views
```sql
-- Create materialized view for aggregated data
CREATE MATERIALIZED VIEW mv_user_stats AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT p.id) as patient_count,
  COUNT(DISTINCT a.id) as appointment_count
FROM users u
LEFT JOIN patients p ON u.id = p.user_id
LEFT JOIN appointments a ON u.id = a.user_id
GROUP BY u.id;

-- Create secure view on top
CREATE VIEW user_stats AS
SELECT s.*
FROM mv_user_stats s
WHERE s.user_id = auth.uid();

-- Create refresh function and trigger
CREATE FUNCTION refresh_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH STATEMENT EXECUTE FUNCTION refresh_stats();
```

### Full-Text Search
```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search document view
CREATE MATERIALIZED VIEW mv_patient_search AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  to_tsvector('english',
    concat_ws(' ',
      p.first_name,
      p.last_name,
      string_agg(m.name, ' ')
    )
  ) as search_vector
FROM patients p
LEFT JOIN medications m ON p.id = m.patient_id
GROUP BY p.id;

-- Create GIN indexes
CREATE INDEX idx_search_trgm 
ON mv_patient_search USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

CREATE INDEX idx_search_vector 
ON mv_patient_search USING GIN (search_vector);
```

### Optimized Timeline Queries
```sql
-- Create composite indexes
CREATE INDEX idx_medications_patient_date 
ON medications (patient_id, start_date DESC NULLS LAST);

CREATE INDEX idx_appointments_patient_date 
ON appointments (patient_id, date DESC NULLS LAST);

-- Create timeline view
CREATE MATERIALIZED VIEW mv_patient_timeline AS
SELECT 
  'medication' as event_type,
  m.id as event_id,
  m.patient_id,
  m.name as title,
  m.start_date as event_date
FROM medications m
UNION ALL
SELECT 
  'appointment' as event_type,
  a.id as event_id,
  a.patient_id,
  a.type as title,
  a.date as event_date
FROM appointments a;
```

### Type-Safe Queries
```typescript
interface TimelineEvent {
  event_type: 'medication' | 'appointment'
  event_id: number
  patient_id: number
  title: string
  event_date: string
}

async function fetchTimeline(
  supabase: SupabaseClient,
  patientId: number
): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('patient_timeline')
    .select('*')
    .eq('patient_id', patientId)
    .order('event_date', { ascending: false })
    .returns<TimelineEvent[]>()

  if (error) throw error
  return data || []
}
```

### Performance Best Practices
1. Use materialized views for expensive computations
2. Add composite indexes for common query patterns
3. Implement concurrent view refreshes
4. Use array_agg for efficient grouping
5. Add type safety with TypeScript interfaces
6. Implement proper error handling
7. Use toast notifications for user feedback
8. Monitor query performance
9. Cache frequently accessed data
10. Use pagination for large datasets