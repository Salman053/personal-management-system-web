"use client";

import { useState } from "react";
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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { name: "Habits", href: "/dashboard/habits", icon: Target },
  { name: "Learning", href: "/dashboard/learning", icon: BookOpen },
  { name: "Task Planner", href: "/dashboard/daily-tasks", icon: Check },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false); // desktop mini mode
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const pathname = usePathname();

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col h-screen border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top: logo + collapse btn */}
        <div className="flex items-center h-16 border-b px-4">
          <span
            className={cn(
              "font-semibold transition-opacity",
              collapsed && "hidden"
            )}
          >
            PMS
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden md:inline-flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              let isActive = false;

              if (item.name === "Dashboard") {
                // Dashboard should only be active on exact route
                isActive = pathname === item.href;
              } else {
                // Others should be active for nested paths too
                isActive = pathname.startsWith(item.href);
              }

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-all",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
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
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center h-16 border-b px-4">
          <span className="font-semibold">PMS</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-background shadow"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
