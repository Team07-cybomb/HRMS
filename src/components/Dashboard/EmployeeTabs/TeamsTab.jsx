import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, XCircle, CalendarOff } from 'lucide-react';

const TeamsTab = () => {
  const { user } = useAuth();
  const { employees: employeesApi, teams: teamsApi, leaveRequests: leaveApi } = useAppContext();
  
  const allEmployees = employeesApi.getAll();
  const currentUser = allEmployees.find(emp => emp.id === user.id);
  const team = teamsApi.getAll().find(t => t.id === currentUser?.teamId);
  const todaysLeaves = leaveApi.getAll().filter(l => new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date() && l.status === 'approved');
  
  if (!team) {
    return <Card><CardHeader><CardTitle>My Team</CardTitle></CardHeader><CardContent><p>You are not currently assigned to a team.</p></CardContent></Card>;
  }

  const teamMembers = team.members.map(memberId => allEmployees.find(emp => emp.id === memberId)).filter(Boolean);

  const getMemberStatus = (memberId) => {
    if (todaysLeaves.some(l => l.employeeId === memberId)) {
      return { text: 'On Leave', icon: <CalendarOff className="w-3 h-3 mr-1 text-blue-500" />, variant: 'secondary' };
    }
    // This is a mock status. In a real app, this would come from live attendance data.
    const isCheckedIn = Math.random() > 0.5;
    return isCheckedIn
      ? { text: 'Checked In', icon: <CheckCircle className="w-3 h-3 mr-1 text-green-500" />, variant: 'outline' }
      : { text: 'Checked Out', icon: <XCircle className="w-3 h-3 mr-1 text-red-500" />, variant: 'outline' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Users className="mr-2" /> {team.name}</CardTitle>
        <p className="text-sm text-muted-foreground">Lead by {team.lead}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map(member => {
            const status = getMemberStatus(member.id);
            return (
              <Card key={member.id} className="p-4 flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-3">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.designation}</p>
                <Badge variant={status.variant} className="mt-2 flex items-center">
                  {status.icon}
                  {status.text}
                </Badge>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamsTab;