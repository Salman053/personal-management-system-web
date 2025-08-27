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
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <ScrollArea className="flex-1  z-10 px-8 py-1 max-h-[91vh] overflow-auto">
              <Breadcrumb />
              {children}
            </ScrollArea>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
