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

  const getTodayAttendance = useCallback(async (employeeId) => {
    try {
      const response = await attendanceApi.getTodayAttendance(employeeId);
      return response.data;
    } catch (error) {
      console.error('Error fetching today attendance:', error);
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