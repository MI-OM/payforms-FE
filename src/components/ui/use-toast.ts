import * as React from "react"

export type ToastVariant = "default" | "success" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastState {
  toasts: Toast[]
}

export type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "CLEAR_ALL" }

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

function genId() {
  return Math.random().toString(36).substring(2, 9)
}

type ActionType = ToastAction

function toastReducer(state: ToastState, action: ActionType): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [
          { ...action.toast, id: action.toast.id || genId() },
          ...state.toasts,
        ].slice(0, TOAST_LIMIT),
      }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
    case "CLEAR_ALL":
      return {
        ...state,
        toasts: [],
      }
    default:
      return state
  }
}

const listeners: Array<(state: ToastState) => void> = []
let memoryState: ToastState = { toasts: [] }

function dispatch(action: ActionType) {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

function toast(options: ToastOptions) {
  const id = genId()
  
  const update = (props: ToastOptions) =>
    dispatch({
      type: "ADD_TOAST",
      toast: { ...props, id },
    })
  
  const dismiss = () => dispatch({ type: "REMOVE_TOAST", id })
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...options,
      id,
    },
  })

  if (options.duration !== Infinity) {
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", id })
    }, options.duration || TOAST_REMOVE_DELAY)
  }

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (id: string) => dispatch({ type: "REMOVE_TOAST", id }),
    clear: () => dispatch({ type: "CLEAR_ALL" }),
  }
}

export { useToast, toast }
