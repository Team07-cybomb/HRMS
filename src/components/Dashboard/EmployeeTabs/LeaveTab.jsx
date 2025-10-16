import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle
} from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

const ApplyLeaveForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Leave Type</Label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-md bg-background">
          <option>Annual Leave</option>
          <option>Sick Leave</option>
          <option>Personal Leave</option>
          <option>Unpaid Leave</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Submit Request</Button>
      </DialogFooter>
    </form>
  );
};

const LeaveTab = () => {
  const { leaveRequests: leaveApi, companyHolidays: holidaysApi } = useAppContext();
  const { user } = useAuth();
  const [isApplyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleApplyLeave = (leaveData) => {
    const newRequest = {
      ...leaveData,
      employee: user.name,
      employeeId: user.id,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approver: 'HR/Admin'
    };
    leaveApi.add(newRequest);
    toast({ title: 'Leave Request Submitted', description: 'Your request has been sent for approval.' });
    setApplyLeaveOpen(false);
  };

  const myLeaveRequests = leaveApi.getAll().filter(req => req.employeeId === user.id && req.status === 'approved');
  const companyHolidays = holidaysApi.getAll();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'hold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'hold': return <PauseCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const DayWithStatus = ({ date, ...props }) => {
    const isHoliday = companyHolidays.some(h => isSameDay(parseISO(h.date), date));
    const isOnLeave = myLeaveRequests.some(l => date >= parseISO(l.startDate) && date <= parseISO(l.endDate));
    
    let statusClass = '';
    if (isHoliday) statusClass = 'bg-purple-100 dark:bg-purple-900/50';
    if (isOnLeave) statusClass = 'bg-blue-100 dark:bg-blue-900/50';

    return (
      <div className={statusClass} style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {props.children}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isApplyLeaveOpen} onOpenChange={setApplyLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Fill in the details for your leave request.</DialogDescription>
          </DialogHeader>
          <ApplyLeaveForm onSave={handleApplyLeave} onCancel={() => setApplyLeaveOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Leave Requests</CardTitle>
              <Button onClick={() => setApplyLeaveOpen(true)}><Plus className="mr-2 h-4 w-4" /> Apply Leave</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveApi.getAll().filter(req => req.employeeId === user.id).length > 0 ? leaveApi.getAll().filter(req => req.employeeId === user.id).map((request, index) => (
                  <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{request.type}</h4>
                          <p className="text-sm text-muted-foreground">{request.startDate} to {request.endDate}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(request.status)}
                            <span>{request.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{request.reason}</p>
                    </div>
                  </motion.div>
                )) : <p className="text-center text-muted-foreground py-8">You have not made any leave requests.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Leave Calendar</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        components={{ Day: DayWithStatus }}
                    />
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-2"></span>My Leave</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-2"></span>Holiday</div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
};

export default LeaveTab;