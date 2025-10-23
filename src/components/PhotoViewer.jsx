import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image } from 'lucide-react';

const PhotoViewer = ({ src, alt, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded border">
        <Image className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-1 hover:bg-gray-100"
      >
        {trigger || (
          <div className="w-10 h-10 bg-blue-50 rounded border border-blue-200 flex items-center justify-center">
            <Image className="w-4 h-4 text-blue-500" />
          </div>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{alt || 'Attendance Photo'}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={src} 
              alt={alt}
              className="max-w-full max-h-96 object-contain rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgODVWMTE1SDc1Vjg1SDEyNVpNMTI1IDc1SDc1Qzc1IDcwLjU4MTcgNzguNTgxNyA2NyA4MyA2N0gxMTdDMTIxLjQxOCA2NyAxMjUgNzAuNTgxNyAxMjUgNzVaTTEzNSA2N0MxMzUgNTcuMDYwOSAxMjYuOTM5IDQ5IDExNyA0OUg4M0M3My4wNjA5IDQ5IDY1IDU3LjA2MDkgNjUgNjdWMTMzQzY1IDE0Mi45MzkgNzMuMDYwOSAxNTEgODMgMTUxSDExN0MxMjYuOTM5IDE1MSAxMzUgMTQyLjkzOSAxMzUgMTMzVjY3WiIgZmlsbD0iIzlDQThBNiIvPgo8L3N2Zz4K';
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoViewer;