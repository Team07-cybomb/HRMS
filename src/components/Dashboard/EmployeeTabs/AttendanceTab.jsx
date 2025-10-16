import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { format, differenceInHours, differenceInMinutes, isSameDay, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AttendanceTab = () => {
  const [date, setDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [workingHours, setWorkingHours] = useState('0h 0m');

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setCheckOutTime(null);
    setWorkingHours('...');
    toast({ title: 'Checked In!', description: `You checked in at ${format(now, 'p')}` });
  };

  const handleCheckOut = () => {
    if (!checkInTime) {
      toast({ title: 'Error', description: 'You must check in first.', variant: 'destructive' });
      return;
    }
    const now = new Date();
    setCheckOutTime(now);
    
    const hours = differenceInHours(now, checkInTime);
    const minutes = differenceInMinutes(now, checkInTime) % 60;
    setWorkingHours(`${hours}h ${minutes}m`);

    toast({ title: 'Checked Out!', description: `You checked out at ${format(now, 'p')}` });
  };

  const getDayStatus = (day) => {
    const dayOfMonth = day.getDate();
    if (day.getDay() === 0 || day.getDay() === 6) return 'weekend';
    if (dayOfMonth % 10 === 0) return 'absent';
    if (dayOfMonth % 5 === 0) return 'half-day';
    return 'present';
  };

  const DayWithStatus = ({ date, ...props }) => {
    const status = getDayStatus(date);
    let statusClass = '';
    switch (status) {
      case 'present': statusClass = 'bg-green-100 dark:bg-green-900/50'; break;
      case 'absent': statusClass = 'bg-red-100 dark:bg-red-900/50'; break;
      case 'half-day': statusClass = 'bg-yellow-100 dark:bg-yellow-900/50'; break;
      case 'weekend': statusClass = 'text-muted-foreground opacity-50'; break;
      default: break;
    }
    
    return (
      <div className={statusClass} style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {props.children}
      </div>
    );
  };

  const renderView = (viewType) => (
    <div className="text-center p-8 border-2 border-dashed rounded-lg">
      <h3 className="font-semibold">{viewType} View</h3>
      <p className="text-muted-foreground text-sm">This is a placeholder for the {viewType.toLowerCase()} attendance view.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-bold text-lg ${checkInTime && !checkOutTime ? 'text-green-500' : 'text-red-500'}`}>
                  {checkInTime && !checkOutTime ? 'Checked In' : 'Checked Out'}
                </p>
              </div>
              <div className="flex space-x-4 mt-4 sm:mt-0">
                {!checkInTime || checkOutTime ? (
                  <Button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700"><LogIn className="mr-2 h-4 w-4" /> Check In</Button>
                ) : (
                  <Button onClick={handleCheckOut} variant="destructive"><LogOut className="mr-2 h-4 w-4" /> Check Out</Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Time</p>
                <p className="font-semibold">{checkInTime ? format(checkInTime, 'p') : '--:--'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out Time</p>
                <p className="font-semibold">{checkOutTime ? format(checkOutTime, 'p') : '--:--'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Working Hours</p>
                <p className="font-semibold">{workingHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Attendance Log</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-4">{renderView('Daily')}</TabsContent>
              <TabsContent value="weekly" className="mt-4">{renderView('Weekly')}</TabsContent>
              <TabsContent value="monthly" className="mt-4">{renderView('Monthly')}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              components={{ Day: DayWithStatus }}
            />
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/50 mr-2"></span>Present</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/50 mr-2"></span>Absent</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50 mr-2"></span>Half-day</div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-muted mr-2"></span>Weekend</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceTab;