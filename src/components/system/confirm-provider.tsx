
// src/components/system/confirm-provider.tsx
"use client"

import * as React from "react"
import ConfirmDialog, { ConfirmDialogProps } from "./confirm-dialog"
import { TriangleAlert } from "lucide-react"

export type ConfirmOptions = Omit<
  ConfirmDialogProps,
  | "open"
  | "onOpenChange"
  | "onConfirm"
  | "onCancel"
  | "footerRender"
> & {
  /**
   * Optional: perform async work on confirm. If it throws, dialog stays open.
   */
  onConfirm?: () => void | Promise<void>
}

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<{ confirm: ConfirmFn } | null>(null)

export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider />")
  return ctx.confirm
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions>({})
  const resolver = React.useRef<(value: boolean) => void>(null)

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    setOptions({
      // sensible defaults; can be overridden per call
      title: "Are you sure?",
      description: "This action cannot be undone.",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      destructive: false,
      icon: <TriangleAlert className="h-5 w-5" aria-hidden />,
      ...opts,
    })
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const handleCancel = React.useCallback(() => {
    resolver.current?.(false)
  }, [])

  const handleConfirm = React.useCallback(async () => {
    try {
      await options.onConfirm?.()
      resolver.current?.(true)
    } catch (e) {
      // keep the dialog open so the user can retry or see UI errors outside
      throw e
    }
  }, [options])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {/* Host the actual dialog once at the app root */}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        {...options}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  )
}
