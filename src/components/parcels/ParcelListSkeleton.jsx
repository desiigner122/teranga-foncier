import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ParcelListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-9 w-1/4" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default ParcelListSkeleton;