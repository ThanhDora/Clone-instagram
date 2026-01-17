import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Input } from "@/Components/ui/input";
import {
  ImageIcon,
  MapPin,
  Users,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { useCreateDialog } from "@/Context/CreateDialogContext";
import httpsRequest from "@/utils/httpsRequest";
import { getImageUrl } from "@/lib/utils";

export default function CreateDialog() {
  const { isOpen, closeDialog } = useCreateDialog();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !selectedFile) {
      fileInputRef.current?.click();
    }
  }, [isOpen, selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Please select an image or video file");
        return;
      }
      setSelectedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select an image or video");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }
      if (location.trim()) {
        formData.append("location", location.trim());
      }

      await httpsRequest.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleClose();
      window.location.reload();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    closeDialog();
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setLocation("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userAvatar = getImageUrl(user?.profilePicture || user?.avatar || "");
  const userInitial = user?.username?.[0]?.toUpperCase() || "U";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] p-0 border-border rounded-lg overflow-hidden bg-card backdrop-blur-0"
        style={{ backgroundColor: "hsl(var(--card))" }}
      >
        <DialogTitle
          className="text-center py-4 border-b border-border text-lg font-semibold relative text-foreground bg-card"
          style={{ backgroundColor: "hsl(var(--card))" }}
        >
          Create new post
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create and share a new post
        </DialogDescription>
        <div className="flex h-[calc(90vh-80px)]">
          <div className="flex-1  flex items-center justify-center relative">
            {preview ? (
              <>
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
                  Click photo to tag people
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="default"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Select from computer
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
          <div
            className="w-80 border-l border-border bg-card flex flex-col"
            style={{ backgroundColor: "hsl(var(--card))" }}
          >
            <div
              className="p-4 border-b border-border bg-card"
              style={{ backgroundColor: "hsl(var(--card))" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={user?.username || "user"}
                      className="h-full w-full object-cover"
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
                    className={`h-full w-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs ${
                      userAvatar ? "hidden" : ""
                    }`}
                  >
                    {userInitial}
                  </div>
                </div>
                <span className="font-medium text-foreground">
                  {user?.username || "username"}
                </span>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-card"
              style={{ backgroundColor: "hsl(var(--card))" }}
            >
              <div>
                <Textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="min-h-24 resize-none border-none focus-visible:ring-0 p-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                  maxLength={2200}
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {caption.length}/2,200
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-foreground hover:bg-accent"
                  onClick={() => {
                    const loc = prompt("Add location:");
                    if (loc) setLocation(loc);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{location || "Add location"}</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-foreground hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Add collaborators</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-foreground hover:bg-accent"
                >
                  <span>Accessibility</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-foreground hover:bg-accent"
                >
                  <span>Advanced settings</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}
            </div>
            <div
              className="p-4 border-t border-border bg-card"
              style={{ backgroundColor: "hsl(var(--card))" }}
            >
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
