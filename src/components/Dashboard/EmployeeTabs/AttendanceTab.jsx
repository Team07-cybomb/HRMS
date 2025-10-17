import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { 
  LogIn, 
  LogOut, 
  Clock, 
  Camera, 
  MapPin, 
  BarChart3,
  Calendar as CalendarIcon,
  Loader2,
  User,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Navigation,
  Zap,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import { format, differenceInHours, differenceInMinutes, differenceInSeconds, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const AttendanceTab = () => {
  const { user } = useAuth();
  const {
    attendance,
    loading: attendanceLoading,
    fetchAttendance,
    checkIn,
    checkOut,
    getTodayAttendance
  } = useAttendance();

  const [date, setDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [workingHours, setWorkingHours] = useState('0h 0m');
  const [checkInLocation, setCheckInLocation] = useState(null);
  const [checkOutLocation, setCheckOutLocation] = useState(null);
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({ worked: 0, total: 5 });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Enhanced data fetching with loading states
  useEffect(() => {
    if (user?.id) {
      fetchTodayAttendance();
      fetchRecentAttendance();
      calculateWeeklyStats();
    }
  }, [user]);

  // Real-time working hours calculation - UPDATED to update every second
  useEffect(() => {
    let interval;
    
    if (checkInTime && !checkOutTime) {
      // Update immediately
      updateWorkingHours();
      
      // Then set up interval for real-time updates
      interval = setInterval(() => {
        updateWorkingHours();
      }, 1000); // Update every second

      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (checkOutTime) {
      // If checked out, calculate final duration once
      updateWorkingHours();
    }
  }, [checkInTime, checkOutTime]);

  // Function to calculate and update working hours
  const updateWorkingHours = () => {
    if (checkInTime) {
      const endTime = checkOutTime || new Date();
      const totalSeconds = differenceInSeconds(endTime, checkInTime);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Format as "Xh Ym Zs" when actively working, or "Xh Ym" when checked out
      if (!checkOutTime) {
        setWorkingHours(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setWorkingHours(`${hours}h ${minutes}m`);
      }
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      if (user?.id) {
        const todayAtt = await getTodayAttendance(user.id);
        setTodayAttendance(todayAtt);
        
        if (todayAtt) {
          if (todayAtt.checkIn) {
            const checkInDate = new Date(`${new Date().toDateString()} ${todayAtt.checkIn}`);
            setCheckInTime(checkInDate);
          }
          if (todayAtt.checkOut) {
            const checkOutDate = new Date(`${new Date().toDateString()} ${todayAtt.checkOut}`);
            setCheckOutTime(checkOutDate);
            if (todayAtt.checkIn) {
              const checkIn = new Date(`${new Date().toDateString()} ${todayAtt.checkIn}`);
              const hours = differenceInHours(checkOutDate, checkIn);
              const minutes = differenceInMinutes(checkOutDate, checkIn) % 60;
              setWorkingHours(`${hours}h ${minutes}m`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      toast({
        title: 'Data Error',
        description: 'Failed to load today\'s attendance data.',
        variant: 'destructive'
      });
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);
      
      const filters = {
        startDate: sevenDaysAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        employeeId: user?.id
      };
      
      await fetchAttendance(filters);
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
      toast({
        title: 'Data Error',
        description: 'Failed to load attendance history.',
        variant: 'destructive'
      });
    }
  };

  const calculateWeeklyStats = () => {
    if (!attendance) return;
    
    const weekStart = startOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: new Date() });
    
    const workedDays = attendance.filter(record => 
      record.status === 'present' && 
      isSameDay(new Date(record.date), new Date())
    ).length;

    setWeeklyStats({ worked: workedDays, total: weekDays.length });
  };

  // Enhanced location service
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            resolve({
              latitude,
              longitude,
              address: `${data.locality || data.city || 'Unknown'}, ${data.countryName || ''}`,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            resolve({
              latitude,
              longitude,
              address: 'Location detected (details unavailable)',
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            });
          }
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  };

  // Enhanced camera handling
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      setShowCamera(true);
      setIsCapturing(true);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: 'Camera Access Required',
        description: 'Please allow camera access to continue with attendance.',
        variant: 'destructive'
      });
      setShowCamera(false);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCapturing(false);
    setIsProcessing(false);
  };

  const capturePhoto = () => {
    return new Promise((resolve) => {
      if (canvasRef.current && videoRef.current) {
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.9);
        resolve(photoData);
      }
    });
  };

  // Enhanced check-in with loading states
  const handleCheckIn = async () => {
    try {
      if (!user?.id) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in again to continue.',
          variant: 'destructive'
        });
        return;
      }

      setIsProcessing(true);
      await startCamera();
    } catch (error) {
      console.error('Check-in error:', error);
      toast({ 
        title: 'Check-in Failed', 
        description: error.message || 'Unable to start check-in process.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!user?.id) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in again to continue.',
          variant: 'destructive'
        });
        return;
      }

      if (!checkInTime) {
        toast({ 
          title: 'Check-in Required', 
          description: 'You must check in first before checking out.', 
          variant: 'destructive' 
        });
        return;
      }

      setIsProcessing(true);
      await startCamera();
    } catch (error) {
      console.error('Check-out error:', error);
      toast({ 
        title: 'Check-out Failed', 
        description: error.message || 'Unable to start check-out process.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmCheckIn = async () => {
    try {
      setIsProcessing(true);
      const photo = await capturePhoto();
      const location = await getCurrentLocation();

      const checkInData = {
        employeeId: user?.id,
        employee: user?.name || user?.email?.split('@')[0] || 'Employee',
        checkInTime: new Date().toLocaleTimeString('en-US', { hour12: true }),
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy,
        photo: photo,
        teamId: user?.teamId || 1
      };

      await checkIn(checkInData);
      
      const now = new Date();
      setCheckInTime(now);
      setCheckInPhoto(photo);
      setCheckInLocation(location);
      setCheckOutTime(null);
      setWorkingHours('0h 0m 0s'); // Reset with seconds format
      
      stopCamera();
      
      toast({ 
        title: '✅ Checked In Successfully!', 
        description: `You checked in at ${format(now, 'p')} from ${location.address}`,
        duration: 5000
      });

      await fetchTodayAttendance();
      await fetchRecentAttendance();

    } catch (error) {
      console.error('Check-in error:', error);
      toast({ 
        title: 'Check-in Failed', 
        description: error.message || 'Unable to complete check-in process.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmCheckOut = async () => {
    try {
      setIsProcessing(true);
      const photo = await capturePhoto();
      const location = await getCurrentLocation();

      const checkOutData = {
        employeeId: user?.id,
        checkOutTime: new Date().toLocaleTimeString('en-US', { hour12: true }),
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy,
        photo: photo
      };

      await checkOut(checkOutData);

      const now = new Date();
      setCheckOutTime(now);
      setCheckOutPhoto(photo);
      setCheckOutLocation(location);
      
      // Final calculation without seconds
      const hours = differenceInHours(now, checkInTime);
      const minutes = differenceInMinutes(now, checkInTime) % 60;
      setWorkingHours(`${hours}h ${minutes}m`);

      stopCamera();
      
      toast({ 
        title: '✅ Checked Out Successfully!', 
        description: `You checked out at ${format(now, 'p')}. Total: ${hours}h ${minutes}m`,
        duration: 5000
      });

      await fetchTodayAttendance();
      await fetchRecentAttendance();

    } catch (error) {
      console.error('Check-out error:', error);
      toast({ 
        title: 'Check-out Failed', 
        description: error.message || 'Unable to complete check-out process.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced chart data generation
  const generateChartData = () => {
    if (!attendance || attendance.length === 0) {
      return [];
    }

    const last7Days = attendance.slice(-7);
    return last7Days.map(record => {
      const hours = record.duration ? parseFloat(record.duration.split('h')[0]) : 0;
      return {
        day: format(new Date(record.date), 'EEE'),
        date: format(new Date(record.date), 'MMM dd'),
        login: record.checkIn || '--:--',
        hours: hours,
        target: 8,
        status: record.status,
        location: record.location
      };
    });
  };

  const generatePieData = () => {
    if (!attendance || attendance.length === 0) return [];
    
    const statusCount = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status).backgroundColor
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      present: { backgroundColor: '#10b981', textColor: '#ffffff' },
      absent: { backgroundColor: '#ef4444', textColor: '#ffffff' },
      late: { backgroundColor: '#f59e0b', textColor: '#ffffff' },
      'half-day': { backgroundColor: '#3b82f6', textColor: '#ffffff' },
      weekend: { backgroundColor: '#6b7280', textColor: '#ffffff' }
    };
    return colors[status] || { backgroundColor: '#6b7280', textColor: '#ffffff' };
  };

  const getDayStatus = (day) => {
    if (!attendance || attendance.length === 0) return 'default';
    
    const attendanceRecord = attendance.find(record => 
      isSameDay(new Date(record.date), day)
    );
    
    if (attendanceRecord) {
      return attendanceRecord.status;
    }
    
    if (day.getDay() === 0 || day.getDay() === 6) return 'weekend';
    return 'default';
  };

  const DayWithStatus = ({ date, ...props }) => {
    const status = getDayStatus(date);
    const statusColors = {
      present: 'bg-green-500 text-white',
      absent: 'bg-red-500 text-white', 
      late: 'bg-yellow-500 text-white',
      'half-day': 'bg-blue-500 text-white',
      weekend: 'bg-gray-300 text-gray-600',
      default: 'bg-white text-gray-900'
    };

    return (
      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${statusColors[status] || statusColors.default} transition-colors duration-200`}>
        {props.children}
      </div>
    );
  };

  // Custom loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );

  const AttendanceRecord = ({ record, index }) => (
    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-all duration-200 group">
      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(record.status).backgroundColor} ring-2 ring-offset-2 ${getStatusColor(record.status).backgroundColor} ring-opacity-50`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
          <p className="text-sm text-muted-foreground">{record.shift || 'Regular Shift'}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{record.location || 'Office Location'}</span>
          </p>
        </div>
      </div>
      
      <div className="text-right space-y-1">
        <p className="text-sm font-medium whitespace-nowrap">
          {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
        </p>
        <p className="text-sm text-muted-foreground">{record.duration || '0h 0m'}</p>
        <Badge 
          variant="secondary" 
          className="mt-1 capitalize"
          style={{ 
            backgroundColor: getStatusColor(record.status).backgroundColor,
            color: getStatusColor(record.status).textColor
          }}
        >
          {record.status}
        </Badge>
      </div>
      
      {(record.checkInPhoto || record.checkOutPhoto) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedImage(record.checkInPhoto || record.checkOutPhoto);
            setImageDialogOpen(true);
          }}
          className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const renderView = (viewType) => (
    <div className="space-y-3">
      {attendanceLoading ? (
        <LoadingSkeleton />
      ) : attendance && attendance.length > 0 ? (
        attendance.slice(0, 10).map((record, index) => (
          <AttendanceRecord key={index} record={record} index={index} />
        ))
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">No attendance records found</p>
          <p className="text-sm text-muted-foreground mt-2">Your attendance history will appear here once you start checking in</p>
        </div>
      )}
    </div>
  );

  const chartData = generateChartData();
  const pieData = generatePieData();

  return (
    <>
      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Attendance Verification Photo
            </DialogTitle>
            <DialogDescription>
              This photo was captured during your attendance check-in/out for verification purposes.
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Attendance verification" 
                className="max-w-full max-h-96 rounded-lg shadow-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {checkInTime && !checkOutTime ? 'Check Out Verification' : 'Check In Verification'}
            </DialogTitle>
            <DialogDescription>
              Please position your face within the frame for attendance verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
              <video 
                ref={videoRef} 
                className="w-full h-80 object-cover"
                autoPlay 
                playsInline
                muted
              />
              {isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-green-400 border-dashed rounded-lg animate-pulse" />
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure Verification
                </Badge>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="outline"
                onClick={stopCamera}
                className="flex items-center gap-2"
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={checkInTime && !checkOutTime ? confirmCheckOut : confirmCheckIn}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-all duration-200"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {isProcessing ? 'Processing...' : (checkInTime && !checkOutTime ? 'Confirm Check Out' : 'Confirm Check In')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Card */}
          <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-indigo-950/20 border-0 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-indigo-800 rounded-full -ml-12 -mb-12 opacity-50"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl shadow-sm">
                  <CalendarIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Today's Attendance
                  </div>
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {/* Status Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full animate-pulse ${
                        checkInTime && !checkOutTime ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Status</p>
                        <p className={`text-2xl font-bold ${
                          checkInTime && !checkOutTime ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {checkInTime && !checkOutTime ? (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                              Active - Checked In
                            </span>
                          ) : 'Not Checked In'}
                        </p>
                        {checkInTime && !checkOutTime && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Working for <span className="font-mono font-bold text-green-600">{workingHours}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {!checkInTime || checkOutTime ? (
                      <Button 
                        onClick={handleCheckIn}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 h-auto text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                        disabled={attendanceLoading || isProcessing}
                        size="lg"
                      >
                        {attendanceLoading || isProcessing ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <LogIn className="mr-2 h-5 w-5" />
                        )}
                        {isProcessing ? 'Processing...' : 'Check In'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleCheckOut}
                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8 py-4 h-auto text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                        disabled={attendanceLoading || isProcessing}
                        size="lg"
                      >
                        {attendanceLoading || isProcessing ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <LogOut className="mr-2 h-5 w-5" />
                        )}
                        {isProcessing ? 'Processing...' : 'Check Out'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-5 text-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <Clock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Check-in Time</p>
                    <p className="font-bold text-xl my-2">{checkInTime ? format(checkInTime, 'p') : '--:--'}</p>
                    {checkInLocation && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2 line-clamp-2">
                        <Navigation className="w-3 h-3 flex-shrink-0" />
                        {checkInLocation.address}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-5 text-center">
                    <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <LogOut className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Check-out Time</p>
                    <p className="font-bold text-xl my-2">{checkOutTime ? format(checkOutTime, 'p') : '--:--'}</p>
                    {checkOutLocation && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2 line-clamp-2">
                        <Navigation className="w-3 h-3 flex-shrink-0" />
                        {checkOutLocation.address}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-5 text-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center shadow-sm">
                      <BarChart3 className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Working Hours</p>
                    <p className="font-bold text-xl my-2 font-mono">
                      {workingHours}
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {checkOutTime ? 'Completed' : 'Live'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Rest of the component remains the same */}
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Performance Chart */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'hours') return [`${value} hours`, 'Work Hours'];
                            if (name === 'target') return [`${value} hours`, 'Target'];
                            return [value, name];
                          }}
                          labelFormatter={(label, items) => {
                            const item = items?.[0];
                            return item ? `Date: ${item.payload.date}` : label;
                          }}
                          contentStyle={{ 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="hours" 
                          name="Actual Hours"
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="target" 
                          name="Target Hours"
                          fill="#82ca9d" 
                          radius={[4, 4, 0, 0]}
                          opacity={0.7}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>No data available for the selected period</p>
                        <p className="text-sm mt-1">Check in to start tracking your attendance</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} days`, name]}
                          contentStyle={{ borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>No status data available</p>
                        <p className="text-sm mt-1">Your attendance status will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Log */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="w-5 h-5" />
                Attendance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="mt-6">
                  {renderView('Daily')}
                </TabsContent>
                <TabsContent value="weekly" className="mt-6">
                  {renderView('Weekly')}
                </TabsContent>
                <TabsContent value="monthly" className="mt-6">
                  {renderView('Monthly')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Rest of the sidebar components remain the same */}
        <div className="space-y-6">
          {/* Calendar Section */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Attendance Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  Day: DayWithStatus
                }}
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Present</span>
                  </div>
                  <Badge variant="secondary">On time</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Late</span>
                  </div>
                  <Badge variant="secondary">Delayed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent</span>
                  </div>
                  <Badge variant="secondary">No check-in</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-purple-600" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Work Days Completed</span>
                  <span className="font-bold">{weeklyStats.worked}/{weeklyStats.total}</span>
                </div>
                <Progress 
                  value={(weeklyStats.worked / weeklyStats.total) * 100} 
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{weeklyStats.worked}</p>
                  <p className="text-xs text-muted-foreground">Days Worked</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">
                    {weeklyStats.total > 0 ? Math.round((weeklyStats.worked / weeklyStats.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Weekly Goal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-orange-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceLoading ? (
                  <LoadingSkeleton />
                ) : attendance && attendance.length > 0 ? (
                  attendance.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors duration-200">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(record.status).backgroundColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {format(new Date(record.date), 'MMM dd')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs capitalize"
                        style={{ 
                          backgroundColor: getStatusColor(record.status).backgroundColor,
                          color: getStatusColor(record.status).textColor
                        }}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AttendanceTab;