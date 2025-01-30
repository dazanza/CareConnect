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

## Type Safety Patterns

### Safe Database Response Transformation
```typescript
function transformData(raw: any): TypedResponse | null {
  if (!raw?.requiredField) return null;
  return {
    // transform data
  };
}

const validData = rawData
  .map(transformData)
  .filter((item): item is TypedResponse => item !== null);
```

### Type Extension Pattern
```typescript
interface BaseType {
  id: number;
  date: string;
}

interface ExtendedType extends BaseType {
  additionalField: string;
}
```

## Code Documentation

### Effective Comments
- Document the "why" and "how" rather than just the "what"
- Include parameter descriptions for complex interfaces
- Note presence/absence of optional fields and their context
- Document return values and side effects
- Group related interfaces with explanatory comments

## Error Handling

### Database Query Error Handling
- Check for query errors before processing results
- Transform raw database responses into typed structures
- Validate required fields before processing
- Use type guards to ensure type safety in filtered results
