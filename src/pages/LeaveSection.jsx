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
  PauseCircle,
  Filter,
  Search,
  Users,
  FileText,
} from "lucide-react";

const LeaveSection = () => {
  const { leaveRequests: leaveApi, employees } = useAppContext();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    type: "Annual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Check if user can manage leaves
  const canManageLeaves = () => {
    return (
      user?.role === "admin" || user?.role === "hr" || user?.role === "employer"
    );
  };

  // Load leave requests based on user role
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      let requests = [];

      if (canManageLeaves()) {
        // Admin/HR view - all requests
        if (leaveApi?.getAll) {
          requests = await leaveApi.getAll();
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
              employee: "John Doe",
              employeeId: "EMP001",
            },
            {
              id: "2",
              type: "Sick Leave",
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
              reason: "Flu",
              status: "approved",
              days: 2,
              appliedDate: new Date(Date.now() - 86400000).toISOString(),
              employee: "Jane Smith",
              employeeId: "EMP002",
              approvedDate: new Date().toISOString(),
              approvedBy: "HR Manager",
            },
          ];
        }
      } else {
        // Employee view - only their requests
        const employeeId = getEmployeeId();
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
            },
          ];
        }
      }

      // Apply status filter
      if (statusFilter !== "all") {
        requests = requests.filter((req) => req.status === statusFilter);
      }

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

  // Get employee ID for current user
  const getEmployeeId = () => {
    if (user?.employeeId) return user.employeeId;
    const employee = employees
      ?.getAll()
      ?.find((emp) => emp.email === user?.email);
    return employee?.id || user?.id || "EMP001";
  };

  // Get employee name for current user
  const getEmployeeName = () => {
    if (user?.name) return user.name;
    const employee = employees
      ?.getAll()
      ?.find((emp) => emp.email === user?.email);
    return employee?.name || user?.email?.split("@")[0] || "Employee";
  };

  // Apply filters
  useEffect(() => {
    let filtered = leaveRequests;

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.employee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [leaveRequests, searchTerm]);

  useEffect(() => {
    loadLeaveRequests();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeId = getEmployeeId();
      const employeeName = getEmployeeName();

      const leaveData = {
        ...formData,
        employee: employeeName,
        employeeId: employeeId,
        employeeEmail: user?.email,
        approver: "HR Manager",
        approverId: "HR001",
        status: "pending",
        appliedDate: new Date().toISOString(),
        days:
          Math.ceil(
            (new Date(formData.endDate) - new Date(formData.startDate)) /
              (1000 * 60 * 60 * 24)
          ) + 1,
      };

      if (leaveApi?.add) {
        await leaveApi.add(leaveData);
      } else {
        // Mock add for testing
        console.log("Adding leave:", leaveData);
      }

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      setFormData({
        type: "Annual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });
      setShowForm(false);
      loadLeaveRequests();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, {
          status: "approved",
          approvedBy: user?.name || "Admin",
          approvedDate: new Date().toISOString(),
        });
      } else {
        // Mock update for testing
        console.log("Approving leave:", leaveId);
      }
      toast({
        title: "Success",
        description: "Leave request approved",
      });
      loadLeaveRequests();
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
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, {
          status: "rejected",
          rejectedBy: user?.name || "Admin",
          rejectedDate: new Date().toISOString(),
        });
      } else {
        // Mock update for testing
        console.log("Rejecting leave:", leaveId);
      }
      toast({
        title: "Success",
        description: "Leave request rejected",
      });
      loadLeaveRequests();
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
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, {
          status: "cancelled",
          cancelledDate: new Date().toISOString(),
        });
      } else {
        // Mock update for testing
        console.log("Cancelling leave:", leaveId);
      }
      toast({
        title: "Success",
        description: "Leave request cancelled",
      });
      loadLeaveRequests();
    } catch (error) {
      console.error("Error cancelling leave:", error);
      toast({
        title: "Error",
        description: "Failed to cancel leave request",
        variant: "destructive",
      });
    }
  };

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
      "Unpaid Leave": PauseCircle,
    };
    return icons[type] || CalendarDays;
  };

  // Calculate stats for admin dashboard
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((req) => req.status === "pending").length,
    approved: leaveRequests.filter((req) => req.status === "approved").length,
    rejected: leaveRequests.filter((req) => req.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {canManageLeaves() ? "Leave Management" : "My Leave Requests"}
          </h2>
          <p className="text-muted-foreground">
            {canManageLeaves()
              ? "Manage and approve employee leave requests"
              : "Track and manage your leave applications"}
          </p>
        </div>
        {!canManageLeaves() && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        )}
      </div>

      {/* Admin Dashboard Stats */}
      {canManageLeaves() && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected
                </p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters for Admin/HR */}
      {canManageLeaves() && (
        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, type, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Leave Application Form */}
      {showForm && !canManageLeaves() && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Leave Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Personal Leave">
                      Personal Leave
                    </SelectItem>
                    <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
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
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Submit Application</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Leave Requests List */}
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
            {canManageLeaves()
              ? "No leave requests found"
              : "No leave requests found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {canManageLeaves()
              ? "There are no leave requests matching your criteria."
              : "You haven't applied for any leave yet."}
          </p>
          {!canManageLeaves() && (
            <Button onClick={() => setShowForm(true)}>
              Apply for Your First Leave
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const LeaveTypeIcon = getLeaveTypeIcon(request.type);
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
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            {request.days ||
                              Math.ceil(
                                (new Date(request.endDate) -
                                  new Date(request.startDate)) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1}
                          </span>{" "}
                          day
                          {request.days !== 1 ? "s" : ""}
                        </div>
                        <div className="truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {canManageLeaves() && (
                          <span className="font-medium">
                            Employee: {request.employee || "Unknown"}
                          </span>
                        )}
                        <span>
                          Applied:{" "}
                          {new Date(
                            request.appliedDate || request.startDate
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
                            {request.approvedBy && ` by ${request.approvedBy}`}
                          </span>
                        )}
                        {request.rejectedDate && (
                          <span className="text-red-600">
                            Rejected:{" "}
                            {new Date(
                              request.rejectedDate
                            ).toLocaleDateString()}
                            {request.rejectedBy && ` by ${request.rejectedBy}`}
                          </span>
                        )}
                        {request.cancelledDate && (
                          <span className="text-gray-600">
                            Cancelled:{" "}
                            {new Date(
                              request.cancelledDate
                            ).toLocaleDateString()}
                            {request.cancelledBy &&
                              ` by ${request.cancelledBy}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    {/* FOR ADMINS/HR - Show Approve/Reject for pending requests */}
                    {canManageLeaves() && request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() =>
                            handleApprove(request._id || request.id)
                          }
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
                    )}

                    {/* FOR EMPLOYEES - Show Cancel for their own pending requests */}
                    {!canManageLeaves() && request.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(request._id || request.id)}
                      >
                        Cancel
                      </Button>
                    )}

                    {/* Show status for non-pending requests */}
                    {(request.status === "approved" ||
                      request.status === "rejected") && (
                      <div className="text-xs text-center text-muted-foreground max-w-[80px]">
                        {request.status === "approved"
                          ? "✅ Approved"
                          : "❌ Rejected"}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaveSection;
