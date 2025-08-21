// src/components/ui/ScrollArea.jsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

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
