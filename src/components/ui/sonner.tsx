"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          // Normal toast styles
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          
          // Success toast styles
          "--success-bg": "hsl(142, 76%, 97%)",
          "--success-text": "hsl(142, 72%, 29%)",
          "--success-border": "hsl(142, 76%, 90%)",
          "--success-icon": "hsl(142, 72%, 29%)",
          
          // Error toast styles
          "--error-bg": "hsl(0, 86%, 97%)",
          "--error-text": "hsl(0, 72%, 39%)",
          "--error-border": "hsl(0, 86%, 90%)",
          "--error-icon": "hsl(0, 84%, 60%)",
          
          // Warning toast styles
          "--warning-bg": "hsl(38, 96%, 97%)",
          "--warning-text": "hsl(30, 80%, 32%)",
          "--warning-border": "hsl(38, 96%, 90%)",
          "--warning-icon": "hsl(38, 92%, 50%)",
          
          // Info toast styles
          "--info-bg": "hsl(210, 96%, 97%)",
          "--info-text": "hsl(210, 80%, 32%)",
          "--info-border": "hsl(210, 96%, 90%)",
          "--info-icon": "hsl(210, 92%, 50%)",
          
          // Loading toast styles
          "--loading-bg": "var(--popover)",
          "--loading-text": "var(--popover-foreground)",
          "--loading-border": "var(--border)",
          "--loading-icon": "hsl(210, 92%, 50%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }