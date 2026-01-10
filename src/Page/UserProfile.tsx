import { useState, useRef, useEffect } from "react";
import Avatar from "@/Components/Avatar";
import { mockUsers, getUserById } from "@/assets/db";
import {
  Settings,
  Grid3x3,
  Bookmark,
  User,
  Camera,
  CircleUser,
  Link2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import Footer from "@/Components/Footer";
import AllLinks from "@/Components/dialog-standard-3";
import { FaThreads } from "react-icons/fa6";
// import Story from "@/Components/Story";

export default function UserProfile() {
  const [showFullBio, setShowFullBio] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const currentUserStr = localStorage.getItem("user");
  let currentUser;

  if (currentUserStr) {
    try {
      const parsedUser = JSON.parse(currentUserStr);
      currentUser = getUserById(parsedUser.id) || mockUsers[0];
    } catch {
      currentUser = mockUsers[0];
    }
  } else {
    currentUser = mockUsers[0];
  }

  const bio = currentUser.bio || "";

  useEffect(() => {
    if (bioRef.current) {
      const element = bioRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * 3;
      setIsOverflowing(element.scrollHeight > maxHeight);
    }
  }, [bio]);
  return (
    <>
      <div className="w-[80%] mx-auto flex flex-col gap-4 justify-center items-center mb-30">
        <div className="flex items-center gap-4 mt-5">
          <Avatar
            image={currentUser.avatar || ""}
            className="h-[50px] w-[50px]"
          />
          {/* User Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{currentUser.username}</h1>
              <Settings className="w-5 h-5 cursor-pointer" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentUser.fullName}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {/* Posts */}
              <div className="flex items-center gap-1">
                <span className="font-medium">{currentUser.posts}</span>
                <span className="text-sm text-muted-foreground">Posts</span>
              </div>
              {/* Followers */}
              <Link to="/followers" className="flex items-center gap-1">
                <span className="font-medium">{currentUser.followers}</span>
                <span className="text-sm text-muted-foreground">Followers</span>
              </Link>
              {/* Following */}
              <Link to="/following" className="flex items-center gap-1">
                <span className="font-medium">{currentUser.following}</span>
                <span className="text-sm text-muted-foreground">Following</span>
              </Link>
            </div>

            {/* Bio */}
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
            {/* Link to all links */}
            <div className="flex-col items-center gap-1">
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
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <FaThreads className="h-5 w-5 text-primary" />
                <span className="font-bold">lee.thanh_dev_</span>
              </Link>
            </div>
          </div>
        </div>
        {/* edit profile button */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            className="w-60 h-13 border-none shadow-none bg-(--primary-background)/90 hover:bg-(--primary-background-hover) rounded-2xl cursor-pointer"
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
        {/* highlight story*/}

        <div className="w-full flex justify-center items-center text-sm text-muted-foreground mt-4">
          {/* <Story /> */}
          <p>Highlight story</p>
        </div>
        {/* Tabs */}
        <div className="w-full mt-8">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-center bg-transparent h-auto p-0 gap-0 border-none relative">
              <TabsTrigger value="posts" className="flex-1 relative">
                <Grid3x3 className="h-10 w-10" />
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex-1 relative">
                <Bookmark className="h-10 w-10" />
              </TabsTrigger>
              <TabsTrigger value="tagged" className="flex-1 relative">
                <User className="h-10 w-10" />
              </TabsTrigger>
            </TabsList>
            <div className="border-b border-border/50 mt-[-15px]"></div>
            <TabsContent value="posts" className="mt-0">
              <div className="py-10 flex items-center flex-col gap-4">
                <Camera className="h-20 w-20" />
                <div className="flex flex-col items-center justify-center gap-4">
                  <h3 className="text-4xl font-bold">Share photos</h3>
                  <p className="text-sm text-muted-foreground">
                    When you share photos, they will appear on your profile.
                  </p>
                  <span className="text-(--primary) hover:underline cursor-pointer">
                    Share your first photo
                  </span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="saved" className="mt-0">
              <div className="py-10 flex items-center flex-col gap-4">
                <Bookmark className="h-20 w-20" />
                <div className="flex flex-col items-center justify-center gap-4">
                  <h3 className="text-4xl font-bold">Saved</h3>
                  <p className="text-sm text-muted-foreground">
                    Save photos and videos that you want to see again. <br />
                    No one is notified, and only you can see what you've saved.
                  </p>
                </div>
              </div>
            </TabsContent>
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
