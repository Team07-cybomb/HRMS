import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAdminAttendance } from '@/contexts/AdminAttendanceContext';
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
  Check,
  X,
  User,
  CalendarDays,
  LogIn,
  LogOut,
  AlertCircle,
  Loader2,
  Users,
  Settings,
  Download,
  Eye,
  BarChart3,
} from 'lucide-react';

// Import components from the correct paths
import PhotoViewer from '../components/PhotoViewer';
import LocationViewer from '../components/LocationViewer';
import AttendanceDetailsModal from '../components/AttendanceDetailsModal';
import ShiftManagement from '../components/ShiftManagement';

const getStatusColor = (status) => {
  const colors = {
    present: { backgroundColor: '#10b981', textColor: '#ffffff' },
    absent: { backgroundColor: '#ef4444', textColor: '#ffffff' },
    late: { backgroundColor: '#f59e0b', textColor: '#ffffff' },
    'half-day': { backgroundColor: '#3b82f6', textColor: '#ffffff' },
    weekend: { backgroundColor: '#6b7280', textColor: '#ffffff' }
  };
  return colors[status] || { backgroundColor: '#6b7280', textColor: '#ffffff' };
};

const AdminAttendanceSection = () => {
  const { 
    user, 
    hasAdminAccess, 
    attendanceData,
    dashboardStats,
    employees,
    loading,
    filters,
    updateFilters,
    fetchAttendanceData,
    exportAttendanceData,
    refreshData,
    isAuthenticated
  } = useAdminAttendance();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: 'all'
  });

  // Authentication check - run once on mount
  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess()) {
      toast({ 
        title: 'Access Denied', 
        description: 'You do not have permission to access this section',
        variant: 'destructive' 
      });
    }
  }, []); // Empty dependency array - runs only once

  // Data fetching - run when tab or date changes
  useEffect(() => {
    if (isAuthenticated && hasAdminAccess()) {
      fetchDataForTab();
    }
  }, [activeTab, selectedDate]); // Remove isAuthenticated from dependencies

  // Wrap fetchDataForTab with useCallback
  const fetchDataForTab = useCallback(async () => {
    if (!isAuthenticated || !hasAdminAccess()) return;

    try {
      switch (activeTab) {
        case 'overview':
          await refreshData();
          break;
        case 'shifts':
          // ShiftManagement component handles its own data fetching
          break;
        case 'reports':
          // Reports tab doesn't need initial data fetch
          break;
      }
    } catch (error) {
      console.error('Error fetching data for tab:', error);
    }
  }, [isAuthenticated, hasAdminAccess, activeTab, refreshData]);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
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

// In AttendanceSection.jsx - Update the employee filter section
const updateEmployeeFilter = (employeeId) => {
  if (employeeId === 'all') {
    setEmployeeFilter('');
    updateFilters({ employeeId: '' });
  } else {
    setEmployeeFilter(employeeId);
    updateFilters({ employeeId });
  }
};

// In the employee dropdown, use employee.employeeId instead of employee._id
<Select 
  value={employeeFilter} 
  onValueChange={updateEmployeeFilter}
>
  <SelectTrigger className="w-60">
    <SelectValue placeholder="All employees" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Employees</SelectItem>
    {employees && employees
      .filter(employee => employee.employeeId && employee.employeeId.trim() !== '')
      .map(employee => (
        <SelectItem 
          key={employee._id} 
          value={employee.employeeId} // Use employee.employeeId instead of employee._id
        >
          {employee.name} - {employee.department || 'No Department'} ({employee.employeeId})
        </SelectItem>
      ))
    }
  </SelectContent>
</Select>
  // In AttendanceSection.jsx - Update the helper functions
// Helper function to extract employee ID from record
const getEmployeeId = (record) => {
  // Now employeeId is directly the EMP003 string
  return record.employeeId || 'N/A';
};

// Helper function to get employee name
const getEmployeeName = (record) => {
  if (record.employeeName) return record.employeeName;
  if (record.employee) return record.employee;
  return 'Unknown Employee';
};

// Helper function to find employee details for display
const getEmployeeDetails = (record) => {
  const employeeId = getEmployeeId(record);
  const employee = employees.find(emp => emp.employeeId === employeeId);
  
  return {
    name: employee?.name || record.employeeName || record.employee || 'Unknown Employee',
    department: employee?.department || 'No Department',
    email: employee?.email || 'N/A'
  };
};

  const renderOverview = () => (
  <div className="space-y-6">
    {/* Employee Filter Section - UPDATED */}
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by Employee:</span>
      </div>
      <Select 
        value={employeeFilter} 
        onValueChange={updateEmployeeFilter}
      >
        <SelectTrigger className="w-60">
          <SelectValue placeholder="All employees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {employees && employees
            .filter(employee => employee.employeeId && employee.employeeId.trim() !== '') // Filter out employees with empty employeeIds
            .map(employee => (
              <SelectItem 
                key={employee._id} 
                value={employee.employeeId} // Use employee.employeeId (EMP003) instead of employee._id
              >
                {employee.name} - {employee.department || 'No Department'} ({employee.employeeId})
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      {employeeFilter && employeeFilter !== 'all' && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => updateEmployeeFilter('all')}
        >
          Clear Filter
        </Button>
      )}
    </div>

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

      {/* Recent Attendance Table */}
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
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
<TableBody>
  {attendanceData && attendanceData.length > 0 ? (
    attendanceData.map((record) => {
      const employeeDetails = getEmployeeDetails(record);
      
      return (
        <TableRow key={record._id}>
          <TableCell className="font-mono text-xs">
            {getEmployeeId(record)}
          </TableCell>
          <TableCell className="font-medium">
            {employeeDetails.name}
            <p className="text-xs text-muted-foreground">
              {employeeDetails.department}
            </p>
          </TableCell>
          <TableCell>
            {new Date(record.date).toLocaleDateString()}
          </TableCell>
          {/* Check In Column - FIXED */}
          <TableCell>
            <div className="flex items-center space-x-2">
              <span>
                {record.checkIn ? 
                  (typeof record.checkIn === 'string' ? record.checkIn : new Date(record.checkIn).toLocaleTimeString()) 
                  : '-'}
              </span>
              {record.checkInLocation && (
                <LocationViewer location={record.checkInLocation} type="Check-in" />
              )}
            </div>
          </TableCell>
          {/* Check Out Column - FIXED */}
          <TableCell>
            <div className="flex items-center space-x-2">
              <span>
                {record.checkOut ? 
                  (typeof record.checkOut === 'string' ? record.checkOut : new Date(record.checkOut).toLocaleTimeString()) 
                  : '-'}
              </span>
              {record.checkOutLocation && (
                <LocationViewer location={record.checkOutLocation} type="Check-out" />
              )}
            </div>
          </TableCell>
          <TableCell>{record.duration || '0h 0m'}</TableCell>
          <TableCell>
            <Badge 
              className="text-xs capitalize"
              style={{ 
                backgroundColor: getStatusColor(record.status).backgroundColor,
                color: getStatusColor(record.status).textColor
              }}
            >
              {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Absent'}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <PhotoViewer 
                src={record.checkInPhoto} 
                alt={`Check-in photo for ${getEmployeeName(record)}`}
              />
              <PhotoViewer 
                src={record.checkOutPhoto} 
                alt={`Check-out photo for ${getEmployeeName(record)}`}
              />
            </div>
          </TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(record)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </TableCell>
        </TableRow>
      );
    })
  ) : (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
        No attendance records found for {selectedDate.toLocaleDateString()}
        {employeeFilter && ` for selected employee`}
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

      {/* Attendance Details Modal */}
      <AttendanceDetailsModal
        record={selectedRecord}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRecord(null);
        }}
      />

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
          {activeTab === 'shifts' && <ShiftManagement />}
          {activeTab === 'reports' && renderReports()}
        </motion.div>
      </div>
    </>
  );
};

export default AdminAttendanceSection;