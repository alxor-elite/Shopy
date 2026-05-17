import { useState, createContext, useContext, useCallback } from 'react'
import { X, Check } from 'lucide-react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, leaving: false }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400)
    }, 3000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400)
  }, [])

  const iconColor = { success: '#3A7D44', error: '#C0392B', warning: '#B7791F', info: '#1C1B1A' }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="glass-strong px-4 py-3 flex items-center gap-3 min-w-[280px]"
            style={{
              animation: toast.leaving ? 'toastDown 0.4s forwards' : 'toastUp 0.4s forwards',
              borderRadius: 14,
              borderLeft: `3px solid ${iconColor[toast.type] || iconColor.success}`,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor[toast.type]}15` }}
            >
              <Check size={12} style={{ color: iconColor[toast.type] }} />
            </div>
            <span className="text-[13px] font-medium text-[#1C1B1A] flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-[#6B6663] hover:text-[#1C1B1A] tr">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
