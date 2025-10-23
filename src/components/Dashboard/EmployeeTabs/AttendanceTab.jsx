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
  BarChart3,
  Calendar as CalendarIcon,
  Loader2,
  User,
  XCircle,
  Image as ImageIcon,
  TrendingUp,
  Users,
  Building
} from 'lucide-react';
import { format, differenceInHours, differenceInMinutes, differenceInSeconds, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// In AttendanceTab.jsx - Fix the authentication check
const AttendanceTab = () => {
  const { user, isAuthenticated } = useAuth(); // Add isAuthenticated
  const {
    attendance,
    loading: attendanceLoading,
    fetchAttendance,
    checkIn,
    checkOut,
    getTodayAttendance
  } = useAttendance();

  // Add authentication state check
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.employeeId) {
      console.log('User authenticated, employeeId:', user.employeeId);
      setAuthChecked(true);
      fetchTodayAttendance();
      fetchRecentAttendance();
      
      fetchShiftDetails();
    } else {
      console.log('User not authenticated or missing employeeId');
      setAuthChecked(true);
    }
  }, [isAuthenticated, user]);

  const [date, setDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [workingHours, setWorkingHours] = useState('0h 0m');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState({ worked: 0, total: 5 });
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftSchedule, setShiftSchedule] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ==============================
  // EFFECT HOOKS
  // ==============================

  // useEffect(() => {
  //   if (user?.employeeId) {
  //     console.log('User employeeId:', user.employeeId);
  //     fetchTodayAttendance();
  //     fetchRecentAttendance();
  //    
  //     fetchShiftDetails();
  //   }
  // }, [user]);

  useEffect(() => {
    let interval;
    
    if (checkInTime && !checkOutTime) {
      updateWorkingHours();
      
      interval = setInterval(() => {
        updateWorkingHours();
      }, 1000);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (checkOutTime) {
      updateWorkingHours();
    }
  }, [checkInTime, checkOutTime]);

  // ==============================
  // CORE FUNCTIONS
  // ==============================

// In AttendanceTab.jsx - Update the working hours display to show break info
const updateWorkingHours = () => {
  if (checkInTime) {
    const endTime = checkOutTime || new Date();
    const totalSeconds = differenceInSeconds(endTime, checkInTime);
    
    // Calculate break duration (default 1 hour)
    const breakSeconds = 60 * 60; // 1 hour in seconds
    
    // Subtract break time if working more than 4 hours (typical for lunch break)
    const netSeconds = totalSeconds > (4 * 60 * 60) ? Math.max(0, totalSeconds - breakSeconds) : totalSeconds;
    
    const hours = Math.floor(netSeconds / 3600);
    const minutes = Math.floor((netSeconds % 3600) / 60);
    const seconds = netSeconds % 60;
    
    if (!checkOutTime) {
      setWorkingHours(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setWorkingHours(`${hours}h ${minutes}m`);
    }
  }
};



const fetchShiftDetails = async () => {
  try {
    const token = localStorage.getItem('hrms_token');
    
    // Get employeeId from multiple sources for fallback
    let employeeId = user?.employeeId;
    if (!employeeId) {
      const storedUser = localStorage.getItem('hrms_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        employeeId = parsedUser.employeeId;
      }
    }

    console.log('Fetching shift details for employeeId:', employeeId);
    
    if (!employeeId) {
      console.error('No employeeId available for shift fetch');
      setCurrentShift(null);
      setShiftSchedule([]);
      return;
    }

    const response = await fetch(`http://localhost:5000/api/employees/employeesShifts?employeeId=${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Shift API Response:', data);
      
      let currentShift = null;
      
      // Find the most recent active shift assignment
      if (data.success && data.assignments && data.assignments.length > 0) {
        // Sort by effectiveDate to get the most recent assignment
        const sortedAssignments = data.assignments.sort((a, b) => 
          new Date(b.effectiveDate) - new Date(a.effectiveDate)
        );
        
        currentShift = sortedAssignments[0]; // Take the most recent active assignment
        console.log('Found current shift assignment:', currentShift);
      }
      
      if (currentShift) {
        setCurrentShift(currentShift);
        
        // Generate dynamic weekly schedule based on the actual shift
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        const weekDays = eachDayOfInterval({ 
          start: weekStart, 
          end: weekEnd 
        });
        
        const schedule = weekDays.map(day => ({
          day: format(day, 'EEEE'),
          date: day,
          shift: currentShift,
          status: getDayScheduleStatus(day)
        }));
        
        setShiftSchedule(schedule);
      } else {
        console.log('No active shift assignment found for current user');
        setCurrentShift(null);
        setShiftSchedule([]);
      }
    } else {
      console.error('Failed to fetch shift assignments:', response.status);
      setCurrentShift(null);
      setShiftSchedule([]);
    }
  } catch (error) {
    console.error('Error fetching shift assignments:', error);
    setCurrentShift(null);
    setShiftSchedule([]);
  }
};

  const getDayScheduleStatus = (day) => {
    const today = new Date();
    if (isSameDay(day, today)) {
      return checkInTime ? (checkOutTime ? 'completed' : 'in-progress') : 'scheduled';
    }
    if (day < today) return 'completed';
    if (day > today) return 'scheduled';
    return 'scheduled';
  };

const fetchTodayAttendance = async () => {
  try {
    if (user?.employeeId) {
      console.log('Fetching today attendance for:', user.employeeId);
      
      const todayAtt = await getTodayAttendance(user.employeeId);
      console.log('Today attendance raw response:', todayAtt);
      
      setTodayAttendance(todayAtt);
      
      if (todayAtt && todayAtt._id) {
        console.log('Found attendance record:', {
          checkIn: todayAtt.checkIn,
          checkOut: todayAtt.checkOut,
          duration: todayAtt.duration
        });
        
        // Simple time setting - just store the time strings
        // The UI can display these directly without complex date parsing
        if (todayAtt.checkIn) {
          // Create a date object for time calculations
          const now = new Date();
          const [time, period] = todayAtt.checkIn.split(' ');
          const [hours, minutes] = time.split(':');
          
          let hourInt = parseInt(hours);
          if (period === 'PM' && hourInt < 12) hourInt += 12;
          if (period === 'AM' && hourInt === 12) hourInt = 0;
          
          const checkInDate = new Date(now);
          checkInDate.setHours(hourInt, parseInt(minutes), 0, 0);
          setCheckInTime(checkInDate);
        }
        
        if (todayAtt.checkOut) {
          const now = new Date();
          const [time, period] = todayAtt.checkOut.split(' ');
          const [hours, minutes] = time.split(':');
          
          let hourInt = parseInt(hours);
          if (period === 'PM' && hourInt < 12) hourInt += 12;
          if (period === 'AM' && hourInt === 12) hourInt = 0;
          
          const checkOutDate = new Date(now);
          checkOutDate.setHours(hourInt, parseInt(minutes), 0, 0);
          setCheckOutTime(checkOutDate);
        }
        
        // Use duration from backend if available, otherwise calculate
        if (todayAtt.duration) {
          setWorkingHours(todayAtt.duration);
        } else if (todayAtt.checkIn && todayAtt.checkOut && checkInTime && checkOutTime) {
          const hours = differenceInHours(checkOutTime, checkInTime);
          const minutes = differenceInMinutes(checkOutTime, checkInTime) % 60;
          setWorkingHours(`${hours}h ${minutes}m`);
        }
        
      } else {
        console.log('No attendance record found for today');
        setCheckInTime(null);
        setCheckOutTime(null);
        setWorkingHours('0h 0m');
      }
    } else {
      console.log('No employeeId available for fetching attendance');
    }
  } catch (error) {
    console.error('Error in fetchTodayAttendance:', error);
    
    // Check if it's a 404 (no record) vs other errors
    if (error.response?.status === 404) {
      console.log('No attendance record exists for today (404)');
      setCheckInTime(null);
      setCheckOutTime(null);
      setWorkingHours('0h 0m');
    } else {
      toast({
        title: 'Attendance Data Error',
        description: error.response?.data?.message || 'Failed to load attendance data',
        variant: 'destructive'
      });
    }
  }
};

  const fetchRecentAttendance = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filters = {
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        employeeId: user?.employeeId
      };
      
      console.log('Fetching attendance with filters:', filters);
      
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



  // ==============================
  // LOCATION & CAMERA SERVICES
  // ==============================

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

  // ==============================
  // ATTENDANCE ACTIONS
  // ==============================

// In AttendanceTab.jsx - Enhanced handleCheckIn with robust employeeId handling
const handleCheckIn = async () => {
  try {
    // Get authentication data from multiple sources
    const token = localStorage.getItem('hrms_token');
    const storedUser = localStorage.getItem('hrms_user');
    
    let employeeId = user?.employeeId;
    
    console.log('Auth check:', {
      hasContextUser: !!user,
      contextEmployeeId: user?.employeeId,
      hasStoredUser: !!storedUser,
      hasToken: !!token
    });

    // If no employeeId from context, try localStorage
    if (!employeeId && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        employeeId = parsedUser.employeeId;
        console.log('Using stored user employeeId:', employeeId);
      } catch (parseError) {
        console.error('Error parsing stored user:', parseError);
      }
    }

    // Final check - if still no employeeId, show error
    if (!employeeId) {
      console.error('No employeeId found in any source:', {
        context: user,
        stored: storedUser ? JSON.parse(storedUser) : null
      });
      
      toast({
        title: 'Employee ID Missing',
        description: 'Unable to find your employee ID. Please log in again.',
        variant: 'destructive'
      });
      return;
    }

    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in again to continue.',
        variant: 'destructive'
      });
      return;
    }

    console.log('Proceeding with check-in for employeeId:', employeeId);
    setIsProcessing(true);
    await startCamera();
  } catch (error) {
    console.error('Check-in authentication error:', error);
    toast({ 
      title: 'Check-in Failed', 
      description: error.message || 'Unable to start check-in process.', 
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
      employeeId: user?.employeeId,
      employee: user?.name || user?.email?.split('@')[0] || 'Employee',
      checkInTime: new Date().toLocaleTimeString('en-US', { hour12: true }),
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      accuracy: location.accuracy,
      photo: photo,
      teamId: user?.teamId || 1
    };

    console.log('Check-in data being sent:', checkInData);

    await checkIn(checkInData);
    
    const now = new Date();
    setCheckInTime(now);
    
    stopCamera();
    
    toast({ 
      title: '✅ Checked In Successfully!', 
      description: `You checked in at ${format(now, 'p')}`,
      duration: 5000
    });

    // Refresh all data after check-in including shift details
    await fetchTodayAttendance();
    await fetchRecentAttendance();
    await fetchShiftDetails(); // Add await here
   

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
      employeeId: user?.employeeId,
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
    await fetchShiftDetails(); // Add await here
   

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
 // Add similar enhanced authentication to handleCheckOut
  const handleCheckOut = async () => {
    try {
      // Enhanced authentication check
      if (!isAuthenticated || !user?.employeeId) {
        const token = localStorage.getItem('hrms_token');
        if (!token) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in again to continue.',
            variant: 'destructive'
          });
          return;
        }
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
      console.error('Check-out authentication error:', error);
      toast({ 
        title: 'Authentication Failed', 
        description: 'Please log in again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };



  // ==============================
  // DATA PROCESSING & UTILITIES
  // ==============================

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

  // ==============================
  // COMPONENTS
  // ==============================

  const DayWithStatus = ({ date, ...props }) => {
    const status = getDayStatus(date);
    const isToday = isSameDay(date, new Date());
    
    const statusColors = {
      present: 'bg-green-500 text-white hover:bg-green-600',
      absent: 'bg-red-500 text-white hover:bg-red-600', 
      late: 'bg-yellow-500 text-white hover:bg-yellow-600',
      'half-day': 'bg-blue-500 text-white hover:bg-blue-600',
      weekend: 'bg-gray-300 text-gray-600 hover:bg-gray-400',
      default: 'bg-white text-gray-900 hover:bg-gray-100'
    };

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const displayStatus = isWeekend ? 'weekend' : status;

    return (
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
          statusColors[displayStatus] || statusColors.default
        } ${
          isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        onClick={() => setDate(date)}
      >
        {date.getDate()}
      </div>
    );
  };

  const getDayStatus = (day) => {
    if (!attendance || attendance.length === 0) return 'default';
    
    const attendanceRecord = attendance.find(record => {
      try {
        const recordDate = new Date(record.date);
        return isSameDay(recordDate, day);
      } catch (error) {
        return false;
      }
    });
    
    if (attendanceRecord) {
      return attendanceRecord.status || 'default';
    }
    
    if (day > new Date()) return 'default';
    if (day.getDay() === 0 || day.getDay() === 6) return 'weekend';
    
    return 'absent';
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg animate-pulse">
          <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-2 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  );

  const renderView = (viewType) => (
    <div className="space-y-2">
      {attendanceLoading ? (
        <LoadingSkeleton />
      ) : attendance && attendance.length > 0 ? (
        attendance.slice(0, 8).map((record, index) => (
          <div key={record._id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all duration-200 group">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(record.status).backgroundColor} ring-2 ring-offset-1 ${getStatusColor(record.status).backgroundColor} ring-opacity-50`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {record.date ? format(new Date(record.date), 'MMM dd, yyyy') : 'Unknown Date'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {record.shiftName || record.shift || 'General Shift'}
                </p>
              </div>
            </div>
            
            <div className="text-right space-y-1 flex-shrink-0 ml-2">
              <p className="text-xs font-medium whitespace-nowrap">
                {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
              </p>
              <p className="text-xs text-muted-foreground">{record.duration || '0h 0m'}</p>
              <Badge 
                variant="secondary" 
                className="text-xs capitalize px-2 py-0"
                style={{ 
                  backgroundColor: getStatusColor(record.status).backgroundColor,
                  color: getStatusColor(record.status).textColor
                }}
              >
                {record.status || 'unknown'}
              </Badge>
            </div>
            
            {(record.checkInPhoto || record.checkOutPhoto || record.photo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedImage(record.checkInPhoto || record.checkOutPhoto || record.photo);
                  setImageDialogOpen(true);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-7 w-7"
              >
                <ImageIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))
      ) : (
        <div className="text-center p-6 border-2 border-dashed rounded-lg bg-muted/20">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No attendance records found</p>
          <p className="text-xs text-muted-foreground mt-1">Your attendance history will appear here once you start checking in</p>
        </div>
      )}
    </div>
  );

const ShiftScheduleItem = ({ day, index }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
      'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'scheduled': { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'absent': { label: 'Absent', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    return statusConfig[status] || statusConfig.scheduled;
  };

  const statusConfig = getStatusBadge(day.status);
  
  // Use dynamic shift data - fallback to currentShift if day.shift is not available
  const shiftData = day.shift || currentShift;
  const shiftStart = shiftData?.startTime || '09:00';
  const shiftEnd = shiftData?.endTime || '17:00';
  const shiftName = shiftData?.shiftName || shiftData?.name || 'General';

  return (
    <div key={index} className="flex items-center justify-between p-2 border rounded text-xs hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${
          day.status === 'completed' ? 'bg-green-500' : 
          day.status === 'in-progress' ? 'bg-yellow-500' :
          day.status === 'absent' ? 'bg-red-500' :
          'bg-blue-500'
        }`} />
        <div>
          <p className="font-medium">{format(day.date, 'EEE')}</p>
          <p className="text-muted-foreground">{format(day.date, 'MMM dd')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-xs">
          {shiftStart} - {shiftEnd}
        </p>
        <p className="text-xs text-muted-foreground mb-1">{shiftName}</p>
        <Badge 
          variant="secondary" 
          className={`text-xs capitalize px-1.5 py-0 ${statusConfig.color}`}
        >
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
};
  // ==============================
  // RENDER
  // ==============================

  return (
    <>
      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="w-4 h-4" />
              Attendance Verification Photo
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img 
                src={selectedImage} 
                alt="Attendance verification" 
                className="max-w-full max-h-80 rounded-lg shadow-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4" />
              {checkInTime && !checkOutTime ? 'Check Out Verification' : 'Check In Verification'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
              <video 
                ref={videoRef} 
                className="w-full h-64 object-cover"
                autoPlay 
                playsInline
                muted
              />
              {isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-400 border-dashed rounded-lg animate-pulse" />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                variant="outline"
                onClick={stopCamera}
                className="flex items-center gap-2 text-xs"
                disabled={isProcessing}
                size="sm"
              >
                <XCircle className="w-3 h-3" />
                Cancel
              </Button>
              <Button
                onClick={checkInTime && !checkOutTime ? confirmCheckOut : confirmCheckIn}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-xs"
                size="sm"
              >
                {isProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
                {isProcessing ? 'Processing...' : (checkInTime && !checkOutTime ? 'Confirm Check Out' : 'Confirm Check In')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Today's Attendance Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Today's Attendance
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {format(new Date(), 'MMM dd, yyyy')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Status Row */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    checkInTime && !checkOutTime ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className={`font-semibold text-sm ${
                      checkInTime && !checkOutTime ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {checkInTime && !checkOutTime ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                          Active - Checked In
                        </span>
                      ) : checkOutTime ? 'Checked Out' : 'Not Checked In'}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {!checkInTime || checkOutTime ? (
                    <Button 
                      onClick={handleCheckIn}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 text-sm"
                      disabled={attendanceLoading || isProcessing}
                      size="sm"
                    >
                      {attendanceLoading || isProcessing ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <LogIn className="mr-1 h-3 w-3" />
                      )}
                      {isProcessing ? 'Processing...' : 'Check In'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCheckOut}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 text-sm"
                      disabled={attendanceLoading || isProcessing}
                      size="sm"
                    >
                      {attendanceLoading || isProcessing ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <LogOut className="mr-1 h-3 w-3" />
                      )}
                      {isProcessing ? 'Processing...' : 'Check Out'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-0 shadow-xs">
                  <CardContent className="p-3 text-center">
                    <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="font-semibold text-sm">{checkInTime ? format(checkInTime, 'p') : '--:--'}</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xs">
                  <CardContent className="p-3 text-center">
                    <LogOut className="w-4 h-4 text-red-600 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="font-semibold text-sm">{checkOutTime ? format(checkOutTime, 'p') : '--:--'}</p>
                  </CardContent>
                </Card>

<Card className="border-0 shadow-xs">
  <CardContent className="p-3 text-center">
    <BarChart3 className="w-4 h-4 text-green-600 mx-auto mb-1" />
    <p className="text-xs text-muted-foreground">Net Hours</p>
    <p className="font-semibold text-sm font-mono">{workingHours}</p>
    {checkOutTime && (
      <p className="text-xs text-muted-foreground mt-1">(1h break deducted)</p>
    )}
  </CardContent>
</Card>
              </div>

           {/* Shift Information - Dynamic Data Only */}
{currentShift ? (
  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <div>
          <p className="text-sm font-medium">
            {currentShift.shiftName || 'General Shift'}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentShift.startTime || '09:00'} - {currentShift.endTime || '17:00'}
            {currentShift.breakDuration ? ` • Break: ${currentShift.breakDuration}m` : ''}
          </p>
          {currentShift.effectiveDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Effective: {format(new Date(currentShift.effectiveDate), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </div>
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
        {currentShift.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  </div>
) : (
  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-yellow-600" />
      <div>
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          No Shift Assigned
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          Please contact HR to assign you a shift schedule
        </p>
      </div>
    </div>
  </div>
)}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-4">
          
          {/* Calendar Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                Attendance Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                components={{
                  Day: DayWithStatus
                }}
              />
              
              {/* Selected Date Details */}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {format(date, 'MMM dd, yyyy')}
                </p>
                {(() => {
                  const attendanceRecord = attendance?.find(record => 
                    isSameDay(new Date(record.date), date)
                  );
                  
                  if (attendanceRecord) {
                    return (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in:</span>
                          <span className="font-medium">{attendanceRecord.checkIn || '--:--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out:</span>
                          <span className="font-medium">{attendanceRecord.checkOut || '--:--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{attendanceRecord.duration || '0h 0m'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge 
                            variant="secondary"
                            className="text-xs px-2 py-0"
                            style={{ 
                              backgroundColor: getStatusColor(attendanceRecord.status).backgroundColor,
                              color: getStatusColor(attendanceRecord.status).textColor
                            }}
                          >
                            {attendanceRecord.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  } else if (date.getDay() === 0 || date.getDay() === 6) {
                    return (
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-muted-foreground">
                        Weekend
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-muted-foreground">
                        No attendance record
                      </div>
                    );
                  }
                })()}
              </div>
            </CardContent>
          </Card>

{/* Shift Schedule - Only show if we have shift data */}
{/* {currentShift ? (
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-blue-600" />
        This Week's Schedule - {currentShift.shiftName}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {shiftSchedule.map((day, index) => (
        <ShiftScheduleItem key={index} day={day} index={index} />
      ))}
    </CardContent>
  </Card>
) : (
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-gray-400" />
        Shift Schedule
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center p-4 text-muted-foreground">
        <p className="text-sm">No shift assigned</p>
        <p className="text-xs mt-1">Contact HR for shift assignment</p>
      </div>
    </CardContent>
  </Card>
)} */}
        </div>
      </div>

      {/* Attendance History */}
      <Card className="mt-4 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-blue-600" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-3">
            <TabsContent value="list" className="space-y-2">
              {renderView('list')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default AttendanceTab;