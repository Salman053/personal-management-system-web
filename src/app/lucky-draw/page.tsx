import { Suspense } from "react"
import { PublicLuckyDrawPage } from "@/components/lucky-draw/public-lucky-draw-page"

export const metadata = {
  title: "Lucky Draw",
  description: "Join a lucky draw room with a code — no account needed",
}

export default function LuckyDrawRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <PublicLuckyDrawPage />
    </Suspense>
  )
}