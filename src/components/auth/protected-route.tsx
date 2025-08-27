"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import AuthLoadingScreen from "@/app/loading";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // When loading is done and no user — redirect
    if (!loading && !user) {
      router.replace("/"); // or "/auth"
    }
  }, [user, loading, router]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return null; // Avoid flashing protected content
  }

  return <>{children}</>;
}
