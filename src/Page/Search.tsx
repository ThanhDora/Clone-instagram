import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/Components/ui/sheet";
import { Input } from "@/Components/ui/input";
import { useSearchSheet } from "@/Context/SearchSheetContext";
import { mockUsers } from "@/assets/db";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";

export default function SearchSheet() {
  const { isOpen, closeSheet } = useSearchSheet();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return [];
    }
    const query = trimmedQuery.toLowerCase();
    return mockUsers.filter((user) => {
      const username = user.username.toLowerCase().trim();
      const fullName = user.fullName.toLowerCase().trim();
      return username.startsWith(query) || fullName.startsWith(query);
    });
  }, [searchQuery]);

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md bg-card backdrop-blur-0 p-0 flex flex-col"
        style={{
          backgroundColor: "hsl(var(--card))",
          left: "5rem",
          top: 0,
          bottom: 0,
          height: "100vh",
        }}
        showCloseButton={false}
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="text-left text-xl font-semibold">
            Search
          </SheetTitle>
          <SheetDescription className="sr-only">
            Search for users by username or name
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {!searchQuery.trim() ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">Start typing to search</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  )}
                >
                  <div className="shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover aspect-square"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user.fullName}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
