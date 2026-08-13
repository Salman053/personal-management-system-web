"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  Check,
  Box,
  DotSquareIcon,
  Users,
  Gift,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { name: "Committees", href: "/dashboard/committees", icon: Users },
  { name: "Habits", href: "/dashboard/habits", icon: Target },
  { name: "Learning", href: "/dashboard/learning", icon: BookOpen },
  { name: "Task Planner", href: "/dashboard/daily-tasks", icon: Check },
  { name: "Doubt Box", href: "/dashboard/doubt", icon: Box },
  { name: "Lucky Draw", href: "/dashboard/lucky-draw", icon: Gift },
  { name: "Templates", href: "/dashboard/templates", icon: DotSquareIcon },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col h-screen transition-all duration-300 sticky top-0",
          collapsed ? "w-16" : "w-64",
          "bg-sidebar border-r border-sidebar-border shrink-0"
        )}
      >
        {/* Top: logo + collapse btn */}
        <div className="flex items-center h-16 border-b border-sidebar-border px-4 shrink-0">
          <span className={cn(
            "font-semibold transition-all duration-300",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            PMS
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto hidden md:inline-flex",
              collapsed && "mx-auto"
            )}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1" aria-label="Main navigation">
            {navigation.map((item) => {
              let isActive = false;
              if (item.name === "Dashboard") {
                isActive = pathname === item.href;
              } else {
                isActive = pathname.startsWith(item.href);
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block",
                    collapsed && "flex justify-center"
                  )}
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-all",
                      collapsed && "justify-center px-2 w-auto"
                    )}
                    size={collapsed ? "icon" : "default"}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                    {collapsed && <span className="sr-only">{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* --- Mobile Sidebar Drawer --- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center h-16 border-b border-sidebar-border px-4 shrink-0">
          <span className="font-semibold">PMS</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              let isActive = false;
              if (item.name === "Dashboard") {
                isActive = pathname === item.href;
              } else {
                isActive = pathname.startsWith(item.href);
              }

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile menu button - hides on desktop */}
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 bottom-4 z-40 md:hidden shadow-lg bg-background border-2"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}