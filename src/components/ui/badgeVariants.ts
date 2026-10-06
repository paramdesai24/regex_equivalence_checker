import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-ring tracking-normal leading-normal',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-2xs',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300',
        outline: 'text-foreground border-border',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300',
        warning:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300',
        subtle:
          'border-border/70 bg-muted/60 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
