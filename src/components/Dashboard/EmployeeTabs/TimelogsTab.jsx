import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const TimelogsTab = () => {
  // Mock data for demonstration
  const timelogs = [
    { id: 1, date: '2025-09-25', checkIn: '09:02 AM', checkOut: '06:05 PM', duration: '9h 3m', status: 'Present' },
    { id: 2, date: '2025-09-24', checkIn: '09:15 AM', checkOut: '06:00 PM', duration: '8h 45m', status: 'Late' },
    { id: 3, date: '2025-09-23', checkIn: 'N/A', checkOut: 'N/A', duration: '0h 0m', status: 'Absent' },
    { id: 4, date: '2025-09-22', checkIn: '09:00 AM', checkOut: '01:00 PM', duration: '4h 0m', status: 'Half-day' },
    { id: 5, date: '2025-09-21', checkIn: 'N/A', checkOut: 'N/A', duration: '0h 0m', status: 'Weekend' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      case 'Late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'Absent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'Half-day': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Timelogs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timelogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut}</TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell><Badge className={getStatusColor(log.status)}>{log.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TimelogsTab;