// BackTrack Chrome Extension Utility Functions
// Shared helpers for network logging, formatting, and more.
// See scope.md for architecture and requirements.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
