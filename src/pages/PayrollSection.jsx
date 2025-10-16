import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MoreVertical,
  TrendingUp,
  Users,
  Globe,
  Download,
  Settings,
  Eye
} from 'lucide-react';

const PayrollSection = () => {
  const [activeTab, setActiveTab] = useState('runs');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRunModalOpen, setRunModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);

  const handleAction = (action, item = null) => {
    toast({
      title: action,
      description: "This feature is now active!"
    });
  };

  const payrollRuns = [
    { id: 'PR001', period: 'January 2024', payDate: '2024-01-31', employees: 1240, totalCost: '$2.4M', status: 'paid', country: 'USA' },
    { id: 'PR002', period: 'January 2024', payDate: '2024-01-31', employees: 85, totalCost: '₹6.5M', status: 'paid', country: 'India' },
    { id: 'PR003', period: 'February 2024', payDate: '2024-02-28', employees: 1247, totalCost: '$2.45M', status: 'pending', country: 'USA' },
    { id: 'PR004', period: 'February 2024', payDate: '2024-02-28', employees: 45, totalCost: '€350K', status: 'draft', country: 'Germany' }
  ];

  const taxEngines = [
    { country: 'USA', status: 'active', lastUpdated: '2024-01-01', version: 'v3.2.1' },
    { country: 'Canada', status: 'active', lastUpdated: '2024-01-01', version: 'v2.8.0' },
    { country: 'India', status: 'active', lastUpdated: '2024-02-01', version: 'v4.1.0' },
    { country: 'Germany', status: 'active', lastUpdated: '2024-01-15', version: 'v2.5.5' }
  ];

  const payrollReports = [
    { id: 'REP01', title: 'Payroll Register', description: 'Detailed breakdown of earnings, deductions, and taxes for each employee.' },
    { id: 'REP02', title: 'Bank File', description: 'File for direct deposit salary payments.' },
    { id: 'REP03', title: 'Tax Liability Report', description: 'Summary of employer and employee tax liabilities.' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'draft': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredRuns = payrollRuns.filter(run =>
    run.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
    run.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPayrollRuns = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by period or country..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Button variant="outline" onClick={() => setFilterModalOpen(true)}><Filter className="w-4 h-4 mr-2" />Filter</Button>
      </div>
      <div className="space-y-4">
        {filteredRuns.map((run, index) => (
          <motion.div key={run.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4"><div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"><DollarSign className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-foreground">{run.period} Payroll</h3><p className="text-sm text-muted-foreground">Pay Date: {run.payDate}</p></div></div>
                <div className="flex items-center space-x-3"><Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => { setSelectedRun(run); setDetailsModalOpen(true); }}>View Details</DropdownMenuItem><DropdownMenuItem>View Report</DropdownMenuItem><DropdownMenuItem className="text-red-500">Cancel Run</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium text-foreground">{run.country}</p></div>
                <div><p className="text-xs text-muted-foreground">Employees</p><p className="text-sm font-medium text-foreground">{run.employees}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Cost</p><p className="text-sm font-medium text-green-600">{run.totalCost}</p></div>
                <div className="flex items-center justify-end space-x-2"><Button size="sm" variant="outline" onClick={() => { setSelectedRun(run); setDetailsModalOpen(true); }}><Eye className="mr-2 h-4 w-4" />View Details</Button>{run.status === 'pending' && (<Button size="sm" onClick={() => handleAction('Process Run', run)}>Process</Button>)}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTaxEngines = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {taxEngines.map((engine, index) => (
        <motion.div key={engine.country} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
          <Card className="p-6 card-hover cursor-pointer" onClick={() => { setSelectedEngine(engine); setConfigModalOpen(true); }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3"><div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg"><Globe className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-foreground">{engine.country} Tax Engine</h3><Badge className={engine.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'}>{engine.status}</Badge></div></div>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => { setSelectedEngine(engine); setConfigModalOpen(true); }}>Configure</DropdownMenuItem><DropdownMenuItem>View Logs</DropdownMenuItem><DropdownMenuItem>Check for Updates</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-muted-foreground">Last Updated</p><p className="text-sm font-medium text-foreground">{engine.lastUpdated}</p></div>
              <div><p className="text-xs text-muted-foreground">Version</p><p className="text-sm font-medium text-foreground">{engine.version}</p></div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderReports = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {payrollReports.map((report) => (
        <Card key={report.id} className="p-6">
          <h3 className="font-semibold text-foreground">{report.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">{report.description}</p>
          <Button onClick={() => handleAction('Download Report', report)}><Download className="mr-2 h-4 w-4" /> Download</Button>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Helmet><title>Payroll - HRMS Pro</title><meta name="description" content="Manage payroll runs, process salaries, and handle multi-country tax compliance with HRMS Pro" /></Helmet>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-3xl font-bold text-foreground">Payroll</h1><p className="text-muted-foreground mt-2">Manage payroll runs, process salaries, and handle tax compliance</p></div>
          <Button onClick={() => setRunModalOpen(true)} className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"><Plus className="w-4 h-4 mr-2" />Run Payroll</Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6"><div className="flex items-center space-x-3"><div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Total Payroll Cost</p><p className="text-2xl font-bold text-foreground">$2.4M</p></div></div></Card>
          <Card className="p-6"><div className="flex items-center space-x-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Employees Paid</p><p className="text-2xl font-bold text-foreground">1,240</p></div></div></Card>
          <Card className="p-6"><div className="flex items-center space-x-3"><div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div><div><p className="text-sm text-muted-foreground">Pending Runs</p><p className="text-2xl font-bold text-foreground">{payrollRuns.filter(r => r.status === 'pending').length}</p></div></div></Card>
          <Card className="p-6"><div className="flex items-center space-x-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Cost Trend</p><p className="text-2xl font-bold text-green-600">+2.1%</p></div></div></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="border-b border-border"><nav className="-mb-px flex space-x-8">{[{ id: 'runs', label: 'Payroll Runs', icon: Clock }, { id: 'taxes', label: 'Tax Engines', icon: Globe }, { id: 'reports', label: 'Reports', icon: FileText }].map((tab) => { const Icon = tab.icon; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}><Icon className="w-4 h-4" /><span>{tab.label}</span></button>);})}</nav></div>
        </motion.div>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {activeTab === 'runs' && renderPayrollRuns()}
          {activeTab === 'taxes' && renderTaxEngines()}
          {activeTab === 'reports' && renderReports()}
        </motion.div>
      </div>
      <Dialog open={isRunModalOpen} onOpenChange={setRunModalOpen}><DialogContent><DialogHeader><DialogTitle>Run New Payroll</DialogTitle><DialogDescription>Select parameters for the new payroll run.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><div><Label>Pay Period</Label><Input type="month" defaultValue="2025-03" /></div><div><Label>Country</Label><Select><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger><SelectContent><SelectItem value="usa">USA</SelectItem><SelectItem value="india">India</SelectItem><SelectItem value="germany">Germany</SelectItem></SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setRunModalOpen(false)}>Cancel</Button><Button onClick={() => { setRunModalOpen(false); handleAction('Start Payroll Run'); }}>Start Run</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Payroll Details: {selectedRun?.period}</DialogTitle><DialogDescription>Country: {selectedRun?.country}</DialogDescription></DialogHeader><div className="py-4 space-y-2"><p><strong>Status:</strong> <Badge className={getStatusColor(selectedRun?.status)}>{selectedRun?.status}</Badge></p><p><strong>Total Cost:</strong> {selectedRun?.totalCost}</p><p><strong>Employees Paid:</strong> {selectedRun?.employees}</p><p><strong>Pay Date:</strong> {selectedRun?.payDate}</p></div><DialogFooter><Button onClick={() => setDetailsModalOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isFilterModalOpen} onOpenChange={setFilterModalOpen}><DialogContent><DialogHeader><DialogTitle>Filter Payroll Runs</DialogTitle></DialogHeader><div className="py-4 space-y-4"><div><Label>Status</Label><Select><SelectTrigger><SelectValue placeholder="Any Status" /></SelectTrigger><SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select></div><div><Label>Country</Label><Select><SelectTrigger><SelectValue placeholder="Any Country" /></SelectTrigger><SelectContent><SelectItem value="usa">USA</SelectItem><SelectItem value="india">India</SelectItem><SelectItem value="germany">Germany</SelectItem></SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setFilterModalOpen(false)}>Cancel</Button><Button onClick={() => { setFilterModalOpen(false); handleAction('Apply Filters'); }}>Apply</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isConfigModalOpen} onOpenChange={setConfigModalOpen}><DialogContent><DialogHeader><DialogTitle>Configure: {selectedEngine?.country} Tax Engine</DialogTitle></DialogHeader><div className="py-4 space-y-4"><div><Label>Tax Year</Label><Input defaultValue="2025" /></div><div><Label>Federal Tax ID</Label><Input placeholder="Enter Federal Tax ID" /></div><div><Label>State Tax ID (if applicable)</Label><Input placeholder="Enter State Tax ID" /></div></div><DialogFooter><Button variant="outline" onClick={() => setConfigModalOpen(false)}>Cancel</Button><Button onClick={() => { setConfigModalOpen(false); handleAction('Save Configuration'); }}>Save</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
};

export default PayrollSection;