import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface NotificationsSheetContextType {
  isOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const NotificationsSheetContext = createContext<
  NotificationsSheetContextType | undefined
>(undefined);

export function NotificationsSheetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => setIsOpen(false);

  return (
    <NotificationsSheetContext.Provider
      value={{ isOpen, openSheet, closeSheet }}
    >
      {children}
    </NotificationsSheetContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationsSheet() {
  const context = useContext(NotificationsSheetContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationsSheet must be used within NotificationsSheetProvider"
    );
  }
  return context;
}
