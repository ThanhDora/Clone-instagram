import {
  Avatar as ShadcnAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/Components/ui/avatar";
import type { TAvatar } from "@/Type/Users";
import { cn, getImageUrl } from "@/lib/utils";

interface AvatarProps extends TAvatar {
  className?: string;
  username?: string;
}

export default function Avatar({ image, className, username }: AvatarProps) {
  const hasImage = image && image.trim() !== "";
  const initial = username?.charAt(0)?.toUpperCase() || "U";

  return (
    <ShadcnAvatar className={cn("h-16 w-16", className)}>
      {hasImage && (
        <AvatarImage
          src={getImageUrl(image)}
          alt="avatar"
          crossOrigin="anonymous"
          onError={() => {
            console.error("Avatar image failed to load:", image);
          }}
        />
      )}
      <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
        {initial}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}
