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
} from "lucide-react";

const LeaveTab = () => {
  const { leaveRequests: leaveApi, employees } = useAppContext();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get employee ID for the current user
  const getEmployeeId = () => {
    if (user?.employeeId) return user.employeeId;

    // Fallback: find employee by email
    const employee = employees
      .getAll()
      .find((emp) => emp.email === user?.email);
    return employee?.id || "EMP001";
  };

  // Load employee's leave requests
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const employeeId = getEmployeeId();
      const requests = await leaveApi.getLeavesByEmployee(employeeId);
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
  }, []);

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

  const handleCancel = async (leaveId) => {
    try {
      await leaveApi.remove(leaveId);
      toast({
        title: "Success",
        description: "Leave request cancelled",
      });
      loadLeaveRequests();
    } catch (error) {
      console.error("Error canceling leave:", error);
      toast({
        title: "Error",
        description: "Failed to cancel leave request",
        variant: "destructive",
      });
    }
  };

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
        <Button onClick={() => (window.location.href = "/leave")}>
          <Plus className="w-4 h-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{request.days}</span>{" "}
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
                          {new Date(request.appliedDate).toLocaleDateString()}
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
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button for Pending Requests */}
                  {request.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(request._id || request.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaveTab;
