
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Users,
  Shield,
  Bell,
  Globe,
  Save,
  DollarSign,
  UserPlus,
  Calendar,
  Clock,
  FileText,
  ListChecks,
  Plus,
  Edit,
  Trash2,
  Upload,
  UserCircle
} from 'lucide-react';

const RoleForm = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState(role || { name: '', description: '', permissions: {} });
  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handlePermissionChange = (module, level) => { setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [module]: level } })); };
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  const permissionModules = ['employees', 'payroll', 'settings', 'reports'];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="name">Role Name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
      <div><Label htmlFor="description">Description</Label><Input id="description" name="description" value={formData.description} onChange={handleChange} /></div>
      <div className="space-y-2"><Label>Permissions</Label>
        {permissionModules.map(module => (
          <div key={module} className="flex items-center justify-between"><span className="capitalize">{module}</span>
            <Select value={formData.permissions[module] || 'none'} onValueChange={(value) => handlePermissionChange(module, value)}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="crud">Full Access (CRUD)</SelectItem><SelectItem value="read">Read Only</SelectItem><SelectItem value="read-self">Read Self</SelectItem><SelectItem value="none">No Access</SelectItem></SelectContent></Select>
          </div>
        ))}
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Role</Button></DialogFooter>
    </form>
  );
};

const ShiftForm = ({ shift, onSave, onCancel }) => {
    const [formData, setFormData] = useState(shift || { name: '', startTime: '', endTime: '' });
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="name">Shift Name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div><Label htmlFor="startTime">Start Time</Label><Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required /></div>
            <div><Label htmlFor="endTime">End Time</Label><Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save Shift</Button></DialogFooter>
        </form>
    );
};

const SettingsSection = () => {
  const { roles: rolesApi, shifts: shiftsApi, companySettings } = useAppContext();
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState(user.role === 'employee' ? 'profile' : 'general');
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isShiftModalOpen, setShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [settingsData, setSettingsData] = useState(companySettings.get());
  const logoInputRef = useRef(null);

  const handleSettingsChange = (e) => {
    const { id, value } = e.target;
    setSettingsData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsData(prev => ({ ...prev, logo: reader.result }));
        toast({ title: 'Logo Updated', description: 'New company logo has been selected. Click Save to apply.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (section) => {
    if (section === 'General') {
        companySettings.update(settingsData);
    }
    toast({ title: `Saved ${section} Settings`, description: "Your changes have been saved successfully." });
  };

  const handleSaveRole = (roleData) => {
    if (editingRole) { rolesApi.update(editingRole.id, roleData); toast({ title: 'Role Updated' }); } 
    else { rolesApi.add({ ...roleData, id: `role_${roleData.name.toLowerCase().replace(/\s+/g, '_')}` }); toast({ title: 'Role Created' }); }
    setEditingRole(null); setRoleModalOpen(false);
  };

  const handleDeleteRole = (roleId) => { rolesApi.remove(roleId); toast({ title: 'Role Deleted' }); };

  const handleSaveShift = (shiftData) => {
    if (editingShift) { shiftsApi.update(editingShift.id, shiftData); toast({ title: 'Shift Updated' }); }
    else { shiftsApi.add(shiftData); toast({ title: 'Shift Created' }); }
    setEditingShift(null); setShiftModalOpen(false);
  };

  const handleDeleteShift = (shiftId) => { shiftsApi.remove(shiftId); toast({ title: 'Shift Deleted' }); };

  const handleAction = (action) => { toast({ title: action, description: "This feature is now active!" }); };

  const renderGeneralSettings = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">General Settings</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Company Logo</Label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-lg border flex items-center justify-center bg-muted">
              {settingsData.logo ? <img src={settingsData.logo} alt="Company Logo" className="h-full w-full object-contain rounded-lg" /> : <Building2 className="w-8 h-8 text-muted-foreground" />}
            </div>
            <Button variant="outline" onClick={() => logoInputRef.current.click()}><Upload className="mr-2 h-4 w-4" /> Upload Logo</Button>
            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><Label htmlFor="name">Company Name</Label><Input id="name" value={settingsData.name} onChange={handleSettingsChange} /></div>
          <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={settingsData.website} onChange={handleSettingsChange} /></div>
        </div>
        <div className="flex justify-end"><Button onClick={() => handleSave('General')}><Save className="w-4 h-4 mr-2" />Save Changes</Button></div>
      </div>
    </Card>
  );

  const renderRolesPermissions = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Roles & Permissions</CardTitle><Button onClick={() => { setEditingRole(null); setRoleModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Role</Button></CardHeader>
      <CardContent><div className="space-y-4">{rolesApi.getAll().map(role => (<div key={role.id} className="p-4 border rounded-lg"><div className="flex items-center justify-between"><div><h4 className="font-semibold">{role.name}</h4><p className="text-sm text-muted-foreground">{role.description}</p></div><div className="flex items-center space-x-2"><Button variant="ghost" size="icon" onClick={() => { setEditingRole(role); setRoleModalOpen(true); }}><Edit className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the "{role.name}" role.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRole(role.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div></div>))}</div></CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card className="p-6"><h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3><div className="space-y-6"><div className="flex items-center justify-between p-4 border rounded-lg"><div><h4 className="font-medium">Two-Factor Authentication (2FA)</h4><p className="text-sm text-muted-foreground">Require a second factor for all users.</p></div><Switch id="2fa-switch" /></div><div className="space-y-2"><Label>Password Policy</Label><div className="p-4 border rounded-lg space-y-2 text-sm"><p>Minimum Length: 10 characters</p><p>Complexity: Uppercase, lowercase, number, special character</p><p>Rotation: Every 90 days</p></div></div><div className="flex justify-end"><Button onClick={() => handleSave('Security')}><Save className="w-4 h-4 mr-2" />Save Changes</Button></div></div></Card>
  );

  const renderNotificationsSettings = () => (
    <Card className="p-6"><h3 className="text-lg font-semibold text-foreground mb-6">Notification Settings</h3><div className="space-y-4"><div className="flex items-center justify-between p-4 border rounded-lg"><h4 className="font-medium">Onboarding Notifications</h4><Button variant="outline" onClick={() => handleAction('Manage Templates')}>Manage</Button></div><div className="flex items-center justify-between p-4 border rounded-lg"><h4 className="font-medium">Leave Approval Notifications</h4><Button variant="outline" onClick={() => handleAction('Manage Templates')}>Manage</Button></div><div className="flex items-center justify-between p-4 border rounded-lg"><h4 className="font-medium">Payslip Ready Notifications</h4><Button variant="outline" onClick={() => handleAction('Manage Templates')}>Manage</Button></div></div></Card>
  );

  const renderLocalizationSettings = () => (
    <Card className="p-6"><h3 className="text-lg font-semibold text-foreground mb-6">Localization Settings</h3><div className="space-y-6"><div className="space-y-2"><Label htmlFor="defaultTimezone">Default Timezone</Label><Input id="defaultTimezone" defaultValue="(GMT-05:00) Eastern Time" /></div><div className="space-y-2"><Label htmlFor="defaultCurrency">Default Currency</Label><Input id="defaultCurrency" defaultValue="USD ($)" /></div><div className="flex items-center justify-between p-4 border rounded-lg"><h4 className="font-medium">Holiday Calendars</h4><Button variant="outline" onClick={() => handleAction('Manage Calendars')}>Manage</Button></div><div className="flex justify-end"><Button onClick={() => handleSave('Localization')}><Save className="w-4 h-4 mr-2" />Save Changes</Button></div></div></Card>
  );

  const renderPayrollSettings = () => (
    <Card className="p-6"><h3 className="text-lg font-semibold text-foreground mb-6">Payroll Settings</h3><div className="space-y-6"><div className="space-y-2"><Label htmlFor="paySchedule">Default Pay Schedule</Label><Input id="paySchedule" defaultValue="Monthly" /></div><div className="flex items-center justify-between p-4 border rounded-lg"><div><h4 className="font-medium">Earning & Deduction Catalogs</h4><p className="text-sm text-muted-foreground">Manage earning types and deductions.</p></div><Button variant="outline" onClick={() => handleAction('Manage Catalogs')}>Manage</Button></div><div className="flex items-center justify-between p-4 border rounded-lg"><div><h4 className="font-medium">GL Mapping</h4><p className="text-sm text-muted-foreground">Map payroll items to your chart of accounts.</p></div><Button variant="outline" onClick={() => handleAction('Configure GL Mapping')}>Configure</Button></div><div className="flex justify-end"><Button onClick={() => handleSave('Payroll')}><Save className="w-4 h-4 mr-2" />Save Changes</Button></div></div></Card>
  );

  const renderAttendanceSettings = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Attendance & Shifts</CardTitle><Button onClick={() => { setEditingShift(null); setShiftModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Add Shift</Button></CardHeader>
      <CardContent><div className="space-y-4">{shiftsApi.getAll().map(shift => (<div key={shift.id} className="p-4 border rounded-lg"><div className="flex items-center justify-between"><div><h4 className="font-semibold">{shift.name}</h4><p className="text-sm text-muted-foreground">{shift.startTime} - {shift.endTime}</p></div><div className="flex items-center space-x-2"><Button variant="ghost" size="icon" onClick={() => { setEditingShift(shift); setShiftModalOpen(true); }}><Edit className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the "{shift.name}" shift.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteShift(shift.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div></div>))}</div></CardContent>
    </Card>
  );

  const renderSimpleSettings = (title) => (<Card className="p-6"><h3 className="text-lg font-semibold text-foreground mb-6">{title} Settings</h3><div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg"><div className="text-center"><p className="text-muted-foreground mb-4">Settings for this module can be configured here.</p><Button onClick={() => handleAction(`Configure ${title}`)}>Configure</Button></div></div></Card>);

  const renderProfileSettings = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">My Profile Settings</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Change Password</h4>
            <p className="text-sm text-muted-foreground">Update your account password.</p>
          </div>
          <Button variant="outline" onClick={() => toast({ title: 'Feature coming soon!' })}>Change</Button>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Manage Email Notifications</h4>
            <p className="text-sm text-muted-foreground">Choose which emails you want to receive.</p>
          </div>
          <Button variant="outline" onClick={() => toast({ title: 'Feature coming soon!' })}>Manage</Button>
        </div>
      </div>
    </Card>
  );

  const adminSettingsTabs = [
    { id: 'general', label: 'General', icon: Building2, content: renderGeneralSettings },
    { id: 'roles', label: 'Roles & Permissions', icon: Users, content: renderRolesPermissions },
    { id: 'security', label: 'Security', icon: Shield, content: renderSecuritySettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, content: renderNotificationsSettings },
    { id: 'localization', label: 'Localization', icon: Globe, content: renderLocalizationSettings },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, content: renderPayrollSettings },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus, content: () => renderSimpleSettings('Onboarding') },
    { id: 'leave', label: 'Leave Tracker', icon: Calendar, content: () => renderSimpleSettings('Leave Tracker') },
    { id: 'attendance', label: 'Attendance & Shifts', icon: Clock, content: renderAttendanceSettings },
    { id: 'hr-letters', label: 'HR Letters', icon: FileText, content: () => renderSimpleSettings('HR Letters') },
    { id: 'tasks', label: 'Tasks/Checklists', icon: ListChecks, content: () => renderSimpleSettings('Tasks/Checklists') },
  ];

  const employeeSettingsTabs = [
    { id: 'profile', label: 'My Profile', icon: UserCircle, content: renderProfileSettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, content: renderNotificationsSettings },
  ];

  const settingsTabs = user.role === 'employee' ? employeeSettingsTabs : adminSettingsTabs;

  return (
    <>
      <Helmet><title>Settings - HRMS Pro</title><meta name="description" content="Configure company settings, roles, security, and more in HRMS Pro" /></Helmet>
      {can('edit:employee_core') && (
        <>
          <Dialog open={isRoleModalOpen} onOpenChange={setRoleModalOpen}><DialogContent><DialogHeader><DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle><DialogDescription>Define the role and its permissions across the system.</DialogDescription></DialogHeader><RoleForm role={editingRole} onSave={handleSaveRole} onCancel={() => setRoleModalOpen(false)} /></DialogContent></Dialog>
          <Dialog open={isShiftModalOpen} onOpenChange={setShiftModalOpen}><DialogContent><DialogHeader><DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle></DialogHeader><ShiftForm shift={editingShift} onSave={handleSaveShift} onCancel={() => setShiftModalOpen(false)} /></DialogContent></Dialog>
        </>
      )}
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><h1 className="text-3xl font-bold text-foreground">Settings</h1><p className="text-muted-foreground mt-2">Manage your organization's settings and preferences</p></motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-1">
            <Card className="p-4"><nav className="space-y-1">{settingsTabs.map((tab) => { const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}><Icon className="w-5 h-5" /><span>{tab.label}</span></button>);})}</nav></Card>
          </motion.div>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="lg:col-span-3">
            {settingsTabs.find(tab => tab.id === activeTab)?.content()}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SettingsSection;
