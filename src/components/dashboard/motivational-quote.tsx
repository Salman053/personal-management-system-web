"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const quotes = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    author: "Roy T. Bennett",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
]

export function MotivationalQuote() {
  const [quote, setQuote] = useState(quotes[0])

  useEffect(() => {
    // Get a random quote based on the current date
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const quoteIndex = dayOfYear % quotes.length
    setQuote(quotes[quoteIndex])
  }, [])

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Quote className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <blockquote className="text-lg font-medium leading-relaxed">"{quote.text}"</blockquote>
            <cite className="text-sm text-muted-foreground">— {quote.author}</cite>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
