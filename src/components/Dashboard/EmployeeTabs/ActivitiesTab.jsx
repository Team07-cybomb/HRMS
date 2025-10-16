import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

const ActivitiesTab = () => {
  const { auditLogs } = useAppContext();
  const { user } = useAuth();

  const userActivities = auditLogs.filter(log => log.user === user.name).slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Activity className="mr-2" /> My Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {userActivities.length > 0 ? userActivities.map(log => (
              <div key={log.id} className="flex items-start space-x-4">
                <div className="bg-primary/10 text-primary p-2 rounded-full">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8">No recent activities found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivitiesTab;