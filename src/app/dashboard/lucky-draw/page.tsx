"use client"

import { Suspense } from "react"
import { LuckyDrawPage } from "@/components/lucky-draw/lucky-draw-page"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <LuckyDrawPage />
    </Suspense>
  )
}
