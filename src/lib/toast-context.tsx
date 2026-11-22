'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = 'info',
      title,
      description,
    }: {
      type?: ToastType;
      title: string;
      description?: string;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => addToast({ type: 'success', title, description }),
    [addToast]
  );
  const error = useCallback(
    (title: string, description?: string) => addToast({ type: 'error', title, description }),
    [addToast]
  );
  const info = useCallback(
    (title: string, description?: string) => addToast({ type: 'info', title, description }),
    [addToast]
  );
  const warning = useCallback(
    (title: string, description?: string) => addToast({ type: 'warning', title, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md transition-all duration-200 bg-white ${
                isSuccess
                  ? 'border-[#B7EB8F] text-[#172B4D]'
                  : isError
                  ? 'border-[#FFCCC7] text-[#172B4D]'
                  : isWarning
                  ? 'border-[#FFE58F] text-[#172B4D]'
                  : 'border-[#D0E0F7] text-[#172B4D]'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#00875A]" strokeWidth={2} />}
                {isError && <AlertCircle className="w-4 h-4 text-[#DE350B]" strokeWidth={2} />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-[#FF991F]" strokeWidth={2} />}
                {!isSuccess && !isError && !isWarning && (
                  <Info className="w-4 h-4 text-[#2457A7]" strokeWidth={2} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold font-khmer">{t.title}</p>
                {t.description && (
                  <p className="text-[11px] text-[#5E6C84] mt-0.5 font-khmer leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-[#7A869A] hover:text-[#172B4D] p-0.5 rounded-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
