import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { MainContextProvider } from "@/contexts/app-context"
import { ConfirmProvider } from "@/components/system/confirm-provider"

export const metadata: Metadata = {
  title: "Personal Management System",
  description: "Your personal life command center - manage projects, finances, habits, and learning all in one place",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
     
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <MainContextProvider>
              <ConfirmProvider>
              {children}
              </ConfirmProvider>
              </MainContextProvider>
            <Toaster duration={3000} swipeDirections={["left","right"]}/>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
