// src/hooks/useManualRequests.js
import { useState, useEffect } from 'react';
import { attendanceApi } from '../lib/attendanceApi';
import { toast } from '@/components/ui/use-toast';

export const useManualRequests = () => {
  const [manualRequests, setManualRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all manual requests (for HR/Admin)
  const fetchManualRequests = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getManualRequests(filters);
      setManualRequests(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch manual requests';
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

  // Fetch manual requests for a specific employee
  const fetchEmployeeManualRequests = async (employeeId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getEmployeeManualRequests(employeeId);
      setManualRequests(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch employee manual requests';
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

  // Create a new manual request
  const createManualRequest = async (requestData) => {
    try {
      setLoading(true);
      const response = await attendanceApi.createManualRequest(requestData);
      toast({
        title: 'Success',
        description: 'Manual request submitted successfully',
      });
      // Refresh the list if we're viewing employee requests
      if (manualRequests.length > 0 && manualRequests[0].employeeId === requestData.employeeId) {
        await fetchEmployeeManualRequests(requestData.employeeId);
      }
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit manual request';
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        if (err.response.data.message?.includes('already exists')) {
          toast({
            title: 'Duplicate Request',
            description: 'You already have a pending request for this date',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Validation Error',
            description: err.response.data.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve a manual request (HR/Admin only)
  const approveRequest = async (id) => {
    try {
      setLoading(true);
      const response = await attendanceApi.approveManualRequest(id);
      toast({
        title: 'Success',
        description: 'Request approved successfully',
      });
      await fetchManualRequests(); // Refresh the list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to approve request';
      
      if (err.response?.status === 400) {
        if (err.response.data.message?.includes('already exists')) {
          toast({
            title: 'Attendance Exists',
            description: 'Attendance record already exists for this date. The request was approved but no new attendance was created.',
            variant: 'warning',
          });
          await fetchManualRequests(); // Still refresh the list
          return;
        } else {
          toast({
            title: 'Cannot Approve',
            description: err.response.data.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject a manual request (HR/Admin only)
  const rejectRequest = async (id, rejectionReason = '') => {
    try {
      setLoading(true);
      const response = await attendanceApi.rejectManualRequest(id, { rejectionReason });
      toast({
        title: 'Success',
        description: 'Request rejected successfully',
      });
      await fetchManualRequests(); // Refresh the list
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject request';
      
      if (err.response?.status === 400) {
        toast({
          title: 'Cannot Reject',
          description: err.response.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a manual request (only for pending requests by the owner)
  const updateManualRequest = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await attendanceApi.updateManualRequest(id, updateData);
      toast({
        title: 'Success',
        description: 'Request updated successfully',
      });
      
      // Refresh the appropriate list
      if (manualRequests.length > 0) {
        if (manualRequests[0].employeeId === updateData.employeeId) {
          await fetchEmployeeManualRequests(updateData.employeeId);
        } else {
          await fetchManualRequests();
        }
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update request';
      
      if (err.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You can only update your own pending requests',
          variant: 'destructive',
        });
      } else if (err.response?.status === 400) {
        toast({
          title: 'Cannot Update',
          description: err.response.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a manual request (only for pending requests by the owner)
  const deleteManualRequest = async (id) => {
    try {
      setLoading(true);
      await attendanceApi.deleteManualRequest(id);
      toast({
        title: 'Success',
        description: 'Request deleted successfully',
      });
      
      // Refresh the current list
      if (manualRequests.length > 0) {
        const currentRequest = manualRequests.find(req => req._id === id);
        if (currentRequest) {
          await fetchManualRequests();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete request';
      
      if (err.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You can only delete your own pending requests',
          variant: 'destructive',
        });
      } else if (err.response?.status === 400) {
        toast({
          title: 'Cannot Delete',
          description: err.response.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get manual request by ID
  const getManualRequestById = async (id) => {
    try {
      setLoading(true);
      // Since we don't have a specific endpoint for this, we'll filter from the current list
      // or fetch all and find the specific one
      if (manualRequests.length === 0) {
        await fetchManualRequests();
      }
      const request = manualRequests.find(req => req._id === id);
      if (!request) {
        throw new Error('Manual request not found');
      }
      return request;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch manual request';
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

  // Get statistics for manual requests
  const getManualRequestStats = () => {
    const stats = {
      total: manualRequests.length,
      pending: manualRequests.filter(req => req.status === 'pending').length,
      approved: manualRequests.filter(req => req.status === 'approved').length,
      rejected: manualRequests.filter(req => req.status === 'rejected').length,
    };
    
    return stats;
  };

  const clearError = () => {
    setError(null);
  };

  const reset = () => {
    setManualRequests([]);
    setLoading(false);
    setError(null);
  };

  return {
    // State
    manualRequests,
    loading,
    error,
    
    // CRUD Operations
    fetchManualRequests,
    fetchEmployeeManualRequests,
    createManualRequest,
    approveRequest,
    rejectRequest,
    updateManualRequest,
    deleteManualRequest,
    getManualRequestById,
    
    // Utilities
    getManualRequestStats,
    clearError,
    reset,
  };
};

export default useManualRequests;