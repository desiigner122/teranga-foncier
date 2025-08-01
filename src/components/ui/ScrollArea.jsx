// src/components/ui/ScrollArea.jsx
import React from 'react';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <div className="h-full w-full rounded-[inherit]">
      <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  </div>
));
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
