"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Option = { label: string; value: string }

// Can be string[] or Option[]
type OptionsType = string[] | Option[]

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: OptionsType
  placeholder?: string
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
}: CustomSelectProps) {
  // Normalize to Option[]
  const normalizedOptions: Option[] = Array.isArray(options)
    ? typeof options[0] === "string"
      ? (options as string[]).map((o) => ({ label: o, value: o }))
      : (options as Option[])
    : []

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {normalizedOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
