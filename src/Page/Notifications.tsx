import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { useNotificationsSheet } from "@/Context/NotificationsSheetContext";
import { useSocket } from "@/Context/SocketContext";
import { cn, getImageUrl } from "@/lib/utils";
import httpsRequest from "@/utils/httpsRequest";
import type { TNotificationsResponse, TNotification } from "@/Type/Notification";

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

function getNotificationText(notification: TNotification): string {
  switch (notification.type) {
    case "like":
      return "liked your photo";
    case "comment":
      return notification.content
        ? `commented: ${notification.content}`
        : "commented on your photo";
    case "follow":
      return "started following you";
    case "mention":
      return "mentioned you in a comment";
    case "post":
      return "posted a new photo";
    default:
      return "interacted with your post";
  }
}

export default function NotificationsSheet() {
  const { isOpen, closeSheet } = useNotificationsSheet();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await httpsRequest.get<TNotificationsResponse>(
        "/api/notifications",
        {
          params: {
            page: 1,
            limit: 50,
          },
        }
      );
      console.log("Notifications: Fetched from API", response.data);

      let notificationsData: TNotification[] = [];

      if (response.data?.data) {
        if (response.data.data.notifications && Array.isArray(response.data.data.notifications)) {
          notificationsData = response.data.data.notifications;
        } else if (Array.isArray(response.data.data)) {
          notificationsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          notificationsData = response.data;
        }
      }

      if (notificationsData.length > 0) {
        setNotifications(notificationsData);
        console.log("Notifications: Set notifications", notificationsData.length);
      } else {
        console.log("Notifications: No notifications in response");
        setNotifications([]);
      }
    } catch (err) {
      console.error("Notifications: Failed to fetch notifications:", err);
      const axiosError = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      if (axiosError.response?.status === 401) {
        console.log("Notifications: Unauthorized, user may need to login");
      }
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("Notifications: Socket not connected", { socket: !!socket, isConnected });
      return;
    }

    console.log("Notifications: Setting up socket listeners");

    const handleNewNotification = (notification: TNotification) => {
      console.log("Notifications: Received new notification", notification);
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) {
          console.log("Notifications: Notification already exists, skipping");
          return prev;
        }
        console.log("Notifications: Adding new notification to list");
        return [notification, ...prev];
      });
    };

    const handleLikeNotification = (data: { notification: TNotification }) => {
      console.log("Notifications: Received like notification", data);
      if (data.notification) {
        handleNewNotification(data.notification);
      }
    };

    const handleCommentNotification = (data: { notification: TNotification }) => {
      console.log("Notifications: Received comment notification", data);
      if (data.notification) {
        handleNewNotification(data.notification);
      }
    };

    const handleFollowNotification = (data: { notification: TNotification }) => {
      console.log("Notifications: Received follow notification", data);
      if (data.notification) {
        handleNewNotification(data.notification);
      }
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("notification", handleNewNotification);
    socket.on("like_notification", handleLikeNotification);
    socket.on("comment_notification", handleCommentNotification);
    socket.on("follow_notification", handleFollowNotification);

    socket.onAny((eventName, ...args) => {
      if (eventName.includes("notification") || eventName.includes("like") || eventName.includes("comment") || eventName.includes("follow")) {
        console.log("Notifications: Received socket event", eventName, args);
      }
    });

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification", handleNewNotification);
      socket.off("like_notification", handleLikeNotification);
      socket.off("comment_notification", handleCommentNotification);
      socket.off("follow_notification", handleFollowNotification);
      socket.offAny();
    };
  }, [socket, isConnected]);

  const handleNotificationClick = useCallback(
    async (notification: TNotification) => {
      if (!notification.isRead) {
        try {
          await httpsRequest.put(`/api/notifications/${notification._id}/read`);
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === notification._id ? { ...n, isRead: true } : n
            )
          );
        } catch (err) {
          console.error("Failed to mark notification as read:", err);
        }
      }

      if (notification.relatedPostId) {
        navigate(`/post/${notification.relatedPostId}`);
        closeSheet();
      } else if (notification.userId?._id) {
        navigate(`/profile/${notification.userId.username}`);
        closeSheet();
      }
    },
    [navigate, closeSheet]
  );

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md bg-card backdrop-blur-0 p-0 flex flex-col"
        style={{
          backgroundColor: "hsl(var(--card))",
          left: "5rem",
          top: 0,
          bottom: 0,
          height: "100vh",
        }}
        showCloseButton={false}
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="text-left text-xl font-semibold">
            Notifications
          </SheetTitle>
          <SheetDescription className="sr-only">
            View your notifications
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-muted/30"
                  )}
                >
                  <div className="shrink-0 relative">
                    {notification.userId.profilePicture ? (
                      <img
                        src={getImageUrl(notification.userId.profilePicture)}
                        alt={notification.userId.username}
                        className="h-10 w-10 rounded-full object-cover aspect-square"
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
                      className={`h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${notification.userId.profilePicture ? "hidden" : "flex"}`}
                    >
                      {notification.userId.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">
                        {notification.userId.username}
                      </span>{" "}
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {notification.relatedPostImage && (
                    <div className="shrink-0">
                      <img
                        src={getImageUrl(notification.relatedPostImage)}
                        alt="Post thumbnail"
                        className="h-11 w-11 rounded object-cover aspect-square"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
