// src/components/system/confirm-dialog.tsx
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDescription } from "../ui/alert";

export type ConfirmDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  title?: React.ReactNode;
  description?: React.ReactNode;

  /** Primary action label */
  confirmLabel?: string;
  /** Secondary (cancel) label */
  cancelLabel?: string;

  /** Visual intent of confirm button */
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  /** Destructive styling shorthand (overrides variant to "destructive" if true) */
  destructive?: boolean;

  /** Optional leading icon for the title */
  icon?: React.ReactNode;

  /** Called when user confirms. Can be async. */
  onConfirm?: () => void | Promise<void>;
  /** Called on cancel/close */
  onCancel?: () => void;

  /** Disable closing via overlay or ESC while pending */
  lockWhilePending?: boolean;

  /** ClassName hooks for custom design systems */
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  requireText?: string;
  footerClassName?: string;

  /**
   * If true, return focus to a given element after close. Helpful for tables/grids.
   */
  returnFocusTo?: HTMLElement | null;

  /**
   * Render props for custom actions/footer if you need to fully take over.
   */
  footerRender?: (ctx: {
    pending: boolean;
    close: () => void;
    confirm: () => void;
  }) => React.ReactNode;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open: controlledOpen,
    onOpenChange,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "default",
    destructive,
    icon,
    onConfirm,
    onCancel,
    lockWhilePending = true,
    className,
    contentClassName,
    headerClassName,
    footerClassName,
    returnFocusTo,
    footerRender,
  } = props;
  const [inputValue, setInputValue] = React.useState("");
  const requireMatch = props.requireText;
  const isMatch = !requireMatch || inputValue.trim() === requireMatch;

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (v: boolean) => (isControlled ? onOpenChange?.(v) : setUncontrolledOpen(v)),
    [isControlled, onOpenChange]
  );

  const [pending, setPending] = React.useState(false);
  const close = React.useCallback(() => {
    if (pending && lockWhilePending) return;
    setOpen(false);
    onCancel?.();
    // Return focus to prior element if provided
    if (returnFocusTo) {
      setTimeout(() => returnFocusTo?.focus?.(), 0);
    }
  }, [pending, lockWhilePending, setOpen, onCancel, returnFocusTo]);

  const confirm = React.useCallback(async () => {
    try {
      setPending(true);
      await onConfirm?.();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }, [onConfirm, setOpen]);

  // Keyboard: Enter confirms when dialog is open
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        // prevent accidental submits if focus is inside a form element
        const target = e.target as HTMLElement;
        const isTextInput = ["INPUT", "TEXTAREA"].includes(
          target?.tagName || ""
        );
        if (!isTextInput) {
          e.preventDefault();
          confirm();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      setInputValue("");
    };
  }, [open, confirm]);

  const confirmBtnVariant = destructive
    ? ("destructive" as const)
    : confirmVariant;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => (pending && lockWhilePending ? null : setOpen(v))}
    >
      <AlertDialogContent
        className={cn(
          "sm:max-w-[480px] flex flex-col",
          contentClassName,
          className
        )}
      >
        <AlertDialogHeader className={headerClassName}>
          <AlertDialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDescription>
          {requireMatch && (
            <div className="mt-4">
              <label className="text-sm font-medium">
                Please type <span className="font-bold">{requireMatch}</span> to
                confirm:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={requireMatch}
              />
            </div>
          )}
        </AlertDescription>

        <AlertDialogFooter className={footerClassName}>
          {footerRender ? (
            footerRender({ pending, close, confirm })
          ) : (
            <>
              <AlertDialogCancel onClick={close} disabled={pending}>
                {cancelLabel}
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  onClick={confirm}
                  disabled={pending || !isMatch}
                  variant={confirmBtnVariant}
                >
                  {pending && (
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin text-current"
                      aria-hidden
                    />
                  )}
                  {confirmLabel}
                </Button>
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
