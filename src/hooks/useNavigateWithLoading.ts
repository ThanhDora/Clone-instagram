import { useCallback } from "react";
import { useNavigate as useReactRouterNavigate } from "react-router-dom";
import { useNavigation } from "@/Context/NavigationContext";

export function useNavigateWithLoading() {
  const navigate = useReactRouterNavigate();
  const { setIsNavigating } = useNavigation();

  const navigateWithLoading = useCallback(
    async (to: string, options?: { replace?: boolean; state?: unknown }) => {
      setIsNavigating(true);
      
      
      
      
      navigate(to, options);
    },
    [navigate, setIsNavigating]
  );

  return navigateWithLoading;
}
