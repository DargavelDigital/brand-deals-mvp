'use client'

import * as React from "react";
import { useRouter } from "next/navigation";
import TopbarFrame from "./TopbarFrame";
import SidebarSkin from "./SidebarSkin";
import SidebarNav from "./SidebarNav";
import UserDropdown from "./UserDropdown";
import { GlobalToastProvider } from "@/components/ui/ToastProvider";
import NotificationsClient from "@/components/notifications/NotificationsClient";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import AgencyAttributionBanner from "@/components/agency/AgencyAttributionBanner";
import { QuickActions } from "@/components/mobile/QuickActions";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 56px topbar, 260px sidebar
  return (
    <GlobalToastProvider>
      <NotificationsClient wsId="demo-workspace" />
      <div className="grid min-h-screen grid-rows-[56px_1fr] grid-cols-[260px_1fr] bg-bg text-text">
      {/* Topbar spans both columns; stays at top */}
      <header className="col-span-2 row-start-1 sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/75 border-b border-[var(--border)]">
        <TopbarFrame>
          {/* Left: brand */}
          <div className="shrink-0 flex items-center gap-2">
            <h1>HYPER</h1>
            <span>by Hype & Swagger</span>
          </div>
          
          {/* Middle: search - flexes but never overflows */}
          <div className="flex-1 min-w-0">
            <div className="w-full max-w-[720px]">
              <form onSubmit={handleSearch}>
                <input 
                  className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  type="search"
                  placeholder="Search brands, contacts, deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Right: language pills, bell, user */}
          <div className="shrink-0 flex items-center gap-2 lg:gap-3">
            <LanguageSwitcher />
            <button className="h-8 w-8 rounded-md border border-[var(--border)] bg-[var(--surface)] grid place-items-center" aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
            </button>
            <UserDropdown />
          </div>
        </TopbarFrame>
        
        {/* Agency Attribution Banner */}
        <div className="container-page">
          <AgencyAttributionBanner className="mt-2" />
        </div>
      </header>

      {/* Sidebar is sticky under the topbar */}
      <aside className="col-start-1 row-start-2 sticky top-[56px] h-[calc(100vh-56px)] overflow-auto">
        <SidebarSkin>
          <SidebarNav />
        </SidebarSkin>
      </aside>

      {/* Main content area */}
      <main className="col-start-2 row-start-2">
        {/* page padding */}
        <div className="container-page py-6 lg:py-8 bg-bg">
          {children}
        </div>
      </main>
    </div>
    
    {/* Mobile Quick Actions - Fixed bottom bar for mobile only */}
    <QuickActions />
    
      </GlobalToastProvider>
  );
}
