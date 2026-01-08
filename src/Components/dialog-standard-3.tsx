import { Button } from "@/Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Facebook, Link2 } from "lucide-react";
// import { Link } from "react-router-dom";

export const title = "All Links";

const Example = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="outline"
        className="border-none font-bold text-sm hover:bg-transparent cursor-pointer hover:text-(--primary)"
      >
        All Links
      </Button>
    </DialogTrigger>
    <DialogContent className=" h-auto p-0 sm:max-w-lg bg-(--secondary-background)">
      <DialogHeader className="sticky top-0 z-10 border-b border-amber-50 bg-(--secondary-background) px-6 pt-6 pb-4 flex items-center">
        <DialogTitle className="text-2xl font-bold">All Links</DialogTitle>
        <DialogDescription>All links from the user.</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-auto">
        <div className="mt-[-10px]">
          <Button
            variant="outline"
            className="flex h-20 items-center justify-start gap-2 hover:bg-primary-background/50 p-2 cursor-pointer hover:underline border-none border-amber-50 w-full"
          >
            <Link2 className="h-10 w-10 -rotate-45 text-primary" />
            <div className="flex flex-col items-start justify-center">
              <h2 className="text-sm font-bold hover:underline">Profile</h2>
              <p className="text-sm text-muted-foreground hover:underline">
                thanhdora.com
              </p>
            </div>
          </Button>
          <hr className="border-amber-50" />
          <Button
            variant="outline"
            className="flex h-20 items-center justify-start gap-2 hover:bg-primary-background/50 p-2 cursor-pointer hover:underline border-none border-amber-50 w-full"
          >
            <Facebook className="h-10 w-10 text-primary" />
            <div className="flex flex-col items-start justify-center">
              <h2 className="text-sm font-bold hover:underline">Facebook</h2>
              <p className="text-sm text-muted-foreground hover:underline">
                thanhdora.com/facebook
              </p>
            </div>
          </Button>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

export default Example;
