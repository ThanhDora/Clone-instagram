import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { useNotificationsSheet } from "@/Context/NotificationsSheetContext";
import { mockNotifications } from "@/assets/db";
import { cn } from "@/lib/utils";

export default function NotificationsSheet() {
  const { isOpen, closeSheet } = useNotificationsSheet();

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md bg-card backdrop-blur-0 p-0 flex flex-col"
        style={{
          backgroundColor: "hsl(var(--card))",
          left: "5rem", // 80px = w-20 (Sidebar khi thu lại)
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
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                  !notification.isRead && "bg-muted/30"
                )}
              >
                <div className="shrink-0">
                  <img
                    src={notification.avatar}
                    alt={notification.username}
                    className="h-10 w-10 rounded-full object-cover aspect-square"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">
                      {notification.username}
                    </span>{" "}
                    {notification.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notification.timestamp}
                  </p>
                </div>
                {notification.thumbnail && (
                  <div className="shrink-0">
                    <img
                      src={notification.thumbnail}
                      alt="Post thumbnail"
                      className="h-11 w-11 rounded object-cover aspect-square"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
