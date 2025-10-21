import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckSquare,
  Calendar,
  User,
  Clock,
  Check,
  X,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CalendarDays,
  Users,
  FileText,
} from "lucide-react";

const ApprovalsSection = () => {
  const { leaveRequests: leaveApi } = useAppContext();
  const { user, can } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);

  // Check if user can manage approvals
  const canManageApprovals = () => {
    return (
      can("approve:leave") ||
      user?.role === "admin" ||
      user?.role === "hr" ||
      user?.role === "employer"
    );
  };

  // Fetch all employees
  const fetchAllEmployees = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees");
      if (response.ok) {
        const employees = await response.json();
        setAllEmployees(employees);
        return employees;
      }
      return [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  // Load all leave requests
  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      let requests = [];

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
            reason: "Family vacation",
            status: "pending",
            days: 1,
            appliedDate: new Date().toISOString(),
            employee: "John Doe",
            employeeId: "EMP001",
            employeeEmail: "john@company.com",
          },
          {
            id: "2",
            type: "Sick Leave",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
            reason: "Medical appointment",
            status: "pending",
            days: 2,
            appliedDate: new Date(Date.now() - 86400000).toISOString(),
            employee: "Jane Smith",
            employeeId: "EMP002",
            employeeEmail: "jane@company.com",
          },
          {
            id: "3",
            type: "Personal Leave",
            startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
            reason: "Personal work",
            status: "approved",
            days: 2,
            appliedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
            employee: "Mike Johnson",
            employeeId: "EMP003",
            employeeEmail: "mike@company.com",
            approvedDate: new Date().toISOString(),
            approvedBy: "HR Manager",
          },
          {
            id: "4",
            type: "Sick Leave",
            startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 6 * 86400000).toISOString(),
            reason: "Emergency travel",
            status: "rejected",
            days: 2,
            appliedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
            employee: "Sarah Wilson",
            employeeId: "EMP004",
            employeeEmail: "sarah@company.com",
            rejectedDate: new Date().toISOString(),
            rejectedBy: "HR Manager",
            rejectionReason: "No sufficient reason provided",
          },
        ];
      }

      console.log("Loaded leave requests for approvals:", requests);
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

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = leaveRequests;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.employee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [leaveRequests, statusFilter, searchTerm]);

  // Load data on component mount
  useEffect(() => {
    loadLeaveRequests();
    fetchAllEmployees();
  }, []);

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
    };
    return icons[type] || CalendarDays;
  };

  const handleAction = async (leaveId, newStatus, rejectionReason = "") => {
    if (!canManageApprovals()) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to approve/reject leaves",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = {
        status: newStatus,
        actionBy: user?.name || "Admin",
        ...(newStatus === "approved" && {
          approvedDate: new Date().toISOString(),
        }),
        ...(newStatus === "rejected" && {
          rejectedDate: new Date().toISOString(),
          rejectionReason: rejectionReason || "No reason provided",
        }),
      };

      if (leaveApi?.update) {
        await leaveApi.update(leaveId, updateData);
      } else {
        // Mock update for testing
        console.log(`Updating leave ${leaveId} to ${newStatus}`, updateData);
      }

      toast({
        title: "Success",
        description: `Leave request ${newStatus} successfully`,
      });

      loadLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (request) => {
    toast({
      title: `Leave Request Details - ${request.employee}`,
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

  const getEmployeeRequests = () => {
    if (!canManageApprovals()) {
      return leaveRequests.filter(
        (req) =>
          req.employeeEmail === user?.email || req.employeeId === user?.id
      );
    }
    return filteredRequests;
  };

  const approvalItems = getEmployeeRequests();

  return (
    <>
      <Helmet>
        <title>Leave Approvals - HRMS Pro</title>
        <meta
          name="description"
          content="Manage all pending leave approvals and track request status in one place."
        />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Leave Approvals
          </h1>
          <p className="text-muted-foreground mt-2">
            {canManageApprovals()
              ? "Review and process all pending leave requests from employees."
              : "Track the status of your leave requests."}
          </p>
        </motion.div>

        {/* Filters and Search - Only for managers */}
        {canManageApprovals() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by employee, type, or reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={loadLeaveRequests}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Leave Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">
                Loading leave requests...
              </p>
            </div>
          ) : approvalItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {canManageApprovals() ? "All Caught Up!" : "No Leave Requests"}
              </h3>
              <p className="text-muted-foreground">
                {canManageApprovals()
                  ? "There are no pending leave approvals at the moment."
                  : "You have not applied for any leave yet."}
              </p>
            </motion.div>
          ) : (
            approvalItems.map((item, index) => {
              const LeaveTypeIcon = getLeaveTypeIcon(item.type);

              return (
                <motion.div
                  key={item.id || item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                          <LeaveTypeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {item.type}
                            </h3>
                            {getStatusBadge(item.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>
                                {item.employee} ({item.employeeId})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(item.startDate).toLocaleDateString()}{" "}
                                - {new Date(item.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                {item.days || 1}
                              </span>{" "}
                              day
                              {item.days !== 1 ? "s" : ""}
                            </div>
                            <div className="truncate" title={item.reason}>
                              {item.reason}
                            </div>
                          </div>

                          {/* Additional info for processed requests */}
                          {(item.status === "approved" ||
                            item.status === "rejected") && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {item.status === "approved" &&
                                item.approvedBy && (
                                  <span>
                                    Approved by {item.approvedBy} on{" "}
                                    {new Date(
                                      item.approvedDate || item.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              {item.status === "rejected" &&
                                item.rejectedBy && (
                                  <span>
                                    Rejected by {item.rejectedBy} on{" "}
                                    {new Date(
                                      item.rejectedDate || item.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              {item.status === "rejected" &&
                                item.rejectionReason && (
                                  <span> - Reason: {item.rejectionReason}</span>
                                )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 flex items-center gap-2">
                        {canManageApprovals() && item.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleAction(item.id || item._id, "approved")
                              }
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt(
                                  "Please provide a reason for rejection:"
                                );
                                if (reason !== null) {
                                  handleAction(
                                    item.id || item._id,
                                    "rejected",
                                    reason
                                  );
                                }
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(item)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ApprovalsSection;
