import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, Award, Calendar, GitBranch } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';

const CareerHistoryTab = () => {
  const { employees: employeesApi } = useAppContext();
  const { user } = useAuth();
  const employee = employeesApi.getById(user.id);

  if (!employee) return null;

  const calculateExperience = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const years = differenceInYears(now, start);
    const months = differenceInMonths(now, start) % 12;
    return `${years} years, ${months} months`;
  };

  const totalExperienceMonths = (employee.workExperience || []).reduce((acc, exp) => {
    const start = new Date(exp.from);
    const end = exp.to ? new Date(exp.to) : new Date();
    return acc + differenceInMonths(end, start);
  }, 0);
  const currentExpMonths = differenceInMonths(new Date(), new Date(employee.doj));
  const overallExpMonths = totalExperienceMonths + currentExpMonths;

  const formatTotalExperience = (totalMonths) => {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return `${years} years, ${months} months`;
  };

  const milestones = [
    { date: employee.doj, title: `Joined as ${employee.designation}` },
    // Add more dynamic milestones here in a real app
    { date: '2023-03-15', title: '1 Year Anniversary' },
    { date: '2024-01-10', title: 'Promoted to Senior Role' },
    { date: '2025-09-25', title: 'Current Status' },
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Current Experience</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{calculateExperience(employee.doj)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overall Experience</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatTotalExperience(overallExpMonths)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Date of Joining</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{format(new Date(employee.doj), 'PPP')}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Career Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
            {milestones.map((milestone, index) => (
              <div key={index} className="relative mb-8">
                <div className="absolute -left-9 top-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="font-semibold">{milestone.title}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(milestone.date), 'PPP')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Previous Companies</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(employee.workExperience || []).map(exp => (
            <div key={exp.id} className="p-4 border rounded-lg">
              <p className="font-semibold">{exp.title} at {exp.company}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(exp.from), 'MMM yyyy')} - {exp.to ? format(new Date(exp.to), 'MMM yyyy') : 'Present'}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerHistoryTab;