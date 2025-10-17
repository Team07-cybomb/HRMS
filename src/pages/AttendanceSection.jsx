// AdminAttendanceSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAdminAttendance } from '@/contexts/AdminAttendanceContext';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  AlertCircle,
  Loader2,
  Users,
  Settings,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

const ShiftScheduleForm = ({ onSubmit, onCancel, loading, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '17:00',
    breakDuration: initialData?.breakDuration || 60,
    description: initialData?.description || '',
    teamIds: initialData?.teamIds || [],
    isActive: initialData?.isActive ?? true
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (name, value) => setFormData({ ...formData, [name]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Shift Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Morning Shift, Night Shift, etc."
            required 
          />
        </div>
        <div>
          <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
          <Input 
            id="breakDuration" 
            name="breakDuration" 
            type="number" 
            value={formData.breakDuration} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input 
            id="startTime" 
            name="startTime" 
            type="time" 
            value={formData.startTime} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input 
            id="endTime" 
            name="endTime" 
            type="time" 
            value={formData.endTime} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Shift details and requirements..."
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isActive">Active Shift</Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Update Shift' : 'Create Shift'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const EmployeeAssignmentForm = ({ onSubmit, onCancel, loading, employees, shifts }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (name, value) => setFormData({ ...formData, [name]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Select value={formData.employeeId} onValueChange={(value) => handleSelectChange('employeeId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map(emp => (
              <SelectItem key={emp._id} value={emp._id}>
                {emp.name} - {emp.email} ({emp.department || 'No Department'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="shiftId">Shift</Label>
        <Select value={formData.shiftId} onValueChange={(value) => handleSelectChange('shiftId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select shift" />
          </SelectTrigger>
          <SelectContent>
            {shifts.filter(shift => shift.isActive).map(shift => (
              <SelectItem key={shift._id} value={shift._id}>
                {shift.name} ({shift.startTime} - {shift.endTime})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="effectiveDate">Effective Date</Label>
        <Input 
          id="effectiveDate" 
          name="effectiveDate" 
          type="date" 
          value={formData.effectiveDate} 
          onChange={handleChange} 
          required 
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Assign Shift
        </Button>
      </DialogFooter>
    </form>
  );
};

const AdminAttendanceSection = () => {
  const { 
    user, 
    hasAdminAccess, 
    canManageShifts,
    attendanceData,
    shifts,
    employeeAssignments,
    dashboardStats,
    employees,
    loading,
    filters,
    updateFilters,
    fetchAttendanceData,
    fetchShifts,
    fetchEmployeeAssignments,
    fetchEmployees,
    createShift,
    updateShift,
    deleteShift,
    assignShiftToEmployee,
    exportAttendanceData,
    refreshData,
    isAuthenticated
  } = useAdminAttendance();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isShiftFormOpen, setShiftFormOpen] = useState(false);
  const [isAssignmentFormOpen, setAssignmentFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: 'all'
  });

  // Check authentication and fetch data when tab changes
  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess()) {
      toast({ 
        title: 'Access Denied', 
        description: 'You do not have permission to access this section',
        variant: 'destructive' 
      });
      return;
    }

    fetchDataForTab();
  }, [activeTab, selectedDate, isAuthenticated]);

  const fetchDataForTab = async () => {
    if (!isAuthenticated || !hasAdminAccess()) return;

    try {
      switch (activeTab) {
        case 'overview':
          await refreshData();
          break;
        case 'shifts':
          await fetchShifts();
          await fetchEmployeeAssignments();
          await fetchEmployees();
          break;
        case 'reports':
          // Reports tab doesn't need initial data fetch
          break;
      }
    } catch (error) {
      console.error('Error fetching data for tab:', error);
    }
  };

  const handleCreateShift = async (data) => {
    try {
      await createShift(data);
      setShiftFormOpen(false);
      toast({ title: 'Shift created successfully' });
      await fetchShifts(); // Refresh shifts list
    } catch (error) {
      console.error('Create shift error:', error);
      toast({
        title: 'Failed to create shift',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateShift = async (data) => {
    try {
      await updateShift(editingShift._id, data);
      setShiftFormOpen(false);
      setEditingShift(null);
      toast({ title: 'Shift updated successfully' });
      await fetchShifts(); // Refresh shifts list
    } catch (error) {
      console.error('Update shift error:', error);
      toast({
        title: 'Failed to update shift',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift? This will also deactivate all active assignments for this shift.')) return;
    
    try {
      await deleteShift(shiftId);
      toast({ title: 'Shift deleted successfully' });
      await fetchShifts(); // Refresh shifts list
      await fetchEmployeeAssignments(); // Refresh assignments
    } catch (error) {
      console.error('Delete shift error:', error);
      toast({
        title: 'Failed to delete shift',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleAssignShift = async (data) => {
    try {
      await assignShiftToEmployee(data);
      setAssignmentFormOpen(false);
      toast({ title: 'Shift assigned successfully' });
      await fetchEmployeeAssignments(); // Refresh assignments
    } catch (error) {
      console.error('Assign shift error:', error);
      toast({
        title: 'Failed to assign shift',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleExportData = async (type) => {
    try {
      let params = {
        format: 'csv'
      };

      switch (type) {
        case 'daily':
          params.startDate = selectedDate.toISOString().split('T')[0];
          params.endDate = selectedDate.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(selectedDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          params.startDate = weekStart.toISOString().split('T')[0];
          params.endDate = weekEnd.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
          params.startDate = monthStart.toISOString().split('T')[0];
          params.endDate = monthEnd.toISOString().split('T')[0];
          break;
        case 'custom':
          params.startDate = reportFilters.startDate;
          params.endDate = reportFilters.endDate;
          if (reportFilters.department !== 'all') {
            // Note: You'll need to implement department filtering in the backend
          }
          break;
        default:
          params.startDate = selectedDate.toISOString().split('T')[0];
          params.endDate = selectedDate.toISOString().split('T')[0];
      }

      await exportAttendanceData(params);
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    updateFilters({ date });
    // Refresh attendance data when date changes
    if (activeTab === 'overview') {
      fetchAttendanceData();
    }
  };

  const handleReportFilterChange = (key, value) => {
    setReportFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefreshData = async () => {
    try {
      await refreshData();
      toast({
        title: 'Data refreshed',
        description: 'Latest data has been loaded'
      });
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Employees</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {loading.dashboard ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardStats.totalEmployees || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Present Today</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {loading.dashboard ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardStats.presentToday || 0}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Absent Today</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {loading.dashboard ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardStats.absentToday || 0}
                </p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Late Today</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {loading.dashboard ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardStats.lateToday || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">On Leave</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {loading.dashboard ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardStats.onLeave || 0}
                </p>
              </div>
              <CalendarDays className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Attendance - {selectedDate.toLocaleDateString()}</span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportData('daily')}
                disabled={loading.attendance}
              >
                {loading.attendance ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshData}
                disabled={loading.attendance}
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading.attendance ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData && attendanceData.length > 0 ? (
                  attendanceData.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {record.employeeName || record.employee?.name || 'Unknown Employee'}
                      </TableCell>
                      <TableCell>{record.shiftName || record.shift?.name || 'No Shift'}</TableCell>
                      <TableCell>
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>{record.totalHours ? `${record.totalHours}h` : '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Absent'}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.location || record.checkInLocation || 'Office'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No attendance records found for {selectedDate.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderShiftManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shift Schedules</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshData}
            disabled={loading.shifts}
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShiftFormOpen(true)} disabled={loading.shifts}>
            <Plus className="w-4 h-4 mr-2" />
            Create Shift
          </Button>
        </div>
      </div>

      {loading.shifts ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts && shifts.length > 0 ? (
              shifts.map(shift => (
                <Card key={shift._id} className={!shift.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{shift.name}</h4>
                        <p className="text-sm text-muted-foreground">{shift.startTime} - {shift.endTime}</p>
                      </div>
                      <Badge variant={shift.isActive ? "default" : "secondary"}>
                        {shift.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {shift.description || 'No description provided'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Break: {shift.breakDuration}m</span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingShift(shift);
                            setShiftFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteShift(shift._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No shifts found. Create your first shift to get started.
              </div>
            )}
          </div>

          {/* Employee Shift Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Employee Shift Assignments</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      fetchEmployeeAssignments();
                      fetchEmployees();
                    }}
                    disabled={loading.assignments}
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={() => setAssignmentFormOpen(true)} 
                    size="sm"
                    disabled={loading.assignments || employees.length === 0 || shifts.filter(s => s.isActive).length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Shift
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.assignments ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Assigned Shift</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeAssignments && employeeAssignments.length > 0 ? (
                      employeeAssignments.map(assignment => (
                        <TableRow key={assignment._id}>
                          <TableCell className="font-medium">
                            {assignment.employeeName || assignment.employeeId?.name || 'Unknown Employee'}
                          </TableCell>
                          <TableCell>{assignment.shiftName || assignment.shiftId?.name || 'No Shift'}</TableCell>
                          <TableCell>{new Date(assignment.effectiveDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.isActive ? "default" : "secondary"}>
                              {assignment.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{assignment.assignedByName || 'System'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No shift assignments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => handleExportData('daily')}
              disabled={loading.attendance}
            >
              {loading.attendance ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Daily Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('weekly')}
              disabled={loading.attendance}
            >
              {loading.attendance ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Weekly Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('monthly')}
              disabled={loading.attendance}
            >
              {loading.attendance ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Monthly Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportData('custom')}
              disabled={loading.attendance}
            >
              {loading.attendance ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Custom Report
            </Button>
          </div>

          {/* Report Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={reportFilters.startDate}
                onChange={(e) => handleReportFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date" 
                value={reportFilters.endDate}
                onChange={(e) => handleReportFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Select 
                value={reportFilters.department}
                onValueChange={(value) => handleReportFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {employees && employees
                    .filter(emp => emp.department)
                    .map(emp => emp.department)
                    .filter((dept, index, arr) => arr.indexOf(dept) === index)
                    .map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full"
                onClick={() => handleExportData('custom')}
                disabled={loading.attendance}
              >
                {loading.attendance ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'half-day': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'shifts', label: 'Shift Management', icon: Settings },
    { id: 'reports', label: 'Reports & Analytics', icon: Download }
  ];

  // Show access denied message if user doesn't have permission
  if (!isAuthenticated || !hasAdminAccess()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-center">
          You do not have permission to access the Admin Attendance section.
          <br />
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Admin Attendance - HRMS Pro</title></Helmet>

      {/* Shift Form Dialog */}
      <Dialog open={isShiftFormOpen} onOpenChange={setShiftFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShift ? 'Edit Shift Schedule' : 'Create New Shift'}
            </DialogTitle>
            <DialogDescription>
              {editingShift ? 'Update shift details' : 'Define a new shift schedule for employees'}
            </DialogDescription>
          </DialogHeader>
          <ShiftScheduleForm
            onSubmit={editingShift ? handleUpdateShift : handleCreateShift}
            onCancel={() => {
              setShiftFormOpen(false);
              setEditingShift(null);
            }}
            loading={loading.shifts}
            initialData={editingShift}
          />
        </DialogContent>
      </Dialog>

      {/* Assignment Form Dialog */}
      <Dialog open={isAssignmentFormOpen} onOpenChange={setAssignmentFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Shift to Employee</DialogTitle>
            <DialogDescription>
              Assign a shift schedule to an employee
            </DialogDescription>
          </DialogHeader>
          <EmployeeAssignmentForm
            onSubmit={handleAssignShift}
            onCancel={() => setAssignmentFormOpen(false)}
            loading={loading.assignments}
            employees={employees || []}
            shifts={shifts || []}
          />
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Attendance</h1>
            <p className="text-muted-foreground mt-2">
              Monitor employee attendance, manage shifts, and generate reports
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleRefreshData}>
              <Loader2 className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={() => setAssignmentFormOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign Shift
            </Button>
          </div>
        </motion.div>

        {/* Date Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Viewing Date:</span>
          </div>
          <Input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            className="w-40"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                  >
                    <Icon className="w-4 h-4" /><span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'shifts' && renderShiftManagement()}
          {activeTab === 'reports' && renderReports()}
        </motion.div>
      </div>
    </>
  );
};

export default AdminAttendanceSection;