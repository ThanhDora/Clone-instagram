import {
  Avatar as ShadcnAvatar,
  AvatarImage,
  AvatarFallback,
} from "@/Components/ui/avatar";
import { User } from "lucide-react";
import type { TAvatar } from "@/Type/Users";

export default function Avatar({ image }: TAvatar) {
  return (
    <ShadcnAvatar className="h-16 w-16">
      {image && <AvatarImage src={image} alt="avatar" />}
      <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500">
        <User className="h-8 w-8 text-white" />
      </AvatarFallback>
    </ShadcnAvatar>
  );
}
