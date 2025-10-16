import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const PlaceholderTab = ({ title }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
          <Info className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Coming Soon!</h3>
          <p className="text-muted-foreground mt-2">
            The "{title}" section is under construction. You can request this feature in your next prompt! 🚀
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceholderTab;