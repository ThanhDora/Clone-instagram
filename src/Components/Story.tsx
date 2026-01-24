import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import httpsRequest from "@/utils/httpsRequest";
import type { Story } from "@/Type/Story";
import type { TAuthError } from "@/Type/Users";

interface StoryResponse {
  success: boolean;
  message: string;
  data: Story[];
}

export default function Story() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    username: string;
    profilePicture?: string;
  } | null>(null);

  const baseURL =
    import.meta.env.VITE_BASE_URL;

  const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${baseURL}${url}`;
    return `${baseURL}/${url}`;
  };

  const fetchStories = useCallback(async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await httpsRequest.get<StoryResponse>("/api/stories");
      setStories(response.data.data || []);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: TAuthError };
      };

      if (axiosError.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          _id: user._id || user.id,
          username: user.username,
          profilePicture: user.profilePicture || user.avatar,
        });
      } catch {
        setCurrentUser(null);
      }
    }
    fetchStories();
  }, [fetchStories]);

  const handleCreateStory = () => {
    navigate("/create-story");
  };

  if (isLoading) {
    return (
      <div className="flex p-1 gap-4 overflow-x-auto pb-2 scrollbar-hide w-full">
        <div className="flex flex-col items-center gap-2 min-w-[80px] shrink-0">
          <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-1 gap-4 overflow-x-auto pb-2 scrollbar-hide w-full">
      {currentUser && (
        <div
          className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer shrink-0"
          onClick={handleCreateStory}
        >
          <div className="relative ring-2 ring-border rounded-full p-1">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {currentUser.profilePicture ? (
                <img
                  src={getImageUrl(currentUser.profilePicture)}
                  alt={currentUser.username}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`h-full w-full rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center ${currentUser.profilePicture ? "hidden" : "flex"
                  }`}
              >
                <span className="text-white text-2xl font-bold">
                  {currentUser.username.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[80px] text-center">
            Your story
          </span>
        </div>
      )}

      {stories.map((story) => {
        const avatarUrl = getImageUrl(story.userAvatar);
        const userInitial = story.username.charAt(0).toUpperCase() || "U";

        return (
          <div
            key={story.id}
            className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer shrink-0"
          >
            <div
              className={`relative ring-2 rounded-full p-1 ${story.isViewed
                ? "ring-border"
                : "ring-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                }`}
            >
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={story.username}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`h-full w-full rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center ${avatarUrl ? "hidden" : "flex"
                    }`}
                >
                  <span className="text-white text-2xl font-bold">
                    {userInitial}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[80px] text-center">
              {story.username}
            </span>
          </div>
        );
      })}
    </div>
  );
}
