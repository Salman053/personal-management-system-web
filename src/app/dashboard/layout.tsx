"use client";

import type React from "react";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Breadcrumb } from "@/components/system/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProtectedRoute from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen app-backdrop">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              <Breadcrumb />
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
