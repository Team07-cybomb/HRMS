import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Send } from 'lucide-react';

const TimesheetsTab = () => {
  // Mock data
  const timesheets = [
    { id: 1, period: 'Sep 1-15, 2025', hours: 80, status: 'Approved' },
    { id: 2, period: 'Sep 16-30, 2025', hours: 78, status: 'Submitted' },
    { id: 3, period: 'Oct 1-15, 2025', hours: 0, status: 'Draft' },
  ];

  const handleAction = (action, period) => {
    toast({ title: action, description: `Timesheet for ${period} has been ${action.toLowerCase()}.` });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Timesheets</CardTitle>
        <Button onClick={() => handleAction('New Timesheet Created', 'Oct 16-31, 2025')}><Plus className="mr-2 h-4 w-4" /> New Timesheet</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {timesheets.map(sheet => (
          <div key={sheet.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <p className="font-semibold">{sheet.period}</p>
              <p className="text-sm text-muted-foreground">Total Hours: {sheet.hours}</p>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <Badge className={getStatusColor(sheet.status)}>{sheet.status}</Badge>
              {sheet.status === 'Draft' && (
                <Button size="sm" onClick={() => handleAction('Submitted', sheet.period)}><Send className="mr-2 h-4 w-4" /> Submit</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TimesheetsTab;