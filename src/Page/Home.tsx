/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import httpsRequest from "@/utils/httpsRequest";
import type { Post, TGetFeedResponse } from "@/Type/Post";
import type { TAuthError, TGetUserByIdResponse } from "@/Type/Users";
import Story from "@/Components/Story";
import { Button } from "@/Components/ui/button";
import Loading from "@/Components/Loading";
import PostDetails from "@/Components/PostDetails";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";

interface UserProfile {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const postIdFromUrl = params.postId;
  const editPostIdFromUrl = searchParams.get("edit");

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const observerTarget = useRef<HTMLDivElement>(null);
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  const [savingPosts, setSavingPosts] = useState<Set<string>>(new Set());
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(
    new Map()
  );
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const baseURL =
    import.meta.env.VITE_BASE_URL || "https://instagram.f8team.dev";

  const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${baseURL}${url}`;
    return `${baseURL}/${url}`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)}w`;
    return `${Math.floor(diffInSeconds / 2592000)}mo`;
  };

  const fetchFeedPosts = useCallback(
    async (currentOffset: number, isLoadMore = false) => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await httpsRequest.get<TGetFeedResponse>(
          "/api/posts/feed",
          {
            params: {
              limit,
              offset: currentOffset,
            },
          }
        );

        const newPosts = (response.data.data?.posts || []).map((post) => ({
          ...post,
          isLiked: post.isLiked ?? false,
          isSaved: post.isSaved ?? false,
        }));
        const pagination = response.data.data?.pagination;

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

        if (pagination) {
          setHasMore(pagination.hasMore ?? newPosts.length === limit);
        } else {
          setHasMore(newPosts.length === limit);
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
          navigate("/login", { replace: true });
          return;
        }

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to load posts. Please try again.";
        setError(errorMessage);
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [navigate, limit]
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id);
      } catch {
        setCurrentUserId(null);
      }
    }
    fetchFeedPosts(0, false);
  }, [fetchFeedPosts]);

  // Sync URL params with state for edit dialog
  useEffect(() => {
    if (editPostIdFromUrl && postIdFromUrl) {
      const post = posts.find((p) => p._id === postIdFromUrl);
      if (post) {
        setEditingPost(post);
        setEditCaption(post.caption || "");
      }
    }
  }, [editPostIdFromUrl, postIdFromUrl, posts]);

  useEffect(() => {
    const userIdsToFetch = new Set<string>();
    posts.forEach((post) => {
      const userId =
        typeof post.userId === "object" ? post.userId?._id : post.userId;
      if (userId && !userProfiles.has(userId)) {
        userIdsToFetch.add(userId);
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
  }, [posts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          const nextOffset = offset + limit;
          setOffset(nextOffset);
          fetchFeedPosts(nextOffset, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, offset, fetchFeedPosts]);

  const handleLike = async (postId: string, currentIsLiked: boolean) => {
    if (likingPosts.has(postId)) return;

    setLikingPosts((prev) => new Set(prev).add(postId));

    const newIsLiked = !currentIsLiked;

    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          const currentLikes = post.likes || 0;
          const newLikes = newIsLiked
            ? currentLikes + 1
            : Math.max(0, currentLikes - 1);
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newLikes,
          };
        }
        return post;
      })
    );

    try {
      if (currentIsLiked) {
        await httpsRequest.delete(`/api/posts/${postId}/like`);
      } else {
        await httpsRequest.post(`/api/posts/${postId}/like`);
      }
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

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const currentLikes = post.likes || 0;
            const revertedLikes = currentIsLiked
              ? currentLikes + 1
              : Math.max(0, currentLikes - 1);
            return {
              ...post,
              isLiked: currentIsLiked,
              likes: revertedLikes,
            };
          }
          return post;
        })
      );
    } finally {
      setLikingPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleSave = async (postId: string, currentIsSaved: boolean) => {
    if (savingPosts.has(postId)) return;

    setSavingPosts((prev) => new Set(prev).add(postId));

    const newIsSaved = !currentIsSaved;

    setPosts((prev) =>
      prev.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            isSaved: newIsSaved,
          };
        }
        return post;
      })
    );

    try {
      if (currentIsSaved) {
        await httpsRequest.delete(`/api/posts/${postId}/save`);
      } else {
        await httpsRequest.post(`/api/posts/${postId}/save`);
      }
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

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              isSaved: currentIsSaved,
            };
          }
          return post;
        })
      );
    } finally {
      setSavingPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleEditPost = (post: Post) => {
    navigate(`/post/${post._id}?edit=true`);
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      await httpsRequest.patch(`/api/posts/${editingPost._id}`, {
        caption: editCaption.trim(),
      });

      setPosts((prev) =>
        prev.map((post) =>
          post._id === editingPost._id
            ? { ...post, caption: editCaption.trim() }
            : post
        )
      );

      setSearchParams({});
      setEditingPost(null);
      setEditCaption("");
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
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await httpsRequest.delete(`/api/posts/${postId}`);

      setPosts((prev) => prev.filter((post) => post._id !== postId));
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
    } finally {
      setIsDeleting(false);
    }
  };

  const isPostOwner = (post: Post): boolean => {
    const postUserId =
      typeof post.userId === "object" ? post.userId?._id : post.userId;
    const postUser = post.user?._id;
    return (
      currentUserId !== null &&
      (postUserId === currentUserId || postUser === currentUserId)
    );
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id);
      } catch {
        setCurrentUserId(null);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
        <Button
          className="mt-4"
          onClick={() => fetchFeedPosts(0, false)}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[614px] mx-auto">
      <div className="mb-6">
        <Story />
      </div>

      {posts.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-muted-foreground text-center">
            <p className="text-xl font-semibold mb-2">No posts yet</p>
            <p className="text-sm">
              Follow users to see their posts in your feed
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => {
            const userIdValue =
              typeof post.userId === "string" ? post.userId : post.userId?._id;
            const cachedUser = userIdValue
              ? userProfiles.get(userIdValue)
              : null;
            const user =
              post.user ||
              cachedUser ||
              (typeof post.userId === "object" ? post.userId : null);
            const profilePictureUrl = user?.profilePicture
              ? getImageUrl(user.profilePicture)
              : null;
            const username = user?.username || "unknown";
            const fullName = user?.fullName || "";
            const userInitial = (username.charAt(0) || "U").toUpperCase();
            const mediaUrl = post.image || post.video || "";
            const postImageUrl = getImageUrl(mediaUrl);
            const isLiked = post.isLiked ?? false;
            const isSaved = post.isSaved ?? false;

            return (
              <article
                key={post._id}
                className="bg-background border border-border rounded-lg overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0">
                      {profilePictureUrl && (
                        <img
                          src={profilePictureUrl}
                          alt={username}
                          className="h-10 w-10 rounded-full object-cover border border-border absolute inset-0"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback =
                              target.parentElement?.querySelector(
                                ".avatar-fallback"
                              ) as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      )}
                      <div
                        className={`avatar-fallback h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center ${
                          profilePictureUrl ? "hidden" : "flex"
                        }`}
                      >
                        <span className="text-white text-sm font-bold">
                          {userInitial}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link
                        to={`/profile/${user?.username || "unknown"}`}
                        className="font-semibold text-sm hover:opacity-70 truncate"
                      >
                        {username}
                      </Link>
                      {fullName && (
                        <span className="text-xs text-muted-foreground truncate">
                          {fullName}
                        </span>
                      )}
                    </div>
                  </div>
                  {isPostOwner(post) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:opacity-70">
                          <MoreHorizontal className="h-5 w-5 text-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-600">
                        <DropdownMenuItem
                          onClick={() => handleEditPost(post)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post._id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button className="p-1 hover:opacity-70">
                      <MoreHorizontal className="h-5 w-5 text-foreground" />
                    </button>
                  )}
                </div>

                <div className="relative w-full bg-black">
                  {post.mediaType === "video" ? (
                    <video
                      src={postImageUrl}
                      className="w-full h-auto max-h-[80vh] object-cover"
                      controls
                      playsInline
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <img
                      src={postImageUrl}
                      alt={post.caption || ""}
                      className="w-full h-auto max-h-[80vh] object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLike(post._id, isLiked)}
                          disabled={likingPosts.has(post._id)}
                          className="hover:opacity-70 disabled:opacity-50"
                        >
                          {isLiked ? (
                            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                          ) : (
                            <Heart className="h-6 w-6 text-foreground" />
                          )}
                        </button>
                        {post.likes > 0 && (
                          <div className="text-sm font-semibold">
                            {post.likes.toLocaleString()} {post.likes === 1}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigate(`/post/${post._id}`);
                          }}
                          className="hover:opacity-70"
                        >
                          <MessageCircle className="h-6 w-6 text-foreground" />
                        </button>
                        {post.comments > 0 && (
                          <button
                            onClick={() => {
                              navigate(`/post/${post._id}`);
                            }}
                            className="text-sm font-semibold hover:opacity-70"
                          >
                            {post.comments.toLocaleString()}{" "}
                            {post.comments === 1}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="hover:opacity-70">
                          <Send className="h-6 w-6 text-foreground" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSave(post._id, isSaved)}
                      disabled={savingPosts.has(post._id)}
                      className="hover:opacity-70 disabled:opacity-50"
                    >
                      {isSaved ? (
                        <Bookmark className="h-6 w-6 text-black fill-black dark:text-gray-400 dark:fill-gray-400" />
                      ) : (
                        <Bookmark className="h-6 w-6 text-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{username}</span>
                      {post.caption && (
                        <span className="text-sm">{post.caption}</span>
                      )}
                    </div>

                    {post.comments > 0 && (
                      <button className="text-sm text-muted-foreground hover:text-foreground">
                        View all {post.comments}{" "}
                        {post.comments === 1 ? "comment" : "comments"}
                      </button>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading more posts...</div>
        </div>
      )}

      <div ref={observerTarget} className="h-4" />

      {/* Edit Post Dialog - controlled by URL */}
      {editPostIdFromUrl && postIdFromUrl && (
        <Dialog
          open={!!editPostIdFromUrl}
          onOpenChange={(open) => {
            if (!open) {
              navigate(-1);
              setEditingPost(null);
              setEditCaption("");
            }
          }}
        >
          <DialogContent
            className="bg-card border-border shadow-lg"
            style={{ backgroundColor: "hsl(var(--card))" }}
          >
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your post caption below.
            </DialogDescription>
            <div className="space-y-4 mt-4">
              <Textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Write a caption..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(-1);
                    setEditingPost(null);
                    setEditCaption("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleUpdatePost}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PostDetails - controlled by URL */}
      {postIdFromUrl && !editPostIdFromUrl && (
        <PostDetails
          post={posts.find((p) => p._id === postIdFromUrl) || null}
          isOpen={!!postIdFromUrl}
          onOpenChange={(open) => {
            if (!open) {
              navigate(-1);
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
      )}
    </div>
  );
}
