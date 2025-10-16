import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  UserPlus,
  DollarSign,
  Gift,
  MessageSquare,
  CheckSquare,
  FileText,
  Building2,
  Calendar
} from 'lucide-react';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees: employeesApi, onboarding: onboardingApi, companyMessages: messagesApi } = useAppContext();

  const allEmployees = employeesApi.getAll();
  const onboardingCandidates = onboardingApi.getAll();
  const currentUser = allEmployees.find(emp => emp.id === user.id);

  const today = new Date();
  const birthdayFolks = allEmployees.filter(emp => {
    if (!emp.dob) return false;
    const birthDate = new Date(emp.dob);
    return birthDate.getDate() === today.getDate() && birthDate.getMonth() === today.getMonth();
  });

  const reportees = allEmployees.filter(emp => emp.manager === currentUser?.name);
  const companyMessages = messagesApi.getAll();

  const stats = [
    { title: 'Total Employees', value: allEmployees.length, icon: Users, path: '/employees' },
    { title: 'Onboarding', value: onboardingCandidates.length, icon: UserPlus, path: '/onboarding' },
    { title: 'Payroll Cost (Jan)', value: '$2.4M', icon: DollarSign, path: '/payroll' },
  ];

  const quickActions = [
    { title: 'Add Employee', icon: UserPlus, path: '/employees' },
    { title: 'Start Onboarding', icon: UserPlus, path: '/onboarding' },
    { title: 'Apply Leave', icon: Calendar, path: '/leave' },
    { title: 'Run Payroll', icon: DollarSign, path: '/payroll' },
    { title: 'Generate Letter', icon: FileText, path: '/hr-letters' },
    { title: 'Create Team', icon: Users, path: '/teams' },
    { title: 'Post Message', icon: MessageSquare, path: '/organization' },
    { title: 'Review Approvals', icon: CheckSquare, path: '/approvals' },
  ];

  return (
    <>
      <Helmet>
        <title>Employer Dashboard - HRMS Pro</title>
        <meta name="description" content="High-level overview of the organization for employers." />
      </Helmet>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-2">A high-level overview of your organization.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 card-hover cursor-pointer" onClick={() => navigate(stat.path)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600"><Icon className="w-6 h-6 text-white" /></div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button key={action.title} variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:shadow-lg" onClick={() => navigate(action.path)}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"><Icon className="w-5 h-5 text-white" /></div>
                  <span className="text-xs font-medium text-center">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" /> Company Messages</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {companyMessages.map(msg => (
                  <div key={msg.id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold">{msg.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{msg.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><Gift className="mr-2 h-5 w-5 text-primary" /> Today's Birthdays</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {birthdayFolks.length > 0 ? birthdayFolks.map(emp => (
                  <div key={emp.id} className="flex items-center space-x-3 p-2 bg-secondary rounded-lg">
                    <p className="text-sm font-medium text-foreground">{emp.name}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-4">No birthdays today.</p>}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> My Reportees</h3>
              <div className="space-y-3">
                {reportees.length > 0 ? reportees.map(rep => (
                  <div key={rep.id} className="flex items-center space-x-3 p-2 bg-secondary rounded-lg">
                    <p className="text-sm font-medium text-foreground">{rep.name}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground text-center py-4">You have no direct reportees.</p>}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EmployerDashboard;