import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const baseURL = import.meta.env.VITE_BASE_URL || "https://instagram.f8team.dev";

export function getImageUrl(url: string | undefined | null): string {
  if (!url || url.trim() === "") {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${baseURL}${url}`;
  }

  return `${baseURL}/${url}`;
}
