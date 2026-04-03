import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
          <p className={`flex-1 text-sm ${
            toast.type === 'success' ? 'text-green-800' :
            toast.type === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className={`shrink-0 ${
              toast.type === 'success' ? 'text-green-600 hover:text-green-800' :
              toast.type === 'error' ? 'text-red-600 hover:text-red-800' :
              'text-blue-600 hover:text-blue-800'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
