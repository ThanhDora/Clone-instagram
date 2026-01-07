import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Profile from "@/Components/Profile";

export default function MainLayout() {
  const location = useLocation();
  const hideProfileRoutes = ["/profile", "/messages", "/reels", "/explore"];
  const shouldHideProfile = hideProfileRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border">
        <Sidebar />
      </aside>
      <main className="ml-64 flex-1 px-4 py-6">
        <div className="mx-auto flex max-w-6xl gap-6">
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
    </div>
  );
}
