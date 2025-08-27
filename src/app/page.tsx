"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import AuthLoadingScreen from "./loading";

type AuthMode = "login" | "register" | "forgot-password";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.replace("/dashboard");
    }
    if(!user){
      router.replace("/")
    }
  }, [user, loading, router]);

  // Show loading screen while auth status is being resolved
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // If user is logged in, don’t render forms (redirect will handle it)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Auth UI */}
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Personal Management System
          </h1>
          <p className="text-muted-foreground">
            Your life command center - all in one place
          </p>
        </div>

        {mode === "login" && (
          <LoginForm
            onToggleMode={() => setMode("register")}
            onForgotPassword={() => setMode("forgot-password")}
          />
        )}

        {mode === "register" && (
          <RegisterForm onToggleMode={() => setMode("login")} />
        )}

        {mode === "forgot-password" && (
          <ForgotPasswordForm onBack={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
