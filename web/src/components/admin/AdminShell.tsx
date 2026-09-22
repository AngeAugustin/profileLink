"use client";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/provider";

function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const t = useT();

  return (
    <div className="min-h-screen bg-surface">
      <button
        type="button"
        aria-label={t("common.close")}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      <AdminSidebar />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-[padding] duration-200 ease-out",
          "pl-0",
          collapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <AdminTopBar />
        <main className="w-full flex-1 bg-surface pt-16">
          <div className="w-full max-w-[1400px] mx-auto px-4 mt-space-md pb-space-xl sm:px-6 sm:mt-space-lg lg:px-8 lg:mt-space-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider storageKey="profilelink.admin.sidebar.collapsed">
        <AdminShellLayout>{children}</AdminShellLayout>
      </SidebarProvider>
    </ToastProvider>
  );
}
