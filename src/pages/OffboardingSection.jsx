import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
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
  Edit
} from 'lucide-react';

const OffboardingForm = ({ employees, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    reason: '',
    lastWorkingDay: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Select onValueChange={(value) => handleSelectChange('employeeId', value)} value={formData.employeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select an employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.id})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="reason">Reason for Leaving</Label>
        <Select onValueChange={(value) => handleSelectChange('reason', value)} value={formData.reason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resignation">Resignation</SelectItem>
            <SelectItem value="termination">Termination</SelectItem>
            <SelectItem value="retirement">Retirement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="lastWorkingDay">Last Working Day</Label>
        <Input id="lastWorkingDay" name="lastWorkingDay" type="date" value={formData.lastWorkingDay} onChange={handleChange} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Start Offboarding</Button>
      </DialogFooter>
    </form>
  );
};

const OffboardingDetailsModal = ({ employee, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(employee.status);
  const [notes, setNotes] = useState('');

  const handleUpdateStatus = () => {
    onUpdateStatus(employee.id, newStatus, notes);
    onClose();
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Offboarding Details - {employee.name}</DialogTitle>
        <DialogDescription>View and manage offboarding progress for this employee.</DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Position</Label>
            <p className="text-sm text-gray-900">{employee.position}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Department</Label>
            <p className="text-sm text-gray-900">{employee.department}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Last Working Day</Label>
            <p className="text-sm text-gray-900">{employee.lastWorkingDay}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Reason</Label>
            <p className="text-sm text-gray-900 capitalize">{employee.reason}</p>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">Progress</Label>
          <Progress value={employee.progress} className="h-3" />
          <p className="text-xs text-gray-500 mt-1">{employee.completedSteps}/{employee.totalSteps} steps completed</p>
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
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes about the status update..." />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handleUpdateStatus}>Update Status</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const StepConfigModal = ({ step, onSave, onClose }) => {
  const [stepData, setStepData] = useState({
    name: step?.name || '',
    description: step?.description || '',
    required: step?.required || true,
    estimatedDays: step?.estimatedDays || 1,
  });

  const handleSave = () => {
    onSave({ ...step, ...stepData });
    onClose();
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
          <Input id="stepName" value={stepData.name} onChange={(e) => setStepData(prev => ({ ...prev, name: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="stepDescription">Description</Label>
          <Textarea id="stepDescription" value={stepData.description} onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="estimatedDays">Estimated Days</Label>
          <Input id="estimatedDays" type="number" value={stepData.estimatedDays} onChange={(e) => setStepData(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) }))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Step</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const OffboardingSection = () => {
  const { offboarding: offboardingApi, employees: employeesApi } = useAppContext();
  const [activeTab, setActiveTab] = useState('active');
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [configuringStep, setConfiguringStep] = useState(null);

  const offboardingEmployees = offboardingApi.getAll();
  const activeEmployees = employeesApi.getAll().filter(e => e.status === 'active');

  const handleStartOffboarding = (offboardingData) => {
    const employee = employeesApi.getById(offboardingData.employeeId);
    if (!employee) {
      toast({ title: 'Error', description: 'Selected employee not found.', variant: 'destructive' });
      return;
    }

    const newOffboarding = {
      ...offboardingData,
      name: employee.name,
      email: employee.email,
      position: employee.designation,
      department: employee.department,
      progress: 14,
      status: 'in-progress',
      currentStep: 'Resignation/Termination',
      completedSteps: 1,
      totalSteps: 7,
      assignedTo: 'HR Manager'
    };
    offboardingApi.add(newOffboarding);
    toast({ title: 'Offboarding Started', description: `Offboarding process has been initiated for ${employee.name}.` });
    setModalOpen(false);
  };

  const handleViewDetails = (employee) => {
    setViewingEmployee(employee);
  };

  const handleGenerateFF = (employee) => {
    toast({ title: 'F&F Generated', description: `Full and Final settlement document has been generated for ${employee.name}.` });
  };

  const handleUpdateStatus = (employeeId, newStatus, notes) => {
    const employee = offboardingApi.getById(employeeId);
    const updatedEmployee = { ...employee, status: newStatus, notes };
    offboardingApi.update(employeeId, updatedEmployee);
    toast({ title: 'Status Updated', description: `Offboarding status has been updated to ${newStatus.replace('-', ' ')}.` });
  };

  const handleConfigureStep = (step) => {
    setConfiguringStep(step);
  };

  const handleSaveStep = (stepData) => {
    toast({ title: 'Step Configured', description: `The step "${stepData.name}" has been configured successfully.` });
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

  const completedOffboarding = [
    {
      id: 'OFF004',
      name: 'Amanda Johnson',
      email: 'amanda.johnson@company.com',
      position: 'HR Specialist',
      department: 'Human Resources',
      completedDate: '2024-12-20',
      reason: 'resignation',
      duration: '14 days',
      assignedTo: 'Lisa Anderson'
    },
  ];

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActiveOffboarding = () => (
    <div className="space-y-6">
      {offboardingEmployees.map((employee, index) => (
        <motion.div
          key={employee.id}
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
                  <p className="text-xs text-gray-400 mt-1">Last Working Day: {employee.lastWorkingDay}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className={getReasonColor(employee.reason)}>
                  {employee.reason}
                </Badge>
                <Badge className={getStatusColor(employee.status)}>
                  {employee.status.replace('-', ' ')}
                </Badge>
                <button
                  onClick={() => toast({ title: 'Offboarding Options', description: 'Additional options menu opened.' })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
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
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-900">{employee.email}</p>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(employee)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

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
                    handleConfigureStep(step);
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
                    handleConfigureStep(step);
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

  const renderCompletedOffboarding = () => (
    <div className="space-y-4">
      {completedOffboarding.map((employee, index) => (
        <motion.div
          key={employee.id}
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
                  <Badge className={`mt-1 ${getReasonColor(employee.reason)}`}>
                    {employee.reason}
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Completed: {employee.completedDate}</p>
                <p className="text-xs text-gray-500">Duration: {employee.duration}</p>
                <p className="text-xs text-gray-500">By: {employee.assignedTo}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Offboarding - HRMS Pro</title>
        <meta name="description" content="Manage employee offboarding process with automated workflows, asset recovery, and final settlement calculations in HRMS Pro" />
      </Helmet>

      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Offboarding</DialogTitle>
            <DialogDescription>Select an employee to begin the offboarding process.</DialogDescription>
          </DialogHeader>
          <OffboardingForm employees={activeEmployees} onSave={handleStartOffboarding} onCancel={() => setModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        {viewingEmployee && (
          <OffboardingDetailsModal
            employee={viewingEmployee}
            onClose={() => setViewingEmployee(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </Dialog>

      <Dialog open={!!configuringStep} onOpenChange={() => setConfiguringStep(null)}>
        {configuringStep && (
          <StepConfigModal
            step={configuringStep}
            onSave={handleSaveStep}
            onClose={() => setConfiguringStep(null)}
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
                <p className="text-2xl font-bold text-gray-900">{offboardingEmployees.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedOffboarding.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {offboardingEmployees.filter(e => e.status === 'pending-final').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">12 days</p>
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