import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  X
} from 'lucide-react';

const TeamForm = ({ team, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    team || { name: '', lead: '', department: '', location: '', budget: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Team Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="lead">Team Lead</Label>
        <Input id="lead" name="lead" value={formData.lead} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" value={formData.department} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="budget">Budget</Label>
        <Input id="budget" name="budget" value={formData.budget} onChange={handleChange} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Team</Button>
      </DialogFooter>
    </form>
  );
};

const TeamMembersModal = ({ team, members, allEmployees, onAddMember, onRemoveMember, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const availableEmployees = allEmployees.filter(emp => !team.members.includes(emp.id));

  const handleAdd = () => {
    if (selectedEmployee) {
      onAddMember(team.id, selectedEmployee);
      setSelectedEmployee('');
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Members of {team.name}</DialogTitle>
        <DialogDescription>View and manage team members.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex space-x-2">
          <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee to add" />
            </SelectTrigger>
            <SelectContent>
              {availableEmployees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}><UserPlus className="mr-2 h-4 w-4" /> Add</Button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
              <span>{member.name} ({member.designation})</span>
              <Button variant="ghost" size="icon" onClick={() => onRemoveMember(team.id, member.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          {members.length === 0 && <p className="text-center text-gray-500">No members in this team yet.</p>}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const FilterModal = ({ filters, onFiltersChange, onClose, onClear }) => {
  const { teams: teamsApi } = useAppContext();
  const teams = teamsApi.getAll();

  const departments = [...new Set(teams.map(t => t.department))];
  const managers = [...new Set(teams.map(t => t.lead))];
  const locations = [...new Set(teams.map(t => t.location))];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Filter Teams</DialogTitle>
        <DialogDescription>Apply filters to narrow down the team list.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label>Department</Label>
          <Select value={filters.department} onValueChange={(value) => onFiltersChange({ ...filters, department: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Manager</Label>
          <Select value={filters.manager} onValueChange={(value) => onFiltersChange({ ...filters, manager: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Managers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              {managers.map(manager => (
                <SelectItem key={manager} value={manager}>{manager}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location</Label>
          <Select value={filters.location} onValueChange={(value) => onFiltersChange({ ...filters, location: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
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
        <Button variant="outline" onClick={onClear}>Clear Filters</Button>
        <Button onClick={onClose}>Apply Filters</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TeamSection = () => {
  const { teams: teamsApi, employees: employeesApi } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: 'all', manager: 'all', location: 'all', status: 'all' });
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [viewingMembersTeam, setViewingMembersTeam] = useState(null);

  const teams = teamsApi.getAll();
  const allEmployees = employeesApi.getAll();

  const handleCreateTeam = (teamData) => {
    teamsApi.add({ ...teamData, members: [], status: 'active' });
    toast({ title: 'Team Created', description: `The team "${teamData.name}" has been successfully created.` });
    setCreateModalOpen(false);
  };

  const handleUpdateTeam = (teamData) => {
    teamsApi.update(editingTeam.id, teamData);
    toast({ title: 'Team Updated', description: `The team "${teamData.name}" has been successfully updated.` });
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId) => {
    const team = teamsApi.getById(teamId);
    teamsApi.remove(teamId);
    toast({ title: 'Team Deleted', description: `The team "${team.name}" has been deleted.` });
  };

  const handleAddMember = (teamId, employeeId) => {
    const team = teamsApi.getById(teamId);
    const updatedMembers = [...team.members, employeeId];
    teamsApi.update(teamId, { members: updatedMembers });
    toast({ title: 'Member Added', description: `Employee has been added to ${team.name}.` });
    setViewingMembersTeam(teamsApi.getById(teamId)); // Refresh modal data
  };

  const handleRemoveMember = (teamId, employeeId) => {
    const team = teamsApi.getById(teamId);
    const updatedMembers = team.members.filter(id => id !== employeeId);
    teamsApi.update(teamId, { members: updatedMembers });
    toast({ title: 'Member Removed', description: `Employee has been removed from ${team.name}.` });
    setViewingMembersTeam(teamsApi.getById(teamId)); // Refresh modal data
  };

  const handleClearFilters = () => {
    setFilters({ department: 'all', manager: 'all', location: 'all', status: 'all' });
    toast({ title: 'Filters Cleared', description: 'All filters have been reset.' });
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.lead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filters.department === 'all' || team.department === filters.department;
    const matchesManager = filters.manager === 'all' || team.lead === filters.manager;
    const matchesLocation = filters.location === 'all' || team.location === filters.location;
    const matchesStatus = filters.status === 'all' || team.status === filters.status;

    return matchesSearch && matchesDepartment && matchesManager && matchesLocation && matchesStatus;
  });

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  return (
    <>
      <Helmet>
        <title>Teams - HRMS Pro</title>
        <meta name="description" content="Manage teams, assign leads, track budgets and organize your workforce effectively with HRMS Pro" />
      </Helmet>

      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Fill in the details to create a new team.</DialogDescription>
          </DialogHeader>
          <TeamForm onSave={handleCreateTeam} onCancel={() => setCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update the details for the team.</DialogDescription>
          </DialogHeader>
          <TeamForm team={editingTeam} onSave={handleUpdateTeam} onCancel={() => setEditingTeam(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingMembersTeam} onOpenChange={() => setViewingMembersTeam(null)}>
        {viewingMembersTeam && (
          <TeamMembersModal
            team={viewingMembersTeam}
            members={viewingMembersTeam.members.map(id => employeesApi.getById(id)).filter(Boolean)}
            allEmployees={allEmployees}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onClose={() => setViewingMembersTeam(null)}
          />
        )}
      </Dialog>

      <Dialog open={isFilterModalOpen} onOpenChange={setFilterModalOpen}>
        <FilterModal
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setFilterModalOpen(false)}
          onClear={handleClearFilters}
        />
      </Dialog>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-2">Manage teams, assign leads, and track performance</p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
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
              className={activeFiltersCount > 0 ? 'border-blue-500 text-blue-600' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
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
          {filteredTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 card-hover group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.department}</p>
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
                        <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team Lead</span>
                    <span className="text-sm font-medium text-gray-900">{team.lead}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Members</span>
                    <Badge variant="secondary">{team.members.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-900">{team.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="text-sm font-medium text-green-600">{team.budget}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <Badge
                    variant={team.status === 'active' ? 'default' : 'secondary'}
                    className={team.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {team.status}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredTeams.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || activeFiltersCount > 0 ? 'Try adjusting your search criteria or filters' : 'Get started by creating your first team'}
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TeamSection;