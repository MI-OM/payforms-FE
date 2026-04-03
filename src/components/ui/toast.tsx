import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  variant?: "default" | "success" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToastProps
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-white border-slate-200 shadow-lg",
    success: "bg-green-50 border-green-200 shadow-lg",
    destructive: "bg-red-50 border-red-200 shadow-lg",
  }

  const iconStyles = {
    default: "text-slate-600",
    success: "text-green-600",
    destructive: "text-red-600",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden border p-4 pr-8 transition-all animate-in slide-in-from-bottom-4",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {variant === "success" && (
          <svg className="h-5 w-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {variant === "destructive" && (
          <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {variant === "default" && (
          <svg className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <div className="grid gap-1">
          {props.title && (
            <div className="text-sm font-semibold text-slate-900">
              {props.title}
            </div>
          )}
          {props.description && (
            <div className="text-sm text-slate-600">
              {props.description}
            </div>
          )}
          {!props.title && !props.description && (
            <div className="text-sm text-slate-700">
              {props.children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
Toast.displayName = "Toast"

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
))
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold text-slate-900", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-slate-600", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-0 left-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:left-4 sm:max-w-[420px] sm:flex-col",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

export {
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastViewport,
}
