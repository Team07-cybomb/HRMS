// src/hooks/useAttendance.js
import { useState, useCallback } from 'react';
import { attendanceApi } from '../lib/attendanceApi';
import { toast } from '@/components/ui/use-toast';

export const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await attendanceApi.getAttendance(filters);
      setAttendance(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance data',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = useCallback(async (data) => {
    try {
      const response = await attendanceApi.checkIn(data);
      toast({
        title: 'Success',
        description: 'Checked in successfully',
      });
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check in',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const checkOut = useCallback(async (data) => {
    try {
      const response = await attendanceApi.checkOut(data);
      toast({
        title: 'Success',
        description: 'Checked out successfully',
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check out',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

// In useAttendance.js - ensure getTodayAttendance is properly implemented
const getTodayAttendance = useCallback(async (employeeId) => {
  try {
    console.log('Calling getTodayAttendance for:', employeeId);
    const response = await attendanceApi.getTodayAttendance(employeeId);
    console.log('getTodayAttendance response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getTodayAttendance:', error);
    
    // Don't throw error for 404 - it just means no record exists
    if (error.response?.status === 404) {
      console.log('No attendance record found (404)');
      return null;
    }
    
    throw error;
  }
}, []);

  return {
    attendance,
    loading,
    fetchAttendance,
    checkIn,
    checkOut,
    getTodayAttendance,
  };
};