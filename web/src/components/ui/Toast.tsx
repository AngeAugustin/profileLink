"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type ToastContextValue = {
  toast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    window.setTimeout(() => setVisible(false), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300 pointer-events-none bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-lg shadow-xl flex items-center gap-space-sm font-label-md text-label-md",
          visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
        )}
        role="status"
      >
        <Icon name="check_circle" className="text-primary-fixed-dim text-[20px]" />
        <span>{message}</span>
      </div>
    </ToastContext.Provider>
  );
}
