import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigation } from "@/Context/NavigationContext";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  Music,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";
import httpsRequest from "@/utils/httpsRequest";
import type { Post, TGetFeedResponse } from "@/Type/Post";
import type { TAuthError, TGetUserByIdResponse } from "@/Type/Users";
import { getImageUrl } from "@/lib/utils";
import PostDetails from "@/Components/PostDetails";
import Loading from "@/Components/Loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

export default function Reels() {
  const { setIsNavigating } = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDetailsOpen, setIsPostDetailsOpen] = useState(false);
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  const [savingPosts, setSavingPosts] = useState<Set<string>>(new Set());
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [followingLoading, setFollowingLoading] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(true);
  const [pausedVideos, setPausedVideos] = useState<Set<string>>(new Set());
  const [userProfiles, setUserProfiles] = useState<Map<string, {
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  }>>(new Map());

  const fetchReels = useCallback(
    async (currentOffset: number, isLoadMore = false) => {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) {
          setError("Please login to view reels");
          return;
        }

        const response = await httpsRequest.get<TGetFeedResponse>(
          "/api/posts/feed",
          {
            params: {
              limit,
              offset: currentOffset,
            },
          }
        );

        const allPosts = response.data.data?.posts || [];
        const videoPosts = allPosts.filter(
          (post) => post.mediaType === "video"
        );

        const newPosts = videoPosts.map((post) => ({
          ...post,
          isLiked: post.isLiked ?? false,
          isSaved: post.isSaved ?? false,
        }));

        if (isLoadMore) {
          setPosts((prev) => {
            const existingPostsMap = new Map(prev.map((p) => [p._id, p]));
            newPosts.forEach((newPost) => {
              const existingPost = existingPostsMap.get(newPost._id);
              if (existingPost) {
                existingPostsMap.set(newPost._id, {
                  ...newPost,
                  isLiked: newPost.isLiked ?? existingPost.isLiked ?? false,
                  isSaved: newPost.isSaved ?? existingPost.isSaved ?? false,
                });
              } else {
                existingPostsMap.set(newPost._id, newPost);
              }
            });
            return Array.from(existingPostsMap.values());
          });
        } else {
          setPosts(newPosts);
        }

        const pagination = response.data.data?.pagination;
        const hasMorePosts = pagination?.hasMore ?? allPosts.length === limit;
        setHasMore(hasMorePosts);

        if (!isLoadMore) {
          setOffset(limit);
        } else {
          setOffset((prev) => prev + limit);
        }
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { status?: number; data?: TAuthError };
          message?: string;
        };

        if (axiosError.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setError("Please login to view reels");
          return;
        }

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to load reels";
        setError(errorMessage);
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
          setIsNavigating(false);
        }
      }
    },
    [setIsNavigating]
  );

  useEffect(() => {
    fetchReels(0, false);
  }, [fetchReels]);

  useEffect(() => {
    if (!isLoading && !isLoadingMore && posts.length < 5 && hasMore) {
      fetchReels(offset, true);
    }
  }, [posts.length, isLoading, isLoadingMore, hasMore, offset, fetchReels]);

  useEffect(() => {
    const userIdsToFetch = new Set<string>();
    posts.forEach((post) => {
      const userId = typeof post.userId === "string" ? post.userId : post.userId?._id || post.user?._id;
      if (userId && !userProfiles.has(userId)) {
        const hasUserData = post.user?.profilePicture || (typeof post.userId === "object" && post.userId?.profilePicture);
        if (!hasUserData) {
          userIdsToFetch.add(userId);
        }
      }
    });

    if (userIdsToFetch.size > 0) {
      Promise.all(
        Array.from(userIdsToFetch).map(async (userId) => {
          try {
            const userResponse = await httpsRequest.get<TGetUserByIdResponse>(
              `/api/users/${userId}`
            );
            const userData = userResponse.data.data;
            return {
              _id: userData._id,
              username: userData.username,
              fullName: userData.fullName,
              profilePicture: userData.profilePicture,
            };
          } catch {
            return null;
          }
        })
      ).then((profiles) => {
        setUserProfiles((prev) => {
          const next = new Map(prev);
          profiles.forEach((profile) => {
            if (profile) {
              next.set(profile._id, profile);
            }
          });
          return next;
        });
      });
    }
  }, [posts, userProfiles]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute("data-video-id");
          if (!videoId) return;

          const video = videoRefs.current.get(videoId);
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setCurrentVideoId(videoId);
            video.currentTime = 0;
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const container = containerRef.current;
    if (!container) return;

    const videoElements = container.querySelectorAll("[data-video-id]");
    videoElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [posts]);

  useEffect(() => {
    if (currentVideoId) {
      videoRefs.current.forEach((video, videoId) => {
        if (videoId !== currentVideoId) {
          video.pause();
        }
      });
    }
  }, [currentVideoId]);

  const handleLike = async (post: Post) => {
    if (likingPosts.has(post._id)) return;

    const previousLiked = post.isLiked ?? false;
    setLikingPosts((prev) => new Set(prev).add(post._id));

    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? {
            ...p,
            isLiked: !previousLiked,
            likes: previousLiked ? (p.likes || 0) - 1 : (p.likes || 0) + 1,
          }
          : p
      )
    );

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      if (previousLiked) {
        await httpsRequest.delete(`/api/posts/${post._id}/like`);
      } else {
        await httpsRequest.post(`/api/posts/${post._id}/like`);
      }
    } catch (error) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? {
              ...p,
              isLiked: previousLiked,
              likes: previousLiked ? (p.likes || 0) + 1 : (p.likes || 0) - 1,
            }
            : p
        )
      );
      console.error("Failed to like post:", error);
    } finally {
      setLikingPosts((prev) => {
        const next = new Set(prev);
        next.delete(post._id);
        return next;
      });
    }
  };

  const handleSave = async (post: Post) => {
    if (savingPosts.has(post._id)) return;

    const previousSaved = post.isSaved ?? false;
    setSavingPosts((prev) => new Set(prev).add(post._id));

    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id ? { ...p, isSaved: !previousSaved } : p
      )
    );

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      if (previousSaved) {
        await httpsRequest.delete(`/api/posts/${post._id}/save`);
      } else {
        await httpsRequest.post(`/api/posts/${post._id}/save`);
      }
    } catch (error) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, isSaved: previousSaved } : p
        )
      );
      console.error("Failed to save post:", error);
    } finally {
      setSavingPosts((prev) => {
        const next = new Set(prev);
        next.delete(post._id);
        return next;
      });
    }
  };

  const handleFollow = async (post: Post) => {
    const userId = typeof post.userId === "string" ? post.userId : post.userId?._id || post.user?._id;
    if (!userId || followingLoading.has(userId)) return;

    const currentUserStr = localStorage.getItem("user");
    let currentUserId: string | null = null;
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        currentUserId = currentUser._id || currentUser.id;
      } catch {
        // Ignore parse error
      }
    }

    if (currentUserId && userId === currentUserId) {
      return;
    }

    const previousFollowing = followingUsers.has(userId);
    setFollowingLoading((prev) => new Set(prev).add(userId));
    setFollowingUsers((prev) => {
      const next = new Set(prev);
      if (previousFollowing) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });

    setPosts((prev) =>
      prev.map((p) => {
        const pUserId = typeof p.userId === "string" ? p.userId : p.userId?._id || p.user?._id;
        return pUserId === userId ? { ...p, isFollowing: !previousFollowing } : p;
      })
    );

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        setFollowingUsers((prev) => {
          const next = new Set(prev);
          if (previousFollowing) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
        return;
      }

      if (previousFollowing) {
        await httpsRequest.delete(`/api/follow/${userId}/follow`);
      } else {
        await httpsRequest.post(`/api/follow/${userId}/follow`, {});
      }
    } catch (error) {
      setFollowingUsers((prev) => {
        const next = new Set(prev);
        if (previousFollowing) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => {
          const pUserId = typeof p.userId === "string" ? p.userId : p.userId?._id || p.user?._id;
          return pUserId === userId ? { ...p, isFollowing: previousFollowing } : p;
        })
      );
      console.error("Failed to follow/unfollow user:", error);
    } finally {
      setFollowingLoading((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingMore || !hasMore) return;

    const container = containerRef.current;
    const scrollBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (scrollBottom < 500) {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
      fetchReels(nextOffset, true);
    }
  }, [offset, isLoadingMore, hasMore, fetchReels]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return <Loading />;
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const getUsername = (post: Post): string => {
    if (post.user?.username) return post.user.username;
    if (typeof post.userId === "object" && post.userId?.username) {
      return post.userId.username;
    }
    return "unknown";
  };

  const getProfilePicture = (post: Post): string | null => {
    if (post.user?.profilePicture) {
      return getImageUrl(post.user.profilePicture);
    }
    if (typeof post.userId === "object" && post.userId?.profilePicture) {
      return getImageUrl(post.userId.profilePicture);
    }
    const userId = getUserId(post);
    if (userId) {
      const userProfile = userProfiles.get(userId);
      if (userProfile?.profilePicture) {
        return getImageUrl(userProfile.profilePicture);
      }
    }
    return null;
  };

  const getUserId = (post: Post): string | null => {
    return typeof post.userId === "string" ? post.userId : post.userId?._id || post.user?._id || null;
  };

  const isFollowingUser = (post: Post): boolean => {
    const userId = getUserId(post);
    if (!userId) return false;
    const postWithFollowing = post as Post & { isFollowing?: boolean };
    return followingUsers.has(userId) || postWithFollowing.isFollowing === true;
  };

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory bg-background"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {posts.map((post) => {
          const videoUrl = getImageUrl(post.video || "");
          const username = getUsername(post);
          let profilePicture = getProfilePicture(post);
          const userId = getUserId(post);
          if (!profilePicture && userId) {
            const userProfile = userProfiles.get(userId);
            if (userProfile?.profilePicture) {
              profilePicture = getImageUrl(userProfile.profilePicture);
            }
          }
          const userInitial = (username.charAt(0) || "U").toUpperCase();

          return (
            <div
              key={post._id}
              className="h-screen snap-start snap-always relative flex items-center justify-center bg-card"
              data-video-id={post._id}
            >
              <div
                className="w-full h-full flex items-center justify-center bg-card relative"
                onClick={(e) => {
                  const video = videoRefs.current.get(post._id);
                  if (video && (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "VIDEO")) {
                    if (video.paused) {
                      video.play().catch(() => { });
                      setPausedVideos((prev) => {
                        const next = new Set(prev);
                        next.delete(post._id);
                        return next;
                      });
                    } else {
                      video.pause();
                      setPausedVideos((prev) => {
                        const next = new Set(prev);
                        next.add(post._id);
                        return next;
                      });
                    }
                  }
                }}
              >
                <div
                  className="h-full w-auto flex items-center justify-center bg-background pointer-events-none relative"
                  style={{ aspectRatio: "9/16" }}
                >
                  <video
                    ref={(el) => {
                      if (el) {
                        videoRefs.current.set(post._id, el);
                        el.muted = isMuted;
                        if (post._id === posts[0]?._id && currentVideoId === null) {
                          setCurrentVideoId(post._id);
                          el.play().catch(() => { });
                        }
                        el.addEventListener("play", () => {
                          setPausedVideos((prev) => {
                            const next = new Set(prev);
                            next.delete(post._id);
                            return next;
                          });
                        });
                        el.addEventListener("pause", () => {
                          setPausedVideos((prev) => {
                            const next = new Set(prev);
                            next.add(post._id);
                            return next;
                          });
                        });
                      } else {
                        videoRefs.current.delete(post._id);
                      }
                    }}
                    src={videoUrl}
                    className="w-full h-full object-contain cursor-pointer"
                    loop
                    muted={isMuted}
                    autoPlay
                    playsInline
                    onLoadedData={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.muted = isMuted;
                      const videoId = target.getAttribute("data-video-id");
                      if (videoId === currentVideoId || (videoId === posts[0]?._id && !currentVideoId)) {
                        target.play().catch(() => { });
                      }
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = "none";
                    }}
                    data-video-id={post._id}
                  />
                  {pausedVideos.has(post._id) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/50 rounded-full p-4">
                        <Play className="h-12 w-12 text-foreground fill-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 flex pointer-events-none">
                <div className="flex-1 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10 pointer-events-auto"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-foreground" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-foreground" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-5 p-4 pr-4 justify-end pb-32 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post);
                    }}
                    disabled={likingPosts.has(post._id)}
                    className="flex flex-col items-center gap-1 hover:opacity-70 disabled:opacity-50"
                  >
                    {post.isLiked ? (
                      <Heart className="h-7 w-7 text-red-500 fill-red-500" />
                    ) : (
                      <Heart className="h-7 w-7 text-foreground" />
                    )}
                    <span className="text-foreground text-xs font-semibold">
                      {post.likes || 0}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                      setIsPostDetailsOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 hover:opacity-70"
                  >
                    <MessageCircle className="h-7 w-7 text-foreground" />
                  </button>

                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center gap-1 hover:opacity-70"
                  >
                    <Send className="h-7 w-7 text-foreground" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(post);
                    }}
                    disabled={savingPosts.has(post._id)}
                    className="flex flex-col items-center gap-1 hover:opacity-70 disabled:opacity-50"
                  >
                    {post.isSaved ? (
                      <Bookmark className="h-7 w-7 text-foreground fill-foreground" />
                    ) : (
                      <Bookmark className="h-7 w-7 text-foreground" />
                    )}
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:opacity-70"
                      >
                        <MoreVertical className="h-7 w-7 text-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Report</DropdownMenuItem>
                      <DropdownMenuItem>Not interested</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link
                    to={`/profile/${username}`}
                    className="h-10 w-10 rounded-full border-2 border-white mt-2 shrink-0 relative overflow-hidden flex items-center justify-center"
                  >
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={username}
                        className="w-full h-full object-cover absolute inset-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = target.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`avatar-fallback h-full w-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center ${profilePicture ? "hidden" : "flex"}`}
                    >
                      <span className="text-foreground text-xs font-bold">
                        {userInitial}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-20 p-4 pb-24 text-foreground pointer-events-auto">
                <div className="flex items-center gap-3 mb-2">
                  {profilePicture ? (
                    <Link
                      to={`/profile/${username}`}
                      className="h-10 w-10 rounded-full overflow-hidden border-2 border-white"
                    >
                      <img
                        src={profilePicture}
                        alt={username}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ) : (
                    <Link
                      to={`/profile/${username}`}
                      className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center border-2 border-white"
                    >
                      <span className="text-foreground text-sm font-bold">
                        {userInitial}
                      </span>
                    </Link>
                  )}
                  <Link
                    to={`/profile/${username}`}
                    className="font-semibold text-sm text-foreground hover:opacity-70"
                  >
                    {username}
                  </Link>
                  {(() => {
                    const userId = getUserId(post);
                    const currentUserStr = localStorage.getItem("user");
                    let currentUserId: string | null = null;
                    if (currentUserStr) {
                      try {
                        const currentUser = JSON.parse(currentUserStr);
                        currentUserId = currentUser._id || currentUser.id;
                      } catch {
                        // Ignore
                      }
                    }
                    const isOwnPost = userId === currentUserId;
                    const isFollowing = isFollowingUser(post);
                    const isLoading = userId ? followingLoading.has(userId) : false;

                    if (isOwnPost) return null;

                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(post);
                        }}
                        disabled={isLoading}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${isFollowing
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "border border-foreground text-foreground hover:bg-foreground/10"
                          } disabled:opacity-50`}
                      >
                        {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                      </button>
                    );
                  })()}
                </div>
                {post.caption && (
                  <p className="text-sm mb-2">
                    {post.caption.length > 50 ? (
                      <>
                        {post.caption.substring(0, 50)}
                        <span className="text-muted-foreground">...</span>
                      </>
                    ) : (
                      post.caption
                    )}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Music className="h-4 w-4" />
                  <span className="text-muted-foreground">
                    {username} · Original audio
                  </span>
                </div>
              </div>


            </div>
          );
        })}

        {isLoadingMore && (
          <div className="h-screen snap-start snap-always flex items-center justify-center">
            <Loading />
          </div>
        )}
      </div>

      <PostDetails
        post={selectedPost}
        isOpen={isPostDetailsOpen}
        onOpenChange={(open) => {
          setIsPostDetailsOpen(open);
          if (!open) {
            setSelectedPost(null);
          }
        }}
        onPostUpdate={(updatedPost) => {
          setPosts((prev) =>
            prev.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
            )
          );
        }}
      />
    </>
  );
}
