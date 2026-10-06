import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface AccordionSectionProps {
  title: string;
  badge?: string | number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  overflow?: boolean;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  badge,
  expanded,
  onToggle,
  children,
  overflow = false,
}) => {
  return (
    <Collapsible
      open={expanded}
      onOpenChange={onToggle}
      className="border-t border-border bg-background"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors select-none cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-[13px] font-medium text-foreground">{title}</span>
          </div>
          {badge !== undefined && (
            <Badge variant="subtle" className="text-xs font-mono h-5 px-1.5 font-normal">
              {badge}
            </Badge>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div
          className={cn(
            'border-t border-border bg-muted/15 max-h-60 overflow-y-auto',
            overflow && 'overflow-x-auto'
          )}
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
