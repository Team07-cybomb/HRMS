
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

const PolicyForm = ({ policy, onSave, onCancel }) => {
  const [formData, setFormData] = useState(policy || { title: '', category: '', content: '' });

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
        <Label htmlFor="title">Policy Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" value={formData.content} onChange={handleChange} required rows={6} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Policy</Button>
      </DialogFooter>
    </form>
  );
};

const CompanyPolicyPage = () => {
  const { policies: policyApi } = useAppContext();
  const { can } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);

  const policies = policyApi.getAll();

  const handleAddNew = () => {
    setEditingPolicy({});
    setModalOpen(true);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleDelete = (policy) => {
    setDeletingPolicy(policy);
  };

  const confirmDelete = () => {
    if (deletingPolicy) {
      policyApi.remove(deletingPolicy.id);
      toast({ title: 'Policy Deleted', description: `The policy "${deletingPolicy.title}" has been deleted.` });
      setDeletingPolicy(null);
    }
  };

  const handleSave = (policyData) => {
    if (policyData.id) {
      policyApi.update(policyData.id, policyData);
      toast({ title: 'Policy Updated', description: 'The policy has been successfully updated.' });
    } else {
      policyApi.add(policyData);
      toast({ title: 'Policy Created', description: 'The new policy has been successfully created.' });
    }
    setModalOpen(false);
    setEditingPolicy(null);
  };

  return (
    <>
      <Helmet>
        <title>Company Policies - HRMS Pro</title>
        <meta name="description" content="View and manage all company policies." />
      </Helmet>

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setEditingPolicy(null); setModalOpen(false); } else { setModalOpen(true); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPolicy?.id ? 'Edit' : 'Create'} Company Policy</DialogTitle>
          </DialogHeader>
          <PolicyForm policy={editingPolicy} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingPolicy(null); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPolicy} onOpenChange={() => setDeletingPolicy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the policy "{deletingPolicy?.title}".</AlertDialogDescription>
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
            <h1 className="text-3xl font-bold">Company Policies</h1>
            <p className="text-muted-foreground mt-2">Central repository for all official company policies.</p>
          </div>
          {can('create:employee') && (
            <Button onClick={handleAddNew} className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Add New Policy
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy, index) => (
            <motion.div key={policy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{policy.title}</CardTitle>
                      <CardDescription>{policy.category}</CardDescription>
                    </div>
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{policy.content}</p>
                </CardContent>
                {can('create:employee') && (
                  <DialogFooter className="p-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(policy)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(policy)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                  </DialogFooter>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CompanyPolicyPage;
