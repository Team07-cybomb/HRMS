// src/hooks/useTimesheets.js
import { useState, useEffect } from 'react';
import { attendanceApi } from '../lib/attendanceApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export const useTimesheets = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimesheets = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getTimesheets(filters);
      setTimesheets(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch timesheets';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: 'Failed to fetch timesheets',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitTimesheet = async (timesheetData) => {
    try {
      const response = await attendanceApi.submitTimesheet(timesheetData);
      toast({
        title: 'Success',
        description: 'Timesheet submitted successfully',
      });
      await fetchTimesheets(); // Refresh the list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit timesheet';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateTimesheetStatus = async (id, status) => {
    try {
      const response = await attendanceApi.updateTimesheetStatus(id, { status });
      toast({
        title: 'Success',
        description: `Timesheet ${status} successfully`,
      });
      await fetchTimesheets(); // Refresh the list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update timesheet';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const getTimesheetById = async (id) => {
    try {
      setLoading(true);
      // Since we don't have a specific endpoint for this, we'll filter from the current list
      if (timesheets.length === 0) {
        await fetchTimesheets();
      }
      const timesheet = timesheets.find(ts => ts._id === id);
      if (!timesheet) {
        throw new Error('Timesheet not found');
      }
      return timesheet;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch timesheet';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const reset = () => {
    setTimesheets([]);
    setLoading(false);
    setError(null);
  };

  return {
    // State
    timesheets,
    loading,
    error,
    
    // Actions
    fetchTimesheets,
    submitTimesheet,
    updateTimesheetStatus,
    getTimesheetById,
    
    // Utilities
    clearError,
    reset,
  };
};

export default useTimesheets;