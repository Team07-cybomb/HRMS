import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import {
  Activity,
  Rss,
  User,
  CheckSquare,
  Calendar,
  Clock,
  Timer,
  FileText,
  Briefcase,
  TrendingUp,
  Users as TeamsIcon,
} from 'lucide-react';

// Employee tab components
import EmployeeProfileTab from '@/components/Dashboard/EmployeeTabs/ProfileTab';
import EmployeeTeamsTab from '@/components/Dashboard/EmployeeTabs/TeamsTab';
import EmployeeLeaveTab from '@/components/Dashboard/EmployeeTabs/LeaveTab';
import EmployeeAttendanceTab from '@/components/Dashboard/EmployeeTabs/AttendanceTab';
import EmployeeActivitiesTab from '@/components/Dashboard/EmployeeTabs/ActivitiesTab';
import EmployeeFeedsTab from '@/components/Dashboard/EmployeeTabs/FeedsTab';
import EmployeeApprovalsTab from '@/components/Dashboard/EmployeeTabs/ApprovalsTab';
import EmployeeTimelogsTab from '@/components/Dashboard/EmployeeTabs/TimelogsTab';
import EmployeeTimesheetsTab from '@/components/Dashboard/EmployeeTabs/TimesheetsTab';
import EmployeeFilesTab from '@/components/Dashboard/EmployeeTabs/FilesTab';
import EmployeeHRProcessTab from '@/components/Dashboard/EmployeeTabs/HRProcessTab';
import EmployeeCareerHistoryTab from '@/components/Dashboard/EmployeeTabs/CareerHistoryTab';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'activities', label: 'Activities', icon: Activity, component: EmployeeActivitiesTab },
    { id: 'feeds', label: 'Feeds', icon: Rss, component: EmployeeFeedsTab },
    { id: 'profile', label: 'Profile', icon: User, component: EmployeeProfileTab },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, component: EmployeeApprovalsTab },
    { id: 'leave', label: 'Leave', icon: Calendar, component: EmployeeLeaveTab },
    { id: 'attendance', label: 'Attendance', icon: Clock, component: EmployeeAttendanceTab },
    { id: 'timelogs', label: 'Timelogs', icon: Timer, component: EmployeeTimelogsTab },
    { id: 'timesheets', label: 'Timesheets', icon: Timer, component: EmployeeTimesheetsTab },
    { id: 'files', label: 'Files', icon: FileText, component: EmployeeFilesTab },
    { id: 'hr_process', label: 'HR Process', icon: Briefcase, component: EmployeeHRProcessTab },
    { id: 'career_history', label: 'Career History', icon: TrendingUp, component: EmployeeCareerHistoryTab },
    { id: 'teams', label: 'Teams', icon: TeamsIcon, component: EmployeeTeamsTab },
  ];

  // Find active tab component
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <>
      <Helmet>
        <title>My Dashboard - HRMS Pro</title>
        <meta name="description" content="Your personal dashboard for attendance, team updates, and company messages." />
      </Helmet>

      <div className="space-y-6">
        {/* Welcome / Loading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {user ? (
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}</h1>
          ) : (
            <h1 className="text-3xl font-bold text-foreground">Loading profile…</h1>
          )}
        </motion.div>

        {/* Tabs */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}

        {/* Active Tab Content */}
        {user && ActiveComponent && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ActiveComponent />
          </motion.div>
        )}
      </div>
    </>
  );
};

export default EmployeeDashboard;
