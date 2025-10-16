
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Users,
  TrendingUp,
  UserCheck,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Clock,
  Eye
} from 'lucide-react';

const ReportsSection = () => {
  const { employees, leaveRequests } = useAppContext();

  const generatePdf = (title, head, body) => {
    const doc = new jsPDF();
    doc.text(title, 14, 16);
    doc.autoTable({
      head: [head],
      body: body,
      startY: 20,
    });
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    toast({ title: 'PDF Generated', description: `${title} has been downloaded.` });
  };

  const generateXlsx = (title, data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
    toast({ title: 'Excel Sheet Generated', description: `${title} has been downloaded.` });
  };

  const reportActions = {
    'Headcount Report': {
      getData: () => employees.getAll().map(e => ({ ID: e.id, Name: e.name, Department: e.department, Designation: e.designation, Status: e.status })),
      columns: ['ID', 'Name', 'Department', 'Designation', 'Status'],
    },
    'Leave Utilization': {
      getData: () => leaveRequests.getAll().map(l => ({ Employee: l.employee, Type: l.type, 'Start Date': l.startDate, 'End Date': l.endDate, Status: l.status })),
      columns: ['Employee', 'Type', 'Start Date', 'End Date', 'Status'],
    },
  };

  const handleDownload = (reportTitle, format) => {
    const reportConfig = reportActions[reportTitle];
    if (!reportConfig) {
      toast({ title: 'Not Implemented', description: `Report generation for "${reportTitle}" is not yet available.`, variant: 'destructive' });
      return;
    }
    const data = reportConfig.getData();
    const body = data.map(row => Object.values(row));

    if (format === 'pdf') {
      generatePdf(reportTitle, reportConfig.columns, body);
    } else if (format === 'xlsx') {
      generateXlsx(reportTitle, data);
    }
  };

  const handleView = (reportTitle) => {
    const reportConfig = reportActions[reportTitle];
    if (!reportConfig) {
      toast({ title: 'Not Implemented', description: `Report viewing for "${reportTitle}" is not yet available.`, variant: 'destructive' });
      return;
    }
    // For now, just toast a success message. A modal could be implemented here.
    toast({ title: `Viewing ${reportTitle}`, description: 'Report preview would be shown here.' });
  };

  const reports = [
    { title: 'Headcount Report', icon: Users, category: 'HR' },
    { title: 'Attrition Analysis', icon: TrendingUp, category: 'HR' },
    { title: 'Diversity Report', icon: UserCheck, category: 'HR' },
    { title: 'Leave Utilization', icon: Calendar, category: 'HR' },
    { title: 'Payroll Register', icon: DollarSign, category: 'Payroll' },
    { title: 'Tax Liability Report', icon: FileText, category: 'Payroll' },
    { title: 'Attendance Summary', icon: Calendar, category: 'Manager' },
    { title: 'Overtime Report', icon: Clock, category: 'Manager' },
  ];

  return (
    <>
      <Helmet>
        <title>Reports - HRMS Pro</title>
        <meta name="description" content="Generate and view insightful reports on headcount, payroll, attendance, and more with HRMS Pro." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">Gain insights into your organization with comprehensive reports.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reports.map((report, index) => {
            const Icon = report.icon;
            const isImplemented = !!reportActions[report.title];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.category} Report</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(report.title)} disabled={!isImplemented}>
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(report.title, 'pdf')} disabled={!isImplemented}>
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(report.title, 'xlsx')} disabled={!isImplemented}>
                      <Download className="w-4 h-4 mr-2" /> Excel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </>
  );
};

export default ReportsSection;
