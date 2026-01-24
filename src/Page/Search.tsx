import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "@/Context/NavigationContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { useSearchSheet } from "@/Context/SearchSheetContext";
import { cn, getImageUrl } from "@/lib/utils";
import { Search as SearchIcon, X } from "lucide-react";
import httpsRequest from "@/utils/httpsRequest";
import type {
  TSearchUsersResponse,
  TSearchUser,
  TAuthError,
  TSearchHistoryResponse,
  TSearchHistoryItem,
  TAddSearchHistoryRequest,
} from "@/Type/Users";

export default function SearchSheet() {
  const { isOpen, closeSheet } = useSearchSheet();
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TSearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<TSearchHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchSearchResults = async () => {
      const trimmedQuery = debouncedQuery.trim();

      if (!trimmedQuery) {
        setSearchResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsSearching(true);
      setError(null);

      try {
        const response = await httpsRequest.get<TSearchUsersResponse>(
          "/api/users/search",
          {
            params: {
              q: trimmedQuery,
              limit: 50,
            },
            signal: abortController.signal,
          }
        );

        if (abortController.signal.aborted) return;

        if (response.data?.data) {
          setSearchResults(response.data.data);
        } else {
          setSearchResults([]);
        }
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;

        const axiosError = err as {
          response?: { status?: number; data?: TAuthError };
          message?: string;
        };

        if (axiosError.response?.status === 401) {
          setError("Please login to search");
        } else if (axiosError.message !== "canceled") {
          const errorData: TAuthError = axiosError.response?.data || {
            message: "Failed to search users",
          };
          setError(errorData.message);
        }
        setSearchResults([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  const fetchSearchHistory = useCallback(async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      setSearchHistory([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await httpsRequest.get<TSearchHistoryResponse>(
        "/api/search-history",
        {
          params: {
            limit: 20,
          },
        }
      );
      if (response.data?.data && Array.isArray(response.data.data)) {
        setSearchHistory(response.data.data);
      } else {
        setSearchHistory([]);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch search history:", err);
      setSearchHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !searchQuery.trim()) {
      fetchSearchHistory();
    }
  }, [isOpen, searchQuery, fetchSearchHistory]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
      setSearchResults([]);
      setError(null);
      setIsSearching(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isOpen]);

  const saveSearchHistory = useCallback(
    async (userId: string, query: string) => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      const userIdString = typeof userId === "string" ? userId : String(userId);

      try {
        await httpsRequest.post<TAddSearchHistoryRequest>(
          "/api/search-history",
          {
            searchedUserId: userIdString,
            searchQuery: query,
          }
        );
        fetchSearchHistory();
      } catch (err: unknown) {
        console.error("Failed to save search history:", err);
      }
    },
    [fetchSearchHistory]
  );

  const handleUserClick = useCallback(
    async (userId: string, username?: string) => {
      if (searchQuery.trim() && username) {
        saveSearchHistory(userId, searchQuery.trim());
      }
      setIsNavigating(true);
      try {
        await import("@/Page/UserProfile");
        if (username) {
          navigate(`/profile/${username}`);
        } else {
          navigate(`/profile/${userId}`);
        }
      } catch (error) {
        console.error("Failed to preload profile:", error);
        if (username) {
          navigate(`/profile/${username}`);
        } else {
          navigate(`/profile/${userId}`);
        }
      }
      closeSheet();
    },
    [navigate, closeSheet, searchQuery, saveSearchHistory, setIsNavigating]
  );

  const handleDeleteHistoryItem = useCallback(
    async (historyId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await httpsRequest.delete(`/api/search-history/${historyId}`);
        setSearchHistory((prev) =>
          prev.filter((item) => item._id !== historyId)
        );
      } catch (err: unknown) {
        console.error("Failed to delete search history:", err);
      }
    },
    []
  );

  const handleClearAllHistory = useCallback(async () => {
    try {
      await httpsRequest.delete("/api/search-history");
      setSearchHistory([]);
    } catch (err: unknown) {
      console.error("Failed to clear search history:", err);
    }
  }, []);

  const handleHistoryItemClick = useCallback(
    async (item: TSearchHistoryItem) => {
      let username: string | null = null;

      if (item.searchedUser) {
        if (
          typeof item.searchedUser === "object" &&
          item.searchedUser !== null
        ) {
          const userObj = item.searchedUser as { username?: string };
          if (userObj.username) {
            username = userObj.username;
          }
        }
      }

      if (username) {
        setIsNavigating(true);
        try {
          await import("@/Page/UserProfile");
          navigate(`/profile/${username}`);
        } catch (error) {
          console.error("Failed to preload profile:", error);
          navigate(`/profile/${username}`);
        }
        closeSheet();
      } else {
        setSearchQuery(item.searchQuery);
      }
    },
    [navigate, closeSheet, setIsNavigating]
  );

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md bg-card backdrop-blur-0 p-0 flex flex-col"
        style={{
          backgroundColor: "hsl(var(--card))",
          left: "5rem",
          top: 0,
          bottom: 0,
          height: "100vh",
        }}
        showCloseButton={false}
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="text-left text-xl font-semibold">
            Search
          </SheetTitle>
          <SheetDescription className="sr-only">
            Search for users by username or name
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {!searchQuery.trim() ? (
              <div>
                {isLoadingHistory ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p className="text-sm">Loading history...</p>
                  </div>
                ) : (
                  (() => {
                    const validHistoryItems = searchHistory.filter(
                      (item) =>
                        (item.searchedUser && item.searchedUser._id) ||
                        item.searchQuery
                    );
                    return validHistoryItems.length > 0 ? (
                      <>
                        <div className="px-4 py-2 flex items-center justify-between border-b border-border">
                          <h3 className="text-sm font-semibold">Recent</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllHistory}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear all
                          </Button>
                        </div>
                        {validHistoryItems.map((item) => {
                          const username =
                            item.searchedUser?.username || item.searchQuery;
                          const avatarUrl = item.searchedUser?.profilePicture;
                          const initial =
                            username?.charAt(0)?.toUpperCase() || "U";

                          return (
                            <div
                              key={item._id}
                              onClick={() => handleHistoryItemClick(item)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                              )}
                            >
                              <div className="shrink-0 relative">
                                {avatarUrl ? (
                                  <img
                                    src={getImageUrl(avatarUrl)}
                                    alt={username}
                                    className="h-10 w-10 rounded-full object-cover aspect-square"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const fallback =
                                        target.nextElementSibling as HTMLElement;
                                      if (fallback)
                                        fallback.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${avatarUrl ? "hidden" : ""
                                    }`}
                                >
                                  {initial}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                  {username}
                                </p>
                                {item.searchedUser?.fullName && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {item.searchedUser.fullName}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) =>
                                  handleDeleteHistoryItem(item._id, e)
                                }
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        <p className="text-sm">Start typing to search</p>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : isSearching ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">Searching...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-destructive">
                <p className="text-sm">{error}</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => {
                const avatarUrl = user.profilePicture;
                const initial = user.username?.charAt(0)?.toUpperCase() || "U";

                return (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user._id, user.username)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    )}
                  >
                    <div className="shrink-0 relative">
                      {avatarUrl ? (
                        <img
                          src={getImageUrl(avatarUrl)}
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover aspect-square"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback =
                              target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold ${avatarUrl ? "hidden" : ""
                          }`}
                      >
                        {initial}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {user.username}
                      </p>
                      {user.fullName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
