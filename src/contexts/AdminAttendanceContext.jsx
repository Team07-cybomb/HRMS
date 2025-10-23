import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

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
  const hasFetchedInitialData = useRef(false);

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
  const hasAdminAccess = useCallback(() => {
    if (!isAuthenticated || !user) return false;
    return can('view:all_attendance') || ['hr', 'employer', 'admin'].includes(user.role);
  }, [isAuthenticated, user, can]);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
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
  }, [hasAdminAccess]);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async (params = {}) => {
    if (!hasAdminAccess()) return;

    setLoading(prev => ({ ...prev, attendance: true }));
    try {
      const queryParams = new URLSearchParams({
        date: filters.date.toISOString().split('T')[0],
        includeAbsent: 'true',
        ...params
      });

      const data = await apiCall(`/admin/attendance/data?${queryParams}`);
      
      // Process data to ensure proper employee names
      let processedData = [];
      
      // Handle different response formats
      if (data && data.attendance && Array.isArray(data.attendance)) {
        processedData = data.attendance.map(record => {
          // Find employee in employees list to get proper name
          const employee = employees.find(emp => 
            emp._id === record.employeeId || 
            emp._id === record.employeeId?._id
          );
          
          return {
            ...record,
            employeeId: record.employeeId?._id || record.employeeId,
            employeeName: employee?.name || record.employeeName || record.employee || 'Unknown Employee',
            employee: employee?.name || record.employeeName || record.employee || 'Unknown Employee'
          };
        });
      } else if (Array.isArray(data)) {
        processedData = data.map(record => {
          const employee = employees.find(emp => 
            emp._id === record.employeeId || 
            emp._id === record.employeeId?._id
          );
          
          return {
            ...record,
            employeeId: record.employeeId?._id || record.employeeId,
            employeeName: employee?.name || record.employeeName || record.employee || 'Unknown Employee',
            employee: employee?.name || record.employeeName || record.employee || 'Unknown Employee'
          };
        });
      } else {
        console.warn('Unexpected API response format:', data);
        processedData = [];
      }
      
      setAttendanceData(processedData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Failed to load attendance data",
        description: error.message,
        variant: "destructive"
      });
      setAttendanceData([]); // Set empty array on error
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  }, [hasAdminAccess, filters.date, filters.department, filters.status, employees]);

  // Fetch detailed attendance record
  const fetchAttendanceDetails = useCallback(async (attendanceId) => {
    if (!hasAdminAccess()) {
      throw new Error('No permission to fetch attendance details');
    }

    try {
      // Check if it's an absent record ID format
      if (attendanceId.startsWith('absent-')) {
        // Extract employee ID and date from absent record ID
        const parts = attendanceId.split('-');
        const employeeId = parts[1];
        const date = parts[2];
        
        // Fetch employee details
        const employee = employees.find(emp => emp._id === employeeId);
        if (!employee) {
          throw new Error('Employee not found');
        }

        // Return absent record structure
        return {
          _id: attendanceId,
          employeeId: employeeId,
          employeeName: employee.name,
          employee: employee,
          date: date,
          checkIn: null,
          checkOut: null,
          status: 'absent',
          checkInPhoto: null,
          checkOutPhoto: null,
          checkInLocation: null,
          checkOutLocation: null,
          duration: '0h 0m',
          shiftName: 'General Shift',
          notes: 'Employee was absent'
        };
      }

      // Fetch actual attendance record from API
      const response = await apiCall(`/admin/attendance/${attendanceId}`);
      return response;
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      
      // Fallback: try to find in existing attendance data
      const existingRecord = attendanceData.find(record => record._id === attendanceId);
      if (existingRecord) {
        return existingRecord;
      }
      
      throw new Error('Attendance record not found');
    }
  }, [hasAdminAccess, employees, attendanceData]);

  // Fetch shifts
  const fetchShifts = useCallback(async () => {
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
  }, [hasAdminAccess]);

  // Fetch employee assignments
  const fetchEmployeeAssignments = useCallback(async () => {
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
  }, [hasAdminAccess]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    if (!hasAdminAccess()) return;

    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const employeesData = await apiCall('/employees');
      
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
  }, [hasAdminAccess]);

  // Create shift
  const createShift = useCallback(async (shiftData) => {
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
  }, [hasAdminAccess]);

  // Update shift
  const updateShift = useCallback(async (shiftId, shiftData) => {
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
  }, [hasAdminAccess]);

  // Delete shift
  const deleteShift = useCallback(async (shiftId) => {
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
  }, [hasAdminAccess]);

  // Assign shift to employee
  const assignShiftToEmployee = useCallback(async (assignmentData) => {
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
  }, [hasAdminAccess]);

  // Update employee assignment
  const updateEmployeeAssignment = useCallback(async (assignmentId, updateData) => {
    if (!hasAdminAccess()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update assignments",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, assignments: true }));
    try {
      const updatedAssignment = await apiCall(`/admin/shifts/assignments/${assignmentId}`, {
        method: 'PUT',
        body: updateData
      });
      
      // PROPERLY UPDATE THE ASSIGNMENTS LIST
      setEmployeeAssignments(prev => prev.map(assignment => {
        if (assignment._id === assignmentId) {
          return { 
            ...assignment, 
            ...updatedAssignment,
            // Ensure nested objects are properly merged
            employeeId: updatedAssignment.employeeId || assignment.employeeId,
            shiftId: updatedAssignment.shiftId || assignment.shiftId
          };
        }
        return assignment;
      }));
      
      toast({
        title: "Assignment updated successfully",
        description: "Shift assignment has been updated"
      });
      
      return updatedAssignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Failed to update assignment",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, [hasAdminAccess]);

  // Remove employee assignment
  const removeEmployeeAssignment = useCallback(async (assignmentId) => {
    if (!hasAdminAccess()) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to remove assignments",
        variant: "destructive"
      });
      return;
    }

    setLoading(prev => ({ ...prev, assignments: true }));
    try {
      await apiCall(`/admin/shifts/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      
      setEmployeeAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
      toast({
        title: "Assignment removed successfully",
        description: "Shift assignment has been removed"
      });
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Failed to remove assignment",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, assignments: false }));
    }
  }, [hasAdminAccess]);

  // Export attendance data
  const exportAttendanceData = useCallback(async (params = {}) => {
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
  }, [hasAdminAccess]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!hasAdminAccess()) return;
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchAttendanceData(),
        fetchShifts(),
        fetchEmployeeAssignments(),
        fetchEmployees()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [hasAdminAccess, fetchDashboardStats, fetchAttendanceData, fetchShifts, fetchEmployeeAssignments, fetchEmployees]);

  // Effect to fetch initial data when component mounts
  useEffect(() => {
    if (hasAdminAccess() && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      // Fetch employees first since other functions depend on it
      fetchEmployees().then(() => {
        fetchDashboardStats();
        fetchAttendanceData();
        fetchShifts();
        fetchEmployeeAssignments();
      });
    }
  }, [isAuthenticated, hasAdminAccess, fetchEmployees, fetchDashboardStats, fetchAttendanceData, fetchShifts, fetchEmployeeAssignments]);

  // Effect to refetch attendance data when filters change
  useEffect(() => {
    if (hasAdminAccess() && employees.length > 0 && hasFetchedInitialData.current) {
      fetchAttendanceData();
    }
  }, [filters.date, filters.department, filters.status, employees.length, hasAdminAccess, fetchAttendanceData]);

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
    fetchAttendanceDetails,
    fetchShifts,
    fetchEmployeeAssignments,
    fetchEmployees,
    createShift,
    updateShift,
    deleteShift,
    assignShiftToEmployee,
    updateEmployeeAssignment,
    removeEmployeeAssignment,
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