import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import httpsRequest from "@/utils/httpsRequest";
import { getImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import Loading from "@/Components/Loading";
import type { TAuthError } from "@/Type/Users";

interface Follower {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  isFollowing?: boolean;
}

type TFollowersResponse = {
  success: boolean;
  message: string;
  data: {
    followers?: Follower[];
    following?: Follower[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalFollowers?: number;
      totalFollowing?: number;
      hasMore: boolean;
    };
  };
};

interface FollowProps {
  username?: string;
  userId?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Follow(props: FollowProps = {}) {
  const { username: usernameProp, userId: userIdProp, isOpen: isOpenProp, onOpenChange: onOpenChangeProp } = props;
  const { username: usernameFromParams } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const modalParam = searchParams.get("modal");
  const isFollowingList = location.pathname.includes("/following") || modalParam === "following";
  const username = usernameProp || usernameFromParams;
  const [isOpen, setIsOpen] = useState(isOpenProp !== undefined ? isOpenProp : true);
  const [users, setUsers] = useState<Follower[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingUsers, setRemovingUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const currentUserStr = localStorage.getItem("user");
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        setCurrentUserId(currentUser._id || currentUser.id);
      } catch {
        // Ignore
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        setError(`Please login to view ${isFollowingList ? "following" : "followers"}`);
        return;
      }

      let userId: string | null = userIdProp || null;

      if (!userId && username) {
        try {
          const searchResponse = await httpsRequest.get<{
            success: boolean;
            data: Array<{
              _id: string;
              username: string;
            }>;
          }>("/api/users/search", {
            params: {
              q: username,
              limit: 10,
            },
          });

          const foundUser = searchResponse.data.data?.find(
            (u) => u.username === username
          );
          if (foundUser) {
            userId = foundUser._id;
          } else {
            try {
              const userResponse = await httpsRequest.get<{
                success: boolean;
                data: { _id: string };
              }>(`/api/users/username/${username}`);
              userId = userResponse.data.data._id;
            } catch {
              // Ignore
            }
          }
        } catch (searchError) {
          try {
            const userResponse = await httpsRequest.get<{
              success: boolean;
              data: { _id: string };
            }>(`/api/users/username/${username}`);
            userId = userResponse.data.data._id;
          } catch {
            console.error("Failed to fetch user by username:", searchError);
          }
        }
      } else {
        try {
          const profileResponse = await httpsRequest.get<{
            success: boolean;
            data: { _id: string };
          }>("/api/users/profile");
          userId = profileResponse.data.data._id;
        } catch {
          // Ignore
        }
      }

      if (!userId) {
        setError("User not found");
        setIsLoading(false);
        return;
      }

      const endpoint = isFollowingList ? "following" : "followers";
      let response;
      try {
        response = await httpsRequest.get<TFollowersResponse>(
          `/api/follow/${userId}/${endpoint}`
        );
      } catch (firstError) {
        try {
          response = await httpsRequest.get<TFollowersResponse>(
            `/api/users/${userId}/${endpoint}`
          );
        } catch {
          throw firstError;
        }
      }

      let usersData: Follower[] = [];
      const responseBody = response?.data;

      if (responseBody && typeof responseBody === "object" && "data" in responseBody) {
        const dataObj = (responseBody as { data: TFollowersResponse["data"] }).data;
        if (dataObj && typeof dataObj === "object") {
          if (isFollowingList && Array.isArray(dataObj.following)) {
            usersData = dataObj.following;
          } else if (!isFollowingList && Array.isArray(dataObj.followers)) {
            usersData = dataObj.followers;
          }
        }
      }

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      const axiosError = err as {
        response?: { status?: number; data?: TAuthError | unknown };
        message?: string;
      };

      if (axiosError.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setError(`Please login to view ${isFollowingList ? "following" : "followers"}`);
        return;
      }

      console.error("Error response:", axiosError.response?.data);
      const errorData = axiosError.response?.data;
      const errorMessage =
        (errorData && typeof errorData === "object" && "message" in errorData
          ? (errorData as { message: string }).message
          : null) ||
        (typeof errorData === "string" ? errorData : null) ||
        axiosError.message ||
        `Failed to load ${isFollowingList ? "following" : "followers"}`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [username, userIdProp, isFollowingList]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.fullName?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleRemove = async (userId: string) => {
    if (removingUsers.has(userId)) return;

    setRemovingUsers((prev) => new Set(prev).add(userId));

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      await httpsRequest.delete(`/api/follow/${userId}/follow`);

      setUsers((prev) => prev.filter((f) => f._id !== userId));
      setFilteredUsers((prev) => prev.filter((f) => f._id !== userId));
    } catch (error) {
      console.error(`Failed to ${isFollowingList ? "unfollow" : "remove"}:`, error);
    } finally {
      setRemovingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp);
    }
  }, [isOpenProp]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
      if (onOpenChangeProp) {
        onOpenChangeProp(open);
      } else {
        if (username) {
          navigate(`/profile/${username}`);
        } else {
          navigate("/profile");
        }
      }
    } else if (onOpenChangeProp) {
      onOpenChangeProp(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 h-[80vh] bg-gray-50/80 text-black flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl text-center font-semibold text-foreground">
            {isFollowingList ? "Following" : "Followers"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input/30"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loading />
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">
                {searchQuery
                  ? `No ${isFollowingList ? "following" : "followers"} found`
                  : `No ${isFollowingList ? "following" : "followers"}`}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredUsers.map((user) => {
                const userInitial = (user.username.charAt(0) || "U").toUpperCase();
                const isOwnProfile = currentUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      className="shrink-0 relative"
                      onClick={() => setIsOpen(false)}
                    >
                      {user.profilePicture ? (
                        <img
                          src={getImageUrl(user.profilePicture)}
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback = target.parentElement?.querySelector(
                              ".avatar-fallback"
                            ) as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`avatar-fallback h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-foreground text-xs font-semibold ${user.profilePicture ? "hidden" : "flex"}`}
                      >
                        {userInitial}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${user.username}`}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.username}
                        </p>
                        {user.fullName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.fullName}
                          </p>
                        )}
                      </Link>
                    </div>

                    {!isOwnProfile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(user._id)}
                        disabled={removingUsers.has(user._id)}
                        className="text-foreground"
                      >
                        {removingUsers.has(user._id)
                          ? "..."
                          : isFollowingList
                            ? "Unfollow"
                            : "Remove"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
