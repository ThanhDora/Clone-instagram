import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import Switch from "./Switch";
import { Link } from "react-router-dom";
import httpsRequest from "@/utils/httpsRequest";
import { getImageUrl } from "@/lib/utils";
import type {
  TGetProfileResponse,
  TUser,
  TSuggestedUsersResponse,
  TSuggestedUser,
} from "@/Type/Users";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const [suggestions, setSuggestions] = useState<TSuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        // Try to get from localStorage user
        const currentUserStr = localStorage.getItem("user");
        if (currentUserStr) {
          try {
            const parsedUser = JSON.parse(currentUserStr);
            setCurrentUser(parsedUser as TUser);
          } catch {
            // Ignore parse error
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await httpsRequest.get<TGetProfileResponse>(
          "/api/users/profile"
        );
        setCurrentUser(response.data.data);
        // Update localStorage user
        localStorage.setItem("user", JSON.stringify(response.data.data));
      } catch (err: unknown) {
        console.error("Failed to fetch profile:", err);
        // Fallback to localStorage user
        const currentUserStr = localStorage.getItem("user");
        if (currentUserStr) {
          try {
            const parsedUser = JSON.parse(currentUserStr);
            setCurrentUser(parsedUser as TUser);
          } catch {
            // Ignore parse error
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestions = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await httpsRequest.get<TSuggestedUsersResponse>(
          "/api/users/suggested",
          {
            params: {
              limit: 5,
            },
          }
        );
        setSuggestions(response.data.data);
      } catch (err: unknown) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    if (currentUser) {
      fetchSuggestions();
    }
  }, [currentUser]);

  const handleFollow = async (userId: string, index: number) => {
    try {
      await httpsRequest.post(`/api/follow/${userId}/follow`);
      // Update suggestion to mark as following
      setSuggestions((prev) =>
        prev.map((user, i) =>
          i === index ? { ...user, isFollowing: true } : user
        )
      );
    } catch (err: unknown) {
      console.error("Failed to follow user:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-card p-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar
            image={getImageUrl(
              currentUser.profilePicture || currentUser.avatar
            )}
            username={currentUser.username}
          />
          <div className="flex-1 min-w-0">
            <Link to="/profile" className="font-semibold truncate">
              {currentUser.username}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {currentUser.fullName || ""}
            </p>
          </div>
          <Switch />
        </div>
      </div>
      <div className="rounded-lg bg-card p-4">
        <div className="flex items-center justify-between">
          <h4 className="mb-3 text-sm font-semibold">Suggestions for you</h4>
          <button className="text-xs font-semibold text-blue-300 hover:text-blue-400 cursor-pointer hover:opacity-80 transition-opacity">
            See All
          </button>
        </div>
        {isLoadingSuggestions ? (
          <div className="mt-4 text-sm text-muted-foreground">
            Loading suggestions...
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3 mt-4">
            {suggestions.map((user, index) => (
              <div key={user._id} className="flex items-center gap-3">
                <Avatar
                  image={getImageUrl(user.profilePicture)}
                  username={user.username}
                />
                <div className="flex-1">
                  <Link
                    to={`/profile/${user._id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {user.username}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.fullName || "Suggested for you"}
                  </p>
                </div>
                <button
                  onClick={() => handleFollow(user._id, index)}
                  disabled={user.isFollowing}
                  className="text-xs font-semibold text-blue-300 hover:text-blue-400 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-muted-foreground">
            No suggestions available
          </div>
        )}
      </div>
    </div>
  );
}
