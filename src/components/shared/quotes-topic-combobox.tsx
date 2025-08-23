"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// 👇 Category-wise topics
export const categorizedTopics = [
  {
    category: "Addictions / Quitting",
    items: [
      "Porn Addiction",
      "Smoking Addiction",
      "Alcohol Addiction",
      "Drug Addiction",
      "Social Media Detox",
      "Gaming Addiction",
      "Overeating / Junk Food",
      "Procrastination",
      "Nail Biting",
      "Teeth Grinding",
      "Oversleeping",
      "Late Night Scrolling",
    ],
  },
  {
    category: "Motivation & Quotes",
    items: [
      "Motivational Quotes",
      "Study Quotes",
      "Work Quotes",
      "Discipline Quotes",
      "Success Stories",
      "Mindset Growth",
      "Leadership Quotes",
    ],
  },
  {
    category: "Positive Habits",
    items: [
      "Fitness & Exercise",
      "Healthy Eating",
      "Meditation",
      "Journaling",
      "Reading Books",
      "Learning New Skills",
      "Gratitude Practice",
      "Affirmations",
    ],
  },
  {
    category: "Productivity",
    items: [
      "Deep Work",
      "Pomodoro Technique",
      "Time Management",
      "Daily Planning",
      "Goal Setting",
      "Study Hacks",
      "Exam Preparation",
      "Career Focus",
      "Entrepreneurship",
    ],
  },
  {
    category: "Mental & Emotional Health",
    items: [
      "Stress Management",
      "Anxiety Relief",
      "Self-Love",
      "Resilience Building",
      "Skipping Breakfast",
    ],
  },
]

interface TopicComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function TopicCombobox({ value, onChange }: TopicComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value : "Select a topic..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 z-50"
        align="start"
        side="bottom"
      >
        <Command>
          <CommandInput placeholder="Search topics..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No topic found.</CommandEmpty>
            {categorizedTopics.map((group) => (
              <CommandGroup key={group.category} heading={group.category}>
                {group.items.map((topic) => (
                  <CommandItem
                    key={topic}
                    value={topic}
                    onSelect={() => {
                      onChange(topic)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === topic ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {topic}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
