import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface CreateDialogContextType {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const CreateDialogContext = createContext<CreateDialogContextType | undefined>(
  undefined
);

export function CreateDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <CreateDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
    </CreateDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCreateDialog() {
  const context = useContext(CreateDialogContext);
  if (context === undefined) {
    throw new Error("useCreateDialog must be used within CreateDialogProvider");
  }
  return context;
}
