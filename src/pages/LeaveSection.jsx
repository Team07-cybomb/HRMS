
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CalendarDays,
  MoreVertical,
  PauseCircle
} from 'lucide-react';

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
        <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-md">
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

const LeaveSection = () => {
  const { leaveRequests: leaveApi, logAction } = useAppContext();
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [isApplyLeaveOpen, setApplyLeaveOpen] = useState(false);

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

  const handleUpdateRequest = (id, status) => {
    if (!can('approve:leave')) {
      toast({ title: 'Permission Denied', variant: 'destructive' });
      return;
    }
    const request = leaveApi.getById(id);
    leaveApi.update(id, { status });
    logAction(`Leave Request ${status}`, { id, employee: request.employee });
    toast({ title: `Request ${status}`, description: `Leave request from ${request.employee} has been ${status}.` });
  };

  const leaveRequests = leaveApi.getAll();
  const leavePolicies = [
    { id: 'LP001', name: 'Annual Leave', allocation: 25 },
    { id: 'LP002', name: 'Sick Leave', allocation: 12 },
  ];
  const leaveBalances = [
    { employee: 'Sarah Johnson', annual: 17, sick: 10 },
    { employee: 'Alex Rodriguez', annual: 15, sick: 9 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'hold': return <PauseCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredRequests = leaveRequests.filter(request =>
    request.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderLeaveRequests = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search leave requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" onClick={() => toast({ title: 'Filter clicked' })}><Filter className="w-4 h-4 mr-2" />Filter</Button>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.employee}</h3>
                    <p className="text-sm text-gray-500">{request.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(request.status)}><div className="flex items-center space-x-1">{getStatusIcon(request.status)}<span>{request.status}</span></div></Badge>
                  {can('approve:leave') && <button onClick={() => toast({ title: 'Options clicked' })} className="p-1 hover:bg-gray-100 rounded"><MoreVertical className="w-4 h-4 text-gray-500" /></button>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div><p className="text-xs text-gray-500 mb-1">Start Date</p><p className="text-sm font-medium text-gray-900">{request.startDate}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">End Date</p><p className="text-sm font-medium text-gray-900">{request.endDate}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Reason</p><p className="text-sm text-gray-900 truncate">{request.reason}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Approver</p><p className="text-sm text-gray-900">{request.approver}</p></div>
              </div>
              {request.status === 'pending' && can('approve:leave') && (
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <Button size="sm" onClick={() => handleUpdateRequest(request.id, 'approved')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                  <Button size="sm" onClick={() => handleUpdateRequest(request.id, 'rejected')} className="border-red-300 text-red-600 hover:bg-red-50">Reject</Button>
                  <Button size="sm" onClick={() => handleUpdateRequest(request.id, 'hold')} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">Hold</Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: 'Viewing details...' })}>View Details</Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderLeavePolicies = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {leavePolicies.map((policy, index) => (
        <motion.div key={policy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6 card-hover cursor-pointer" onClick={() => toast({ title: 'Editing policy...' })}>
            <h3 className="font-semibold text-gray-900">{policy.name}</h3>
            <p className="text-sm text-gray-500">Annual Allocation: {policy.allocation} days</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderLeaveBalances = () => (
    <div className="space-y-4">
      {leaveBalances.map((balance, index) => (
        <motion.div key={balance.employee} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900">{balance.employee}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p>Annual: {balance.annual} days</p>
              <p>Sick: {balance.sick} days</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Leave Management - HRMS Pro</title>
        <meta name="description" content="Manage leave requests, policies, and employee leave balances with comprehensive leave management tools in HRMS Pro" />
      </Helmet>

      <Dialog open={isApplyLeaveOpen} onOpenChange={setApplyLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Fill in the details for your leave request.</DialogDescription>
          </DialogHeader>
          <ApplyLeaveForm onSave={handleApplyLeave} onCancel={() => setApplyLeaveOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-2">Manage leave requests, policies, and employee balances</p>
          </div>
          <Button onClick={() => setApplyLeaveOpen(true)} className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" /> Apply Leave
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'requests', label: 'Leave Requests', icon: Clock },
                ...(can('approve:leave') ? [
                  { id: 'policies', label: 'Leave Policies', icon: CalendarDays },
                  { id: 'balances', label: 'Leave Balances', icon: User }
                ] : [])
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'requests' && renderLeaveRequests()}
          {activeTab === 'policies' && can('approve:leave') && renderLeavePolicies()}
          {activeTab === 'balances' && can('approve:leave') && renderLeaveBalances()}
        </motion.div>
      </div>
    </>
  );
};

export default LeaveSection;
