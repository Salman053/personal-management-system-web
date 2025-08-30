"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { TemplateManager } from "@/components/template/template-manager"

export default function TemplatesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Email Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage your email templates for job applications, academic correspondence, and professional communication.
          </p>
        </div>

        <TemplateManager />
      </div>
    </div>
  )
}
