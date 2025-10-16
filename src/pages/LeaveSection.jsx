import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CalendarDays,
  PauseCircle,
} from "lucide-react";

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
          className="w-full p-2 border rounded-md"
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

const LeaveSection = () => {
  const { leaveRequests: leaveApi, employees } = useAppContext();
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isApplyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user can approve leaves based on your AuthContext permission structure
  const canApproveLeaves = can("approve:leave");

  // Debug information
  console.log("Current User:", user);
  console.log("Can approve leave:", canApproveLeaves);
  console.log("User role:", user?.role);

  // Enhanced employee ID resolution function
  const getEmployeeId = () => {
    console.log("=== Resolving Employee ID ===");
    console.log("User object:", user);

    // If user has employee ID
    if (user?.employeeId) {
      console.log("Using employee ID from user:", user.employeeId);
      return user.employeeId;
    }

    // For users, find their employee record by email
    if (user?.email) {
      const employee = employees
        .getAll()
        .find((emp) => emp.email === user.email);
      if (employee) {
        console.log("Found employee record:", employee.id);
        return employee.id;
      }
    }

    console.log("No employee ID found, using default EMP001");
    return "EMP001"; // Fallback for demo
  };

  // Load leave requests based on user role
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      console.log("=== Loading Leave Requests ===");
      console.log("User role:", user?.role);
      console.log("Can approve leaves:", canApproveLeaves);

      let requests = [];

      if (canApproveLeaves) {
        // Admin/HR: Load all leave requests
        console.log("Loading all leaves for admin/HR...");
        requests = await leaveApi.getAllForHR();
      } else {
        // Employee: Load only their own leave requests
        const employeeId = getEmployeeId();
        console.log("Loading leaves for employee:", employeeId);
        requests = await leaveApi.getLeavesByEmployee(employeeId);
      }

      console.log("Loaded leave requests:", requests);
      setLeaveRequests(Array.isArray(requests) ? requests : []);
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

  useEffect(() => {
    loadLeaveRequests();
  }, [user?.role]);

  const handleApplyLeave = async (leaveData) => {
    try {
      console.log("=== Applying for Leave ===");
      console.log("Leave data:", leaveData);

      // Get employee ID and details
      const employeeId = getEmployeeId();
      const employee = employees.getAll().find((emp) => emp.id === employeeId);

      if (!employee) {
        throw new Error("Employee not found");
      }

      console.log("Employee found:", employee.name);

      // Calculate number of days
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      const leaveRequestData = {
        employee: employee.name,
        employeeId: employee.id,
        type: leaveData.type,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        days: days,
        reason: leaveData.reason,
        status: "pending",
        appliedDate: new Date().toISOString().split("T")[0],
        approver: employee.manager || "HR Manager",
      };

      console.log("Submitting leave request:", leaveRequestData);

      await leaveApi.add(leaveRequestData);

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      setApplyLeaveOpen(false);
      loadLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error("Error applying for leave:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      console.log("Approving leave:", leaveId);
      await leaveApi.update(leaveId, {
        status: "approved",
        approvedBy: user?.name || "Admin",
      });

      toast({
        title: "Success",
        description: "Leave request approved",
      });

      loadLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (leaveId) => {
    try {
      console.log("Rejecting leave:", leaveId);
      await leaveApi.update(leaveId, {
        status: "rejected",
        rejectedBy: user?.name || "Admin",
      });

      toast({
        title: "Success",
        description: "Leave request rejected",
      });

      loadLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (leaveId) => {
    try {
      console.log("Canceling leave:", leaveId);
      await leaveApi.remove(leaveId);

      toast({
        title: "Success",
        description: "Leave request cancelled",
      });

      loadLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error("Error canceling leave:", error);
      toast({
        title: "Error",
        description: "Failed to cancel leave request",
        variant: "destructive",
      });
    }
  };

  // Filter leave requests based on search and status
  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch = request.employee
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { bg: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { bg: "bg-red-100 text-red-800", icon: XCircle },
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
      "Unpaid Leave": PauseCircle,
    };
    return icons[type] || CalendarDays;
  };

  return (
    <>
      <Helmet>
        <title>Leave Management | HRMS</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Leave Management
            </h1>
            <p className="text-muted-foreground">
              {canApproveLeaves
                ? "Manage and approve employee leave requests"
                : "View and manage your leave requests"}
            </p>
          </div>
          {!canApproveLeaves && (
            <Button onClick={() => setApplyLeaveOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {["requests", "calendar", "balances"].map((tab) => (
              <button
                key={tab}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        {canApproveLeaves && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}

        {/* Leave Requests */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">
                  Loading leave requests...
                </p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No leave requests found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search filters"
                    : canApproveLeaves
                    ? "No leave requests to review"
                    : "You haven't applied for any leave yet"}
                </p>
              </Card>
            ) : (
              filteredRequests.map((request) => {
                const LeaveTypeIcon = getLeaveTypeIcon(request.type);
                return (
                  <motion.div
                    key={request._id || request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <LeaveTypeIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {request.employee}
                              </h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    request.startDate
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    request.endDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">
                                  {request.days}
                                </span>{" "}
                                day
                                {request.days !== 1 ? "s" : ""}
                              </div>
                              <div>{request.type}</div>
                              <div className="truncate" title={request.reason}>
                                {request.reason}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Applied:{" "}
                                {new Date(
                                  request.appliedDate
                                ).toLocaleDateString()}
                              </span>
                              {request.approver && (
                                <span>Approver: {request.approver}</span>
                              )}
                              {request.approvedDate && (
                                <span className="text-green-600">
                                  Approved:{" "}
                                  {new Date(
                                    request.approvedDate
                                  ).toLocaleDateString()}
                                  {request.approvedBy &&
                                    ` by ${request.approvedBy}`}
                                </span>
                              )}
                              {request.rejectedDate && (
                                <span className="text-red-600">
                                  Rejected:{" "}
                                  {new Date(
                                    request.rejectedDate
                                  ).toLocaleDateString()}
                                  {request.rejectedBy &&
                                    ` by ${request.rejectedBy}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - FIXED: Using correct permission check */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          {canApproveLeaves && request.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApprove(request._id || request.id)
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleReject(request._id || request.id)
                                }
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : !canApproveLeaves &&
                            request.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleCancel(request._id || request.id)
                              }
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Calendar View */}
        {activeTab === "calendar" && (
          <Card className="p-6">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground">
                Calendar view will be implemented in the next update
              </p>
            </div>
          </Card>
        )}

        {/* Leave Balances */}
        {activeTab === "balances" && (
          <Card className="p-6">
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Leave Balances</h3>
              <p className="text-muted-foreground">
                Leave balances view will be implemented in the next update
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Apply Leave Dialog */}
      <Dialog open={isApplyLeaveOpen} onOpenChange={setApplyLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Fill in the details below to submit your leave request.
            </DialogDescription>
          </DialogHeader>
          <ApplyLeaveForm
            onSave={handleApplyLeave}
            onCancel={() => setApplyLeaveOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeaveSection;
