import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ParcelDescriptionCard = ({ description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ParcelDescriptionCard;