import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Create unique ID
export function createId() {
  return nanoid();
}

// Helper function to build API URL
export function buildApiUrl(path: string): string {
  // Check if in client environment
  const isClient = typeof window !== "undefined";

  if (isClient) {
    // On client, use relative path
    return path;
  } else {
    // On server, need full URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${path}`;
  }
}
