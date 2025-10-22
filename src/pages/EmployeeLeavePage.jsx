import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  AlertCircle,
  User,
  CalendarDays,
  TrendingDown,
  Ban,
  RotateCcw,
} from "lucide-react";

const EmployeeLeavePage = () => {
  const { leaveRequests: leaveApi } = useAppContext();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [currentEmployeeBalance, setCurrentEmployeeBalance] = useState({
    annualLeave: 6,
    sickLeave: 6,
    personalLeave: 6,
  });

  // Form state
  const [formData, setFormData] = useState({
    type: "Annual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Check if a leave type is available (has remaining days)
  const isLeaveTypeAvailable = (type) => {
    const remainingDays = getRemainingDays(type);
    return remainingDays > 0;
  };

  // Get available leave types for dropdown
  const getAvailableLeaveTypes = () => {
    const allTypes = [
      { value: "Annual Leave", label: "Annual Leave" },
      { value: "Sick Leave", label: "Sick Leave" },
      { value: "Personal Leave", label: "Personal Leave" },
    ];

    return allTypes.map((type) => ({
      ...type,
      available: isLeaveTypeAvailable(type.value),
      remainingDays: getRemainingDays(type.value),
    }));
  };

  // Fetch all employees from Employee collection
  const fetchAllEmployees = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees");
      if (response.ok) {
        const employees = await response.json();
        return employees;
      }
      return [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  // Get current employee's ID from Employee collection
  const getCurrentEmployeeId = async () => {
    if (!user?.email) return null;

    const employees = await fetchAllEmployees();
    const employee = employees.find((emp) => emp.email === user.email);
    return employee?.employeeId || null;
  };

  // Load leave requests for current employee
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      let requests = [];

      const employeeId = await getCurrentEmployeeId();
      if (!employeeId) {
        console.error("Could not find employee ID for user:", user?.email);
        toast({
          title: "Error",
          description: "Could not load employee information",
          variant: "destructive",
        });
        return;
      }

      setCurrentEmployeeId(employeeId);

      if (leaveApi?.getLeavesByEmployee) {
        requests = await leaveApi.getLeavesByEmployee(employeeId);
      } else {
        // Mock data for testing
        requests = [
          {
            id: "1",
            type: "Annual Leave",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            reason: "Vacation",
            status: "pending",
            days: 1,
            appliedDate: new Date().toISOString(),
            employeeId: employeeId,
          },
        ];
      }

      console.log("Loaded leave requests:", requests);
      setLeaveRequests(Array.isArray(requests) ? requests : []);

      // Calculate balance immediately after loading requests
      calculateBalanceFromApprovedRequests(requests, employeeId);
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

  // Calculate balance from approved leave requests (EXACTLY LIKE LeaveSection.jsx)
  const calculateBalanceFromApprovedRequests = (
    requests = leaveRequests,
    employeeId = currentEmployeeId
  ) => {
    if (!employeeId) return;

    // Start with default balances (same as LeaveSection.jsx)
    const balance = {
      annualLeave: 6,
      sickLeave: 6,
      personalLeave: 6,
    };

    console.log("Calculating balance for employee:", employeeId);
    console.log("All leave requests for calculation:", requests);

    // Deduct only approved leaves (EXACT SAME LOGIC AS LeaveSection.jsx)
    requests.forEach((request) => {
      if (request.status === "approved" && request.employeeId === employeeId) {
        const fieldMap = {
          "Annual Leave": "annualLeave",
          "Sick Leave": "sickLeave",
          "Personal Leave": "personalLeave",
        };

        const field = fieldMap[request.type];
        // Only deduct from paid leave types (same as LeaveSection.jsx)
        if (field) {
          const days = request.days || 1;
          console.log(
            `Deducting ${days} days from ${field} for ${request.type}`
          );
          balance[field] = Math.max(0, balance[field] - days);
        }
      }
    });

    console.log("Final calculated balance:", balance);
    setCurrentEmployeeBalance(balance);
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadLeaveRequests();
    }
  }, [user]);

  // Update balance whenever leaveRequests or currentEmployeeId changes
  useEffect(() => {
    if (leaveRequests.length > 0 && currentEmployeeId) {
      console.log(
        "Recalculating balance due to leaveRequests or employeeId change"
      );
      calculateBalanceFromApprovedRequests(leaveRequests, currentEmployeeId);
    }
  }, [leaveRequests, currentEmployeeId]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { bg: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { bg: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { bg: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const variant = variants[status] || variants.pending;
    const IconComponent = variant.icon;

    return (
      <Badge className={`${variant.bg} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      "Annual Leave": Calendar,
      "Sick Leave": AlertCircle,
      "Personal Leave": User,
    };
    return icons[type] || CalendarDays;
  };

  const handleCancel = async (leaveId) => {
    try {
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, {
          status: "cancelled",
          actionBy: user?.name || "Employee",
        });
      } else {
        // Mock update for testing
        console.log(`Cancelling leave ${leaveId}`);
      }

      toast({
        title: "Success",
        description: "Leave request cancelled successfully",
      });

      loadLeaveRequests(); // Refresh the list
      // Balance will automatically update via useEffect
    } catch (error) {
      console.error("Error canceling leave:", error);
      toast({
        title: "Error",
        description: "Failed to cancel leave request",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check if selected leave type is available
    if (!isLeaveTypeAvailable(formData.type)) {
      toast({
        title: "Leave Not Available",
        description: `${formData.type} is not available. You have 0 days remaining.`,
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate < startDate) {
      toast({
        title: "Validation Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }

    // Check if there are enough leave days for paid leaves
    const remainingDays = getRemainingDays(formData.type);
    const requestedDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    if (requestedDays > remainingDays) {
      toast({
        title: "Insufficient Leave Balance",
        description: `You only have ${remainingDays} days remaining for ${formData.type}. You requested ${requestedDays} days.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get employee data from Employee collection
      const employeeId = await getCurrentEmployeeId();
      if (!employeeId) {
        toast({
          title: "Error",
          description: "Could not find your employee information",
          variant: "destructive",
        });
        return;
      }

      const employees = await fetchAllEmployees();
      const employee = employees.find((emp) => emp.employeeId === employeeId);

      if (!employee) {
        toast({
          title: "Error",
          description: "Could not find your employee record",
          variant: "destructive",
        });
        return;
      }

      // Calculate the number of days
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      const leaveData = {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
        employee: employee.name,
        employeeId: employeeId,
        employeeEmail: employee.email,
        approver: "HR Manager",
        approverId: "HR001",
        status: "pending",
        days: days,
      };

      console.log("Submitting leave request:", leaveData);

      if (leaveApi?.create) {
        await leaveApi.create(leaveData);
      } else {
        // Mock create for testing
        console.log("Creating leave request with PENDING status:", leaveData);
      }

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      setShowForm(false);
      setFormData({
        type: "Annual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      loadLeaveRequests(); // Refresh the list
      // Balance will automatically update via useEffect when requests are loaded
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get remaining days for current leave type
  const getRemainingDays = (type) => {
    const balanceMap = {
      "Annual Leave": currentEmployeeBalance.annualLeave,
      "Sick Leave": currentEmployeeBalance.sickLeave,
      "Personal Leave": currentEmployeeBalance.personalLeave,
    };

    return balanceMap[type] || 0;
  };

  // Get balance color based on remaining days (same as LeaveSection.jsx)
  const getBalanceColor = (days) => {
    if (days >= 4) return "text-green-600";
    if (days >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  // Handle leave type change in form
  const handleLeaveTypeChange = (value) => {
    setFormData({ ...formData, type: value });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">
          Loading your leave information...
        </p>
      </div>
    );
  }

  const availableLeaveTypes = getAvailableLeaveTypes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Leave Requests</h2>
          <p className="text-muted-foreground">
            Track and manage your leave applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadLeaveRequests}
            disabled={loading}
          >
            <RotateCcw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Employee Leave Balance Card */}
      {currentEmployeeBalance && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            My Leave Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div
                className={`text-2xl font-bold ${getBalanceColor(
                  currentEmployeeBalance.annualLeave
                )}`}
              >
                {currentEmployeeBalance.annualLeave}
              </div>
              <div className="text-sm text-muted-foreground">Annual Leave</div>
              <div className="text-xs text-gray-500">/ 6 days</div>
              {currentEmployeeBalance.annualLeave === 0 && (
                <div className="text-xs text-red-500 font-medium mt-1 flex items-center justify-center gap-1">
                  <Ban className="w-3 h-3" />
                  Not Available
                </div>
              )}
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div
                className={`text-2xl font-bold ${getBalanceColor(
                  currentEmployeeBalance.sickLeave
                )}`}
              >
                {currentEmployeeBalance.sickLeave}
              </div>
              <div className="text-sm text-muted-foreground">Sick Leave</div>
              <div className="text-xs text-gray-500">/ 6 days</div>
              {currentEmployeeBalance.sickLeave === 0 && (
                <div className="text-xs text-red-500 font-medium mt-1 flex items-center justify-center gap-1">
                  <Ban className="w-3 h-3" />
                  Not Available
                </div>
              )}
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div
                className={`text-2xl font-bold ${getBalanceColor(
                  currentEmployeeBalance.personalLeave
                )}`}
              >
                {currentEmployeeBalance.personalLeave}
              </div>
              <div className="text-sm text-muted-foreground">
                Personal Leave
              </div>
              <div className="text-xs text-gray-500">/ 6 days</div>
              {currentEmployeeBalance.personalLeave === 0 && (
                <div className="text-xs text-red-500 font-medium mt-1 flex items-center justify-center gap-1">
                  <Ban className="w-3 h-3" />
                  Not Available
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Leave Requests List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">My Leave Requests</h3>
        {leaveRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leave requests</h3>
            <p className="text-muted-foreground mb-4">
              You haven't applied for any leave yet
            </p>
            <Button onClick={() => setShowForm(true)}>
              Apply for Your First Leave
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => {
              const LeaveTypeIcon = getLeaveTypeIcon(request.type);
              const remainingDays = getRemainingDays(request.type);

              return (
                <Card key={request._id || request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <LeaveTypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.type}</h3>
                          {getStatusBadge(request.status)}
                          <Badge
                            variant="outline"
                            className={`${
                              remainingDays === 0
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {remainingDays === 0 ? (
                              <span className="flex items-center gap-1">
                                <Ban className="w-3 h-3" />
                                No Balance
                              </span>
                            ) : (
                              `Balance: ${remainingDays} days`
                            )}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(request.startDate).toLocaleDateString()}{" "}
                              - {new Date(request.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {request.days || 1}
                            </span>{" "}
                            day
                            {request.days !== 1 ? "s" : ""}
                          </div>
                          <div className="truncate" title={request.reason}>
                            {request.reason}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Applied:{" "}
                            {new Date(request.appliedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCancel(request._id || request.id)
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Apply for Leave
                {currentEmployeeId && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Employee ID: {currentEmployeeId})
                  </span>
                )}
              </h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Leave Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={handleLeaveTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLeaveTypes.map((leaveType) => (
                          <SelectItem
                            key={leaveType.value}
                            value={leaveType.value}
                            disabled={!leaveType.available}
                            className={
                              !leaveType.available
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          >
                            <div className="flex justify-between items-center w-full">
                              <span>{leaveType.label}</span>
                              {!leaveType.available && (
                                <Badge
                                  variant="destructive"
                                  className="ml-2 text-xs"
                                >
                                  Not Available
                                </Badge>
                              )}
                              {leaveType.available && (
                                <span className="text-xs text-green-600 ml-2">
                                  {leaveType.remainingDays} days left
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isLeaveTypeAvailable(formData.type) && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
                        <Ban className="w-4 h-4" />
                        <span>
                          <strong>{formData.type}</strong> is not available. You
                          have 0 days remaining.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Duration</Label>
                    <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                      {formData.startDate && formData.endDate
                        ? `${
                            Math.ceil(
                              (new Date(formData.endDate) -
                                new Date(formData.startDate)) /
                                (1000 * 60 * 60 * 24)
                            ) + 1
                          } days`
                        : "Select dates to calculate duration"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                      disabled={!isLeaveTypeAvailable(formData.type)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                      disabled={!isLeaveTypeAvailable(formData.type)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for your leave..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    required
                    rows={3}
                    disabled={!isLeaveTypeAvailable(formData.type)}
                  />
                </div>

                {/* Leave Balance Preview */}
                {currentEmployeeId && (
                  <div
                    className={`p-3 rounded-lg ${
                      isLeaveTypeAvailable(formData.type)
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {isLeaveTypeAvailable(formData.type) ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            Current {formData.type} Balance:{" "}
                            {getRemainingDays(formData.type)} days
                          </span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">
                            {formData.type} Not Available - 0 days remaining
                          </span>
                        </>
                      )}
                    </div>
                    {formData.startDate &&
                      formData.endDate &&
                      isLeaveTypeAvailable(formData.type) && (
                        <div className="mt-2 text-sm text-blue-700">
                          Requested:{" "}
                          {Math.ceil(
                            (new Date(formData.endDate) -
                              new Date(formData.startDate)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{" "}
                          days | Remaining after approval:{" "}
                          {getRemainingDays(formData.type) -
                            (Math.ceil(
                              (new Date(formData.endDate) -
                                new Date(formData.startDate)) /
                                (1000 * 60 * 60 * 24)
                            ) +
                              1)}{" "}
                          days
                        </div>
                      )}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      submitting || !isLeaveTypeAvailable(formData.type)
                    }
                  >
                    {submitting
                      ? "Submitting..."
                      : !isLeaveTypeAvailable(formData.type)
                      ? "Leave Not Available"
                      : "Submit Leave Request"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeavePage;
