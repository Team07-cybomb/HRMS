import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAdminAttendance } from '@/contexts/AdminAttendanceContext';

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
  Plus,
  Loader2,
  Edit,
  Trash2,
  X,
  Users
} from 'lucide-react';

// Shift Schedule Form Component
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

// Employee Assignment Form Component - FIXED VERSION
const EmployeeAssignmentForm = ({ onSubmit, onCancel, loading, employees, shifts, isEditing, currentAssignment }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [assignmentId, setAssignmentId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when currentAssignment changes
  useEffect(() => {
    if (currentAssignment) {
      console.log('Current assignment data:', currentAssignment);
      
      // For editing, we need to find the employee by employeeId (EMP003)
      if (currentAssignment.employeeId) {
        let employeeToUse = null;
        
        // If employeeId is an object (populated), use it directly
        if (typeof currentAssignment.employeeId === 'object' && currentAssignment.employeeId !== null) {
          employeeToUse = employees.find(emp => 
            emp._id.toString() === currentAssignment.employeeId._id?.toString() || 
            emp.employeeId === currentAssignment.employeeId.employeeId
          );
        } else {
          // If employeeId is a string (EMP003), find the employee
          employeeToUse = employees.find(emp => 
            emp.employeeId === currentAssignment.employeeId
          );
        }
        
        console.log('Found employee for editing:', employeeToUse);
        
        if (employeeToUse) {
          setSelectedEmployee(employeeToUse);
          setFormData(prev => ({
            ...prev,
            employeeId: employeeToUse._id, // Use ObjectId for form display
            shiftId: currentAssignment.shiftId?._id || currentAssignment.shiftId || '',
            effectiveDate: currentAssignment.effectiveDate ? 
              new Date(currentAssignment.effectiveDate).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0],
            endDate: currentAssignment.endDate ? 
              new Date(currentAssignment.endDate).toISOString().split('T')[0] : ''
          }));
        }
      }
      
      setAssignmentId(currentAssignment._id || '');
    } else {
      // Reset for new assignment
      setFormData({
        employeeId: '',
        shiftId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      setSelectedEmployee(null);
      setAssignmentId('');
    }
  }, [currentAssignment, employees]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSelectChange = (name, value) => {
    if (name === 'employeeId') {
      const employee = employees.find(emp => emp._id === value);
      setSelectedEmployee(employee);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate dates
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.effectiveDate)) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after effective date",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // For new assignments, find the employee object
      let finalEmployee = selectedEmployee;
      if (!finalEmployee && formData.employeeId) {
        finalEmployee = employees.find(emp => emp._id === formData.employeeId);
      }

      if (!finalEmployee) {
        toast({
          title: "Employee not found",
          description: "Selected employee could not be found",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare data with proper formats
      const submitData = {
        employeeId: finalEmployee.employeeId, // Use EMP003 string for backend
        employeeName: finalEmployee.name,
        shiftId: formData.shiftId, // Keep as ObjectId string
        effectiveDate: formData.effectiveDate,
        endDate: formData.endDate || null
      };

      console.log('Submitting shift assignment:', submitData);
      await onSubmit(submitData, assignmentId);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display value for employee select
  const getEmployeeDisplayValue = () => {
    if (!formData.employeeId) return '';
    
    if (selectedEmployee) {
      return `${selectedEmployee.name} - ${selectedEmployee.email} (${selectedEmployee.department || 'No Department'}) - ID: ${selectedEmployee.employeeId}`;
    }
    
    // Fallback: try to find employee in the list
    const employee = employees.find(emp => emp._id === formData.employeeId);
    return employee ? 
      `${employee.name} - ${employee.email} (${employee.department || 'No Department'}) - ID: ${employee.employeeId}` : 
      'Employee not found';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee *</Label>
        {isEditing ? (
          // Display only for editing (non-editable)
          <div className="p-3 border rounded-md bg-muted/50">
            <div className="font-medium">
              {selectedEmployee ? 
                `${selectedEmployee.name} - ${selectedEmployee.email} (${selectedEmployee.department || 'No Department'})` : 
                'Loading employee...'
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Employee ID: {selectedEmployee?.employeeId || 'N/A'}
            </div>
            <input type="hidden" name="employeeId" value={formData.employeeId} />
          </div>
        ) : (
          // Select for new assignments
          <Select 
            value={formData.employeeId} 
            onValueChange={(value) => handleSelectChange('employeeId', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee">
                {formData.employeeId && getEmployeeDisplayValue()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.name} - {emp.email} ({emp.department || 'No Department'}) - ID: {emp.employeeId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isEditing && (
          <p className="text-xs text-muted-foreground mt-1">
            Employee cannot be changed when updating assignment
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="shiftId">Shift *</Label>
        <Select 
          value={formData.shiftId} 
          onValueChange={(value) => handleSelectChange('shiftId', value)}
          required
        >
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="effectiveDate">Effective Date *</Label>
          <Input 
            id="effectiveDate" 
            name="effectiveDate" 
            type="date" 
            value={formData.effectiveDate} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input 
            id="endDate" 
            name="endDate" 
            type="date" 
            value={formData.endDate} 
            onChange={handleChange}
            min={formData.effectiveDate}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for indefinite assignment
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Assignment' : 'Assign Shift'}
        </Button>
      </DialogFooter>
    </form>
  );
};

  const ShiftManagement = () => {
    const { 
      shifts,
      employeeAssignments,
      employees,
      loading,
      fetchShifts,
      fetchEmployeeAssignments,
      fetchEmployees,
      createShift,
      updateShift,
      deleteShift,
      assignShiftToEmployee,
      updateEmployeeAssignment,
      hasAdminAccess
    } = useAdminAttendance();

    const [showShiftForm, setShowShiftForm] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if user has permission to manage shifts
    const canManageShifts = hasAdminAccess();

    // Create stable callback functions
    const loadData = useCallback(async () => {
      if (canManageShifts) {
        await fetchShifts();
        await fetchEmployeeAssignments();
        await fetchEmployees();
      }
    }, [canManageShifts, fetchShifts, fetchEmployeeAssignments, fetchEmployees]);

    // Fetch data when component mounts
    useEffect(() => {
      loadData();
    }, [loadData]);

    const handleCreateShift = async (formData) => {
      setIsSubmitting(true);
      try {
        await createShift(formData);
        setShowShiftForm(false);
        toast({
          title: "Shift created successfully",
          description: `Shift "${formData.name}" has been created`
        });
      } catch (error) {
        console.error('Error creating shift:', error);
        toast({
          title: "Failed to create shift",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleUpdateShift = async (formData) => {
      setIsSubmitting(true);
      try {
        await updateShift(editingShift._id, formData);
        setShowShiftForm(false);
        setEditingShift(null);
        toast({
          title: "Shift updated successfully",
          description: `Shift "${formData.name}" has been updated`
        });
      } catch (error) {
        console.error('Error updating shift:', error);
        toast({
          title: "Failed to update shift",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDeleteShift = async (shiftId) => {
      if (!confirm('Are you sure you want to delete this shift? This action cannot be undone.')) {
        return;
      }

      try {
        await deleteShift(shiftId);
        toast({
          title: "Shift deleted successfully",
          description: "The shift has been removed from the system"
        });
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast({
          title: "Failed to delete shift",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    const handleAssignShift = async (formData) => {
      setIsSubmitting(true);
      try {
        await assignShiftToEmployee(formData);
        setShowAssignmentForm(false);
        toast({
          title: "Shift assigned successfully",
          description: "Employee has been assigned to the shift"
        });
      } catch (error) {
        console.error('Error assigning shift:', error);
        toast({
          title: "Failed to assign shift",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleUpdateAssignment = async (formData, assignmentId) => {
      setIsSubmitting(true);
      try {
        await updateEmployeeAssignment(assignmentId, formData);
        setShowAssignmentForm(false);
        setEditingAssignment(null);
        toast({
          title: "Assignment updated successfully",
          description: "Shift assignment has been updated"
        });
      } catch (error) {
        console.error('Error updating assignment:', error);
        toast({
          title: "Failed to update assignment",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleEditShift = (shift) => {
      setEditingShift(shift);
      setShowShiftForm(true);
    };

    const handleEditAssignment = (assignment) => {
      setEditingAssignment(assignment);
      setShowAssignmentForm(true);
    };

    const handleCloseShiftForm = () => {
      setShowShiftForm(false);
      setEditingShift(null);
    };

    const handleCloseAssignmentForm = () => {
      setShowAssignmentForm(false);
      setEditingAssignment(null);
    };

    // Helper function to get employee name - IMPROVED VERSION
    const getEmployeeName = (employeeId) => {
      console.log('Getting employee name for:', employeeId);
      
      // If it's already an object with name (populated data)
      if (typeof employeeId === 'object' && employeeId !== null) {
        return employeeId.name || 'Unknown Employee';
      }
      
      // If it's a string (EMP003 or ObjectId), find in employees array
      const employee = employees.find(emp => {
        // Check by employeeId (EMP003)
        if (emp.employeeId === employeeId) return true;
        // Check by _id (ObjectId)
        if (emp._id === employeeId) return true;
        // Check if employeeId is ObjectId string
        if (emp._id.toString() === employeeId) return true;
        return false;
      });
      
      console.log('Found employee:', employee);
      return employee ? employee.name : 'Unknown Employee';
    };

    // Helper function to get shift name - IMPROVED VERSION
    const getShiftName = (shiftId) => {
      console.log('Getting shift name for:', shiftId);
      
      // If it's already an object with name (populated data)
      if (typeof shiftId === 'object' && shiftId !== null) {
        return shiftId.name || 'Unknown Shift';
      }
      
      // If it's a string (ObjectId), find in shifts array
      const shift = shifts.find(s => {
        if (s._id === shiftId) return true;
        if (s._id.toString() === shiftId) return true;
        return false;
      });
      
      console.log('Found shift:', shift);
      return shift ? shift.name : 'Unknown Shift';
    };

    if (!canManageShifts) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground text-center">
              You do not have permission to manage shifts. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Shift Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shift Schedules</CardTitle>
            <Button onClick={() => setShowShiftForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Shift
            </Button>
          </CardHeader>
          <CardContent>
            {loading.shifts ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts && shifts.length > 0 ? (
                    shifts.map((shift) => (
                      <TableRow key={shift._id}>
                        <TableCell className="font-medium">{shift.name}</TableCell>
                        <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                        <TableCell>{shift.breakDuration} mins</TableCell>
                        <TableCell>
                          <Badge variant={shift.isActive ? "default" : "secondary"}>
                            {shift.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {shift.description || 'No description'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditShift(shift)}
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
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No shifts found. Create your first shift schedule.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Employee Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee Shift Assignments</CardTitle>
            <Button onClick={() => setShowAssignmentForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Shift
            </Button>
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
                    <TableHead>Shift</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeAssignments && employeeAssignments.length > 0 ? (
                    employeeAssignments.map((assignment) => {
                      console.log('Assignment data:', assignment);
                      
                      const isActive = !assignment.endDate || new Date(assignment.endDate) > new Date();
                      const isFuture = new Date(assignment.effectiveDate) > new Date();
                      
                      return (
                        <TableRow key={assignment._id}>
                          <TableCell className="font-medium">
                            {assignment.employeeName || getEmployeeName(assignment.employeeId)}
                            {!assignment.employeeName && (
                              <p className="text-xs text-yellow-600 mt-1">
                                (Using fallback lookup)
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.shiftName || getShiftName(assignment.shiftId)}
                            {!assignment.shiftName && (
                              <p className="text-xs text-yellow-600 mt-1">
                                (Using fallback lookup)
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.effectiveDate ? 
                              new Date(assignment.effectiveDate).toLocaleDateString() : 
                              'Invalid Date'
                            }
                          </TableCell>
                          <TableCell>
                            {assignment.endDate ? 
                              new Date(assignment.endDate).toLocaleDateString() : 
                              'Indefinite'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              isFuture ? 'secondary' : 
                              isActive ? 'default' : 'destructive'
                            }>
                              {isFuture ? 'Future' : isActive ? 'Active' : 'Expired'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAssignment(assignment)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No shift assignments found. Assign shifts to employees.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Shift Form Dialog */}
        <Dialog open={showShiftForm} onOpenChange={handleCloseShiftForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingShift ? 'Edit Shift' : 'Create New Shift'}
              </DialogTitle>
              <DialogDescription>
                {editingShift 
                  ? 'Update the shift schedule details below.' 
                  : 'Create a new shift schedule for employee assignments.'
                }
              </DialogDescription>
            </DialogHeader>
            <ShiftScheduleForm
              onSubmit={editingShift ? handleUpdateShift : handleCreateShift}
              onCancel={handleCloseShiftForm}
              loading={isSubmitting}
              initialData={editingShift}
            />
          </DialogContent>
        </Dialog>

        {/* Assignment Form Dialog */}
        <Dialog open={showAssignmentForm} onOpenChange={handleCloseAssignmentForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? 'Edit Shift Assignment' : 'Assign Shift to Employee'}
              </DialogTitle>
              <DialogDescription>
                {editingAssignment 
                  ? 'Update the shift assignment details below.' 
                  : 'Assign a shift to an employee with effective dates.'
                }
              </DialogDescription>
            </DialogHeader>
            <EmployeeAssignmentForm
              onSubmit={editingAssignment ? handleUpdateAssignment : handleAssignShift}
              onCancel={handleCloseAssignmentForm}
              loading={isSubmitting}
              employees={employees}
              shifts={shifts}
              isEditing={!!editingAssignment}
              currentAssignment={editingAssignment}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  export default ShiftManagement;