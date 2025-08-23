"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname(); // e.g. "/projects/123/payments"
  const segments = pathname.split("/").filter(Boolean); // ["projects","123","payments"]

  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center  py-4    bg-background/10  space-x-1 text-sm", className)} 
    >
      {/* Home */}
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/"); // build path step by step
        const isLast = idx === segments.length - 1;

        return (
          <div key={idx} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {capitalize(seg)}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {capitalize(seg)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
