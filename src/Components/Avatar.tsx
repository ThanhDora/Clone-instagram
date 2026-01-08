import {
  Avatar as ShadcnAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/Components/ui/avatar";
import { User } from "lucide-react";
import type { TAvatar } from "@/Type/Users";
import { cn } from "@/lib/utils";

interface AvatarProps extends TAvatar {
  className?: string;
}

export default function Avatar({ image, className }: AvatarProps) {
  return (
    <ShadcnAvatar className={cn("h-16 w-16", className)}>
      {image && <AvatarImage src={image} alt="avatar" />}
      <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500">
        <User className="h-8 w-8 text-white" />
      </AvatarFallback>
    </ShadcnAvatar>
  );
}
