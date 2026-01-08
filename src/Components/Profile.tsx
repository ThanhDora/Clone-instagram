import Avatar from "./Avatar";
import { mockUsers, getUserById } from "@/assets/db";
import Switch from "./Switch";
import { Link } from "react-router-dom";

export default function Profile() {
  // Get current user from localStorage or use first mock user as default
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

  // Get suggestions (exclude current user)
  const suggestions = mockUsers
    .filter((user) => user.id !== currentUser.id)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar image={currentUser.avatar || ""} />
          <div className="flex-1 min-w-0">
            <Link to="/profile" className="font-semibold truncate">
              {currentUser.username}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {currentUser.fullName}
            </p>
          </div>
          <Switch />
        </div>
      </div>
      <div className="rounded-lg bg-card p-4">
        <div className="flex items-center justify-between">
          <h4 className="mb-3 text-sm font-semibold">Suggestions for you</h4>
          <button className="text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer hover:opacity-80 transition-opacity">
            See All
          </button>
        </div>
        <div className="space-y-3 mt-4">
          {suggestions.map((user) => {
            const mutualFriends =
              user.mutualFriends
                ?.map((friendId) => getUserById(friendId))
                .filter(
                  (friend): friend is NonNullable<typeof friend> =>
                    friend !== undefined
                )
                .slice(0, 3) || [];

            return (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar image={user.avatar || ""} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {mutualFriends.length > 0 && (
                      <div className="flex -space-x-2">
                        {mutualFriends.map((friend) => (
                          <div
                            key={friend.id}
                            className="h-4 w-4 rounded-full border-2 border-background overflow-hidden"
                          >
                            <img
                              src={friend.avatar || ""}
                              alt={friend.username}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {mutualFriends.length > 0
                        ? `${mutualFriends.length} mutual friend${
                            mutualFriends.length > 1 ? "s" : ""
                          }`
                        : "Suggested for you"}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-primary hover:text-primary/80">
                  <span className="cursor-pointer text-(--primary) hover:text-(--primary)/80 transition-opacity">
                    Follow
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
