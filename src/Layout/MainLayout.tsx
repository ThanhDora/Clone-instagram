import { lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Profile from "@/Components/Profile";
import { useNotificationsSheet } from "@/Context/NotificationsSheetContext";
import { useSearchSheet } from "@/Context/SearchSheetContext";
import { cn } from "@/lib/utils";

const FloatingMessages = lazy(() => import("@/Components/FloatingMessages"));

export default function MainLayout() {
  const location = useLocation();
  const hideProfileRoutes = ["/profile", "/messages", "/reels", "/explore", "/edit-profile"];
  const shouldHideProfile = hideProfileRoutes.includes(location.pathname) || location.pathname.startsWith("/profile/");
  const { isOpen: isNotificationsOpen } = useNotificationsSheet();
  const { isOpen: isSearchOpen } = useSearchSheet();
  const isCollapsed = isNotificationsOpen || isSearchOpen;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen border-r transition-all duration-500 ease-in-out",
          isCollapsed ? "w-20 border-r-0" : "w-64 border-r border-border"
        )}
      >
        <Sidebar />
      </aside>
      <main className={cn("ml-64 flex-1", location.pathname === "/messages" ? "" : "px-4 py-6")}>
        <div className={cn("flex gap-6", location.pathname === "/messages" ? "h-screen" : "mx-auto max-w-6xl")}>
          <div className="flex-1">
            <Outlet />
          </div>
          {!shouldHideProfile && (
            <aside className="hidden w-80 lg:block">
              <Profile />
            </aside>
          )}
        </div>
      </main>
      <Suspense fallback={null}>
        <FloatingMessages />
      </Suspense>
    </div>
  );
}
