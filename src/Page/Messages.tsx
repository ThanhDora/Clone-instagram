import { useState, useMemo, useEffect, useCallback } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  Send,
  ShieldAlert,
  Phone,
  Video,
} from "lucide-react";
import type {
  TConversation,
  TConversationsResponse,
} from "@/Type/Conversation";
import type {
  TMessage,
  TMessagesResponse,
  TSendTextMessageRequest,
  TSendMessageResponse,
} from "@/Type/Message";
import type { TGetProfileResponse, TUser } from "@/Type/Users";
import Switch from "@/Components/Switch";
import httpsRequest from "@/utils/httpsRequest";

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks}w`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
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
  const [conversations, setConversations] = useState<TConversation[]>([]);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
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
  }, []);

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const response = await httpsRequest.get<TConversationsResponse>(
        "/api/messages/conversations",
        {
          params: {
            page: 1,
            limit: 50,
          },
        }
      );
      setConversations(response.data.data.conversations);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await httpsRequest.get<TMessagesResponse>(
        `/api/messages/conversations/${conversationId}/messages`,
        {
          params: {
            page: 1,
            limit: 50,
          },
        }
      );
      setMessages(response.data.data.messages);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, [fetchCurrentUser, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, fetchMessages]);

  const conversationsWithUsers = useMemo(() => {
    if (!currentUser) return [];

    return conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id !== currentUser._id
      );
      const lastMessage = conv.lastMessage;

      return {
        ...conv,
        id: conv._id,
        otherUser: otherUser
          ? {
              id: otherUser._id,
              username: otherUser.username,
              fullName: otherUser.fullName || "",
              avatar: otherUser.profilePicture,
              isActive: false,
              lastActive: "",
            }
          : undefined,
        lastMessage: lastMessage
          ? {
              id: lastMessage._id,
              conversationId: conv._id,
              senderId: lastMessage.senderId,
              receiverId: otherUser?._id || "",
              text: lastMessage.content || lastMessage.imageUrl || "",
              timestamp: formatTimeAgo(lastMessage.createdAt),
              isRead: lastMessage.isRead,
            }
          : undefined,
        unreadCount: conv.unreadCount,
      };
    });
  }, [conversations, currentUser]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversationsWithUsers;
    const query = searchQuery.toLowerCase();
    return conversationsWithUsers.filter(
      (conv) =>
        conv.otherUser?.username.toLowerCase().includes(query) ||
        conv.otherUser?.fullName.toLowerCase().includes(query)
    );
  }, [conversationsWithUsers, searchQuery]);

  const currentMessages = useMemo(() => {
    if (!selectedConversation || !currentUser) return [];

    return messages.map((msg) => {
      const senderId =
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;
      const isFromCurrentUser = senderId === currentUser._id;

      return {
        id: msg._id,
        conversationId: msg.conversationId,
        senderId,
        receiverId: msg.recipientId,
        text: msg.content || msg.imageUrl || "",
        timestamp: formatMessageTime(msg.createdAt),
        isRead: msg.isRead,
        isFromCurrentUser,
        sender: typeof msg.senderId === "object" ? msg.senderId : undefined,
      };
    });
  }, [messages, selectedConversation, currentUser]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser) return;

    const conv = conversationsWithUsers.find(
      (c) => c.id === selectedConversation
    );
    if (!conv || !conv.otherUser) return;

    setIsSendingMessage(true);
    try {
      const requestData: TSendTextMessageRequest = {
        conversationId: selectedConversation,
        recipientId: conv.otherUser.id,
        messageType: "text",
        content: messageInput.trim(),
      };

      const response = await httpsRequest.post<TSendMessageResponse>(
        "/api/messages/messages",
        requestData
      );

      const newMessage = response.data.data;
      setMessages((prev) => [...prev, newMessage]);
      setMessageInput("");
      await fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedConv = useMemo(() => {
    if (!selectedConversation) return null;
    return conversationsWithUsers.find((c) => c.id === selectedConversation);
  }, [selectedConversation, conversationsWithUsers]);

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
            <div className="relative shrink-0">
              {currentUser?.profilePicture ? (
                <img
                  src={getImageUrl(currentUser.profilePicture)}
                  alt={currentUser.username}
                  className="h-12 w-12 rounded-full object-cover border border-border"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`h-12 w-12 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${
                  currentUser?.profilePicture ? "hidden" : ""
                }`}
              >
                {currentUser?.username?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {currentUser?.fullName || "Obsessed with..."}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentUser?.username || "Your note"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Messages</h2>
            <span className="text-sm text-muted-foreground">Requests</span>
          </div>
          <div className="py-2">
            {isLoadingConversations ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">Loading conversations...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const lastMessage = conv.lastMessage;
                const isFromCurrentUser =
                  lastMessage?.senderId === currentUser?._id;
                const previewText = lastMessage
                  ? isFromCurrentUser
                    ? `You: ${lastMessage.text}`
                    : lastMessage.text
                  : "No messages yet";
                const timeDisplay = lastMessage
                  ? formatTimeAgo(conv.lastMessageAt)
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
                            src={getImageUrl(conv.otherUser.avatar)}
                            alt={conv.otherUser.username}
                          />
                        )}
                        <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
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
                        {previewText}
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
                <Avatar className="h-10 w-10">
                  {selectedConv?.otherUser?.avatar && (
                    <AvatarImage
                      src={getImageUrl(selectedConv.otherUser.avatar)}
                      alt={selectedConv.otherUser.username}
                    />
                  )}
                  <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {selectedConv?.otherUser?.username?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedConv?.otherUser?.username || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConv?.otherUser?.isActive
                      ? `Active ${selectedConv?.otherUser.lastActive}`
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
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    Loading messages...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {currentMessages.map((message) => {
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.isFromCurrentUser
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {!message.isFromCurrentUser && message.sender && (
                          <Avatar className="h-8 w-8 shrink-0">
                            {message.sender.profilePicture && (
                              <AvatarImage
                                src={getImageUrl(message.sender.profilePicture)}
                                alt={message.sender.username}
                              />
                            )}
                            <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {message.sender.username?.[0]?.toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            message.isFromCurrentUser
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          )}
                        >
                          <p className="text-sm p-2 rounded-lg">
                            {message.text}
                          </p>
                          <p
                            className={cn(
                              "text-xs mt-1 flex items-center justify-end",
                              message.isFromCurrentUser
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
              )}
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
                  disabled={isSendingMessage}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSendingMessage}
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
