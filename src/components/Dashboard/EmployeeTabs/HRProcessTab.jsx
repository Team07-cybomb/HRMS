import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRightLeft, Users, Award } from 'lucide-react';

const RequestForm = ({ requestType, onSave, onCancel }) => {
  const [details, setDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: requestType, details });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="details">Reason / Details</Label>
        <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Submit Request</Button>
      </DialogFooter>
    </form>
  );
};

const HRProcessTab = () => {
  const { hrRequests: hrRequestsApi } = useAppContext();
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('');

  const myRequests = hrRequestsApi.getAll().filter(req => req.employeeId === user.id);

  const handleNewRequest = (type) => {
    setRequestType(type);
    setModalOpen(true);
  };

  const handleSaveRequest = (data) => {
    hrRequestsApi.add({
      ...data,
      employeeId: user.id,
      status: 'pending',
      requestedDate: new Date().toISOString().split('T')[0],
    });
    toast({ title: 'Request Submitted', description: 'Your request has been sent to HR for review.' });
    setModalOpen(false);
  };

  const requestOptions = [
    { type: 'Department Change', icon: ArrowRightLeft },
    { type: 'Team Change', icon: Users },
    { type: 'Designation Change', icon: Award },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request {requestType}</DialogTitle>
            <DialogDescription>Provide details for your request.</DialogDescription>
          </DialogHeader>
          <RequestForm requestType={requestType} onSave={handleSaveRequest} onCancel={() => setModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Initiate HR Request</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requestOptions.map(opt => {
              const Icon = opt.icon;
              return (
                <Button key={opt.type} variant="outline" className="h-20 flex-col" onClick={() => handleNewRequest(opt.type)}>
                  <Icon className="w-6 h-6 mb-2" />
                  <span>{opt.type}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My HR Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.length > 0 ? myRequests.map(req => (
              <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{req.type}</p>
                  <p className="text-sm text-muted-foreground">{req.details}</p>
                </div>
                <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8">You have no pending or past HR requests.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HRProcessTab;