import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
} from "lucide-react";

const LeaveTab = () => {
  const { leaveRequests: leaveApi, employees } = useAppContext();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get employee ID for the current user
  const getEmployeeId = () => {
    if (user?.employeeId) return user.employeeId;

    // Fallback: find employee by email
    const employee = employees
      ?.getAll()
      ?.find((emp) => emp.email === user?.email);
    return employee?.id || user?.id || "EMP001";
  };

  // Load employee's leave requests
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const employeeId = getEmployeeId();
      console.log("Loading leave requests for employee:", employeeId);

      let requests = [];
      if (leaveApi?.getLeavesByEmployee) {
        requests = await leaveApi.getLeavesByEmployee(employeeId);
      } else if (leaveApi?.getAll) {
        // Fallback: get all and filter by employee
        const allRequests = await leaveApi.getAll();
        requests = allRequests.filter(
          (req) => req.employeeId === employeeId || req.employee === user?.name
        );
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

      console.log("Loaded requests:", requests);
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
      setRefreshing(false);
    }
  };

  // Auto-refresh every 10 seconds to get real-time updates
  useEffect(() => {
    loadLeaveRequests();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      console.log("Auto-refreshing leave requests...");
      loadLeaveRequests();
    }, 10000); // Refresh every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [user]);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaveRequests();
    toast({
      title: "Refreshed",
      description: "Leave requests updated",
    });
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

  const handleCancel = async (leaveId) => {
    try {
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, { status: "cancelled" });
      } else {
        // Mock update for testing
        console.log("Cancelling leave:", leaveId);
      }
      toast({
        title: "Success",
        description: "Leave request cancelled successfully",
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

  // Calculate pending requests count
  const pendingCount = leaveRequests.filter(
    (req) => req.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Leave Requests</h2>
          <p className="text-muted-foreground">
            Track and manage your leave applications
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                • {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => (window.location.href = "/leave")}>
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      {leaveRequests.length > 0 && (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>
              Pending:{" "}
              {leaveRequests.filter((req) => req.status === "pending").length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>
              Approved:{" "}
              {leaveRequests.filter((req) => req.status === "approved").length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>
              Rejected:{" "}
              {leaveRequests.filter((req) => req.status === "rejected").length}
            </span>
          </div>
        </div>
      )}

      {/* Leave Requests List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">
            Loading your leave requests...
          </p>
        </div>
      ) : leaveRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No leave requests found
          </h3>
          <p className="text-muted-foreground mb-4">
            You haven't applied for any leave yet
          </p>
          <Button onClick={() => (window.location.href = "/leave")}>
            Apply for Your First Leave
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaveRequests.map((request) => {
            const LeaveTypeIcon = getLeaveTypeIcon(request.type);

            // Show different border colors based on status
            const getCardBorderClass = () => {
              switch (request.status) {
                case "approved":
                  return "border-l-4 border-l-green-500";
                case "rejected":
                  return "border-l-4 border-l-red-500";
                case "pending":
                  return "border-l-4 border-l-yellow-500";
                default:
                  return "";
              }
            };

            return (
              <Card
                key={request._id || request.id}
                className={`p-6 transition-all duration-300 hover:shadow-md ${getCardBorderClass()}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LeaveTypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.type}</h3>
                        {getStatusBadge(request.status)}

                        {/* Show update indicator for recent changes */}
                        {(request.status === "approved" ||
                          request.status === "rejected") && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            Updated
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
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
                        <span>
                          Applied:{" "}
                          {new Date(
                            request.appliedDate || request.startDate
                          ).toLocaleDateString()}
                        </span>
                        {request.approver && (
                          <span>Approver: {request.approver}</span>
                        )}

                        {/* Show approval details */}
                        {request.approvedDate && (
                          <span className="text-green-600 font-medium">
                            ✅ Approved:{" "}
                            {new Date(
                              request.approvedDate
                            ).toLocaleDateString()}
                            {request.approvedBy && ` by ${request.approvedBy}`}
                          </span>
                        )}

                        {/* Show rejection details */}
                        {request.rejectedDate && (
                          <span className="text-red-600 font-medium">
                            ❌ Rejected:{" "}
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

                  {/* Action Buttons - EMPLOYEE ONLY */}
                  <div className="flex gap-2 ml-4">
                    {request.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(request._id || request.id)}
                      >
                        Cancel
                      </Button>
                    )}

                    {/* Show message for approved/rejected requests */}
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

      {/* Auto-refresh indicator */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🔄 Auto-refreshing every 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default LeaveTab;
