import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserMinus,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Shield,
  Briefcase,
  Calendar,
  MoreVertical,
  DollarSign,
  Eye,
  RefreshCw,
  Settings,
  Edit,
  Loader2,
  Trash2,
  Package
} from 'lucide-react';
import { offboardingService } from '../lib/offboardingService';
import { employeeService } from '../lib/employeeService';
const OffboardingForm = ({ employees, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    reason: '',
    lastWorkingDay: '',
    assignedTo: 'HR Manager',
    notes: ''
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    setSelectedEmployee(employee);
    setFormData(prev => ({ ...prev, employeeId }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.employeeId || !formData.reason || !formData.lastWorkingDay) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    onSave(formData);
  };

  // Set default last working day to today + 30 days
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      lastWorkingDay: defaultDate.toISOString().split('T')[0]
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee *</Label>
        <Select 
          onValueChange={handleEmployeeSelect} 
          value={formData.employeeId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an employee">
              {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.employeeId}) - ${selectedEmployee.department}` : 'Select an employee'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {employees.map(emp => (
              <SelectItem 
                key={emp.employeeId || emp.id} 
                value={emp.employeeId || emp.id}
              >
                {emp.name} ({emp.employeeId || emp.id}) - {emp.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEmployee && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Position:</span> {selectedEmployee.designation || selectedEmployee.position}
              </div>
              <div>
                <span className="font-medium">Email:</span> {selectedEmployee.email}
              </div>
              <div>
                <span className="font-medium">Department:</span> {selectedEmployee.department}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <Badge variant="outline" className="ml-1 capitalize">
                  {selectedEmployee.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="reason">Reason for Leaving *</Label>
        <Select 
          onValueChange={(value) => handleSelectChange('reason', value)} 
          value={formData.reason}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resignation">Resignation</SelectItem>
            <SelectItem value="termination">Termination</SelectItem>
            <SelectItem value="retirement">Retirement</SelectItem>
            <SelectItem value="end-of-contract">End of Contract</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="lastWorkingDay">Last Working Day *</Label>
        <Input 
          id="lastWorkingDay" 
          name="lastWorkingDay" 
          type="date" 
          value={formData.lastWorkingDay} 
          onChange={handleChange} 
          required 
        />
        <p className="text-xs text-gray-500 mt-1">
          Selected: {formData.lastWorkingDay ? new Date(formData.lastWorkingDay).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'No date selected'}
        </p>
      </div>
      
      <div>
        <Label htmlFor="assignedTo">Assigned To</Label>
        <Select 
          onValueChange={(value) => handleSelectChange('assignedTo', value)} 
          value={formData.assignedTo}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HR Manager">HR Manager</SelectItem>
            <SelectItem value="Department Head">Department Head</SelectItem>
            <SelectItem value="Team Lead">Team Lead</SelectItem>
            <SelectItem value="IT Department">IT Department</SelectItem>
            <SelectItem value="Payroll Department">Payroll Department</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="notes">Initial Notes</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          placeholder="Any initial notes about the offboarding..."
          rows={3}
        />
      </div>
      
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.employeeId}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Start Offboarding
        </Button>
      </DialogFooter>
    </form>
  );
};

const OffboardingDetailsModal = ({ employee, onClose, onUpdateStatus, onCompleteStep, isLoading }) => {
  const [newStatus, setNewStatus] = useState(employee.status);
  const [notes, setNotes] = useState(employee.notes || '');
  const [activeStep, setActiveStep] = useState('overview');

  const handleUpdateStatus = () => {
    onUpdateStatus(employee.employeeId, newStatus, notes);
  };

  const handleCompleteStep = (stepId) => {
    onCompleteStep(employee.employeeId, stepId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending-final': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (completed) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Offboarding Details - {employee.name}</DialogTitle>
        <DialogDescription>View and manage offboarding progress for this employee.</DialogDescription>
      </DialogHeader>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'steps', 'assets', 'settlement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStep(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeStep === tab
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeStep === 'overview' && (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
              <p className="text-sm text-gray-900">{employee.employeeId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Position</Label>
              <p className="text-sm text-gray-900">{employee.position}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Department</Label>
              <p className="text-sm text-gray-900">{employee.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Email</Label>
              <p className="text-sm text-gray-900">{employee.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Last Working Day</Label>
              <p className="text-sm text-gray-900">{formatDate(employee.lastWorkingDay)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Reason</Label>
              <p className="text-sm text-gray-900 capitalize">{employee.reason}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
              <p className="text-sm text-gray-900">{employee.assignedTo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Start Date</Label>
              <p className="text-sm text-gray-900">{formatDate(employee.startDate)}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Progress</Label>
            <Progress value={employee.progress} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">
              {employee.completedSteps}/{employee.totalSteps} steps completed ({employee.progress}%)
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Current Step</Label>
            <p className="text-sm text-gray-900 font-medium">{employee.currentStep}</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-600">Update Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending-final">Pending Final Settlement</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add any notes about the status update..." 
              rows={4}
            />
          </div>
        </div>
      )}

      {activeStep === 'steps' && (
        <div className="space-y-4 py-4">
          <h3 className="text-lg font-medium text-gray-900">Offboarding Steps</h3>
          <div className="space-y-3">
            {employee.steps?.map((step) => (
              <Card key={step.stepId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${step.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Assigned to: {step.assignedTo}
                        {step.completedAt && ` • Completed: ${formatDate(step.completedAt)}`}
                      </p>
                      {step.notes && (
                        <p className="text-xs text-gray-600 mt-1">Notes: {step.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStepStatusColor(step.completed)}>
                      {step.completed ? 'Completed' : 'Pending'}
                    </Badge>
                    {!step.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteStep(step.stepId)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Complete'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeStep === 'assets' && (
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Asset Recovery</h3>
            <Button size="sm" variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
          {employee.assets?.length > 0 ? (
            <div className="space-y-3">
              {employee.assets.map((asset, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{asset.name}</h4>
                      <p className="text-sm text-gray-500">{asset.type} • {asset.serialNumber}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Assigned: {formatDate(asset.assignedDate)}
                        {asset.returnedDate && ` • Returned: ${formatDate(asset.returnedDate)}`}
                      </p>
                      {asset.condition && (
                        <p className="text-xs text-gray-600 mt-1">Condition: {asset.condition}</p>
                      )}
                    </div>
                    <Badge variant={asset.returnedDate ? "default" : "secondary"}>
                      {asset.returnedDate ? 'Returned' : 'Pending Return'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Assets Assigned</h4>
              <p className="text-gray-500">No company assets are assigned to this employee.</p>
            </Card>
          )}
        </div>
      )}

      {activeStep === 'settlement' && (
        <div className="space-y-4 py-4">
          <h3 className="text-lg font-medium text-gray-900">Final Settlement</h3>
          {employee.finalSettlement ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Salary</Label>
                <p className="text-sm text-gray-900">${employee.finalSettlement.lastSalary?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Pending Leaves</Label>
                <p className="text-sm text-gray-900">{employee.finalSettlement.pendingLeaves} days</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Leave Encashment</Label>
                <p className="text-sm text-gray-900">${employee.finalSettlement.leaveEncashment?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Notice Pay</Label>
                <p className="text-sm text-gray-900">${employee.finalSettlement.noticePay?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Deductions</Label>
                <p className="text-sm text-gray-900">${employee.finalSettlement.deductions?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Total Settlement</Label>
                <p className="text-lg font-bold text-green-600">
                  ${employee.finalSettlement.totalSettlement?.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-600">Settlement Status</Label>
                <Badge className={getStatusColor(employee.finalSettlement.settlementStatus)}>
                  {employee.finalSettlement.settlementStatus}
                </Badge>
                {employee.finalSettlement.settlementDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Settlement Date: {formatDate(employee.finalSettlement.settlementDate)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Settlement Not Calculated</h4>
              <p className="text-gray-500">Final settlement has not been calculated yet.</p>
            </Card>
          )}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Close
        </Button>
        <Button onClick={handleUpdateStatus} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Update Status
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const StepConfigModal = ({ step, onSave, onClose, isLoading }) => {
  const [stepData, setStepData] = useState({
    name: step?.name || '',
    description: step?.description || '',
    required: step?.required || true,
    estimatedDays: step?.estimatedDays || 1,
  });

  const handleSave = () => {
    onSave({ ...step, ...stepData });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{step ? 'Configure Step' : 'Add Step'}</DialogTitle>
        <DialogDescription>Configure the offboarding step details and requirements.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="stepName">Step Name</Label>
          <Input 
            id="stepName" 
            value={stepData.name} 
            onChange={(e) => setStepData(prev => ({ ...prev, name: e.target.value }))} 
          />
        </div>
        <div>
          <Label htmlFor="stepDescription">Description</Label>
          <Textarea 
            id="stepDescription" 
            value={stepData.description} 
            onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))} 
          />
        </div>
        <div>
          <Label htmlFor="estimatedDays">Estimated Days</Label>
          <Input 
            id="estimatedDays" 
            type="number" 
            min="1"
            value={stepData.estimatedDays} 
            onChange={(e) => setStepData(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) || 1 }))} 
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Step
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// In OffboardingSection.jsx - Replace the entire component with this corrected version

const OffboardingSection = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [configuringStep, setConfiguringStep] = useState(null);
  const [offboardingEmployees, setOffboardingEmployees] = useState([]);
  const [completedOffboarding, setCompletedOffboarding] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pendingFinal: 0,
    avgDuration: 0
  });
  const [loading, setLoading] = useState({
    page: true,
    start: false,
    update: false,
    completeStep: false,
    employees: true
  });

  // Define fetchOffboardingData function properly
  const fetchOffboardingData = async () => {
    try {
      setLoading(prev => ({ ...prev, page: true }));
      
      const [offboardingData, statsData] = await Promise.all([
        offboardingService.getAll(),
        offboardingService.getStats()
      ]);

      setOffboardingEmployees(offboardingData.filter(emp => emp.status !== 'completed'));
      setCompletedOffboarding(offboardingData.filter(emp => emp.status === 'completed'));
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching offboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load offboarding data',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };

  const fetchActiveEmployees = async () => {
    try {
      setLoading(prev => ({ ...prev, employees: true }));
      
      // Using employeeService to fetch from backend
      const activeEmps = await employeeService.getActiveEmployees();
      setActiveEmployees(activeEmps);
      
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load employee data',
        variant: 'destructive'
      });
      // Fallback to empty array
      setActiveEmployees([]);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  // Fetch offboarding data and employees
  useEffect(() => {
    fetchOffboardingData();
    fetchActiveEmployees();
  }, []);

  const handleStartOffboarding = async (offboardingData) => {
    try {
      setLoading(prev => ({ ...prev, start: true }));
      
      // Find the selected employee to get complete details
      const selectedEmployee = activeEmployees.find(emp => emp.employeeId === offboardingData.employeeId);
      
      if (!selectedEmployee) {
        toast({
          title: 'Error',
          description: 'Selected employee not found',
          variant: 'destructive'
        });
        return;
      }

      // Prepare complete offboarding data
      const completeOffboardingData = {
        ...offboardingData,
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        position: selectedEmployee.designation || selectedEmployee.position,
        department: selectedEmployee.department,
        startDate: new Date().toISOString()
      };

      await offboardingService.start(completeOffboardingData);
      
      toast({ 
        title: 'Offboarding Started', 
        description: `Offboarding process has been initiated for ${selectedEmployee.name}.` 
      });
      
      setModalOpen(false);
      await fetchOffboardingData(); // This should work now
      await fetchActiveEmployees(); // Refresh employees list
    } catch (error) {
      console.error('Error starting offboarding:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to start offboarding process',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, start: false }));
    }
  };

  const handleViewDetails = (employee) => {
    setViewingEmployee(employee);
  };

  const handleGenerateFF = async (employee) => {
    try {
      await offboardingService.updateSettlement(employee.employeeId, {
        settlementStatus: 'calculated'
      });
      
      toast({ 
        title: 'F&F Generated', 
        description: `Full and Final settlement has been calculated for ${employee.name}.` 
      });
      
      await fetchOffboardingData(); // This should work now
    } catch (error) {
      console.error('Error generating F&F:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate F&F settlement',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (employeeId, newStatus, notes) => {
    try {
      setLoading(prev => ({ ...prev, update: true }));
      
      await offboardingService.updateStatus(employeeId, {
        status: newStatus,
        notes
      });
      
      toast({ 
        title: 'Status Updated', 
        description: `Offboarding status has been updated to ${newStatus.replace('-', ' ')}.` 
      });
      
      setViewingEmployee(null);
      await fetchOffboardingData(); // This should work now
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update offboarding status',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleCompleteStep = async (employeeId, stepId) => {
    try {
      setLoading(prev => ({ ...prev, completeStep: true }));
      
      await offboardingService.completeStep(employeeId, { stepId });
      
      toast({ 
        title: 'Step Completed', 
        description: 'Offboarding step marked as completed.' 
      });
      
      await fetchOffboardingData(); // This should work now
      
      // Update viewing employee data if modal is open
      if (viewingEmployee) {
        const updatedEmployee = await offboardingService.getByEmployeeId(employeeId);
        setViewingEmployee(updatedEmployee);
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete step',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, completeStep: false }));
    }
  };

  const handleCompleteOffboarding = async (employeeId) => {
    try {
      await offboardingService.complete(employeeId);
      
      toast({ 
        title: 'Offboarding Completed', 
        description: 'Offboarding process has been completed successfully.' 
      });
      
      await fetchOffboardingData(); // This should work now
    } catch (error) {
      console.error('Error completing offboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete offboarding',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteOffboarding = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this offboarding record?')) {
      return;
    }

    try {
      await offboardingService.delete(employeeId);
      
      toast({ 
        title: 'Record Deleted', 
        description: 'Offboarding record has been deleted.' 
      });
      
      await fetchOffboardingData(); // This should work now
    } catch (error) {
      console.error('Error deleting offboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete offboarding record',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-final':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'resignation':
        return 'bg-blue-100 text-blue-800';
      case 'termination':
        return 'bg-red-100 text-red-800';
      case 'retirement':
        return 'bg-green-100 text-green-800';
      case 'end-of-contract':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const offboardingSteps = [
    { id: 1, name: 'Resignation/Termination', icon: FileText, description: 'Process resignation or termination notice', required: true, estimatedDays: 1 },
    { id: 2, name: 'Asset Recovery', icon: Briefcase, description: 'Collect company assets and equipment', required: true, estimatedDays: 2 },
    { id: 3, name: 'Knowledge Handover', icon: User, description: 'Transfer responsibilities and knowledge', required: true, estimatedDays: 3 },
    { id: 4, name: 'Final Timesheet', icon: Clock, description: 'Submit and approve final timesheet', required: true, estimatedDays: 1 },
    { id: 5, name: 'Leave Encashment', icon: Calendar, description: 'Calculate unused leave encashment', required: true, estimatedDays: 1 },
    { id: 6, name: 'F&F Calculation', icon: DollarSign, description: 'Calculate full and final settlement', required: true, estimatedDays: 2 },
    { id: 7, name: 'Profile Deactivation', icon: Shield, description: 'Deactivate access and archive profile', required: true, estimatedDays: 1 }
  ];

  const renderActiveOffboarding = () => {
    if (loading.page) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading offboarding data...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {offboardingEmployees.map((employee, index) => (
          <motion.div
            key={employee._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Employee ID: {employee.employeeId} • Last Working Day: {formatDate(employee.lastWorkingDay)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getReasonColor(employee.reason)}>
                    {employee.reason}
                  </Badge>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status.replace('-', ' ')}
                  </Badge>
                  <div className="relative">
                    <button
                      onClick={() => toast({ title: 'Offboarding Options', description: 'Additional options menu opened.' })}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {employee.completedSteps}/{employee.totalSteps} steps completed
                    </span>
                  </div>
                  <Progress value={employee.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Step</p>
                    <p className="text-sm font-medium text-gray-900">{employee.currentStep}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                    <p className="text-sm text-gray-900">{employee.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="text-sm text-gray-900">{calculateDuration(employee.startDate, employee.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(employee)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateFF(employee)}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Generate F&F
                  </Button>
                  {employee.progress === 100 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteOffboarding(employee.employeeId)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        
        {offboardingEmployees.length === 0 && (
          <Card className="p-12 text-center">
            <UserMinus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Offboarding</h3>
            <p className="text-gray-500">Start a new offboarding process to see it here.</p>
            <Button 
              onClick={() => setModalOpen(true)} 
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Offboarding
            </Button>
          </Card>
        )}
      </div>
    );
  };

  const renderOffboardingSteps = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {offboardingSteps.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6 card-hover group relative">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Step {step.id}</span>
                    <h3 className="font-semibold text-gray-900">{step.name}</h3>
                    {step.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <p className="text-xs text-gray-500 mb-3">Estimated: {step.estimatedDays} day{step.estimatedDays > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    // handleConfigureStep(step);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    // handleConfigureStep(step);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderCompletedOffboarding = () => {
    if (loading.page) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {completedOffboarding.map((employee, index) => (
          <motion.div
            key={employee._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getReasonColor(employee.reason)}>
                        {employee.reason}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {calculateDuration(employee.startDate, employee.updatedAt)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Completed: {formatDate(employee.updatedAt)}
                  </p>
                  <p className="text-xs text-gray-500">By: {employee.assignedTo}</p>
                  {employee.finalSettlement?.totalSettlement && (
                    <p className="text-xs font-medium text-green-600 mt-1">
                      Settlement: ${employee.finalSettlement.totalSettlement.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        
        {completedOffboarding.length === 0 && (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Offboarding</h3>
            <p className="text-gray-500">Completed offboarding processes will appear here.</p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Offboarding - HRMS Pro</title>
        <meta name="description" content="Manage employee offboarding process with automated workflows, asset recovery, and final settlement calculations in HRMS Pro" />
      </Helmet>

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start New Offboarding</DialogTitle>
            <DialogDescription>
              Select an employee to begin the offboarding process. Only active employees are shown.
            </DialogDescription>
          </DialogHeader>
          {loading.employees ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
              <span>Loading employees...</span>
            </div>
          ) : (
            <OffboardingForm 
              employees={activeEmployees} 
              onSave={handleStartOffboarding} 
              onCancel={() => setModalOpen(false)}
              isLoading={loading.start}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        {viewingEmployee && (
          <OffboardingDetailsModal
            employee={viewingEmployee}
            onClose={() => setViewingEmployee(null)}
            onUpdateStatus={handleUpdateStatus}
            onCompleteStep={handleCompleteStep}
            isLoading={loading.update || loading.completeStep}
          />
        )}
      </Dialog>

      <Dialog open={!!configuringStep} onOpenChange={() => setConfiguringStep(null)}>
        {configuringStep && (
          <StepConfigModal
            step={configuringStep}
            onSave={() => {}}
            onClose={() => setConfiguringStep(null)}
            isLoading={false}
          />
        )}
      </Dialog>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offboarding</h1>
            <p className="text-gray-600 mt-2">Manage employee exits with structured offboarding workflows</p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Offboarding
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending F&F</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingFinal}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDuration} days</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'active', label: 'Active Offboarding', icon: Clock },
                { id: 'steps', label: 'Offboarding Steps', icon: FileText },
                { id: 'completed', label: 'Completed', icon: CheckCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'active' && renderActiveOffboarding()}
          {activeTab === 'steps' && renderOffboardingSteps()}
          {activeTab === 'completed' && renderCompletedOffboarding()}
        </motion.div>
      </div>
    </>
  );
};

export default OffboardingSection;