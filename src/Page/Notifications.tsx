import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { useNotificationsSheet } from "@/Context/NotificationsSheetContext";
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
  const username = notification.userId.username;
  switch (notification.type) {
    case "like":
      return `${username} liked your photo`;
    case "comment":
      return notification.content
        ? `${username} commented: ${notification.content}`
        : `${username} commented on your photo`;
    case "follow":
      return `${username} started following you`;
    case "mention":
      return `${username} mentioned you in a comment`;
    default:
      return `${username} interacted with your post`;
  }
}

export default function NotificationsSheet() {
  const { isOpen, closeSheet } = useNotificationsSheet();
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
      setNotifications(response.data.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

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
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-muted/30"
                  )}
                >
                  <div className="shrink-0">
                    <img
                      src={getImageUrl(notification.userId.profilePicture)}
                      alt={notification.userId.username}
                      className="h-10 w-10 rounded-full object-cover aspect-square"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
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
