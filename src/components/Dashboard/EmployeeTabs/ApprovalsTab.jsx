import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckSquare,
  Calendar,
  Clock,
  Check,
  X,
  Eye,
  AlertCircle,
  PauseCircle,
  CalendarDays,
  User,
} from "lucide-react";

const ApprovalsTab = () => {
  const { leaveRequests: leaveApi } = useAppContext();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employee's own leave requests
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      let requests = [];

      // Get employee data first
      const employeesResponse = await fetch(
        "http://localhost:5000/api/employees"
      );
      if (employeesResponse.ok) {
        const employees = await employeesResponse.json();
        const employee = employees.find((emp) => emp.email === user.email);

        if (employee && leaveApi?.getLeavesByEmployee) {
          requests = await leaveApi.getLeavesByEmployee(employee.employeeId);
        } else {
          // Mock data for testing
          requests = [
            {
              id: "1",
              type: "Annual Leave",
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 86400000).toISOString(),
              reason: "Family vacation",
              status: "pending",
              days: 1,
              appliedDate: new Date().toISOString(),
              employeeId: employee?.employeeId,
            },
            {
              id: "2",
              type: "Sick Leave",
              startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
              endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
              reason: "Medical appointment",
              status: "approved",
              days: 2,
              appliedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
              employeeId: employee?.employeeId,
              approvedDate: new Date().toISOString(),
            },
          ];
        }
      }

      setLeaveRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("Error loading leave requests:", error);
      toast({
        title: "Error",
        description: "Failed to load your leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadLeaveRequests();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { bg: "bg-green-100 text-green-800", icon: Check },
      rejected: { bg: "bg-red-100 text-red-800", icon: X },
      cancelled: { bg: "bg-gray-100 text-gray-800", icon: X },
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

  const handleViewDetails = (request) => {
    toast({
      title: `Your Leave Request Details`,
      description: (
        <div className="space-y-2 text-sm">
          <div>
            <strong>Type:</strong> {request.type}
          </div>
          <div>
            <strong>Dates:</strong>{" "}
            {new Date(request.startDate).toLocaleDateString()} to{" "}
            {new Date(request.endDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Duration:</strong> {request.days || 1} day(s)
          </div>
          <div>
            <strong>Reason:</strong> {request.reason}
          </div>
          <div>
            <strong>Applied:</strong>{" "}
            {new Date(request.appliedDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Status:</strong> {request.status}
          </div>
          {request.approvedBy && (
            <div>
              <strong>Approved By:</strong> {request.approvedBy}
            </div>
          )}
          {request.rejectionReason && (
            <div>
              <strong>Rejection Reason:</strong> {request.rejectionReason}
            </div>
          )}
        </div>
      ),
    });
  };

  const handleCancel = async (leaveId) => {
    try {
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, {
          status: "cancelled",
          actionBy: user?.name || "Employee",
        });
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">
          Loading your leave requests...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Removed Apply for Leave button */}
      <div>
        <h2 className="text-2xl font-bold">My Leave Requests</h2>
        <p className="text-muted-foreground">
          Track the status of your leave applications
        </p>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaveRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Leave Requests</h3>
            <p className="text-muted-foreground mb-4">
              You haven't applied for any leave yet
            </p>
          </Card>
        ) : (
          leaveRequests.map((request) => {
            const LeaveTypeIcon = getLeaveTypeIcon(request.type);

            return (
              <Card key={request.id || request._id} className="p-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
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
                      </div>
                      {(request.status === "approved" ||
                        request.status === "rejected") && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {request.status === "approved" &&
                            request.approvedBy && (
                              <span>
                                Approved by {request.approvedBy} on{" "}
                                {new Date(
                                  request.approvedDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          {request.status === "rejected" &&
                            request.rejectedBy && (
                              <span>
                                Rejected by {request.rejectedBy} on{" "}
                                {new Date(
                                  request.rejectedDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {request.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(request.id || request._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApprovalsTab;
