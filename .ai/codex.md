# Modal Forms with Multiple Items

## Problem
Need to create a modal form that can handle multiple related items (like prescriptions with multiple medications) while maintaining good UX and proper data management.

## Solution
Use a combination of React Hook Form's `useFieldArray`, shadcn/ui components, and proper modal structure.

### Modal Structure
```tsx
<DialogContent className="sm:max-w-[800px] lg:max-w-[1000px] h-[90vh] p-0">
  <DialogHeader className="px-6 pt-6 pb-4 border-b">
    <DialogTitle>Title</DialogTitle>
  </DialogHeader>
  <div className="px-6 py-4 overflow-y-auto">
    {/* Content */}
  </div>
</DialogContent>
```

### Form Array Management
```tsx
// Schema
const itemSchema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.number().min(0),
})

const formSchema = z.object({
  items: z.array(itemSchema).min(1, 'At least one item required'),
})

// Component
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'items',
})
```

### Table Layout for Arrays
```tsx
<div className="border rounded-lg overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[25%]">Field 1</TableHead>
        {/* ... */}
      </TableRow>
    </TableHeader>
    <TableBody>
      {fields.map((field, index) => (
        <TableRow key={field.id}>
          <TableCell className="p-2">
            <FormField
              control={form.control}
              name={`items.${index}.field`}
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} className="h-8" />
                  </FormControl>
                </FormItem>
              )}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Date Picker Integration
```tsx
<Popover>
  <PopoverTrigger asChild>
    <FormControl>
      <Button variant="outline" className="w-full pl-3 text-left">
        {value ? format(value, 'PPP') : <span>Pick a date</span>}
        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    </FormControl>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={value}
      onSelect={onChange}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

### API Integration
```typescript
// Create parent record first
const { data: parent } = await supabase
  .from('parent_table')
  .insert([parentData])
  .select()
  .single()

// Then create child records with parent reference
const childPromises = items.map(item => 
  supabase
    .from('child_table')
    .insert([{ ...item, parent_id: parent.id }])
)

await Promise.all(childPromises)
```

## Considerations
1. Form Density
   - Use `h-8` for compact inputs in tables
   - Use `p-2` for table cells
   - Use full-width controls in grid layouts
   - Maintain clear section separation with spacing

2. Loading States
   - Disable all inputs during submission
   - Show loading text in submit button
   - Prevent multiple submissions

3. Error Handling
   - Use toast notifications for API errors
   - Show form validation messages
   - Implement proper error boundaries

## Notes
- Modal size should be responsive but capped (max-w-[800px] on small screens, max-w-[1000px] on large screens)
- Content should be scrollable while header and footer remain fixed
- Use grid layout for form fields (grid-cols-1 md:grid-cols-2)
- Implement proper validation before submission
- Handle both single and batch operations efficiently 