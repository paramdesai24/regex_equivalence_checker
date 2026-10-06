import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer select-none tracking-normal leading-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-2xs hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-2xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        subtle: 'bg-muted/70 text-foreground border border-border/60 hover:bg-muted',
      },
      size: {
        default: 'h-8 px-3.5 py-1.5',
        sm: 'h-7 rounded-md px-2.5 text-xs',
        lg: 'h-9.5 rounded-md px-5 text-sm',
        icon: 'h-7.5 w-7.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
