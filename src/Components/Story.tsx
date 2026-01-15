import { Plus } from "lucide-react";

export default function Story() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide w-full">
      <div className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer shrink-0">
        <div className="relative ring-2 ring-border rounded-full p-0.5">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-6 w-6 text-foreground" />
          </div>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[80px] text-center">
          New
        </span>
      </div>
    </div>
  );
}
