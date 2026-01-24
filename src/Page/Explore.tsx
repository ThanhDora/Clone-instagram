import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigation } from "@/Context/NavigationContext";
import { Heart, MessageCircle } from "lucide-react";
import httpsRequest from "@/utils/httpsRequest";
import type { Post, TGetFeedResponse } from "@/Type/Post";
import type { TAuthError } from "@/Type/Users";
import { getImageUrl } from "@/lib/utils";
import PostDetails from "@/Components/PostDetails";
import Loading from "@/Components/Loading";

export default function Explore() {
  const { setIsNavigating } = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostDetailsOpen, setIsPostDetailsOpen] = useState(false);

  const fetchExplorePosts = useCallback(
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
          setError("Please login to view explore posts");
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
          setError("Please login to view explore posts");
          return;
        }

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to load posts";
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
    fetchExplorePosts(0, false);
  }, [fetchExplorePosts]);

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
          fetchExplorePosts(nextOffset, true);
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
  }, [hasMore, isLoadingMore, isLoading, offset, fetchExplorePosts]);

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

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => {
              const imageUrl = post.image || post.video || "";
              const postImageUrl = getImageUrl(imageUrl);

              return (
                <div
                  key={post._id}
                  className="aspect-square relative cursor-pointer group"
                  onClick={() => {
                    setSelectedPost(post);
                    setIsPostDetailsOpen(true);
                  }}
                >
                  {post.mediaType === "video" ? (
                    <video
                      src={postImageUrl}
                      className="w-full h-full object-cover"
                      muted
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
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-4 text-white">
                      <span className="font-semibold flex items-center gap-1">
                        <Heart className="h-5 w-5" /> {post.likes || 0}
                      </span>
                      <span className="font-semibold flex items-center gap-1">
                        <MessageCircle className="h-5 w-5" />{" "}
                        {post.comments || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-muted-foreground">No posts found</p>
          </div>
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        )}

        <div ref={observerTarget} className="h-4" />
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
