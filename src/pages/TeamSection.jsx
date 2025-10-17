import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Eye,
  X,
  Target,
  DollarSign,
  Calendar,
  UserCheck,
  Users2,
  Briefcase,
  Building,
  MapPinned,
  Wallet,
  Activity
} from 'lucide-react';

const TeamForm = ({ team, onSave, onCancel, employees }) => {
  const [formData, setFormData] = useState(
    team || { 
      name: '', 
      lead: '', 
      department: '', 
      location: '', 
      budget: '',
      status: 'active'
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  // Get selected lead details for display
  const selectedLead = employees.find(emp => emp._id === formData.lead);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Team Name *
        </Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          placeholder="Enter team name"
          className="pl-10"
        />
        <Target className="absolute left-3 top-9 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      <div>
        <Label htmlFor="lead" className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-600" />
          Team Lead *
        </Label>
        <Select 
          value={formData.lead} 
          onValueChange={(value) => handleSelectChange('lead', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select team lead">
              {selectedLead ? `${selectedLead.name} - ${selectedLead.designation}` : 'Select team lead'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee._id} value={employee._id}>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-500" />
                  {employee.name} - {employee.designation} ({employee.department})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedLead && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm text-blue-700 flex items-start gap-2">
            <UserCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Selected:</strong> {selectedLead.name} - {selectedLead.designation} | {selectedLead.department} | {selectedLead.email}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="department" className="flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-600" />
          Department *
        </Label>
        <Input 
          id="department" 
          name="department" 
          value={formData.department} 
          onChange={handleChange} 
          required 
          placeholder="Enter department"
          className="pl-10"
        />
        <Building className="absolute left-3 top-9 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      <div>
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-orange-600" />
          Location
        </Label>
        <Input 
          id="location" 
          name="location" 
          value={formData.location} 
          onChange={handleChange} 
          placeholder="Enter location"
          className="pl-10"
        />
        <MapPinned className="absolute left-3 top-9 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      <div>
        <Label htmlFor="budget" className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-green-600" />
          Budget
        </Label>
        <Input 
          id="budget" 
          name="budget" 
          value={formData.budget} 
          onChange={handleChange} 
          placeholder="Enter budget amount"
          className="pl-10"
        />
        <Wallet className="absolute left-3 top-9 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      <div>
        <Label htmlFor="status" className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Status
        </Label>
        <div className="relative">
          <select 
            id="status" 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            className="w-full px-10 py-2 border border-gray-300 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex items-center gap-2">
          {team ? (
            <>
              <Edit className="w-4 h-4" />
              Update Team
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Team
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

const TeamMembersModal = ({ team, members, allEmployees, onAddMember, onRemoveMember, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Filter out employees who are already in the team
  const availableEmployees = allEmployees.filter(emp => 
    !team.members.includes(emp._id)
  );

  const handleAdd = async () => {
    if (selectedEmployee) {
      await onAddMember(team._id, selectedEmployee);
      setSelectedEmployee('');
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users2 className="w-5 h-5 text-blue-600" />
          Members of {team.name}
        </DialogTitle>
        <DialogDescription>View and manage team members.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex space-x-2">
          <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select employee to add" />
            </SelectTrigger>
            <SelectContent>
              {availableEmployees.map(emp => (
                <SelectItem key={emp._id} value={emp._id}>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    {emp.name} - {emp.designation} ({emp.department})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedEmployee} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> 
            Add
          </Button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Current Members ({members.length})
          </h4>
          {members.map(member => (
            <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({member.designation})</span>
                  <div className="text-xs text-gray-500">{member.department} • {member.email}</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemoveMember(team._id, member._id)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No members in this team yet.</p>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const FilterModal = ({ filters, onFiltersChange, onClose, onClear, teams, employees }) => {
  const departments = ['all', ...new Set(teams.map(t => t.department).filter(Boolean))];
  const locations = ['all', ...new Set(teams.map(t => t.location).filter(Boolean))];
  
  // Get unique team leads from employees
  const teamLeads = ['all', ...new Set(teams.map(t => t.lead).filter(Boolean))];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Filter Teams
        </DialogTitle>
        <DialogDescription>Apply filters to narrow down the team list.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-600" />
            Department
          </Label>
          <Select 
            value={filters.department} 
            onValueChange={(value) => onFiltersChange({ ...filters, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-600" />
            Team Lead
          </Label>
          <Select 
            value={filters.lead} 
            onValueChange={(value) => onFiltersChange({ ...filters, lead: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Team Leads" />
            </SelectTrigger>
            <SelectContent>
              {teamLeads.map(leadId => {
                if (leadId === 'all') {
                  return <SelectItem key="all" value="all">All Team Leads</SelectItem>;
                }
                const leadEmployee = employees.find(emp => emp._id === leadId);
                return (
                  <SelectItem key={leadId} value={leadId}>
                    {leadEmployee ? `${leadEmployee.name} - ${leadEmployee.designation}` : leadId}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="flex items-center gap-2">
            <MapPinned className="w-4 h-4 text-orange-600" />
            Location
          </Label>
          <Select 
            value={filters.location} 
            onValueChange={(value) => onFiltersChange({ ...filters, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Status
          </Label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClear} className="flex items-center gap-2">
          <X className="w-4 h-4" />
          Clear Filters
        </Button>
        <Button onClick={onClose} className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Apply Filters
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TeamSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    department: 'all', 
    lead: 'all', 
    location: 'all', 
    status: 'all' 
  });
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [viewingMembersTeam, setViewingMembersTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      toast({ title: 'Error', description: 'Failed to fetch teams' });
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      toast({ title: 'Error', description: 'Failed to fetch employees' });
      setEmployees([]);
    }
  };

  useEffect(() => { 
    fetchTeams();
    fetchEmployees();
  }, []);

  const handleCreateTeam = async (teamData) => {
    try {
      const res = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create team');
      }

      const result = await res.json();
      toast({ 
        title: 'Team Created', 
        description: result.message 
      });
      setCreateModalOpen(false);
      fetchTeams(); // Refresh the list
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${editingTeam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update team');
      }

      const result = await res.json();
      toast({ 
        title: 'Team Updated', 
        description: result.message 
      });
      setEditingTeam(null);
      fetchTeams(); // Refresh the list
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete team');
      }

      const result = await res.json();
      toast({ 
        title: 'Team Deleted', 
        description: result.message 
      });
      fetchTeams(); // Refresh the list
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  const handleAddMember = async (teamId, employeeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add member');
      }

      const result = await res.json();
      toast({ 
        title: 'Member Added', 
        description: result.message 
      });
      
      // Refresh the current team data
      const updatedTeamRes = await fetch(`http://localhost:5000/api/teams/${teamId}`);
      if (updatedTeamRes.ok) {
        const updatedTeam = await updatedTeamRes.json();
        setViewingMembersTeam(updatedTeam);
      }
      
      fetchTeams(); // Refresh the main list
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  const handleRemoveMember = async (teamId, employeeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      const result = await res.json();
      toast({ 
        title: 'Member Removed', 
        description: result.message 
      });
      
      // Refresh the current team data
      const updatedTeamRes = await fetch(`http://localhost:5000/api/teams/${teamId}`);
      if (updatedTeamRes.ok) {
        const updatedTeam = await updatedTeamRes.json();
        setViewingMembersTeam(updatedTeam);
      }
      
      fetchTeams(); // Refresh the main list
    } catch (err) {
      toast({ title: 'Error', description: err.message });
    }
  };

  const handleClearFilters = () => {
    setFilters({ department: 'all', lead: 'all', location: 'all', status: 'all' });
    toast({ title: 'Filters Cleared', description: 'All filters have been reset.' });
  };

  // Filter teams based on search and filters
  const filteredTeams = teams.filter(team => {
    if (!team) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (team.name && team.name.toLowerCase().includes(searchLower)) ||
      (team.lead && getLeadName(team.lead)?.toLowerCase().includes(searchLower)) ||
      (team.department && team.department.toLowerCase().includes(searchLower)) ||
      false;
    
    const matchesDepartment = filters.department === 'all' || team.department === filters.department;
    const matchesLead = filters.lead === 'all' || team.lead === filters.lead;
    const matchesLocation = filters.location === 'all' || team.location === filters.location;
    const matchesStatus = filters.status === 'all' || team.status === filters.status;

    return matchesSearch && matchesDepartment && matchesLead && matchesLocation && matchesStatus;
  });

  // Helper function to get lead name from employee ID
  const getLeadName = (leadId) => {
    const leadEmployee = employees.find(emp => emp._id === leadId);
    return leadEmployee ? leadEmployee.name : leadId;
  };

  // Helper function to get lead details
  const getLeadDetails = (leadId) => {
    return employees.find(emp => emp._id === leadId);
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  // Get team members details for the modal
  const getTeamMembersDetails = (team) => {
    if (!team || !team.members) return [];
    return team.members.map(memberId => 
      employees.find(emp => emp._id === memberId)
    ).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Teams - HRMS Pro</title>
        <meta name="description" content="Manage teams, assign leads, track budgets and organize your workforce effectively with HRMS Pro" />
      </Helmet>

      {/* Create Team Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Create New Team
            </DialogTitle>
            <DialogDescription>Fill in the details to create a new team.</DialogDescription>
          </DialogHeader>
          <TeamForm 
            onSave={handleCreateTeam} 
            onCancel={() => setCreateModalOpen(false)}
            employees={employees}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Team
            </DialogTitle>
            <DialogDescription>Update the details for the team.</DialogDescription>
          </DialogHeader>
          <TeamForm 
            team={editingTeam} 
            onSave={handleUpdateTeam} 
            onCancel={() => setEditingTeam(null)}
            employees={employees}
          />
        </DialogContent>
      </Dialog>

      {/* Team Members Dialog */}
      <Dialog open={!!viewingMembersTeam} onOpenChange={() => setViewingMembersTeam(null)}>
        {viewingMembersTeam && (
          <TeamMembersModal
            team={viewingMembersTeam}
            members={getTeamMembersDetails(viewingMembersTeam)}
            allEmployees={employees}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onClose={() => setViewingMembersTeam(null)}
          />
        )}
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
        <FilterModal
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setFilterModalOpen(false)}
          onClear={handleClearFilters}
          teams={teams}
          employees={employees}
        />
      </Dialog>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
              <p className="text-gray-600 mt-2">Manage teams, assign leads, and track performance</p>
            </div>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search teams, leads, or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilterModalOpen(true)}
              className={activeFiltersCount > 0 ? 'border-blue-500 text-blue-600 flex items-center gap-2' : 'flex items-center gap-2'}
            >
              <Filter className="w-4 h-4" />
              Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="icon" onClick={handleClearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTeams.map((team, index) => {
            const leadDetails = getLeadDetails(team.lead);
            return (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 card-hover group border-2 border-transparent hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {team.department}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setViewingMembersTeam(team)}>
                            <Eye className="mr-2 h-4 w-4" /> View Members
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingTeam(team)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setViewingMembersTeam(team)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add Member
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
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the team "{team.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTeam(team._id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        Team Lead
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {leadDetails ? leadDetails.name : team.lead}
                        </span>
                        {leadDetails && (
                          <div className="text-xs text-gray-500">{leadDetails.designation}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        Members
                      </span>
                      <Badge variant="secondary">{team.members?.length || 0}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPinned className="w-4 h-4 text-orange-600" />
                        Location
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-900">{team.location || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    {team.budget && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-green-600" />
                          Budget
                        </span>
                        <span className="text-sm font-medium text-green-600">{team.budget}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <Badge
                      variant={team.status === 'active' ? 'default' : 'secondary'}
                      className={team.status === 'active' ? 
                        'bg-green-100 text-green-800 flex items-center gap-1' : 
                        'bg-gray-100 text-gray-800 flex items-center gap-1'
                      }
                    >
                      <Activity className="w-3 h-3" />
                      {team.status || 'active'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setViewingMembersTeam(team)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredTeams.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeFiltersCount > 0 ? 'Try adjusting your search criteria or filters' : 'Get started by creating your first team'}
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TeamSection;