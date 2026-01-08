import { mockStories } from "@/assets/db";
import Avatar from "@/Components/Avatar";
import { Plus } from "lucide-react";

export default function Story() {
  const currentUserStr = localStorage.getItem("user");
  let currentUserId = "1";

  if (currentUserStr) {
    try {
      const parsedUser = JSON.parse(currentUserStr);
      currentUserId = parsedUser.id || "1";
    } catch {
      currentUserId = "1";
    }
  }

  const userStories = mockStories.filter(
    (story) => story.userId === currentUserId
  );

  const groupedStories = userStories.reduce((acc, story) => {
    const title = story.title || "Highlights";
    if (!acc[title]) {
      acc[title] = [];
    }
    acc[title].push(story);
    return acc;
  }, {} as Record<string, typeof userStories>);

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
      {Object.entries(groupedStories).map(([title, stories]) => (
        <div
          key={title}
          className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer shrink-0"
        >
          <div className="relative ring-2 ring-border rounded-full p-0.5">
            <Avatar
              image={stories[0]?.userAvatar || stories[0]?.image || ""}
              className="h-20 w-20"
            />
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[80px] text-center">
            {title}
          </span>
        </div>
      ))}
    </div>
  );
}
