import React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props} />)
  );
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";
}

export { Skeleton }
