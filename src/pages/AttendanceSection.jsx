import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
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
  Clock,
  Plus,
  Search,
  Filter,
  Check,
  X,
  User,
  CalendarDays,
  MoreVertical,
  LogIn,
  LogOut,
  MapPin,
  AlertCircle
} from 'lucide-react';

const ManualEntryForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ inTime: '', outTime: '', reason: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inTime">In Time</Label>
          <Input id="inTime" name="inTime" type="time" value={formData.inTime} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="outTime">Out Time</Label>
          <Input id="outTime" name="outTime" type="time" value={formData.outTime} onChange={handleChange} />
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

const AttendanceSection = () => {
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [isManualEntryOpen, setManualEntryOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleAction = (action, item = null) => {
    toast({
      title: action,
      description: "This feature is now active!"
    });
  };

  const handleManualEntrySubmit = (data) => {
    toast({ title: 'Request Submitted', description: 'Your manual attendance entry request has been submitted for approval.' });
    setManualEntryOpen(false);
  };

  const attendanceData = [
    { id: 'ATT001', employeeId: 'EMP001', employee: 'Sarah Johnson', date: '2024-01-24', checkIn: '09:05 AM', checkOut: '06:15 PM', status: 'present', shift: 'Day Shift', location: 'New York HQ', duration: '9h 10m', teamId: 1 },
    { id: 'ATT002', employeeId: 'EMP002', employee: 'Alex Rodriguez', date: '2024-01-24', checkIn: '09:30 AM', checkOut: '06:00 PM', status: 'late', shift: 'Day Shift', location: 'New York HQ', duration: '8h 30m', teamId: 1 },
    { id: 'ATT003', employeeId: 'EMP003', employee: 'Emily Davis', date: '2024-01-24', checkIn: null, checkOut: null, status: 'absent', shift: 'Flexible', location: 'Remote', duration: '0h 0m', teamId: 2 },
  ];

  const timesheets = [
    { id: 'TS001', employeeId: 'EMP001', employee: 'Sarah Johnson', period: 'Jan 2024', totalHours: 176, status: 'approved', approver: 'Mike Chen', teamId: 1 },
    { id: 'TS002', employeeId: 'EMP002', employee: 'Alex Rodriguez', period: 'Jan 2024', totalHours: 168, status: 'pending', approver: 'Sarah Johnson', teamId: 1 },
    { id: 'TS003', employeeId: 'EMP003', employee: 'Emily Davis', period: 'Jan 2024', totalHours: 160, status: 'submitted', approver: 'Lisa Anderson', teamId: 2 },
  ];

  const manualRequests = [
    { id: 'MR001', employee: 'Alex Rodriguez', date: '2024-01-23', requestedIn: '09:00 AM', requestedOut: '06:00 PM', reason: 'Forgot to punch in.' }
  ];

  const getVisibleAttendance = () => {
    if (can?.('view:all_attendance')) return attendanceData;
    return attendanceData.filter(a => a.employeeId === user?.id || (a.teamId && user?.teamIds?.includes(a.teamId)));
  };

  const getVisibleTimesheets = () => {
    if (can?.('approve:timesheet')) return timesheets;
    return timesheets.filter(t => t.employeeId === user?.id);
  };

  const filteredAttendance = getVisibleAttendance().filter(record =>
    record.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'half-day': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTimesheetStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const renderTodayAttendance = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => handleAction('Filter Attendance')}><Filter className="w-4 h-4 mr-2" />Filter</Button>
        </div>
        <div className="space-y-4">
          {filteredAttendance.map((record, index) => (
            <motion.div key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{record.employee}</h3>
                      <p className="text-sm text-muted-foreground">{record.shift}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    {can?.('approve:manual_attendance') &&
                      <button onClick={() => handleAction('Attendance Options', record)} className="p-1 hover:bg-accent rounded">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    }
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check In</p>
                      <p className="text-sm font-medium">{record.checkIn || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check Out</p>
                      <p className="text-sm font-medium">{record.checkOut || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{record.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{record.location}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <Calendar value={date} onChange={setDate} className="rounded-md border" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTimesheets = () => (
    <div className="space-y-4">
      {getVisibleTimesheets().map((sheet, index) => (
        <motion.div key={sheet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{sheet.employee}</h3>
                  <p className="text-sm text-muted-foreground">Period: {sheet.period}</p>
                </div>
              </div>
              <Badge className={getTimesheetStatusColor(sheet.status)}>{sheet.status}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-muted-foreground">Total Hours</p><p className="text-sm font-medium">{sheet.totalHours}h</p></div>
              <div><p className="text-xs text-muted-foreground">Approver</p><p className="text-sm font-medium">{sheet.approver}</p></div>
              <div className="col-span-2 flex items-center justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleAction('View Timesheet', sheet)}>View</Button>
                {sheet.status === 'submitted' && can?.('approve:timesheet') && <Button size="sm" onClick={() => handleAction('Approve Timesheet', sheet)}>Approve</Button>}
                {sheet.status === 'pending' && sheet.employeeId === user?.id && <Button size="sm" onClick={() => handleAction('Submit Timesheet', sheet)}>Submit</Button>}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderManualRequests = () => (
    <div className="space-y-4">
      {manualRequests.map((req, index) => (
        <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-semibold">{req.employee}</h3>
                  <p className="text-sm text-muted-foreground">Date: {req.date}</p>
                </div>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{req.reason}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">Requested In</p><p className="text-sm font-medium">{req.requestedIn}</p></div>
              <div><p className="text-xs text-muted-foreground">Requested Out</p><p className="text-sm font-medium">{req.requestedOut}</p></div>
              {can?.('approve:manual_attendance') &&
                <div className="flex items-center justify-end space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('Approve Request', req)}><Check className="w-4 h-4 mr-2" />Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleAction('Reject Request', req)}><X className="w-4 h-4 mr-2" />Reject</Button>
                </div>
              }
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'today', label: "Today's Attendance", icon: Clock },
    { id: 'timesheets', label: 'Timesheets', icon: CalendarDays },
    ...(can?.('approve:manual_attendance') ? [{ id: 'requests', label: 'Manual Requests', icon: AlertCircle }] : [])
  ];

  return (
    <>
      <Helmet><title>Attendance & Time - HRMS Pro</title></Helmet>

      <Dialog open={isManualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent>
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Manual Attendance Entry</DialogTitle>
              <DialogDescription>Request a correction for your attendance.</DialogDescription>
            </DialogHeader>
            <ManualEntryForm onSubmit={handleManualEntrySubmit} onCancel={() => setManualEntryOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance & Time</h1>
            <p className="text-muted-foreground mt-2">Track attendance, manage timesheets, and monitor work hours</p>
          </div>
          <Button onClick={() => setManualEntryOpen(true)} className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />Manual Entry
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
                    <Icon className="w-4 h-4" /><span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'today' && renderTodayAttendance()}
          {activeTab === 'timesheets' && renderTimesheets()}
          {activeTab === 'requests' && renderManualRequests()}
        </motion.div>
      </div>
    </>
  );
};

export default AttendanceSection;
