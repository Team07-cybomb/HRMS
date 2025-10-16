import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  MoreVertical,
  Users,
  Trash2,
  Upload
} from 'lucide-react';

const HRLettersSection = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedLetters, setGeneratedLetters] = useState([
    { id: 'GL001', employee: 'Alex Rodriguez', template: 'Offer Letter', generatedDate: '2023-12-20', generatedBy: 'HR Admin', status: 'signed', fileUrl: '#' },
    { id: 'GL002', employee: 'Sarah Johnson', template: 'Salary Revision Letter', generatedDate: '2024-01-22', generatedBy: 'HR Manager', status: 'sent', fileUrl: '#' },
    { id: 'GL003', employee: 'Michael Brown', template: 'Experience Letter', generatedDate: '2024-01-31', generatedBy: 'HR Admin', status: 'draft', fileUrl: '#' }
  ]);
  const fileInputRef = useRef(null);

  const handleAction = (action, item = null) => {
    toast({
      title: action,
      description: "This feature is now active!"
    });
  };

  const handleGenerateClick = (template) => {
    setSelectedTemplate(template);
    setGenerateModalOpen(true);
  };

  const handleEditClick = (template) => {
    setSelectedTemplate(template);
    setEditModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    const newLetter = {
      id: `GL00${generatedLetters.length + 1}`,
      employee: 'New Employee',
      template: selectedTemplate.name,
      generatedDate: new Date().toISOString().split('T')[0],
      generatedBy: 'Current User',
      status: 'draft',
      fileUrl: '#'
    };
    setGeneratedLetters(prev => [newLetter, ...prev]);
    setGenerateModalOpen(false);
    toast({ title: 'Letter Generated', description: `${selectedTemplate.name} for New Employee has been generated.` });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast({ title: 'File Uploaded', description: `${file.name} has been uploaded successfully.` });
    }
  };

  const letterTemplates = [
    { id: 'LT001', name: 'Offer Letter', category: 'Onboarding', version: 'v2.1', lastUpdated: '2024-01-10', placeholders: ['{{employee_name}}', '{{designation}}', '{{doj}}', '{{salary_gross}}'] },
    { id: 'LT002', name: 'Appointment Letter', category: 'Onboarding', version: 'v1.5', lastUpdated: '2023-12-15', placeholders: ['{{employee_name}}', '{{emp_code}}', '{{designation}}', '{{doj}}'] },
    { id: 'LT003', name: 'Salary Revision Letter', category: 'Compensation', version: 'v3.0', lastUpdated: '2024-01-20', placeholders: ['{{employee_name}}', '{{effective_date}}', '{{new_salary}}'] },
    { id: 'LT004', name: 'Experience Letter', category: 'Offboarding', version: 'v1.2', lastUpdated: '2023-11-01', placeholders: ['{{employee_name}}', '{{doj}}', '{{last_working_day}}', '{{designation}}'] }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = letterTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Button variant="outline" onClick={() => handleAction('Filter Templates')}><Filter className="w-4 h-4 mr-2" />Filter</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Card className="p-6 card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3"><div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"><FileText className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-gray-900">{template.name}</h3><p className="text-sm text-gray-500">{template.category}</p></div></div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4 text-gray-500" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => handleGenerateClick(template)}>Generate</DropdownMenuItem><DropdownMenuItem onClick={() => handleEditClick(template)}>Edit</DropdownMenuItem><DropdownMenuItem className="text-red-500" onClick={() => handleAction('Delete Template', template)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Version</span><Badge variant="secondary">{template.version}</Badge></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Last Updated</span><span className="text-sm font-medium text-gray-900">{template.lastUpdated}</span></div>
              </div>
              <div className="flex items-center space-x-2"><Button size="sm" onClick={() => handleGenerateClick(template)}>Generate</Button><Button size="sm" variant="outline" onClick={() => handleEditClick(template)}><Edit className="w-4 h-4 mr-2" />Edit</Button></div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderGeneratedLetters = () => (
    <div className="space-y-4">
      {generatedLetters.map((letter, index) => (
        <motion.div key={letter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4"><div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-gray-900">{letter.template}</h3><p className="text-sm text-gray-500">For: {letter.employee}</p></div></div>
              <Badge className={getStatusColor(letter.status)}>{letter.status}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Generated Date</p><p className="text-sm font-medium text-gray-900">{letter.generatedDate}</p></div>
              <div><p className="text-xs text-gray-500">Generated By</p><p className="text-sm font-medium text-gray-900">{letter.generatedBy}</p></div>
              <div className="col-span-2 flex items-center justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleAction('View Letter', letter)}><Eye className="w-4 h-4 mr-2" />View</Button>
                <a href={letter.fileUrl} download={`${letter.template}_${letter.employee}.pdf`}><Button size="sm"><Download className="w-4 h-4 mr-2" />Download</Button></a>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      <Helmet><title>HR Letters - HRMS Pro</title><meta name="description" content="Generate, manage, and track HR letters using customizable templates with HRMS Pro" /></Helmet>
      <Dialog open={isGenerateModalOpen} onOpenChange={setGenerateModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate '{selectedTemplate?.name}'</DialogTitle><DialogDescription>Fill placeholders, upload attachments, and generate the letter.</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            <p>Fill in the required information for the letter.</p>
            <Input placeholder="Employee Name" />
            <Input placeholder="Designation" />
            <div className="flex items-center space-x-2 pt-4">
              <Button variant="outline" onClick={() => fileInputRef.current.click()}><Upload className="mr-2 h-4 w-4" /> Upload Attachment</Button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" onClick={() => handleAction('Download Template')}><Download className="mr-2 h-4 w-4" /> Download Template</Button>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setGenerateModalOpen(false)}>Cancel</Button><Button onClick={handleConfirmGeneration}>Confirm Generation</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent><DialogHeader><DialogTitle>Edit '{selectedTemplate?.name}' Template</DialogTitle><DialogDescription>Modify the template content and placeholders.</DialogDescription></DialogHeader><div className="py-4"><p>This is a placeholder for the template editor.</p></div><DialogFooter><Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button><Button onClick={() => { setEditModalOpen(false); handleAction('Save Template'); }}>Save</Button></DialogFooter></DialogContent>
      </Dialog>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900">HR Letters</h1><p className="text-gray-600 mt-2">Generate and manage official HR letters from templates</p></div>
          <Button onClick={() => toast({title: "Select a template", description: "Please select a template to generate a letter."})} className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"><Plus className="w-4 h-4 mr-2" />Generate Letter</Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[{ id: 'templates', label: 'Templates', icon: FileText }, { id: 'generated', label: 'Generated Letters', icon: Users }].map((tab) => {
                const Icon = tab.icon;
                return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Icon className="w-4 h-4" /><span>{tab.label}</span></button>);
              })}
            </nav>
          </div>
        </motion.div>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'generated' && renderGeneratedLetters()}
        </motion.div>
      </div>
    </>
  );
};

export default HRLettersSection;