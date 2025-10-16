import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, XCircle, PauseCircle } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

const ApplyLeaveForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "Annual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        toast({
          title: "Invalid Dates",
          description: "End date cannot be before start date",
          variant: "destructive",
        });
        return;
      }
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Leave Type</Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-background"
          required
        >
          <option value="Annual Leave">Annual Leave</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Personal Leave">Personal Leave</option>
          <option value="Unpaid Leave">Unpaid Leave</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Please provide a reason for your leave"
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit Request</Button>
      </DialogFooter>
    </form>
  );
};

const LeaveTab = () => {
  const {
    leaveRequests: leaveApi,
    companyHolidays: holidaysApi,
    employees,
  } = useAppContext();
  const { user } = useAuth();
  const [isApplyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const companyHolidays = holidaysApi.getAll();

  // Enhanced employee ID resolution function
  const getEmployeeId = () => {
    console.log("=== Resolving Employee ID ===");
    console.log("User object:", user);

    const allEmployees = employees.getAll();

    // Check if user has employeeId (unlikely in current setup)
    if (user?.employeeId) {
      console.log("Found employeeId directly in user:", user.employeeId);
      return user.employeeId;
    }

    // Try to match by email (most reliable)
    if (user?.email) {
      console.log("Searching by user email:", user.email);
      const employeeByEmail = allEmployees.find(
        (emp) =>
          emp.email && emp.email.toLowerCase() === user.email.toLowerCase()
      );
      if (employeeByEmail) {
        console.log("Found employee by email match:", employeeByEmail.id);
        return employeeByEmail.id;
      }
    }

    // Try to match by MongoDB _id to employee id (if they're the same)
    if (user?._id) {
      console.log("Searching by user _id:", user._id);
      const employeeById = allEmployees.find((emp) => emp.id === user._id);
      if (employeeById) {
        console.log("Found employee by _id match:", employeeById.id);
        return employeeById.id;
      }
    }

    // Fallback: use the first employee as default (for testing)
    if (allEmployees.length > 0) {
      console.log("Using fallback employee:", allEmployees[0].id);
      return allEmployees[0].id;
    }

    console.log("No employee ID found");
    return null;
  };

  const getEmployeeName = () => {
    // First try to get name from user object
    if (user?.name) {
      return user.name;
    }

    const employeeId = getEmployeeId();
    if (employeeId) {
      const allEmployees = employees.getAll();
      const employee = allEmployees.find((emp) => emp.id === employeeId);
      return employee?.name || "Unknown Employee";
    }

    // Fallback name based on user email
    if (user?.email) {
      const nameFromEmail = user.email.split("@")[0];
      return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }

    return "Unknown Employee";
  };

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      let requests = [];

      // Use employeeId from user context or fallback to id
      const employeeId = getEmployeeId();

      if (employeeId) {
        console.log("Loading leaves for employee:", employeeId);
        requests = await leaveApi.getLeavesByEmployee(employeeId);
      } else {
        console.warn(
          "No employee ID found in user context, user object:",
          user
        );
        // If no employeeId, try to get all leaves and filter by employee name (fallback)
        const allLeaves = await leaveApi.getAll();
        requests = allLeaves.filter((leave) => leave.employee === user?.name);
      }

      console.log("Loaded leave requests:", requests);
      setMyLeaveRequests(requests);
      setAllLeaveRequests(requests);
    } catch (error) {
      console.error("Error loading leave requests:", error);
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      // Calculate days difference
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Get employee ID and name
      const employeeId = getEmployeeId();
      const employeeName = getEmployeeName();

      if (!employeeId) {
        console.error("Unable to identify employee. User object:", user);
        console.error("Available employees:", employees.getAll());

        toast({
          title: "Employee Record Not Found",
          description: `No employee record found for ${user?.email}. Please contact HR to link your account.`,
          variant: "destructive",
        });
        return;
      }

      const newRequest = {
        employee: employeeName,
        employeeId: employeeId,
        type: leaveData.type,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason,
        approver: "HR/Admin",
        days: days,
        status: "pending",
      };

      console.log("Submitting leave request:", newRequest);

      const savedLeave = await leaveApi.add(newRequest);

      // Reload the data to show the new request
      await loadLeaveRequests();

      toast({
        title: "Leave Request Submitted",
        description: "Your request has been sent for approval.",
      });
      setApplyLeaveOpen(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400";
      case "hold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "hold":
        return <PauseCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const DayWithStatus = ({ date, ...props }) => {
    const isHoliday = companyHolidays.some((h) =>
      isSameDay(parseISO(h.date), date)
    );
    const isOnLeave = myLeaveRequests.some((l) => {
      const startDate = l.startDate
        ? parseISO(l.startDate)
        : new Date(l.startDate);
      const endDate = l.endDate ? parseISO(l.endDate) : new Date(l.endDate);
      return date >= startDate && date <= endDate && l.status === "approved";
    });

    let statusClass = "";
    if (isHoliday) statusClass = "bg-purple-100 dark:bg-purple-900/50";
    if (isOnLeave) statusClass = "bg-blue-100 dark:bg-blue-900/50";

    return (
      <div
        className={statusClass}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.children}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading leave requests...
      </div>
    );
  }

  return (
    <>
      <Dialog open={isApplyLeaveOpen} onOpenChange={setApplyLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Fill in the details for your leave request.
            </DialogDescription>
          </DialogHeader>
          <ApplyLeaveForm
            onSave={handleApplyLeave}
            onCancel={() => setApplyLeaveOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Leave Requests</CardTitle>
              <Button onClick={() => setApplyLeaveOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Apply Leave
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myLeaveRequests.length > 0 ? (
                  myLeaveRequests.map((request, index) => (
                    <motion.div
                      key={request._id || request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{request.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.startDate
                                ? format(
                                    new Date(request.startDate),
                                    "MMM dd, yyyy"
                                  )
                                : ""}{" "}
                              to{" "}
                              {request.endDate
                                ? format(
                                    new Date(request.endDate),
                                    "MMM dd, yyyy"
                                  )
                                : ""}
                              {request.days && ` (${request.days} days)`}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span>{request.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {request.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied on:{" "}
                          {request.appliedDate
                            ? format(
                                new Date(request.appliedDate),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    You have not made any leave requests.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar</CardTitle>
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
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-2"></span>
                  My Leave
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-2"></span>
                  Holiday
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LeaveTab;
