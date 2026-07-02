import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCompany } from "@/contexts/CompanyContext";
import { readSelectedCompanyFromStorage } from "@/contexts/CompanyContext";

export const Route = createFileRoute("/company")({
  component: CompanyLayout,
});

function CompanyLayout() {
  const navigate = useNavigate();
  const { selected, setSelected } = useCompany();

  useEffect(() => {
    if (!selected) {
      const stored = readSelectedCompanyFromStorage();
      if (stored) {
        setSelected(stored);
      } else {
        navigate({ to: "/" });
      }
    }
  }, [selected, navigate, setSelected]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
            <SidebarTrigger className="md:hidden" />
            <SidebarTrigger className="hidden md:flex" />
            <nav className="text-sm text-slate-500">
              <span>Companies</span>
              {selected && (
                <>
                  <span className="mx-2 text-slate-300">/</span>
                  <span className="font-medium text-slate-900">
                    {selected.companyName}
                  </span>
                </>
              )}
            </nav>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
