import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Briefcase, Calendar, Edit, UserCheck
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ProfileTab = () => {
  const { user } = useAuth();
  const { employees: employeesApi } = useAppContext();
  const employee = employeesApi.getById(user.id);

  if (!employee) {
    return <div>Loading profile...</div>;
  }

  const handleEdit = () => {
    toast({
      title: "Edit Profile",
      description: "This would open an edit modal. Feature not fully implemented in this view.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Profile</CardTitle>
          <Button variant="outline" onClick={handleEdit}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-4xl">{employee.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-muted-foreground">{employee.designation}</p>
              <Badge className="mt-2">{employee.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center"><User className="mr-2" /> Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{employee.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{employee.phone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span>{employee.address}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center"><Briefcase className="mr-2" /> Employment Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span>{employee.department}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date of Joining</span><span>{employee.doj}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reporting Manager</span><span className="flex items-center"><UserCheck className="w-4 h-4 mr-2 text-muted-foreground" />{employee.reportingManager}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileTab;