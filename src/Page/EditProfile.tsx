import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/Components/ui/dropdown-menu";
import Avatar from "@/Components/Avatar";
import httpsRequest from "@/utils/httpsRequest";
import type {
  TGetProfileResponse,
  TUpdateProfileResponse,
  TAuthError,
  TUser,
} from "@/Type/Users";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profileData, setProfileData] = useState<TUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showThreadsBadge, setShowThreadsBadge] = useState(false);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);

  const maxBioLength = 150;

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await httpsRequest.get<TGetProfileResponse>(
        "/api/users/profile"
      );
      const userData = response.data.data;

      setProfileData(userData);
      setFullName(userData.fullName || "");
      setBio(userData.bio || "");
      setWebsite(userData.website || "");
      setGender(userData.gender || "");
      setPreviewImage(userData.profilePicture || null);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: TAuthError };
      };

      // If 401 Unauthorized, redirect to login
      if (axiosError.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const errorData: TAuthError = axiosError.response?.data || {
        message: "Failed to load profile. Please try again.",
      };
      setError(errorData.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (website && website.trim() !== "") {
        try {
          new URL(website.startsWith("http") ? website : `https://${website}`);
        } catch {
          setError("Please enter a valid website URL");
          setIsSubmitting(false);
          return;
        }
      }

      const formData = new FormData();

      if (fullName.trim()) formData.append("fullName", fullName.trim());
      if (bio.trim()) formData.append("bio", bio.trim());
      if (website.trim()) {
        const websiteUrl = website.trim().startsWith("http")
          ? website.trim()
          : `https://${website.trim()}`;
        formData.append("website", websiteUrl);
      }
      if (gender) formData.append("gender", gender);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await httpsRequest.patch<TUpdateProfileResponse>(
        "/api/users/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update localStorage user data
      if (profileData) {
        const updatedUser = {
          ...profileData,
          fullName: response.data.data.fullName ?? profileData.fullName,
          bio: response.data.data.bio ?? profileData.bio,
          website: response.data.data.website ?? profileData.website,
          profilePicture:
            response.data.data.profilePicture ?? profileData.profilePicture,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: TAuthError };
      };

      // If 401 Unauthorized, redirect to login
      if (axiosError.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const errorData: TAuthError = axiosError.response?.data || {
        message: "Failed to update profile. Please try again.",
      };
      setError(errorData.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
        <Button
          className="mt-4"
          onClick={() => navigate("/profile")}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Edit profile</h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-blue-500 hover:text-blue-600"
          variant="ghost"
        >
          {isSubmitting ? "Saving..." : "Done"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Picture Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="shrink-0">
            <Avatar
              image={previewImage || profileData?.profilePicture || ""}
              className="h-24 w-24"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {profileData?.username}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {fullName || profileData?.fullName}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={handleChangePhoto}
              className="mt-2 text-blue-500 hover:text-blue-600 p-0 h-auto font-semibold"
            >
              Change photo
            </Button>
          </div>
        </div>

        {/* Full Name Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Name</label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setError(null);
            }}
            placeholder="Name"
            className="bg-input/30"
            maxLength={30}
          />
        </div>

        {/* Website Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Website</label>
          <Input
            type="url"
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              setError(null);
            }}
            placeholder="Website"
            className="bg-input/30"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Editing your links is only available on mobile. Visit the Instagram
            app and edit your profile to change the websites in your bio.
          </p>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setError(null);
            }}
            placeholder="Bio"
            maxLength={maxBioLength}
            className="bg-input/30 min-h-24 resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-muted-foreground">
              {bio.length}/{maxBioLength}
            </span>
          </div>
        </div>

        {/* Show Threads badge */}
        <div className="flex items-center justify-between mb-6 py-3 border-b border-border">
          <div>
            <label className="text-sm font-medium">Show Threads badge</label>
          </div>
          <Checkbox
            checked={showThreadsBadge}
            onCheckedChange={(checked) => setShowThreadsBadge(checked === true)}
          />
        </div>

        {/* Gender Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Gender</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-input/30 cursor-pointer"
              >
                {gender
                  ? gender.charAt(0).toUpperCase() + gender.slice(1)
                  : "Prefer not to say"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup
                className="text-foreground bg-gray-400 text-white rounded-2xl cursor-pointer"
                value={gender}
                onValueChange={(value) =>
                  setGender(value as "male" | "female" | "other" | "")
                }
              >
                <DropdownMenuRadioItem value="">
                  Prefer not to say
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="male">Male</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="female">
                  Female
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="other">
                  Other
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-xs text-muted-foreground mt-1">
            This won't be part of your public profile.
          </p>
        </div>

        {/* Show account suggestions */}
        <div className="mb-6 py-3 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1">
                Show account suggestions on profiles
              </label>
              <p className="text-xs text-muted-foreground">
                Choose whether people can see similar account suggestions on
                your profile, and whether your account can be suggested on other
                profiles.
              </p>
            </div>
            <Checkbox
              checked={showAccountSuggestions}
              onCheckedChange={(checked) =>
                setShowAccountSuggestions(checked === true)
              }
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 mb-4">
            Profile updated successfully!
          </div>
        )}

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Certain profile info, like your name, bio and links, is visible to
          everyone.{" "}
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={() => {
              // Handle "See what profile info is visible" action
            }}
          >
            See what profile info is visible
          </button>
        </p>
      </form>
    </div>
  );
}
