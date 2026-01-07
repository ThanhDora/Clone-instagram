import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Compass,
  Video,
  Heart,
  MessageCircle,
  PlusSquare,
  User,
  Sun,
  Moon,
  Settings,
  BarChart3,
  Bookmark,
  AlertCircle,
  Menu,
  Flower,
} from "lucide-react";
import {
  TbApps,
  TbBrandWhatsapp,
  TbBrandThreads,
  TbBrandMeta,
} from "react-icons/tb";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { mockUsers, getUserById } from "@/assets/db";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/popover";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Reels", href: "/reels", icon: Video },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Notifications", href: "/notifications", icon: Heart },
  { name: "Create", href: "/create", icon: PlusSquare },
  { name: "Profile", href: "/profile", icon: User, isProfile: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Get current user avatar
  const currentUserStr = localStorage.getItem("user");
  let currentUserAvatar = "";

  if (currentUserStr) {
    try {
      const parsedUser = JSON.parse(currentUserStr);
      const user = getUserById(parsedUser.id);
      currentUserAvatar = user?.avatar || "";
    } catch {
      currentUserAvatar = mockUsers[0]?.avatar || "";
    }
  } else {
    currentUserAvatar = mockUsers[0]?.avatar || "";
  }

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("refresh_token");
  //   window.location.href = "/login";
  // };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 px-4">
        <Link to="/">
          <h1 className="instagram-logo mb-5 mt-5 text-4xl text-foreground cursor-pointer hover:opacity-80 transition-opacity">
            Instagram
          </h1>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const isProfile = item.name === "Profile";

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {isProfile && currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt="Profile"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <item.icon className="h-6 w-6" />
              )}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground cursor-pointer transition-colors duration-200 ease-in-out hover:bg-blue-50/20 hover:text-foreground active:scale-95 active:shadow-inner focus:outline-none">
              <Menu className="h-6 w-6" />
              <span>More</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="py-2 flex flex-col gap-1.5 items-center">
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground">
                <BarChart3 className="h-5 w-5" />
                <span>Your Activity</span>
              </button>
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground">
                <Bookmark className="h-5 w-5" />
                <span>Saved</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Switch appearance</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Switch appearance</span>
                  </>
                )}
              </button>
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground">
                <AlertCircle className="h-5 w-5" />
                <span>Report a problem</span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5 items-center">
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground">
                <span>Switch accounts</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("refresh_token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="flex w-[90%] mb-2 rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground bg-muted/50"
              >
                <span>Log out</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground cursor-pointer transition-colors duration-200 ease-in-out hover:bg-blue-50/20 hover:text-foreground active:scale-95 active:shadow-inner focus:outline-none">
              <Flower className="h-6 w-6" />
              <span>Also from Meta</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="py-2 flex flex-col gap-1.5 items-center">
              <Link
                to="https://www.meta.ai/?utm_source=ig_web_nav"
                target="_blank"
                className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground"
              >
                <TbBrandMeta className="h-5 w-5" />
                <span>Meta AI</span>
              </Link>
              <Link
                to="https://aistudio.instagram.com/?utm_source=ig_web_nav"
                target="_blank"
                className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground"
              >
                <TbApps className="h-5 w-5" />
                <span>AI Studio</span>
              </Link>
              <Link
                to="https://www.whatsapp.com/?utm_source=ig_web_nav&utm_campaign=afm"
                target="_blank"
                className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground"
              >
                <TbBrandWhatsapp className="h-5 w-5" />
                <span>WhatsApp</span>
              </Link>
              <Link
                to="https://www.threads.net/?utm_source=ig_web_nav"
                target="_blank"
                className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground"
              >
                <TbBrandThreads className="h-5 w-5" />
                <span>Threads</span>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
