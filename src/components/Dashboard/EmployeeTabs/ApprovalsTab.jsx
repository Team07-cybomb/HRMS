import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ApprovalsTab = () => {
  const { leaveRequests, hrRequests } = useAppContext();
  const { user, can } = useAuth();

  const myLeaveRequests = leaveRequests.getAll().filter(req => req.employeeId === user.id);
  const myHrRequests = hrRequests.getAll().filter(req => req.employeeId === user.id);

  const pendingLeaveApprovals = can('approve:leave') ? leaveRequests.getAll().filter(req => req.status === 'pending') : [];

  const handleApprovalAction = (api, id, status) => {
    api.update(id, { status });
    toast({ title: `Request ${status}`, description: 'The request status has been updated.' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-requests">
          <TabsList>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {can('approve:leave') && <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>}
          </TabsList>
          <TabsContent value="my-requests" className="mt-4 space-y-4">
            <h3 className="font-semibold">My Leave Requests</h3>
            {myLeaveRequests.length > 0 ? myLeaveRequests.map(req => (
              <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{req.type} ({req.startDate} to {req.endDate})</p>
                  <p className="text-sm text-muted-foreground">{req.reason}</p>
                </div>
                <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground">No leave requests found.</p>}
            
            <h3 className="font-semibold mt-6">My HR Requests</h3>
            {myHrRequests.length > 0 ? myHrRequests.map(req => (
              <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{req.type}</p>
                  <p className="text-sm text-muted-foreground">{req.details}</p>
                </div>
                <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground">No HR requests found.</p>}
          </TabsContent>
          {can('approve:leave') && (
            <TabsContent value="pending-approvals" className="mt-4 space-y-4">
              {pendingLeaveApprovals.length > 0 ? pendingLeaveApprovals.map(req => (
                <div key={req.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.employee} - {req.type}</p>
                      <p className="text-sm text-muted-foreground">{req.startDate} to {req.endDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" onClick={() => toast({title: 'View Details', description: req.reason})}><Eye className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-green-500" onClick={() => handleApprovalAction(leaveRequests, req.id, 'approved')}><Check className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleApprovalAction(leaveRequests, req.id, 'rejected')}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">No pending approvals.</p>}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApprovalsTab;