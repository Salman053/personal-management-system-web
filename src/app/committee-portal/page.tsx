"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PublicDrawView } from "@/components/committee/public-draw-view"

function CommitteePortalContent() {
  const searchParams = useSearchParams()
  const committeeId = searchParams.get("id") || undefined

  return <PublicDrawView initialCommitteeId={committeeId} />
}

export default function CommitteePortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Public Committee Verification Portal...</div>}>
      <CommitteePortalContent />
    </Suspense>
  )
}
