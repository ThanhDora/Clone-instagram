import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SearchSheetContextType {
  isOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const SearchSheetContext = createContext<
  SearchSheetContextType | undefined
>(undefined);

export function SearchSheetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => setIsOpen(false);

  return (
    <SearchSheetContext.Provider
      value={{ isOpen, openSheet, closeSheet }}
    >
      {children}
    </SearchSheetContext.Provider>
  );
}

export function useSearchSheet() {
  const context = useContext(SearchSheetContext);
  if (context === undefined) {
    throw new Error(
      "useSearchSheet must be used within SearchSheetProvider"
    );
  }
  return context;
}

