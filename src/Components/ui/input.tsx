import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  placeholder,
  value,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"input">) {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputValue = value ?? props.defaultValue ?? "";
  const hasValue =
    inputValue !== "" && inputValue !== undefined && inputValue !== null;
  const showLabel = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="relative">
      <input
        type={type}
        data-slot="input"
        placeholder=""
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground bg-input/30 border-input/50 h-12 w-full min-w-0 rounded-md border px-3 text-base text-foreground transition-all duration-300 ease-in-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          showLabel ? "pt-5 pb-1" : "py-3",
          className
        )}
        {...props}
      />
      {placeholder && (
        <label
          className={cn(
            "absolute left-3 text-muted-foreground pointer-events-none transition-all duration-300 ease-in-out whitespace-nowrap",
            showLabel
              ? "top-1.5 text-xs opacity-100"
              : "top-1/2 -translate-y-1/2 text-base opacity-70"
          )}
        >
          {placeholder}
        </label>
      )}
    </div>
  );
}

export { Input };
