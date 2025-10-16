import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Shield, FileText, ArrowLeft, Edit, Upload, Trash2, Plus, Save, GraduationCap, Building, Contact, CreditCard, Lock
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ProfilePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { employees: employeesApi, logAction } = useAppContext();
  const { user, can } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [viewPermission, setViewPermission] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isSalaryModalOpen, setSalaryModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [salaryFormData, setSalaryFormData] = useState({ components: [] });
  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const foundEmployee = employeesApi.getById(employeeId);
    if (foundEmployee) {
      const permission = can('view:employee_details', foundEmployee);
      if (!permission) {
        toast({ title: "Access Denied", description: "You don't have permission to view this profile.", variant: "destructive" });
        navigate('/employees');
        return;
      }
      setViewPermission(permission);
      setEmployee(foundEmployee);
      setEditFormData(foundEmployee);
      const components = foundEmployee.salaryStructure 
        ? Object.entries(foundEmployee.salaryStructure)
            .filter(([key]) => key !== 'total')
            .map(([name, value]) => ({ id: uuidv4(), name, value }))
        : [];
      setSalaryFormData({ components });
    } else {
      toast({ title: "Employee not found", variant: "destructive" });
      navigate('/employees');
    }
  }, [employeeId, navigate, employeesApi, can]);

  const handleEditProfile = () => {
    setEditFormData(employee);
    setEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    const canEditCore = can('edit:employee_core', employee);
    const canEditBasic = can('edit:employee_basic', employee);

    if (!canEditCore && !canEditBasic) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }

    let dataToSave = { ...editFormData };
    if (!canEditCore && canEditBasic) {
      const basicFields = ['phone', 'address', 'emergencyContact'];
      const filteredData = {};
      basicFields.forEach(field => {
        if (dataToSave.hasOwnProperty(field)) {
          filteredData[field] = dataToSave[field];
        }
      });
      dataToSave = { ...employee, ...filteredData };
    }

    const oldData = employeesApi.getById(employeeId);
    employeesApi.update(employeeId, dataToSave);
    setEmployee(prev => ({...prev, ...dataToSave}));
    logAction('Update Employee Profile', { id: employeeId, name: dataToSave.name }, oldData, dataToSave);
    toast({ title: 'Profile Updated' });
    setEditModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    if (!can('edit:employee_basic', employee)) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedEmployee = { ...employee, avatar: reader.result };
        employeesApi.update(employeeId, updatedEmployee);
        setEmployee(updatedEmployee);
        toast({ title: 'Photo Updated' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e) => {
    if (!can('edit:employee_core', employee)) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    const file = e.target.files[0];
    if (file) {
        const newDocument = { id: uuidv4(), name: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString() };
        const updatedDocuments = [...(employee.documents || []), newDocument];
        const updatedEmployee = { ...employee, documents: updatedDocuments };
        employeesApi.update(employeeId, updatedEmployee);
        setEmployee(updatedEmployee);
        toast({ title: 'Document Uploaded' });
    }
  };

  const handleDeleteDocument = (docId) => {
    if (!can('edit:employee_core', employee)) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    const updatedDocuments = employee.documents.filter(doc => doc.id !== docId);
    const updatedEmployee = { ...employee, documents: updatedDocuments };
    employeesApi.update(employeeId, updatedEmployee);
    setEmployee(updatedEmployee);
    toast({ title: 'Document Deleted' });
  };

  const handleSaveSalary = () => {
    if (!can('edit:employee_core', employee)) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    const newSalaryStructure = salaryFormData.components.reduce((acc, curr) => {
        if (curr.name) acc[curr.name] = parseFloat(curr.value) || 0;
        return acc;
    }, {});
    newSalaryStructure.total = Object.values(newSalaryStructure).reduce((sum, val) => sum + val, 0);
    
    const updatedEmployee = { ...employee, salaryStructure: newSalaryStructure };
    employeesApi.update(employeeId, updatedEmployee);
    setEmployee(updatedEmployee);
    toast({ title: 'Salary Structure Updated' });
    setSalaryModalOpen(false);
  };

  const handleSectionEdit = (section, item) => {
    if (!can('edit:employee_core', employee)) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    setEditingSection(section);
    setEditingItem(item || {});
  };

  const handleSaveSectionItem = () => {
    const updatedEmployee = { ...employee };
    const sectionData = updatedEmployee[editingSection] || [];
    if (editingItem.id) {
      const index = sectionData.findIndex(i => i.id === editingItem.id);
      sectionData[index] = editingItem;
    } else {
      sectionData.push({ ...editingItem, id: uuidv4() });
    }
    updatedEmployee[editingSection] = sectionData;
    employeesApi.update(employeeId, updatedEmployee);
    setEmployee(updatedEmployee);
    toast({ title: 'Information Updated' });
    setEditingSection(null);
    setEditingItem(null);
  };

  const handleRemoveSectionItem = (section, itemId) => {
    if (!can('edit:employee_core', employee)) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    const updatedEmployee = { ...employee };
    updatedEmployee[section] = (updatedEmployee[section] || []).filter(i => i.id !== itemId);
    employeesApi.update(employeeId, updatedEmployee);
    setEmployee(updatedEmployee);
    toast({ title: 'Item Removed' });
  };

  if (!employee) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>;
  }

  const isFullView = viewPermission === true;

  const SectionCard = ({ icon: Icon, title, data, sectionKey, children, isLocked }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-blue-600 mr-3" />
          <CardTitle>{title}</CardTitle>
          {isLocked && <Lock className="w-4 h-4 text-gray-400 ml-2" />}
        </div>
        {!isLocked && can('edit:employee_core', employee) && (
          <Button variant="ghost" size="icon" onClick={() => handleSectionEdit(sectionKey, null)}>
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? data.map(item => (
            <div key={item.id} className="p-3 border rounded-lg group relative">
              {children(item)}
              {!isLocked && can('edit:employee_core', employee) && (
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSectionEdit(sectionKey, item)}><Edit className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveSectionItem(sectionKey, item.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                </div>
              )}
            </div>
          )) : <p className="text-sm text-gray-500 text-center py-4">No information added yet.</p>}
        </div>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard icon={User} title="Basic Details" data={[{...employee, id:'basic'}]} sectionKey="basicDetails" isLocked={!can('edit:employee_core', employee)}>
        {(item) => (<div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Full Name</span><span className="font-medium">{item.name}</span></div>
            {isFullView && <div className="flex justify-between"><span className="text-gray-600">Date of Birth</span><span className="font-medium">{item.dob}</span></div>}
            {isFullView && <div className="flex justify-between"><span className="text-gray-600">Country</span><span className="font-medium">{item.country}</span></div>}
        </div>)}
      </SectionCard>
      <SectionCard icon={Contact} title="Contact Details" data={[{...employee, id:'contact'}]} sectionKey="contactDetails" isLocked={!can('edit:employee_basic', employee)}>
        {(item) => (<div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{item.email}</span></div>
            {isFullView && <div className="flex justify-between"><span className="text-gray-600">Phone</span><span className="font-medium">{item.phone}</span></div>}
            {isFullView && <div className="flex justify-between"><span className="text-gray-600">Address</span><span className="font-medium">{item.address}</span></div>}
            {isFullView && <div className="flex justify-between"><span className="text-gray-600">Emergency Contact</span><span className="font-medium">{item.emergencyContact?.name} ({item.emergencyContact?.phone})</span></div>}
        </div>)}
      </SectionCard>
      {isFullView && <>
        <SectionCard icon={Shield} title="Compliance Details" data={employee.complianceDetails || []} sectionKey="complianceDetails" isLocked={!can('edit:employee_core', employee)}>
          {(item) => (<div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Type</span><span className="font-medium">{item.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Number</span><span className="font-medium">{item.number}</span></div>
          </div>)}
        </SectionCard>
        <SectionCard icon={CreditCard} title="Bank Details" data={employee.bankDetails || []} sectionKey="bankDetails" isLocked={!can('edit:employee_core', employee)}>
          {(item) => (<div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Account Name</span><span className="font-medium">{item.accountName}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Account Number</span><span className="font-medium">{item.accountNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">IFSC Code</span><span className="font-medium">{item.ifscCode}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Bank Name</span><span className="font-medium">{item.bankName}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Branch</span><span className="font-medium">{item.branch}</span></div>
          </div>)}
        </SectionCard>
        <SectionCard icon={Building} title="Work Experience" data={employee.workExperience} sectionKey="workExperience" isLocked={!can('edit:employee_core', employee)}>
          {(item) => (<div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Company</span><span className="font-medium">{item.company}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Title</span><span className="font-medium">{item.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Duration</span><span className="font-medium">{item.from} to {item.to}</span></div>
          </div>)}
        </SectionCard>
        <SectionCard icon={GraduationCap} title="Education Details" data={employee.educationDetails} sectionKey="educationDetails" isLocked={!can('edit:employee_core', employee)}>
          {(item) => (<div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Institution</span><span className="font-medium">{item.institution}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Degree</span><span className="font-medium">{item.degree}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Duration</span><span className="font-medium">{item.from} to {item.to}</span></div>
          </div>)}
        </SectionCard>
      </>}
    </div>
  );

  const renderDocuments = () => (
    <Card>
      <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
      <CardContent>
        {can('edit:employee_core', employee) && (
          <>
            <Button onClick={() => docFileInputRef.current.click()}><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
            <input type="file" ref={docFileInputRef} onChange={handleDocumentUpload} className="hidden" />
          </>
        )}
        <div className="mt-6 space-y-3">
            {(employee.documents || []).length > 0 ? (
                employee.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3"><FileText className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB - Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {can('edit:employee_core', employee) && <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                    </div>
                ))
            ) : <p className="text-center text-gray-500 mt-8">No documents uploaded yet.</p>}
        </div>
      </CardContent>
    </Card>
  );

  const renderSalaryStructure = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Salary Structure</CardTitle>
        {can('edit:employee_core', employee) && <Button variant="outline" onClick={() => setSalaryModalOpen(true)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {employee.salaryStructure && Object.entries(employee.salaryStructure).map(([key, value]) => key !== 'total' && (
            <div key={key} className="flex justify-between text-sm"><span className="text-gray-600 capitalize">{key}:</span><span className="font-medium">${value.toLocaleString()}</span></div>
          ))}
          <div className="flex justify-between text-lg font-bold pt-3 border-t"><span>Total CTC:</span><span>${(employee.salaryStructure?.total || 0).toLocaleString()} / year</span></div>
        </div>
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    ...(isFullView ? [
      { id: 'salary', label: 'Salary Structure', icon: DollarSign },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'leave', label: 'Leave', icon: Calendar },
      { id: 'payroll', label: 'Payroll', icon: DollarSign },
    ] : [])
  ];

  return (
    <>
      <Helmet><title>{employee.name} - Profile - HRMS Pro</title></Helmet>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="ghost" onClick={() => navigate('/employees')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to Employees</Button>
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {employee.avatar ? <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" /> : <span className="text-white font-medium text-3xl">{employee.name.split(' ').map(n => n[0]).join('')}</span>}
                  </div>
                  {can('edit:employee_basic', employee) && <><Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current.click()}><Upload className="h-4 w-4" /></Button><input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" /></>}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
                  <p className="text-gray-600">{employee.designation}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {employee.email}</span>
                    {isFullView && <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {employee.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                <Badge className={`${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} capitalize`}>{employee.status.replace('-', ' ')}</Badge>
                {can('edit:employee_basic', employee) && <Button onClick={handleEditProfile}><Edit className="w-4 h-4 mr-2" />Edit Profile</Button>}
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8 overflow-x-auto">{tabs.map((tab) => { const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Icon className="w-4 h-4" /><span>{tab.label}</span></button>);})}</nav></div>
        </motion.div>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'overview' && renderOverview()}
          {isFullView && activeTab === 'salary' && renderSalaryStructure()}
          {isFullView && activeTab === 'documents' && renderDocuments()}
          {isFullView && activeTab === 'leave' && <p>Leave tab content goes here.</p>}
          {isFullView && activeTab === 'payroll' && <p>Payroll tab content goes here.</p>}
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;