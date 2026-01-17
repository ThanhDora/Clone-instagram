import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Instagram,
  RefreshCw,
} from "lucide-react";
import {
  TbApps,
  TbBrandWhatsapp,
  TbBrandThreads,
  TbBrandMeta,
} from "react-icons/tb";
import Switch from "@/Components/Switch";
import { cn, getImageUrl } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import httpsRequest from "@/utils/httpsRequest";
import type { TGetProfileResponse, TUser } from "@/Type/Users";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { useNotificationsSheet } from "@/Context/NotificationsSheetContext";
import { useSearchSheet } from "@/Context/SearchSheetContext";
import { useCreateDialog } from "@/Context/CreateDialogContext";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: null, icon: Search, isSheet: true },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Reels", href: "/reels", icon: Video },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Notifications", href: null, icon: Heart, isSheet: true },
  { name: "Create", href: null, icon: PlusSquare, isDialog: true },
  { name: "Profile", href: null, icon: User, isProfile: true },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const { openSheet: openNotificationsSheet, isOpen: isNotificationsOpen } =
    useNotificationsSheet();
  const { openSheet: openSearchSheet, isOpen: isSearchOpen } = useSearchSheet();
  const { openDialog: openCreateDialog } = useCreateDialog();
  const isCollapsed = isNotificationsOpen || isSearchOpen;

  const handlePostClick = () => {
    openCreateDialog();
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await httpsRequest.get<TGetProfileResponse>(
          "/api/users/profile"
        );
        setCurrentUser(response.data.data);
      } catch {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            setCurrentUser(JSON.parse(userStr));
          } catch {
            // Ignore
          }
        }
      }
    };

    fetchCurrentUser();
  }, []);

  const currentUserAvatar = getImageUrl(
    currentUser?.profilePicture || currentUser?.avatar || ""
  );
  const currentUserInitial = currentUser?.username?.[0]?.toUpperCase() || "U";

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("refresh_token");
  //   window.location.href = "/login";
  // };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 px-4 h-20 flex items-center">
        <Link
          to="/"
          className="w-full relative flex items-center justify-center"
        >
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all duration-500 ease-in-out",
              isCollapsed
                ? "opacity-0 scale-0 pointer-events-none"
                : "opacity-100 scale-100"
            )}
          >
            <h1 className="instagram-logo text-4xl text-foreground">
              Instagram
            </h1>
          </div>
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all duration-500 ease-in-out",
              isCollapsed
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-0 translate-y-4 pointer-events-none"
            )}
          >
            <div className="instagram-logo text-2xl text-foreground">
              <Instagram />
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = item.href ? location.pathname === item.href : false;
          const isProfile = item.name === "Profile";
          const isDialog = item.isDialog;
          const isSheet = item.isSheet;

          if (isSheet) {
            const handleSheetClick = () => {
              if (item.name === "Notifications") {
                openNotificationsSheet();
              } else if (item.name === "Search") {
                openSearchSheet();
              }
            };

            return (
              <button
                key={item.name}
                onClick={handleSheetClick}
                className={cn(
                  "flex w-full items-center rounded-lg text-base font-medium transition-all duration-200 px-4 py-3",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <item.icon className="h-6 w-6 shrink-0 transition-transform duration-200 hover:scale-110" />
                <span
                  className={cn(
                    "transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                    isCollapsed
                      ? "w-0 opacity-0 ml-0"
                      : "w-auto opacity-100 ml-3"
                  )}
                >
                  {item.name}
                </span>
              </button>
            );
          }

          if (isDialog) {
            return (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center rounded-lg text-base font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98] px-4 py-3">
                    <item.icon className="h-6 w-6 shrink-0 transition-transform duration-200 hover:scale-110" />
                    <span
                      className={cn(
                        "transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                        isCollapsed
                          ? "w-0 opacity-0 ml-0"
                          : "w-auto opacity-100 ml-3"
                      )}
                    >
                      {item.name}
                    </span>
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

          if (isProfile) {
            const handleProfileClick = (e: React.MouseEvent) => {
              e.preventDefault();
              if (currentUser?.username) {
                navigate(`/profile/${currentUser.username}`);
              } else {
                navigate("/profile");
              }
            };

            return (
              <button
                key={item.name}
                onClick={handleProfileClick}
                className={cn(
                  "flex w-full items-center rounded-lg text-base font-medium transition-all duration-200 px-4 py-3",
                  location.pathname === "/profile" ||
                    (currentUser?.username &&
                      location.pathname === `/profile/${currentUser.username}`)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isProfile ? (
                  currentUserAvatar ? (
                    <img
                      src={currentUserAvatar}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover shrink-0 transition-transform duration-200 hover:scale-110"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null
                ) : null}
                {isProfile && !currentUserAvatar && (
                  <div className="h-6 w-6 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs shrink-0 transition-transform duration-200 hover:scale-110">
                    {currentUserInitial}
                  </div>
                )}
                {!isProfile && (
                  <item.icon className="h-6 w-6 shrink-0 transition-transform duration-200 hover:scale-110" />
                )}
                <span
                  className={cn(
                    "transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                    isCollapsed
                      ? "w-0 opacity-0 ml-0"
                      : "w-auto opacity-100 ml-3"
                  )}
                >
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href || "/"}
              className={cn(
                "flex items-center rounded-lg text-base font-medium transition-all duration-200 px-4 py-3",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {!isProfile && (
                <item.icon className="h-6 w-6 shrink-0 transition-transform duration-200 hover:scale-110" />
              )}
              <span
                className={cn(
                  "transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center rounded-lg text-base font-medium text-muted-foreground cursor-pointer transition-colors duration-200 ease-in-out hover:bg-blue-50/20 hover:text-foreground active:scale-95 active:shadow-inner focus:outline-none px-4 py-3">
              <Menu className="h-6 w-6 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                )}
              >
                More
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <div className="py-2 flex flex-col gap-1.5 items-center">
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground cursor-pointer">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground cursor-pointer">
                <BarChart3 className="h-5 w-5" />
                <span>Your Activity</span>
              </button>
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground cursor-pointer">
                <Bookmark className="h-5 w-5" />
                <span>Saved</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground cursor-pointer"
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
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground cursor-pointer">
                <AlertCircle className="h-5 w-5" />
                <span>Report a problem</span>
              </button>
            </div>
            <div className="flex flex-col gap-1.5 items-center">
              <button className="flex w-[90%] rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground cursor-pointer">
                <RefreshCw className="h-5 w-5" />
                <span>
                  <Switch trigger={<span>Switch accounts</span>} />
                </span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("refresh_token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="flex w-[90%] mb-2 rounded-lg items-center gap-3 px-4 py-3 text-left text-base hover:bg-blue-50/20 font-medium text-foreground bg-muted/50 cursor-pointer"
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
            <button className="flex w-full items-center rounded-lg text-base font-medium text-muted-foreground cursor-pointer transition-colors duration-200 ease-in-out hover:bg-blue-50/20 hover:text-foreground active:scale-95 active:shadow-inner focus:outline-none px-4 py-3">
              <Flower className="h-6 w-6 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                )}
              >
                Also from Meta
              </span>
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
