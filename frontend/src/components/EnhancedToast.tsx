/**
 * Componente de Notificação Toast Melhorado
 * Sistema de feedback visual aprimorado
 */

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './EnhancedToast.css'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const TOAST_DURATION = 5000

// Gerenciador global de toasts
class ToastManager {
  private listeners: Set<(toasts: Toast[]) => void> = new Set()
  private toasts: Toast[] = []

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.toasts))
  }

  show(message: string, type: ToastType = 'info', duration?: number, action?: Toast['action']) {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, message, type, duration, action }
    
    this.toasts = [...this.toasts, toast]
    this.notify()

    // Auto-remover após duração
    const timeout = duration || TOAST_DURATION
    setTimeout(() => this.dismiss(id), timeout)
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  dismissAll() {
    this.toasts = []
    this.notify()
  }
}

export const toastManager = new ToastManager()

// Atalhos convenientes
export const toast = {
  success: (message: string, duration?: number, action?: Toast['action']) => 
    toastManager.show(message, 'success', duration, action),
  
  error: (message: string, duration?: number, action?: Toast['action']) => 
    toastManager.show(message, 'error', duration, action),
  
  info: (message: string, duration?: number, action?: Toast['action']) => 
    toastManager.show(message, 'info', duration, action),
  
  warning: (message: string, duration?: number, action?: Toast['action']) => 
    toastManager.show(message, 'warning', duration, action),
  
  dismiss: (id: string) => toastManager.dismiss(id),
  dismissAll: () => toastManager.dismissAll(),
}

// Componente de Toast individual
const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300) // Aguardar animação
  }

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
  }

  return (
    <div className={`enhanced-toast enhanced-toast-${toast.type} ${isExiting ? 'exiting' : ''}`}>
      <div className="enhanced-toast-icon">
        {icons[toast.type]}
      </div>
      <div className="enhanced-toast-content">
        <p className="enhanced-toast-message">{toast.message}</p>
        {toast.action && (
          <button 
            className="enhanced-toast-action"
            onClick={() => {
              toast.action!.onClick()
              handleDismiss()
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button 
        className="enhanced-toast-close"
        onClick={handleDismiss}
        aria-label="Fechar notificação"
      >
        <X size={18} />
      </button>
    </div>
  )
}

// Container de toasts
export const EnhancedToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  return (
    <div className="enhanced-toast-container">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onDismiss={() => toastManager.dismiss(toast.id)}
        />
      ))}
    </div>
  )
}
