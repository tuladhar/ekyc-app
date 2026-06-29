import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Standard shadcn/ui class-name combiner.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
