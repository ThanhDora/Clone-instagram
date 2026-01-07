import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.ComponentProps<"input"> {
  showToggle?: boolean;
}

function PasswordInput({
  className,
  showToggle = true,
  value,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn(showToggle && hasValue && "pr-20", className)}
        value={value}
        {...props}
      />
      {showToggle && hasValue && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 text-xs font-semibold text-foreground border border-border rounded-md bg-input/30 hover:bg-input/50 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}

export { PasswordInput };
