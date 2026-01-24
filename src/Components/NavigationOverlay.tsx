import { useEffect, useState } from "react";
import { useNavigation } from "@/Context/NavigationContext";
import { cn } from "@/lib/utils";

export default function NavigationOverlay() {
  const { isNavigating } = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isNavigating) {
      setTimeout(() => {
        setProgress(0);
      }, 0);
      return;
    }

    setTimeout(() => {
      setProgress(0);
    }, 0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 90);
      });
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [isNavigating]);

  if (!isNavigating) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-9998 h-1 bg-transparent pointer-events-none transition-opacity duration-300",
        isNavigating ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
        }}
      />
    </div>
  );
}