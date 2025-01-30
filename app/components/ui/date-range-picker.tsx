'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * Props for the DateRangePicker component
 * @interface DateRangePickerProps
 * @property {DateRange} value - Currently selected date range
 * @property {(date: DateRange) => void} onChange - Callback function when date range changes
 * @property {string} [className] - Optional CSS class names
 */
interface DateRangePickerProps {
  value: DateRange
  onChange: (date: DateRange) => void
  className?: string
}

/**
 * DateRangePicker Component
 * 
 * A reusable date range picker component that allows users to select a start and end date.
 * Built on top of react-day-picker with a custom UI using shadcn/ui components.
 * 
 * Features:
 * - Clean and intuitive UI
 * - Popup calendar with month navigation
 * - Range selection with visual feedback
 * - Formatted date display
 * - Keyboard navigation support
 * - Responsive design
 * 
 * @component
 * @param {DateRangePickerProps} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * ```tsx
 * const [dateRange, setDateRange] = useState<DateRange>({ from: new Date() })
 * 
 * return (
 *   <DateRangePicker
 *     value={dateRange}
 *     onChange={setDateRange}
 *     className="w-[300px]"
 *   />
 * )
 * ```
 */
export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 