import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPinIcon } from 'lucide-react';

const LocationViewer = ({ location, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!location || !location.address) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-1 h-auto hover:bg-gray-100"
      >
        <div className="flex items-center space-x-1 text-xs">
          <MapPinIcon className="w-3 h-3 text-green-600" />
          <span className="max-w-20 truncate">View</span>
        </div>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type} Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Address</Label>
              <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{location.address}</p>
            </div>
            {location.latitude && location.longitude && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <p className="text-sm mt-1">{location.latitude}</p>
                </div>
                <div>
                  <Label>Longitude</Label>
                  <p className="text-sm mt-1">{location.longitude}</p>
                </div>
              </div>
            )}
            {location.accuracy && (
              <div>
                <Label>Accuracy</Label>
                <p className="text-sm mt-1">{location.accuracy}m</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationViewer;