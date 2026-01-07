import { User } from "lucide-react";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-purple-500">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{user.username || "username"}</h3>
            <p className="text-sm text-muted-foreground">
              {user.fullName || "Full Name"}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-3 text-sm font-semibold">Suggestions for you</h4>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-pink-400 to-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">user_{item}</p>
                <p className="text-xs text-muted-foreground">
                  Suggested for you
                </p>
              </div>
              <button className="text-xs font-semibold text-primary hover:text-primary/80">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
