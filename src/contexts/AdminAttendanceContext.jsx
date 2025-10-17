// contexts/AdminAttendanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

const AdminAttendanceContext = createContext();

export const useAdminAttendance = () => {
  const context = useContext(AdminAttendanceContext);
  if (!context) {
    throw new Error('useAdminAttendance must be used within an AdminAttendanceProvider');
  }
  return context;
};

export const AdminAttendanceProvider = ({ children }) => {
  const { user, isAuthenticated, can } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({
    dashboard: false,
    attendance: false,
    shifts: false,
    assignments: false,
    employees: false
  });
  const [filters, setFilters] = useState({
    date: new Date(),
    department: 'all',
    status: 'all'
  });

  // API base URL
  const API_BASE = 'http://localhost:5000/api';

  // Helper function for API calls
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('hrms_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Check if user has admin attendance permissions
  const hasAdminAccess = () => {
    if (!isAuthenticated || !user) return false;
    return can('view:all_attendance') || ['hr', 'employer', 'admin'].includes(user.role);
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!hasAdminAccess()) return;

    setLoading(prev => ({ ...prev, dashboard: true }));
    try {
      const stats = await apiCall('/admin/dashboard/stats');
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Failed to load dashboard",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch attendance data - UPDATED
  const fetchAttendanceData = async (params = {}) => {
    if (!hasAdminAccess()) return;

    setLoading(prev => ({ ...prev, attendance: true }));
    try {
      const queryParams = new URLSearchParams({
        date: filters.date.toISOString().split('T')[0],
        ...params
      });

      const data = await apiCall(`/admin/attendance/data?${queryParams}`);
      
      // Handle different response formats
      if (data.attendance) {
        setAttendanceData(data.attendance);
      } else if (Array.isArray(data)) {
        setAttendanceData(data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // If the endpoint doesn't exist, create mock data for testing
      if (error.message.includes('404')) {
        console.log('Attendance endpoint not found, using mock data for testing');
        setAttendanceData(generateMockAttendanceData());
      } else {
        toast({
          title: "Failed to load attendance data",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  };

  // Generate mock attendance data for testing
  const generateMockAttendanceData = () => {
    const statuses = ['present', 'late', 'absent', 'half-day'];
    const locations = ['Office', 'Remote', 'Client Site'];
    
    return employees.slice(0, 5).map((employee, index) => ({
      _id: `mock-attendance-${index}`,
      employeeId: employee._id,
      employeeName: employee.name,
      date: new Date(),
      checkIn: index > 1 ? new Date().setHours(9, Math.floor(Math.random() * 30), 0) : null,
      checkOut: index > 1 && index < 4 ? new Date().setHours(17, Math.floor(Math.random() * 30), 0) : null,
      totalHours: index > 1 && index < 4 ? (8 + Math.random() * 2).toFixed(1) : null,
      status: statuses[index] || 'present',
      location: locations[Math.floor(Math.random() * locations.length)],
      shiftName: 'General Shift'
    }));
  };

  // Fetch shifts
  const fetchShifts = async () => {
    if (!hasAdminAccess()) return;

    setLoading(prev => ({ ...prev, shifts: true }));
    try {
      const shiftsData = await apiCall('/admin/shifts');
      setShifts(shiftsData.shifts || shiftsData || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Failed to load shifts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, shifts: false }));
    }
  };

  // Fetch employee assignments
  const fetchEmployeeAssignments = async () => {
    if (!hasAdminAccess()) return;

    setLoading(prev => ({ ...prev, assignments: true }));
    try {
      const assignments = await apiCall('/admin/shifts/assignments');
      setEmployeeAssignments(assignments.assignments || assignments || []);
    } catch (error) {
      console.error('Error fetching employee assignments:', error);
      toast({
        title: "Failed to load employee assignments",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  };

// In AdminAttendanceContext.jsx - Update the fetchEmployees function
const fetchEmployees = async () => {
  if (!hasAdminAccess()) return;

  setLoading(prev => ({ ...prev, employees: true }));
  try {
    // Use the new employees endpoint
    const employeesData = await apiCall('/admin/employees');
    
    // Handle different response formats
    if (employeesData.employees) {
      setEmployees(employeesData.employees);
    } else if (Array.isArray(employeesData)) {
      setEmployees(employeesData);
    } else {
      setEmployees([]);
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    toast({
      title: "Failed to load employees",
      description: error.message,
      variant: "destructive"
    });
  } finally {
    setLoading(prev => ({ ...prev, employees: false }));
  }
};

  // Generate mock employees for testing
  const generateMockEmployees = () => {
    return [
      {
        _id: '68f07bbda77e7a233e1a56fb',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        status: 'active'
      },
      {
        _id: '68f07bbda77e7a233e1a56fc',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        department: 'Marketing',
        status: 'active'
      },
      {
        _id: '68f07bbda77e7a233e1a56fd',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        department: 'Sales',
        status: 'active'
      },
      {
        _id: '68f07bbda77e7a233e1a56fe',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        department: 'HR',
        status: 'active'
      },
      {
        _id: '68f07bbda77e7a233e1a56ff',
        name: 'David Brown',
        email: 'david.brown@company.com',
        department: 'Engineering',
        status: 'active'
      }
    ];
  };

  // Create shift
  const createShift = async (shiftData) => {
    if (!hasAdminAccess()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create shifts",
        variant: "destructive"
      });
      return;
    }

    try {
      const newShift = await apiCall('/admin/shifts', {
        method: 'POST',
        body: shiftData
      });
      
      setShifts(prev => [...prev, newShift]);
      toast({
        title: "Shift created successfully",
        description: `${shiftData.name} has been created`
      });
      return newShift;
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({
        title: "Failed to create shift",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update shift
  const updateShift = async (shiftId, shiftData) => {
    if (!hasAdminAccess()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update shifts",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedShift = await apiCall(`/admin/shifts/${shiftId}`, {
        method: 'PUT',
        body: shiftData
      });
      
      setShifts(prev => prev.map(shift => 
        shift._id === shiftId ? { ...shift, ...updatedShift } : shift
      ));
      toast({
        title: "Shift updated successfully",
        description: `${shiftData.name} has been updated`
      });
      return updatedShift;
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Failed to update shift",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete shift
  const deleteShift = async (shiftId) => {
    if (!hasAdminAccess()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete shifts",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiCall(`/admin/shifts/${shiftId}`, {
        method: 'DELETE'
      });
      
      setShifts(prev => prev.filter(shift => shift._id !== shiftId));
      toast({
        title: "Shift deleted successfully",
        description: "Shift has been removed"
      });
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Failed to delete shift",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Assign shift to employee
  const assignShiftToEmployee = async (assignmentData) => {
    if (!hasAdminAccess()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to assign shifts",
        variant: "destructive"
      });
      return;
    }

    try {
      const newAssignment = await apiCall('/admin/shifts/assign', {
        method: 'POST',
        body: assignmentData
      });
      
      setEmployeeAssignments(prev => [...prev, newAssignment]);
      toast({
        title: "Shift assigned successfully",
        description: "Employee has been assigned to shift"
      });
      return newAssignment;
    } catch (error) {
      console.error('Error assigning shift:', error);
      toast({
        title: "Failed to assign shift",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Export attendance data
  const exportAttendanceData = async (params = {}) => {
    if (!hasAdminAccess()) return;

    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE}/admin/attendance/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hrms_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `attendance-export-${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Attendance data has been exported"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Refresh all data
  const refreshData = () => {
    fetchDashboardStats();
    fetchAttendanceData();
    fetchShifts();
    fetchEmployeeAssignments();
    fetchEmployees();
  };

  // Effect to fetch data when filters change or user authenticates
  useEffect(() => {
    if (hasAdminAccess()) {
      fetchDashboardStats();
      fetchAttendanceData();
      fetchEmployees(); // Fetch employees on initial load for assignment forms
    }
  }, [filters.date, isAuthenticated]);

  const value = {
    // State
    attendanceData,
    shifts,
    employeeAssignments,
    dashboardStats,
    employees,
    loading,
    filters,
    
    // Actions
    fetchAttendanceData,
    fetchShifts,
    fetchEmployeeAssignments,
    fetchEmployees,
    createShift,
    updateShift,
    deleteShift,
    assignShiftToEmployee,
    exportAttendanceData,
    updateFilters,
    refreshData,
    
    // Permissions
    hasAdminAccess,
    canManageShifts: hasAdminAccess(),
    canViewReports: hasAdminAccess(),
    
    // User info
    currentUser: user,
    isAuthenticated
  };

  return (
    <AdminAttendanceContext.Provider value={value}>
      {children}
    </AdminAttendanceContext.Provider>
  );
};