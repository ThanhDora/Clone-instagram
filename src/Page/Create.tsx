import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { Plus, ImageIcon, Sparkles } from "lucide-react";
import { useCreateDialog } from "@/Context/CreateDialogContext";

export default function CreateDialog() {
  const { isOpen, closeDialog } = useCreateDialog();
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const handlePostClick = () => {
    closeDialog();
    setIsPostDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-xs p-0 bg-(--secondary-background) border-border rounded-lg">
          <DialogTitle className="sr-only">Create</DialogTitle>
          <DialogDescription className="sr-only">
            Choose what to create
          </DialogDescription>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-t-lg border-none h-auto py-4 px-6 hover:bg-accent/50 text-white"
              >
                <Plus className="h-5 w-5 mr-3" />
                <span className="text-base font-normal">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-(--secondary-background) border-border"
              align="start"
            >
              <DropdownMenuItem
                onClick={handlePostClick}
                className="flex items-center  cursor-pointer text-white"
              >
                <div className="flex items-center  gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Post</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center  cursor-pointer text-white">
                <div className="flex items-center  gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>AI</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] border-border rounded-lg">
          <DialogTitle className="text-center py-4 border-b border-border text-lg font-semibold">
            Create new post
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create and share a new post
          </DialogDescription>
          <div className="py-8">
            <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
              <p className="text-muted-foreground">Post content here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
