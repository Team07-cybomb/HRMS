import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Eye,
  Calendar,
  User,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ApprovalsTab = () => {
  console.log("🟡 APPROVALS TAB IS RENDERING - This is approvals dashboard");

  const { leaveRequests: leaveApi, hrRequests, employees } = useAppContext();
  const { user, can } = useAuth();

  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [pendingLeaveApprovals, setPendingLeaveApprovals] = useState([]);
  const [myHrRequests, setMyHrRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user's leave requests
      if (user) {
        const employeeId = getEmployeeId();
        const leaves = await leaveApi.getLeavesByEmployee(employeeId);
        setMyLeaveRequests(Array.isArray(leaves) ? leaves : []);
      }

      // Load pending approvals for managers/admins
      if (can("approve:leave")) {
        const allLeaves = await leaveApi.getAll();
        const pending = Array.isArray(allLeaves)
          ? allLeaves.filter((req) => req.status === "pending")
          : [];
        setPendingLeaveApprovals(pending);
      }

      // Load HR requests
      const hrReqs = hrRequests
        .getAll()
        .filter((req) => req.employeeId === user?.employeeId);
      setMyHrRequests(hrReqs);
    } catch (error) {
      console.error("Error loading approvals data:", error);
      toast({
        title: "Error",
        description: "Failed to load approvals data",
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
      .getAll()
      .find((emp) => emp.email === user?.email);
    return employee?.id || user?.id || "EMP001";
  };

  const handleApprovalAction = async (api, id, status) => {
    try {
      await leaveApi.update(id, {
        status,
        [status === "approved" ? "approvedBy" : "rejectedBy"]:
          user?.name || "Admin",
      });

      toast({
        title: `Request ${status}`,
        description: `Leave request has been ${status}.`,
      });

      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast({
        title: "Error",
        description: `Failed to ${status} request`,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (request) => {
    toast({
      title: `Leave Request Details - ${request.employee}`,
      description: (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              <strong>Dates:</strong>{" "}
              {new Date(request.startDate).toLocaleDateString()} to{" "}
              {new Date(request.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              <strong>Duration:</strong> {request.days} day(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>
              <strong>Type:</strong> {request.type}
            </span>
          </div>
          <div className="mt-2">
            <strong>Reason:</strong>
            <p className="text-sm mt-1">{request.reason}</p>
          </div>
          {request.appliedDate && (
            <div className="text-xs text-muted-foreground">
              Applied on: {new Date(request.appliedDate).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "approved":
        return Check;
      case "rejected":
        return X;
      default:
        return Clock;
    }
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      "Annual Leave": Calendar,
      "Sick Leave": AlertCircle,
      "Personal Leave": User,
      "Unpaid Leave": Clock,
    };
    return icons[type] || Calendar;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading approvals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approvals Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-requests">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            {can("approve:leave") && (
              <TabsTrigger value="pending-approvals">
                Pending Approvals
                {pendingLeaveApprovals.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {pendingLeaveApprovals.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* My Requests Tab */}
          <TabsContent value="my-requests" className="mt-4 space-y-6">
            {/* Leave Requests Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                My Leave Requests
              </h3>
              {myLeaveRequests.length > 0 ? (
                <div className="space-y-3">
                  {myLeaveRequests.map((req) => {
                    const StatusIcon = getStatusIcon(req.status);
                    const LeaveTypeIcon = getLeaveTypeIcon(req.type);
                    return (
                      <div
                        key={req._id || req.id}
                        className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <LeaveTypeIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{req.type}</p>
                              <Badge className={getStatusColor(req.status)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {req.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(req.startDate).toLocaleDateString()} to{" "}
                              {new Date(req.endDate).toLocaleDateString()}(
                              {req.days} day{req.days !== 1 ? "s" : ""})
                            </p>
                            <p className="text-sm mt-1">{req.reason}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Applied:{" "}
                                {new Date(req.appliedDate).toLocaleDateString()}
                              </span>
                              {req.approver && (
                                <span>Approver: {req.approver}</span>
                              )}
                              {req.approvedDate && (
                                <span className="text-green-600">
                                  Approved:{" "}
                                  {new Date(
                                    req.approvedDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              {req.rejectedDate && (
                                <span className="text-red-600">
                                  Rejected:{" "}
                                  {new Date(
                                    req.rejectedDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No leave requests found.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => (window.location.href = "/leave")}
                  >
                    Apply for Leave
                  </Button>
                </div>
              )}
            </div>

            {/* HR Requests Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                My HR Requests
              </h3>
              {myHrRequests.length > 0 ? (
                <div className="space-y-3">
                  {myHrRequests.map((req) => {
                    const StatusIcon = getStatusIcon(req.status);
                    return (
                      <div
                        key={req.id}
                        className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{req.type}</p>
                            <Badge className={getStatusColor(req.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {req.details}
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            Requested:{" "}
                            {new Date(req.requestedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No HR requests found.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pending Approvals Tab */}
          {can("approve:leave") && (
            <TabsContent value="pending-approvals" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                  Pending Leave Approvals
                </h3>
                <Badge variant="outline">
                  {pendingLeaveApprovals.length} pending
                </Badge>
              </div>

              {pendingLeaveApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingLeaveApprovals.map((req) => {
                    const LeaveTypeIcon = getLeaveTypeIcon(req.type);
                    return (
                      <div
                        key={req._id || req.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <LeaveTypeIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{req.employee}</p>
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  {req.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(req.startDate).toLocaleDateString()}{" "}
                                to {new Date(req.endDate).toLocaleDateString()}
                                <span className="mx-2">•</span>
                                {req.days} day{req.days !== 1 ? "s" : ""}
                              </p>
                              <p className="text-sm mt-2 line-clamp-2">
                                {req.reason}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  Applied:{" "}
                                  {new Date(
                                    req.appliedDate
                                  ).toLocaleDateString()}
                                </span>
                                <span>Approver: {req.approver}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(req)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                handleApprovalAction(
                                  leaveApi,
                                  req._id || req.id,
                                  "approved"
                                )
                              }
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleApprovalAction(
                                  leaveApi,
                                  req._id || req.id,
                                  "rejected"
                                )
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">All Caught Up!</h4>
                  <p className="text-sm text-muted-foreground">
                    There are no pending leave requests requiring your approval.
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApprovalsTab;
