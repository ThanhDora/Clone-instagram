import { createContext, useContext, useState, type ReactNode } from "react";

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <NavigationContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}