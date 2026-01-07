import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label?: string;
}

function FloatingInput({ className, type, label, placeholder, ...props }: FloatingInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const hasValue = props.value !== undefined && props.value !== "";

  return (
    <div className="relative">
      <input
        type={type}
        data-slot="input"
        placeholder={isFocused || hasValue ? "" : placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground bg-input/30 border-input/50 h-12 w-full min-w-0 rounded-md border px-3 pt-4 pb-1 text-base text-foreground transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
      {(isFocused || hasValue) && placeholder && (
        <label
          className={cn(
            "absolute left-3 text-xs text-muted-foreground transition-all pointer-events-none",
            isFocused || hasValue ? "top-1.5" : "top-3"
          )}
        >
          {placeholder}
        </label>
      )}
    </div>
  );
}

export { FloatingInput };

