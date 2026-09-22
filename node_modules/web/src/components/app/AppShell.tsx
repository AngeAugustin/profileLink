"use client";

import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-surface">
      {/* Backdrop — mobile / tablet only */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      <AppSidebar />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-[padding] duration-200 ease-out",
          "pl-0",
          collapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <AppTopBar />
        <main className="w-full flex-1 bg-surface pt-16">
          <div className="w-full max-w-[1400px] mx-auto px-4 mt-space-md pb-space-xl sm:px-6 sm:mt-space-lg lg:px-8 lg:mt-space-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider storageKey="profilelink.app.sidebar.collapsed">
        <AppShellLayout>{children}</AppShellLayout>
      </SidebarProvider>
    </ToastProvider>
  );
}
