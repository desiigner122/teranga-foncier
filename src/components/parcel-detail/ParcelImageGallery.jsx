import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ParcelImageGallery = ({ images = [], parcelName, parcelId }) => {
  const mainImageDesc = images[0] || `Image principale pour ${parcelName}`;
  
  const thumbnailImagesData = images.length > 1 ? images.slice(1, 6) : 
    images.length === 1 ? [] : 
    [ 
      `Image miniature 1 pour ${parcelName}`, 
      `Image miniature 2 pour ${parcelName}`, 
      `Image miniature 3 pour ${parcelName}`,
      `Image miniature 4 pour ${parcelName}`
    ];


  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-video bg-muted group relative overflow-hidden">
           <img  
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              alt={mainImageDesc} src="https://images.unsplash.com/photo-1542364041-2cada653f4ee" />
        </div>

        {thumbnailImagesData.length > 0 && (
          <div className="p-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 border-t">
            {thumbnailImagesData.map((desc, index) => (
              <div key={index} className="aspect-square bg-muted rounded overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:opacity-90 transition-opacity">
                 <img  
                    className="w-full h-full object-cover"
                    alt={desc} src="https://images.unsplash.com/photo-1424169144302-13dcdec06242" />
              </div>
            ))}
            {images.length > 6 && (
              <div className="aspect-square bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground border border-dashed">
                +{images.length - (thumbnailImagesData.length)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParcelImageGallery;
