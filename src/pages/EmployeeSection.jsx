import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Mail,
  MapPin,
  Edit,
  Eye,
  Trash2,
  Phone,
  Calendar,
  User,
  Building,
  Briefcase,
  Clock
} from 'lucide-react';

// ================== Employee Form ==================
const EmployeeForm = ({ employee, onSave, onCancel, suggestedId }) => {
  const [formData, setFormData] = useState(
    employee || { 
      employeeId: suggestedId, 
      name: '', 
      email: '', 
      department: '', 
      designation: '', 
      status: 'active', 
      location: '' 
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Row - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input 
              id="employeeId" 
              name="employeeId" 
              value={formData.employeeId} 
              onChange={handleChange} 
              required 
              disabled={!!employee} 
            />
           
          </div>
          
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Input 
              id="department" 
              name="department" 
              value={formData.department} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="designation">Designation</Label>
            <Input 
              id="designation" 
              name="designation" 
              value={formData.designation} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
      </div>

      {/* Status Field - Full Width */}
      <div>
        <Label htmlFor="status">Status</Label>
        <select 
          id="status" 
          name="status" 
          value={formData.status} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="active">Active</option>
          <option value="on-probation">On Probation</option>
          <option value="on-leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* Buttons */}
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Employee</Button>
      </DialogFooter>
    </form>
  );
};

// ================== Employee View Dialog ==================
const EmployeeViewDialog = ({ employee, isOpen, onClose }) => {
  if (!employee) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-probation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'on-leave': return <Clock className="w-3 h-3" />;
      case 'on-probation': return <Clock className="w-3 h-3" />;
      case 'terminated': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6" />
            Employee Profile
          </DialogTitle>
          <DialogDescription>
            Complete details for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Avatar and Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <p className="text-gray-600">{employee.designation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(employee.status)}`}>
                      {getStatusIcon(employee.status)}
                      {employee.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {employee.employeeId}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border">
                <Building className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{employee.department}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border">
                <MapPin className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{employee.location}</p>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">Not provided</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Work Information */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Work Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="font-medium text-gray-900">{employee.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Work Location</p>
                    <p className="font-medium text-gray-900">{employee.location}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Information */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Clock className="w-5 h-5 text-green-600" />
                Employment Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <Badge className={`${getStatusColor(employee.status)}`}>
                    {employee.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Employee ID</span>
                  <span className="font-medium text-gray-900">{employee.employeeId}</span>
                </div>
              </div>
            </Card>

            {/* Additional Information */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-purple-600" />
                Additional Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Join Date</span>
                  <span className="font-medium text-gray-900">Not specified</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="text-sm text-gray-600">Reports To</span>
                  <span className="font-medium text-gray-900">Not assigned</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ================== Employee Section ==================
const EmployeeSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', department: 'all', location: 'all' });
  const [isModalOpen, setModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);

  // ================== Fetch Employees ==================
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch employees' });
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // ================== Suggested ID ==================
  const suggestedId = useMemo(() => {
    const lastEmployee = employees[employees.length - 1];
    if (!lastEmployee || !lastEmployee.employeeId.startsWith('EMP')) return 'EMP001';
    const lastIdNum = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
    return `EMP${String(lastIdNum + 1).padStart(3, '0')}`;
  }, [employees]);

  // ================== Save Employee ==================
  const handleSaveEmployee = async (employeeData) => {
    try {
      if (editingEmployee) {
        // Update
        const res = await fetch(`http://localhost:5000/api/employees/${employeeData.employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        });
        if (!res.ok) throw new Error('Update failed');
        toast({ title: 'Employee Updated', description: `${employeeData.name} updated successfully.` });
      } else {
        // Add
        const res = await fetch('http://localhost:5000/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        });
        if (!res.ok) throw new Error('Add failed');
        toast({ title: 'Employee Added', description: `${employeeData.name} added successfully.` });
      }
      setModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees(); // Refresh list
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  // ================== Delete Employee ==================
  const handleDeleteEmployee = async (employeeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${employeeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Deleted', description: 'Employee removed successfully' });
      fetchEmployees();
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  // ================== View Employee ==================
  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee);
    setViewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-blue-100 text-blue-800';
      case 'on-probation': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.employeeId.toLowerCase().includes(searchLower);
    const matchesStatus = filters.status === 'all' || emp.status === filters.status;
    const matchesDept = filters.department === 'all' || emp.department === filters.department;
    const matchesLocation = filters.location === 'all' || emp.location === filters.location;
    return matchesSearch && matchesStatus && matchesDept && matchesLocation;
  });

  const filterOptions = {
    status: ['all', 'active', 'on-probation', 'on-leave', 'terminated'],
    department: ['all', ...new Set(employees.map(e => e.department))],
    location: ['all', ...new Set(employees.map(e => e.location))],
  };

  return (
    <>
      <Helmet><title>Employees - HRMS Pro</title></Helmet>

      {/* Edit/Add Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) setEditingEmployee(null); setModalOpen(open); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>{editingEmployee ? 'Update employee details' : 'Fill in new employee information'}</DialogDescription>
          </DialogHeader>
          <EmployeeForm 
            employee={editingEmployee} 
            onSave={handleSaveEmployee} 
            onCancel={() => setModalOpen(false)} 
            suggestedId={suggestedId} 
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <EmployeeViewDialog 
        employee={viewingEmployee} 
        isOpen={isViewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
      />

      <div className="space-y-8">
        {/* Header + Add */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-2">Manage employee profiles and track lifecycle</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button onClick={() => { setEditingEmployee(null); setModalOpen(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border rounded-lg bg-background capitalize">
              {filterOptions.status.map(option => <option key={option} value={option}>{option.replace('-', ' ')}</option>)}
            </select>
            <select name="department" value={filters.department} onChange={handleFilterChange} className="px-3 py-2 border rounded-lg bg-background">
              {filterOptions.department.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            <select name="location" value={filters.location} onChange={handleFilterChange} className="px-3 py-2 border rounded-lg bg-background">
              {filterOptions.location.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Employee Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEmployees.map((employee, index) => (
            <motion.div key={employee.employeeId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <Card className="p-6 card-hover cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">{employee.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                      <Badge className={`mt-1 ${getStatusColor(employee.status)} capitalize`}>{employee.status.replace('-', ' ')}</Badge>
                    </div>
                  </div>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewEmployee(employee)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingEmployee(employee); setModalOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600"> 
                            <Trash2 className="mr-2 h-4 w-4" /> Delete 
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will delete {employee.name}'s profile.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteEmployee(employee.employeeId)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Department</p>
                      <p className="text-sm font-medium text-foreground">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Designation</p>
                      <p className="text-sm font-medium text-foreground">{employee.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 pt-2 border-t border-border">
                    <div className="flex items-center space-x-1 text-muted-foreground"><Mail className="w-3 h-3" /><span className="text-xs">{employee.email}</span></div>
                    <div className="flex items-center space-x-1 text-muted-foreground"><MapPin className="w-3 h-3" /><span className="text-xs">{employee.location}</span></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredEmployees.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No employees found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search criteria</p>
            <Button onClick={() => { setEditingEmployee(null); setModalOpen(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default EmployeeSection;