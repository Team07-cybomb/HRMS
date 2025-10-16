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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Plus,
  Target,
  MapPin,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

const OrganizationForm = ({ item, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState(item || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFields = () => {
    switch (type) {
      case 'departments':
        return (
          <>
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            <Label htmlFor="head">Head</Label>
            <Input id="head" name="head" value={formData.head || ''} onChange={handleChange} />
            <Label htmlFor="target">Headcount Target</Label>
            <Input id="target" name="target" type="number" value={formData.target || ''} onChange={handleChange} />
          </>
        );
      case 'designations':
        return (
          <>
            <Label htmlFor="title">Designation Title</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
            <Label htmlFor="level">Level</Label>
            <Input id="level" name="level" value={formData.level || ''} onChange={handleChange} />
          </>
        );
      case 'locations':
        return (
          <>
            <Label htmlFor="name">Location Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
          </>
        );
      case 'messages':
        return (
          <>
            <Label htmlFor="title">Message Title</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} required />
            <Label htmlFor="content">Content</Label>
            <Input id="content" name="content" value={formData.content || ''} onChange={handleChange} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFields()}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

const OrganizationSection = () => {
  const { departments: deptApi, designations: desigApi, locations: locApi, companyMessages: msgApi } = useAppContext();
  const [activeTab, setActiveTab] = useState('departments');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const apis = {
    departments: deptApi,
    designations: desigApi,
    locations: locApi,
    messages: msgApi,
  };

  const items = apis[activeTab].getAll();

  const handleAddNew = () => {
    setEditingItem({});
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeletingItem(item);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      apis[activeTab].remove(deletingItem.id);
      toast({ title: 'Item Deleted', description: `The item has been successfully deleted.` });
      setDeletingItem(null);
    }
  };

  const handleSave = (itemData) => {
    if (itemData.id) {
      apis[activeTab].update(itemData.id, itemData);
      toast({ title: 'Item Updated', description: 'The item has been successfully updated.' });
    } else {
      apis[activeTab].add(itemData);
      toast({ title: 'Item Created', description: 'The item has been successfully created.' });
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const renderDepartments = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((dept, index) => (
        <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"><Building2 className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-500">Head: {dept.head}</p>
                </div>
              </div>
              <ItemMenu onEdit={() => handleEdit(dept)} onDelete={() => handleDelete(dept)} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Headcount</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{dept.headcount}/{dept.target}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: `${(dept.headcount / dept.target) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderDesignations = () => (
    <div className="space-y-4">
      {items.map((designation, index) => (
        <motion.div key={designation.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg"><Target className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{designation.title}</h3>
                  <p className="text-sm text-gray-500">{designation.department} • Level {designation.level}</p>
                </div>
              </div>
              <ItemMenu onEdit={() => handleEdit(designation)} onDelete={() => handleDelete(designation)} />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderLocations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((location, index) => (
        <motion.div key={location.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg"><MapPin className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-500">{location.timezone}</p>
                </div>
              </div>
              <ItemMenu onEdit={() => handleEdit(location)} onDelete={() => handleDelete(location)} />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      {items.map((message, index) => (
        <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{message.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{message.content}</p>
              </div>
              <ItemMenu onEdit={() => handleEdit(message)} onDelete={() => handleDelete(message)} />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const ItemMenu = ({ onEdit, onDelete }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Helmet>
        <title>Organization - HRMS Pro</title>
        <meta name="description" content="Manage departments, designations, locations, and company communications with HRMS Pro organization tools" />
      </Helmet>

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setEditingItem(null); setModalOpen(false); } else { setModalOpen(true); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <OrganizationForm item={editingItem} type={activeTab} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingItem(null); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the item.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization</h1>
            <p className="text-gray-600 mt-2">Manage departments, designations, locations, and company structure</p>
          </div>
          <Button onClick={handleAddNew} className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'departments', label: 'Departments', icon: Building2 },
                { id: 'designations', label: 'Designations', icon: Target },
                { id: 'locations', label: 'Locations', icon: MapPin },
                { id: 'messages', label: 'Company Messages', icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'departments' && renderDepartments()}
          {activeTab === 'designations' && renderDesignations()}
          {activeTab === 'locations' && renderLocations()}
          {activeTab === 'messages' && renderMessages()}
        </motion.div>
      </div>
    </>
  );
};

export default OrganizationSection;