# Learnings from Building the Prescription Modal

## Modal Design Patterns
1. For large forms, use a modal with:
   - Fixed header with border
   - Scrollable content area
   - Fixed footer with actions
   - Proper max-width and height constraints
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

## Form Array Patterns
1. Using `useFieldArray` with React Hook Form:
   ```tsx
   const { fields, append, remove } = useFieldArray({
     control: form.control,
     name: 'medications',
   })
   ```

2. Table layout for array fields:
   - Use fixed column widths
   - Compact inputs with reduced height
   - Delete button in last column
   ```tsx
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
               name={`arrayName.${index}.fieldName`}
               render={/* ... */}
             />
           </TableCell>
         </TableRow>
       ))}
     </TableBody>
   </Table>
   ```

## Date Picker Implementation
1. Proper date picker button structure:
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

## Form Validation
1. Zod schema for nested arrays:
   ```tsx
   const itemSchema = z.object({
     field1: z.string().min(1, 'Required'),
     field2: z.number().min(0),
   })

   const formSchema = z.object({
     arrayField: z.array(itemSchema).min(1, 'At least one item required'),
     // ... other fields
   })
   ```

## API Integration
1. Group related items under a parent record:
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

## UI/UX Considerations
1. Form density:
   - Use compact inputs in tables (`h-8`)
   - Reduce padding in table cells (`p-2`)
   - Full-width controls in grid layouts
   - Clear section separation with spacing

2. Loading states:
   - Disable all inputs during submission
   - Show loading text in submit button
   - Prevent multiple submissions

3. Error handling:
   - Toast notifications for API errors
   - Form validation messages
   - Proper error boundaries 