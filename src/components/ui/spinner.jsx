import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  );
};

export default LoadingSpinner;
