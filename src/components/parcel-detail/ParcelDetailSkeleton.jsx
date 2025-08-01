import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

const ParcelDetailSkeleton = () => (
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Skeleton */}
          <Card>
              <Skeleton className="aspect-video w-full rounded-t-lg" />
              <CardContent className="p-2 grid grid-cols-5 gap-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded" />)}
              </CardContent>
          </Card>
          {/* Description Skeleton */}
          <Card>
              <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
              <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
              </CardContent>
          </Card>
          {/* Documents Skeleton */}
          <Card>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
              </CardContent>
          </Card>
          {/* Location Skeleton */}
          <Card>
              <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
              <CardContent>
                  <Skeleton className="aspect-video w-full rounded" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
              </CardContent>
          </Card>
      </div>

      {/* Right Column Skeleton */}
      <div className="lg:col-span-1 space-y-6">
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <div className="flex justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-1/3" />
                  </div>
              </CardHeader>
              <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                   <div className="flex space-x-2 pt-3 border-t mt-4">
                       <Skeleton className="h-9 w-9 rounded-md" />
                       <Skeleton className="h-9 w-9 rounded-md" />
                   </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </CardFooter>
          </Card>
      </div>
   </div>
);

export default ParcelDetailSkeleton;