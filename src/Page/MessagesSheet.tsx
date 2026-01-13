import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
  mockConversations,
  getUserById,
  getMessagesByConversationId,
} from "@/assets/db";
import { cn } from "@/lib/utils";
import { Search, SquareArrowOutUpRight, ArrowLeft, Send } from "lucide-react";
import type { ConversationWithUser } from "@/Type/Conversation";
import type { Message } from "@/Type/Message";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

const currentUserId = "1";

function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

interface MessagesSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MessagesSheet({
  isOpen,
  onOpenChange,
}: MessagesSheetProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    const allMessages: Message[] = [];
    mockConversations.forEach((conv) => {
      const convMessages = getMessagesByConversationId(conv.id);
      allMessages.push(...convMessages);
    });
    return allMessages;
  });

  const conversationsWithUsers: ConversationWithUser[] = useMemo(() => {
    const activeStatuses: Record<
      string,
      { isActive: boolean; lastActive: string }
    > = {
      "2": { isActive: true, lastActive: "1m ago" },
      "3": { isActive: true, lastActive: "1m ago" },
      "4": { isActive: false, lastActive: "26w" },
      "5": { isActive: true, lastActive: "1 active today" },
    };

    return mockConversations.map((conv) => {
      const otherUserId = conv.participants.find((id) => id !== currentUserId);
      const otherUser = otherUserId ? getUserById(otherUserId) : undefined;
      const status = otherUserId ? activeStatuses[otherUserId] : undefined;
      const lastMessage = conv.lastMessage;
      const isFromCurrentUser = lastMessage?.senderId === currentUserId;

      return {
        ...conv,
        otherUser: otherUser
          ? {
              id: otherUser.id,
              username: otherUser.username,
              fullName: otherUser.fullName,
              avatar: otherUser.avatar,
              isActive: status?.isActive ?? false,
              lastActive:
                lastMessage && !isFromCurrentUser
                  ? status?.lastActive ?? ""
                  : status?.lastActive ?? "",
            }
          : undefined,
      };
    });
  }, []);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversationsWithUsers;
    const query = searchQuery.toLowerCase();
    return conversationsWithUsers.filter(
      (conv) =>
        conv.otherUser?.username.toLowerCase().includes(query) ||
        conv.otherUser?.fullName.toLowerCase().includes(query)
    );
  }, [conversationsWithUsers, searchQuery]);

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const conv = conversationsWithUsers.find(
      (c) => c.id === selectedConversation
    );
    if (!conv) return;

    const receiverId = conv.otherUser?.id;
    if (!receiverId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: currentUserId,
      receiverId: receiverId,
      text: messageInput.trim(),
      timestamp: getCurrentTime(),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return messages.filter(
      (msg) => msg.conversationId === selectedConversation
    );
  }, [messages, selectedConversation]);

  const selectedConv = useMemo(() => {
    if (!selectedConversation) return null;
    return conversationsWithUsers.find((c) => c.id === selectedConversation);
  }, [selectedConversation, conversationsWithUsers]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "w-1/4 h-1/2 rounded-lg p-0 flex flex-col inset-x-auto! inset-y-auto! right-6! bottom-6! left-auto! top-auto!",
          theme === "dark"
            ? "bg-[#25292e] border-border"
            : "bg-white border-gray-200"
        )}
        showCloseButton={true}
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          {selectedConversation ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>
              <Avatar className="h-8 w-8">
                {selectedConv?.otherUser?.avatar && (
                  <AvatarImage
                    src={selectedConv.otherUser.avatar}
                    alt={selectedConv.otherUser.username}
                  />
                )}
                <AvatarFallback>
                  {selectedConv?.otherUser?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <SheetTitle className="text-left text-lg font-semibold flex-1">
                {selectedConv?.otherUser?.username || "Unknown"}
              </SheetTitle>
            </div>
          ) : (
            <>
              <SheetTitle className="text-left text-xl font-semibold">
                Messages
              </SheetTitle>
              <button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/messages");
                }}
                className="absolute right-12 top-4 p-1 hover:bg-muted rounded transition-colors"
              >
                <SquareArrowOutUpRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}
        </SheetHeader>
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {currentMessages.map((message) => {
                  const isFromCurrentUser = message.senderId === currentUserId;
                  const sender = getUserById(message.senderId);
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isFromCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isFromCurrentUser && (
                        <Avatar className="h-8 w-8 shrink-0">
                          {sender?.avatar && (
                            <AvatarImage
                              src={sender.avatar}
                              alt={sender.username}
                            />
                          )}
                          <AvatarFallback>
                            {sender?.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg",
                          isFromCurrentUser ? " text-white" : " text-foreground"
                        )}
                      >
                        <p className="text-sm bg-(--primary) p-2 rounded-lg">
                          {message.text}
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isFromCurrentUser
                              ? "text-white/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Message..."
                  className="flex-1 bg-input/30"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 pt-4 pb-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-input/30"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const lastMessage = conv.lastMessage;
                    const isFromCurrentUser =
                      lastMessage?.senderId === currentUserId;
                    const previewText = lastMessage
                      ? isFromCurrentUser
                        ? `You: ${lastMessage.text}`
                        : lastMessage.text
                      : "No messages yet";
                    const timeDisplay = lastMessage
                      ? lastMessage.timestamp
                      : "";

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleConversationClick(conv.id)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30"
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            {conv.otherUser?.avatar && (
                              <AvatarImage
                                src={conv.otherUser.avatar}
                                alt={conv.otherUser.username}
                              />
                            )}
                            <AvatarFallback>
                              {conv.otherUser?.username?.[0]?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          {conv.otherUser?.isActive && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-card rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {conv.otherUser?.username || "Unknown"}
                            </p>
                            {timeDisplay && (
                              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                {timeDisplay}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.otherUser?.isActive && !lastMessage
                              ? `Active ${conv.otherUser.lastActive}`
                              : previewText}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p className="text-sm">No conversations found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
