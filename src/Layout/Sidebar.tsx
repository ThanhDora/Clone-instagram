import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
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
  ImageIcon,
  Sparkles,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/Components/ui/dialog";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Reels", href: "/reels", icon: Video },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Notifications", href: "/notifications", icon: Heart },
  { name: "Create", href: null, icon: PlusSquare, isDialog: true },
  { name: "Profile", href: "/profile", icon: User, isProfile: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const handlePostClick = () => {
    setIsPostDialogOpen(true);
  };

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
          const isActive = item.href ? location.pathname === item.href : false;
          const isProfile = item.name === "Profile";
          const isDialog = item.isDialog;

          if (isDialog) {
            return (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    <item.icon className="h-6 w-6 transition-transform duration-200 hover:scale-110" />
                    <span>{item.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-card border-border backdrop-blur-0"
                  style={{ backgroundColor: "hsl(var(--card))" }}
                  align="start"
                >
                  <DropdownMenuItem
                    onClick={handlePostClick}
                    className="flex items-center gap-2 cursor-pointer text-foreground"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Post</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-foreground">
                    <Sparkles className="h-5 w-5" />
                    <span>AI</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href || "/"}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isProfile && currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt="Profile"
                  className="h-6 w-6 rounded-full object-cover transition-transform duration-200 hover:scale-110"
                />
              ) : (
                <item.icon className="h-6 w-6 transition-transform duration-200 hover:scale-110" />
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

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] bg-card backdrop-blur-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 duration-300 ease-out"
          style={{ backgroundColor: "hsl(var(--card))" }}
          showCloseButton={false}
        >
          <div className="text-center py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Create new post</h2>
          </div>
          <div className="py-8">
            <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
              <p className="text-muted-foreground">Post content here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
