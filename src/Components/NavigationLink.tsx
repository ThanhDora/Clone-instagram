import { ReactNode, MouseEvent } from "react";
import { Link as ReactRouterLink, useNavigate, To } from "react-router-dom";
import { useNavigation } from "@/Context/NavigationContext";
import { cn } from "@/lib/utils";

interface NavigationLinkProps {
  to: To;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  replace?: boolean;
}

async function preloadComponent(path: string) {
  if (path === "/" || path.startsWith("/post/")) {
    await import("@/Page/Home");
  } else if (path === "/explore") {
    await import("@/Page/Explore");
  } else if (path === "/reels") {
    await import("@/Page/Reels");
  } else if (path === "/messages") {
    await import("@/Page/Messages");
  } else if (path.startsWith("/profile")) {
    await import("@/Page/UserProfile");
  } else if (path === "/edit-profile") {
    await import("@/Page/EditProfile");
  }
}

export default function NavigationLink({
  to,
  children,
  className,
  onClick,
  replace,
}: NavigationLinkProps) {
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigation();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    const targetPath = typeof to === "string" ? to : to.pathname || "";
    
    if (targetPath && !targetPath.startsWith("http")) {
      e.preventDefault();
      setIsNavigating(true);

      try {
        await preloadComponent(targetPath);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setIsNavigating(false);
        navigate(to, { replace });
      } catch (error) {
        console.error("Failed to preload component:", error);
        setIsNavigating(false);
        navigate(to, { replace });
      }
    }
  };

  return (
    <ReactRouterLink
      to={to}
      className={className}
      onClick={handleClick}
      replace={replace}
    >
      {children}
    </ReactRouterLink>
  );
}