import { useState, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
  mockConversations,
  getUserById,
  getMessagesByConversationId,
} from "@/assets/db";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  Send,
  ShieldAlert,
  Phone,
  Video,
} from "lucide-react";
import type { ConversationWithUser } from "@/Type/Conversation";
import type { Message } from "@/Type/Message";
import Switch from "@/Components/Switch";

const currentUserId = "1";

function formatTimeAgo(timestamp: string): string {
  return timestamp;
}

function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    const allMessages: Message[] = [];
    mockConversations.forEach((conv) => {
      const convMessages = getMessagesByConversationId(conv.id);
      allMessages.push(...convMessages);
    });
    return allMessages;
  });

  const [conversations, setConversations] = useState(mockConversations);

  const conversationsWithUsers: ConversationWithUser[] = useMemo(() => {
    const activeStatuses: Record<
      string,
      { isActive: boolean; lastActive: string }
    > = {
      "2": { isActive: true, lastActive: "23m ago" },
      "3": { isActive: true, lastActive: "34m ago" },
      "4": { isActive: false, lastActive: "4m ago" },
      "5": { isActive: true, lastActive: "1 active today" },
    };

    return conversations.map((conv) => {
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
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversationsWithUsers;
    const query = searchQuery.toLowerCase();
    return conversationsWithUsers.filter(
      (conv) =>
        conv.otherUser?.username.toLowerCase().includes(query) ||
        conv.otherUser?.fullName.toLowerCase().includes(query)
    );
  }, [conversationsWithUsers, searchQuery]);

  const currentUser = getUserById(currentUserId);

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
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation ? { ...c, lastMessage: newMessage } : c
      )
    );
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

  return (
    <div className="flex h-screen overflow-hidden bg-card">
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Switch
              open={isSwitchOpen}
              onOpenChange={setIsSwitchOpen}
              trigger={
                <button
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setIsSwitchOpen(true)}
                >
                  <span className="font-semibold text-foreground">
                    {currentUser?.username || "lee.thanh_dev_"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              }
            />
          </div>
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

        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12">
              {currentUser?.avatar && (
                <AvatarImage
                  src={currentUser.avatar}
                  alt={currentUser.username}
                />
              )}
              <AvatarFallback>
                {currentUser?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Obsessed with...</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your note</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Messages</h2>
            <span className="text-sm text-muted-foreground">Requests</span>
          </div>
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
                  ? formatTimeAgo(lastMessage.timestamp)
                  : "";

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                      selectedConversation === conv.id
                        ? "bg-muted/50"
                        : "hover:bg-muted/30"
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
                          {conv.otherUser?.username?.[0]?.toUpperCase() || "U"}
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
      </div>

      <div className="flex-1 flex items-center justify-center bg-card">
        {selectedConversation ? (
          <div className="w-full h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {(() => {
                  const conv = conversationsWithUsers.find(
                    (c) => c.id === selectedConversation
                  );
                  return (
                    <>
                      <Avatar className="h-10 w-10">
                        {conv?.otherUser?.avatar && (
                          <AvatarImage
                            src={conv.otherUser.avatar}
                            alt={conv.otherUser.username}
                          />
                        )}
                        <AvatarFallback>
                          {conv?.otherUser?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {conv?.otherUser?.username || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conv?.otherUser?.isActive
                            ? `Active ${conv?.otherUser.lastActive}`
                            : "Offline"}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-muted rounded transition-colors cursor-pointer">
                          <Phone className="h-6 w-6 text-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded transition-colors cursor-pointer">
                          <Video className="h-8 w-8 text-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded transition-colors cursor-pointer">
                          <ShieldAlert className="h-6 w-6 text-foreground" />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
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
                          "max-w-[70%] rounded-lg px-4 py-2 ",
                          isFromCurrentUser
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-foreground"
                        )}
                      >
                        <p className="text-sm p-2 rounded-lg">{message.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1 flex items-center justify-end",
                            isFromCurrentUser
                              ? "text-primary-foreground/70"
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
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-24 h-24 rounded-full border-2 border-border flex items-center justify-center mb-6">
              <Send className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Your messages
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Send private photos and messages to a friend or group.
            </p>
            <Button className="bg-(--primary) hover:bg-(--primary)/90 cursor-pointer">
              <Send className="h-5 w-5" />
              Send message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
