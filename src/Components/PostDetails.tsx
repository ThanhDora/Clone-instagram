import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/Components/ui/dialog";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import type { Post } from "@/Type/Post";
import type { TGetUserByIdResponse } from "@/Type/Users";
import httpsRequest from "@/utils/httpsRequest";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { useSocket } from "@/Context/SocketContext";

interface PostDetailsProps {
  post: Post | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdate?: (updatedPost: Post) => void;
}

interface Comment {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        username: string;
        fullName?: string;
        profilePicture?: string;
      };
  content: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
}

export default function PostDetails({
  post,
  isOpen,
  onOpenChange,
  onPostUpdate,
}: PostDetailsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
  const [isSaved, setIsSaved] = useState(post?.isSaved ?? false);
  const [likes, setLikes] = useState(post?.likes ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    _id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  } | null>(null);
  const [commentUserProfiles, setCommentUserProfiles] = useState<
    Map<
      string,
      {
        _id: string;
        username: string;
        fullName?: string;
        profilePicture?: string;
      }
    >
  >(new Map());

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

  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked ?? false);
      setIsSaved(post.isSaved ?? false);
      setLikes(post.likes ?? 0);
    }
  }, [post]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!post) return;

      const userIdValue =
        typeof post.userId === "string" ? post.userId : post.userId?._id;

      // Nếu không có userId, không fetch
      if (!userIdValue) return;

      // Kiểm tra xem đã có profilePicture đầy đủ chưa
      const currentUser =
        post.user || (typeof post.userId === "object" ? post.userId : null);
      const hasProfilePicture = currentUser?.profilePicture;

      // Nếu đã có profilePicture, không cần fetch
      if (hasProfilePicture) {
        return;
      }

      // Fetch user profile nếu thiếu profilePicture
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) return;

        const response = await httpsRequest.get<TGetUserByIdResponse>(
          `/api/users/${userIdValue}`
        );

        if (response.data.success && response.data.data) {
          setUserProfile({
            _id: response.data.data._id,
            username: response.data.data.username,
            fullName: response.data.data.fullName,
            profilePicture: response.data.data.profilePicture,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    if (isOpen && post) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [isOpen, post]);

  const fetchComments = useCallback(async () => {
    if (!post) return;

    setIsLoadingComments(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      const response = await httpsRequest.get<{
        success: boolean;
        data: { comments: Comment[] };
      }>(`/api/posts/${post._id}/comments`);

      if (response.data.success) {
        const commentsData = response.data.data.comments || [];
        setComments(commentsData);

        // Fetch user profiles cho comments thiếu profilePicture
        const userIdsToFetch = new Set<string>();
        commentsData.forEach((comment) => {
          const userIdValue =
            typeof comment.userId === "string"
              ? comment.userId
              : comment.userId?._id;

          if (!userIdValue) return;

          const commentUser =
            typeof comment.userId === "object" ? comment.userId : null;
          const hasProfilePicture = commentUser?.profilePicture;

          // Nếu thiếu profilePicture, thêm vào danh sách fetch
          if (!hasProfilePicture) {
            userIdsToFetch.add(userIdValue);
          }
        });

        // Fetch user profiles
        if (userIdsToFetch.size > 0) {
          Promise.all(
            Array.from(userIdsToFetch).map(async (userId) => {
              try {
                const userResponse =
                  await httpsRequest.get<TGetUserByIdResponse>(
                    `/api/users/${userId}`
                  );
                const userData = userResponse.data.data;
                return {
                  userId,
                  profile: {
                    _id: userData._id,
                    username: userData.username,
                    fullName: userData.fullName,
                    profilePicture: userData.profilePicture,
                  },
                };
              } catch {
                return null;
              }
            })
          ).then((results) => {
            setCommentUserProfiles((prev) => {
              const next = new Map(prev);
              results.forEach((result) => {
                if (result) {
                  next.set(result.userId, result.profile);
                }
              });
              return next;
            });
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [post]);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
    } else {
      setComments([]);
      setNewComment("");
      setCommentUserProfiles(new Map());
    }
  }, [isOpen, post, fetchComments]);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !post || !isOpen) return;

    const handleNewComment = (data: { postId: string; comment: Comment }) => {
      if (data.postId === post._id) {
        setComments((prev) => {
          const exists = prev.find((c) => c._id === data.comment._id);
          if (exists) return prev;
          return [data.comment, ...prev];
        });

        const userIdValue =
          typeof data.comment.userId === "string"
            ? data.comment.userId
            : data.comment.userId?._id;

        if (userIdValue) {
          const commentUser =
            typeof data.comment.userId === "object"
              ? data.comment.userId
              : null;
          const hasProfilePicture = commentUser?.profilePicture;

          if (!hasProfilePicture) {
            httpsRequest
              .get<TGetUserByIdResponse>(`/api/users/${userIdValue}`)
              .then((userResponse) => {
                const userData = userResponse.data.data;
                setCommentUserProfiles((prev) => {
                  const next = new Map(prev);
                  next.set(userIdValue, {
                    _id: userData._id,
                    username: userData.username,
                    fullName: userData.fullName,
                    profilePicture: userData.profilePicture,
                  });
                  return next;
                });
              })
              .catch((error) => {
                console.error(
                  "Failed to fetch user profile for new comment:",
                  error
                );
              });
          }
        }

        if (onPostUpdate) {
          onPostUpdate({
            ...post,
            comments: (post.comments || 0) + 1,
          });
        }
      }
    };

    socket.on("new_comment", handleNewComment);

    return () => {
      socket.off("new_comment", handleNewComment);
    };
  }, [socket, isConnected, post, isOpen, onPostUpdate]);

  const handleLike = async () => {
    if (!post || isLiking) return;

    const previousLiked = isLiked;
    const previousLikes = likes;

    setIsLiked(!isLiked);
    setLikes((prev) => (previousLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      if (previousLiked) {
        await httpsRequest.delete(`/api/posts/${post._id}/like`);
      } else {
        await httpsRequest.post(`/api/posts/${post._id}/like`);
      }

      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          isLiked: !previousLiked,
          likes: previousLiked ? previousLikes - 1 : previousLikes + 1,
        });
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      console.error("Failed to like post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!post || isSaving) return;

    const previousSaved = isSaved;
    setIsSaved(!isSaved);
    setIsSaving(true);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      if (previousSaved) {
        await httpsRequest.delete(`/api/posts/${post._id}/save`);
      } else {
        await httpsRequest.post(`/api/posts/${post._id}/save`);
      }

      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          isSaved: !previousSaved,
        });
      }
    } catch (error) {
      setIsSaved(previousSaved);
      console.error("Failed to save post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!post || !newComment.trim() || isSubmittingComment) return;

    const commentText = newComment.trim();
    setNewComment("");
    setIsSubmittingComment(true);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      const response = await httpsRequest.post<{
        success: boolean;
        data: { comment: Comment };
      }>(`/api/posts/${post._id}/comments`, {
        content: commentText,
      });

      if (response.data.success && response.data.data.comment) {
        setComments((prev) => [response.data.data.comment, ...prev]);
        if (onPostUpdate) {
          onPostUpdate({
            ...post,
            comments: (post.comments || 0) + 1,
          });
        }
      }
    } catch (error) {
      setNewComment(commentText);
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!post) return null;

  // Merge user data: ưu tiên post.user, nhưng nếu thiếu profilePicture thì dùng userProfile
  let user =
    post.user ||
    userProfile ||
    (typeof post.userId === "object" ? post.userId : null);

  // Nếu post.user có nhưng thiếu profilePicture, merge với userProfile
  if (post.user && !post.user.profilePicture && userProfile) {
    user = {
      ...post.user,
      profilePicture: userProfile.profilePicture,
    };
  }

  // Nếu vẫn chưa có user, dùng userProfile hoặc post.userId
  if (!user) {
    user =
      userProfile || (typeof post.userId === "object" ? post.userId : null);
  }

  const profilePictureUrl = user?.profilePicture
    ? getImageUrl(user.profilePicture)
    : null;
  const username = user?.username || "unknown";
  const fullName = user?.fullName || "";
  const userInitial = (username.charAt(0) || "U").toUpperCase();
  const mediaUrl = post.image || post.video || "";
  const postImageUrl = getImageUrl(mediaUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-5xl max-w-[90vw] max-h-[90vh] p-0 border-border rounded-lg overflow-hidden bg-card"
        style={{ backgroundColor: "hsl(var(--card))" }}
      >
        <div className="flex h-[90vh]">
          {/* Left side - Media */}
          <div className="flex-1 bg-black flex items-center justify-center w-full h-full">
            {post.mediaType === "video" ? (
              <video
                src={postImageUrl}
                className="w-full h-full object-cover"
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
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            )}
          </div>

          {/* Right side - Details */}
          <div className="w-[400px] flex flex-col bg-background border-l border-border">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
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
                        const fallback = target.parentElement?.querySelector(
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
                <div className="flex flex-col min-w-0 flex-1">
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
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Caption */}
              <div className="flex items-start gap-2">
                <span className="font-semibold text-sm">{username}</span>
                {post.caption && (
                  <span className="text-sm flex-1">{post.caption}</span>
                )}
              </div>

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="text-center text-muted-foreground py-4">
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const userIdValue =
                      typeof comment.userId === "string"
                        ? comment.userId
                        : comment.userId?._id;
                    const commentUserObject =
                      typeof comment.userId === "object"
                        ? comment.userId
                        : null;
                    const cachedUserProfile = userIdValue
                      ? commentUserProfiles.get(userIdValue)
                      : null;

                    // Merge user data: ưu tiên commentUserObject, nhưng nếu thiếu profilePicture thì dùng cachedUserProfile
                    let commentUser = commentUserObject || cachedUserProfile;
                    if (
                      commentUserObject &&
                      !commentUserObject.profilePicture &&
                      cachedUserProfile
                    ) {
                      commentUser = {
                        ...commentUserObject,
                        profilePicture: cachedUserProfile.profilePicture,
                      };
                    }

                    const commentUsername = commentUser?.username || "unknown";
                    const commentAvatar = commentUser?.profilePicture
                      ? getImageUrl(commentUser.profilePicture)
                      : null;
                    const commentInitial = (
                      commentUsername.charAt(0) || "U"
                    ).toUpperCase();

                    return (
                      <div key={comment._id} className="flex items-start gap-2">
                        <Link
                          to={`/profile/${commentUsername}`}
                          className="relative h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {commentAvatar && (
                            <img
                              src={commentAvatar}
                              alt={commentUsername}
                              className="h-8 w-8 rounded-full object-cover border border-border absolute inset-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          )}
                          {!commentAvatar && (
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {commentInitial}
                              </span>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/profile/${commentUsername}`}
                              className="font-semibold text-sm hover:opacity-70"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {commentUsername}
                            </Link>
                            <span className="text-sm flex-1">
                              {comment.content}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No comments yet
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className="hover:opacity-70 disabled:opacity-50"
                  >
                    {isLiked ? (
                      <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                    ) : (
                      <Heart className="h-6 w-6 text-foreground" />
                    )}
                  </button>
                  <button className="hover:opacity-70">
                    <MessageCircle className="h-6 w-6 text-foreground" />
                  </button>
                  <button className="hover:opacity-70">
                    <Send className="h-6 w-6 text-foreground" />
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="hover:opacity-70 disabled:opacity-50"
                >
                  {isSaved ? (
                    <Bookmark className="h-6 w-6 text-black fill-black dark:text-gray-400 dark:fill-gray-400" />
                  ) : (
                    <Bookmark className="h-6 w-6 text-foreground" />
                  )}
                </button>
              </div>

              {likes > 0 && (
                <div className="text-sm font-semibold">
                  {likes.toLocaleString()} {likes === 1 ? "like" : "likes"}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[40px] max-h-[100px] resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  size="sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
