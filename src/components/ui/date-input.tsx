import * as React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// 1. Defined standard Lucide calendar graphic SVG safely inline
const CalendarIcon = () => (
  <svg
    xmlns="http://w3.org"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground pointer-events-none"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
)

export interface DateInputProps extends React.ComponentPropsWithoutRef<"input"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, id, name, type = "date", ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center" data-slot="date-input-wrapper">
        {/* 2. Hidden native browser webkit picker targets cleanly */}
        <style dangerouslySetInnerHTML={{
          __html: `
          input[type="month"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent;
            bottom: 0;
            color: transparent;
            cursor: pointer;
            height: auto;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: auto;
          }
        `}} />

        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent pl-3 pr-10 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm",
            "dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            className
          )}
          {...props}
        />

        {/* 3. Placed custom vector layout graphic cleanly aligned right */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          <CalendarIcon />
        </div>
      </div>
    )
  }
)
DateInput.displayName = "DateInput"

export default DateInput
