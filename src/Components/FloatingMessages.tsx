import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { cn, getImageUrl } from "@/lib/utils";
import MessagesSheet from "@/Page/MessagesSheet";
import httpsRequest from "@/utils/httpsRequest";
import type {
  TConversationsResponse,
  TConversation,
} from "@/Type/Conversation";
import type { TGetProfileResponse, TUser } from "@/Type/Users";

export default function FloatingMessages() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [conversations, setConversations] = useState<TConversation[]>([]);
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);

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

    const fetchConversations = async () => {
      try {
        const response = await httpsRequest.get<TConversationsResponse>(
          "/api/messages/conversations",
          {
            params: {
              page: 1,
              limit: 3,
            },
          }
        );
        setConversations(response.data.data.conversations);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };

    fetchCurrentUser();
    fetchConversations();
  }, []);

  const avatars = conversations
    .slice(0, 3)
    .map((conv) => {
      if (!currentUser) return null;
      const otherUser = conv.participants.find(
        (p) => p._id !== currentUser._id
      );
      return otherUser
        ? {
            _id: otherUser._id,
            username: otherUser.username,
            profilePicture: otherUser.profilePicture,
          }
        : null;
    })
    .filter((user) => user !== null);

  const handleClick = () => {
    setIsSheetOpen(true);
  };

  if (location.pathname === "/messages") {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-card border border-border px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl",
          isHovered && "scale-105"
        )}
      >
        <Send className="h-5 w-5 text-foreground shrink-0" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          Messages
        </span>
        <div className="flex items-center -space-x-2">
          {avatars.map((user, index) => (
            <Avatar
              key={user?._id || index}
              className="h-8 w-8 border-2 border-card shrink-0"
            >
              {user?.profilePicture && (
                <AvatarImage
                  src={getImageUrl(user.profilePicture)}
                  alt={user.username}
                />
              )}
              <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </button>
      <MessagesSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
