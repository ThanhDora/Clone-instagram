import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Settings,
  Grid3x3,
  Bookmark,
  User,
  Camera,
  CircleUser,
  Link2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import Footer from "@/Components/Footer";
import AllLinks from "@/Components/dialog-standard-3";
import { FaThreads } from "react-icons/fa6";
import httpsRequest from "@/utils/httpsRequest";
import type {
  TGetProfileResponse,
  TGetUserByIdResponse,
  TAuthError,
} from "@/Type/Users";
import type { TGetUserPostsResponse, Post } from "@/Type/Post";

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [showFullBio, setShowFullBio] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<
    (TGetProfileResponse["data"] | TGetUserByIdResponse["data"]) | null
  >(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const isViewingOwnProfile = !userId;

  const fetchUserProfile = useCallback(
    async (skipLoading = false) => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (isViewingOwnProfile && !token) {
        navigate("/login", { replace: true });
        return;
      }

      if (!skipLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        let response;
        if (isViewingOwnProfile) {
          const profileResponse = await httpsRequest.get<TGetProfileResponse>(
            "/api/users/profile"
          );
          const profileData = profileResponse.data.data;

          if (
            profileData.followersCount === undefined ||
            profileData.followingCount === undefined ||
            profileData.postsCount === undefined
          ) {
            try {
              const statsResponse =
                await httpsRequest.get<TGetUserByIdResponse>(
                  `/api/users/${profileData._id}`
                );
              const statsData = statsResponse.data.data;

              setUserData({
                ...profileData,
                followersCount: statsData.followersCount,
                followingCount: statsData.followingCount,
                postsCount: statsData.postsCount,
              });
            } catch (statsErr) {
              console.error("Failed to fetch stats:", statsErr);
              setUserData(profileData);
            }
          } else {
            setUserData(profileData);
          }
        } else {
          response = await httpsRequest.get<TGetUserByIdResponse>(
            `/api/users/${userId}`
          );
          const data = response.data.data;
          setUserData(data);
          setIsFollowing(data.isFollowing ?? false);
        }
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { status?: number; data?: TAuthError };
        };

        if (axiosError.response?.status === 401) {
          if (isViewingOwnProfile) {
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
          }
        }

        const errorData: TAuthError = axiosError.response?.data || {
          message: "Failed to load profile. Please try again.",
        };
        setError(errorData.message || "Failed to load profile");
      } finally {
        if (!skipLoading) {
          setIsLoading(false);
        }
      }
    },
    [userId, isViewingOwnProfile, navigate]
  );

  const fetchUserPosts = useCallback(
    async (filter: "all" | "video" | "saved" = "all") => {
      if (!userData) return;

      const targetUserId = userId || userData._id;
      setIsLoadingPosts(true);

      try {
        const response = await httpsRequest.get<TGetUserPostsResponse>(
          `/api/posts/user/${targetUserId}`,
          {
            params: {
              filter,
              limit: 20,
              offset: 0,
            },
          }
        );
        setPosts(response.data.data.posts);
      } catch (err: unknown) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [userData, userId]
  );

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userData && !isViewingOwnProfile && "isFollowing" in userData) {
      const userDataWithFollowing = userData as TGetUserByIdResponse["data"];
      if (userDataWithFollowing.isFollowing !== isFollowing) {
        setIsFollowing(userDataWithFollowing.isFollowing);
      }
    }
  }, [userData, isViewingOwnProfile, isFollowing]);

  useEffect(() => {
    if (userData) {
      const filter = activeTab === "saved" ? "saved" : "all";
      fetchUserPosts(filter);
    }
  }, [userData, activeTab, fetchUserPosts]);

  useEffect(() => {
    if (bioRef.current && userData?.bio) {
      const element = bioRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * 3;
      setIsOverflowing(element.scrollHeight > maxHeight);
    }
  }, [userData?.bio]);

  const handleFollow = async () => {
    if (!userId || !userData) return;

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
      setError("You cannot follow yourself");
      return;
    }

    setIsFollowingLoading(true);
    setError(null);
    try {
      await httpsRequest.post(`/api/follow/${userId}/follow`, {});
      await fetchUserProfile(true);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: TAuthError | Record<string, unknown> | string;
        };
        message?: string;
      };

      if (axiosError.response) {
        const errorData = axiosError.response.data;
        let errorMessage = "";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (typeof errorData === "object") {
            if (
              "message" in errorData &&
              typeof errorData.message === "string"
            ) {
              errorMessage = errorData.message;
            } else if (
              "error" in errorData &&
              typeof errorData.error === "string"
            ) {
              errorMessage = errorData.error;
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          }
        }

        if (
          errorMessage.toLowerCase().includes("already following") ||
          errorMessage.toLowerCase().includes("already follow")
        ) {
          await fetchUserProfile(true);
        } else {
          setError(errorMessage || "Failed to follow user");
        }
      } else {
        setError(axiosError.message || "Failed to follow user");
      }
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!userId || !userData) return;

    setIsFollowingLoading(true);
    setError(null);
    try {
      await httpsRequest.delete(`/api/follow/${userId}/follow`);
      await fetchUserProfile(true);
    } catch (err: unknown) {
      console.error("Unfollow error:", err);
      const axiosError = err as {
        response?: {
          status?: number;
          data?: TAuthError | Record<string, unknown> | string;
        };
        message?: string;
      };

      if (axiosError.response) {
        const errorData = axiosError.response.data;
        let errorMessage = "";

        if (errorData) {
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (typeof errorData === "object" && "message" in errorData) {
            errorMessage = (errorData as { message: string }).message;
          }
        }

        if (
          errorMessage.toLowerCase().includes("not following") ||
          errorMessage.toLowerCase().includes("not follow")
        ) {
          await fetchUserProfile(true);
        } else {
          setError(errorMessage || "Failed to unfollow user");
        }
      } else {
        setError(axiosError.message || "Failed to unfollow user");
      }
    } finally {
      setIsFollowingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
        <Button
          className="mt-4"
          onClick={() => navigate("/")}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">No user data available</div>
      </div>
    );
  }

  const getNumericValue = (value: unknown): number => {
    if (typeof value === "number" && !isNaN(value) && value >= 0) {
      return value;
    }
    if (typeof value === "string" && !isNaN(Number(value))) {
      return Number(value);
    }
    return 0;
  };

  const apiPostsCount = getNumericValue(
    "postsCount" in userData ? userData.postsCount : undefined
  );
  const postsCount = apiPostsCount > 0 ? apiPostsCount : posts.length;

  const followersCount = getNumericValue(
    "followersCount" in userData ? userData.followersCount : undefined
  );
  const followingCount = getNumericValue(
    "followingCount" in userData ? userData.followingCount : undefined
  );

  const baseURL =
    import.meta.env.VITE_BASE_URL || "https://instagram.f8team.dev";
  const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${baseURL}${url}`;
    return `${baseURL}/${url}`;
  };

  const profilePicture = getImageUrl(
    userData.profilePicture ||
      ("avatar" in userData ? userData.avatar : undefined)
  );
  const username = userData.username || "";
  const fullName = userData.fullName || "";
  const bio = userData.bio || "";

  return (
    <>
      <div className="w-[80%] mx-auto flex flex-col gap-4 justify-center items-center mb-30">
        <div className="flex items-center gap-4 mt-5">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={username}
              className="h-[200px] w-[200px] rounded-full object-cover border border-border"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`h-[200px] w-[200px] rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center ${
              profilePicture ? "hidden" : ""
            }`}
          >
            <span className="text-white text-6xl font-bold">
              {username.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{username}</h1>
              {isViewingOwnProfile && (
                <Settings className="w-5 h-5 cursor-pointer" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{fullName}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                <span className="font-medium">{postsCount}</span>
                <span className="text-sm text-muted-foreground">Posts</span>
              </div>
              <Link
                to={`/followers${userId ? `/${userId}` : ""}`}
                className="flex items-center gap-1"
              >
                <span className="font-medium">{followersCount}</span>
                <span className="text-sm text-muted-foreground">Followers</span>
              </Link>
              <Link
                to={`/following${userId ? `/${userId}` : ""}`}
                className="flex items-center gap-1"
              >
                <span className="font-medium">{followingCount}</span>
                <span className="text-sm text-muted-foreground">Following</span>
              </Link>
            </div>

            {bio && (
              <div className="max-w-md">
                <p
                  ref={bioRef}
                  className={`text-sm text-muted-foreground wrap-break-word whitespace-normal ${
                    !showFullBio ? "line-clamp-3" : ""
                  }`}
                >
                  "{bio}"
                </p>
                {!showFullBio && isOverflowing && (
                  <button
                    onClick={() => setShowFullBio(true)}
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    ...more
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col items-start gap-1 mt-3">
              {userData.website && (
                <div className="flex items-center gap-1">
                  <Link
                    to={userData.website}
                    target="_blank"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Link2 className="h-5 w-5 -rotate-45 text-primary" />
                    <span className="font-bold">{userData.website}</span>
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Link
                  to="/links"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Link2 className="h-5 w-5 -rotate-45 text-primary" />
                  <span className="font-bold">Thanhdora.com</span>
                </Link>
                <AllLinks />
              </div>
              <Link
                to="https://www.threads.com/@lee.thanh_dev_?xmt=AQF0Aqry2tJEhko-XOUWxBiAbR4POSsB8Hor6zm46F379tA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FaThreads className="h-5 w-5 text-primary" />
                <span className="font-bold">lee.thanh_dev_</span>
              </Link>
            </div>
          </div>
        </div>

        {isViewingOwnProfile ? (
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              className="w-60 h-13 border-none shadow-none bg-(--primary-background)/90 hover:bg-(--primary-background-hover) rounded-2xl cursor-pointer"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="w-60 h-13 border-none shadow-none bg-(--primary-background)/90 hover:bg-(--primary-background-hover) rounded-2xl cursor-pointer"
            >
              View archive
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              className="w-60 h-13 border-none shadow-none bg-(--primary-background)/90 hover:bg-(--primary-background-hover) rounded-2xl cursor-pointer"
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={isFollowingLoading}
            >
              {isFollowingLoading
                ? "Loading..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </Button>
            <Button
              variant="outline"
              className="w-60 h-13 border-none shadow-none bg-(--primary-background)/90 hover:bg-(--primary-background-hover) rounded-2xl cursor-pointer"
            >
              Message
            </Button>
          </div>
        )}

        <div className="w-full flex justify-center items-center text-sm text-muted-foreground mt-4">
          <p>Highlight story</p>
        </div>

        <div className="w-full mt-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-center bg-transparent h-auto p-0 gap-0 border-none relative">
              <TabsTrigger value="posts" className="flex-1 relative">
                <Grid3x3 className="h-10 w-10" />
              </TabsTrigger>
              {isViewingOwnProfile && (
                <TabsTrigger value="saved" className="flex-1 relative">
                  <Bookmark className="h-10 w-10" />
                </TabsTrigger>
              )}
              <TabsTrigger value="tagged" className="flex-1 relative">
                <User className="h-10 w-10" />
              </TabsTrigger>
            </TabsList>
            <div className="border-b border-border/50 mt-[-15px]"></div>
            <TabsContent value="posts" className="mt-0">
              {isLoadingPosts ? (
                <div className="py-10 flex items-center justify-center">
                  <div className="text-muted-foreground">Loading posts...</div>
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 mt-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="aspect-square relative cursor-pointer group"
                    >
                      <img
                        src={post.image || post.video || ""}
                        alt={post.caption || ""}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-4 text-white">
                          <span className="font-semibold">❤️ {post.likes}</span>
                          <span className="font-semibold">
                            💬 {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex items-center flex-col gap-4">
                  <Camera className="h-20 w-20" />
                  <div className="flex flex-col items-center justify-center gap-4">
                    <h3 className="text-4xl font-bold">Share photos</h3>
                    <p className="text-sm text-muted-foreground">
                      When you share photos, they will appear on your profile.
                    </p>
                    {isViewingOwnProfile && (
                      <span className="text-(--primary) hover:underline cursor-pointer">
                        Share your first photo
                      </span>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            {isViewingOwnProfile && (
              <TabsContent value="saved" className="mt-0">
                {isLoadingPosts ? (
                  <div className="py-10 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      Loading saved posts...
                    </div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 mt-4">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="aspect-square relative cursor-pointer group"
                      >
                        <img
                          src={post.image || post.video || ""}
                          alt={post.caption || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 flex items-center flex-col gap-4">
                    <Bookmark className="h-20 w-20" />
                    <div className="flex flex-col items-center justify-center gap-4">
                      <h3 className="text-4xl font-bold">Saved</h3>
                      <p className="text-sm text-muted-foreground">
                        Save photos and videos that you want to see again.{" "}
                        <br />
                        No one is notified, and only you can see what you've
                        saved.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
            <TabsContent value="tagged" className="mt-0">
              <div className="py-10 flex items-center flex-col gap-4">
                <CircleUser className="h-20 w-20" />
                <div className="flex flex-col items-center justify-center gap-4">
                  <h3 className="text-4xl font-bold">Photos of you</h3>
                  <p className="text-sm text-muted-foreground">
                    When people tag you in photos, they'll appear here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
