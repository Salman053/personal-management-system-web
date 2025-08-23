"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

type AuthMode = "login" | "register" | "forgot-password"

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // useEffect(() => {
  //   if (user && !loading) {
  //     router.push("/dashboard")
  //   }
  // }, [user, loading, router])

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   )
  // }

  // if (user) {
  //   return null // Will redirect to dashboard
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Personal Management System</h1>
          <p className="text-muted-foreground">Your life command center - all in one place</p>
        </div>

        {mode === "login" && (
          <LoginForm onToggleMode={() => setMode("register")} onForgotPassword={() => setMode("forgot-password")} />
        )}

        {mode === "register" && <RegisterForm onToggleMode={() => setMode("login")} />}

        {mode === "forgot-password" && <ForgotPasswordForm onBack={() => setMode("login")} />}
      </div>
    </div>
  )
}
