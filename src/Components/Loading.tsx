import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Loading() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsLoading(true);
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

    const completeTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 200);
      }, 300);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      clearTimeout(completeTimeout);
    };
  }, [location.pathname]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-9999 h-1 bg-transparent pointer-events-none transition-opacity duration-300 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
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
