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
  CheckSquare,
  Gift,
  MessageSquare,
  User
} from 'lucide-react';
import { format } from 'date-fns';

const HRDashboard = () => {
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
    { title: 'Pending Approvals', value: 15, icon: CheckSquare, path: '/approvals' },
  ];

  const quickActions = [
    { title: 'Add Employee', path: '/employees' },
    { title: 'Start Onboarding', path: '/onboarding' },
    { title: 'Review Approvals', path: '/approvals' },
    { title: 'Generate Letter', path: '/hr-letters' },
  ];

  return (
    <>
      <Helmet>
        <title>HR Dashboard - HRMS Pro</title>
        <meta name="description" content="HR dashboard for managing employees, onboarding, and company-wide updates." />
      </Helmet>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
          <p className="text-muted-foreground mt-2">Here's an overview of your organization's HR activities.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map(action => (
                  <Button key={action.title} variant="outline" className="h-20" onClick={() => navigate(action.path)}>{action.title}</Button>
                ))}
              </div>
            </Card>
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

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-8">
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

export default HRDashboard;