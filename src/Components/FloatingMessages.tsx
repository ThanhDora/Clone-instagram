import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { mockConversations, getUserById } from "@/assets/db";
import { cn } from "@/lib/utils";
import MessagesSheet from "@/Page/MessagesSheet";

const currentUserId = "1";

export default function FloatingMessages() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const recentConversations = mockConversations.slice(0, 3);
  const avatars = recentConversations.map((conv) => {
    const otherUserId = conv.participants.find((id) => id !== currentUserId);
    const otherUser = otherUserId ? getUserById(otherUserId) : undefined;
    return otherUser;
  });

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
              key={index}
              className="h-8 w-8 border-2 border-card shrink-0"
            >
              {user?.avatar && (
                <AvatarImage src={user.avatar} alt={user.username} />
              )}
              <AvatarFallback>
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
