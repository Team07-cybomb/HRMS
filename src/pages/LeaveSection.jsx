import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertCircle,
  User,
  CalendarDays,
  PauseCircle,
  Filter,
  Search,
  Users,
  FileText,
  TrendingDown,
  RotateCcw,
  Download,
} from "lucide-react";

const LeaveSection = () => {
  const { leaveRequests: leaveApi } = useAppContext();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveBalances, setLeaveBalances] = useState({});
  const [activeTab, setActiveTab] = useState("requests");

  // Check if user can manage leaves
  const canManageLeaves = () => {
    return (
      user?.role === "admin" || user?.role === "hr" || user?.role === "employer"
    );
  };

  // Fetch all employees from Employee collection
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

  // Load leave requests for all employees
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
            reason: "Vacation",
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
            reason: "Flu",
            status: "approved",
            days: 2,
            appliedDate: new Date(Date.now() - 86400000).toISOString(),
            employee: "Jane Smith",
            employeeId: "EMP002",
            employeeEmail: "jane@company.com",
            approvedDate: new Date().toISOString(),
            approvedBy: "HR Manager",
          },
          {
            id: "3",
            type: "Personal Leave",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            reason: "Family event",
            status: "pending",
            days: 1,
            appliedDate: new Date().toISOString(),
            employee: "Mike Johnson",
            employeeId: "EMP003",
            employeeEmail: "mike@company.com",
          },
        ];
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

  // Load leave balances for all employees
  const loadLeaveBalances = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/leaves/balances");
      if (response.ok) {
        const balances = await response.json();

        // Enhance balances with employee data
        const employees = await fetchAllEmployees();
        const enhancedBalances = { ...balances };

        // Ensure all employees have balance entries
        employees.forEach((employee) => {
          if (!enhancedBalances[employee.employeeId]) {
            enhancedBalances[employee.employeeId] = {
              annualLeave: 6,
              sickLeave: 6,
              personalLeave: 6,
              employeeName: employee.name,
              employeeEmail: employee.email,
              employeeId: employee.employeeId,
            };
          } else {
            // Enhance existing balance with employee data
            enhancedBalances[employee.employeeId] = {
              ...enhancedBalances[employee.employeeId],
              employeeName: employee.name,
              employeeEmail: employee.email,
              employeeId: employee.employeeId,
            };
          }
        });

        setLeaveBalances(enhancedBalances);
      } else {
        // Fallback: calculate from leave requests and employee data
        calculateBalancesFromRequests();
      }
    } catch (error) {
      console.error("Error loading leave balances:", error);
      // Fallback: calculate from leave requests
      calculateBalancesFromRequests();
    }
  };

  // Calculate balances from leave requests (fallback)
  const calculateBalancesFromRequests = async () => {
    const employees = await fetchAllEmployees();
    const balances = {};

    // Initialize all employees with default balances
    employees.forEach((emp) => {
      balances[emp.employeeId] = {
        annualLeave: 6,
        sickLeave: 6,
        personalLeave: 6,
        employeeName: emp.name,
        employeeEmail: emp.email,
        employeeId: emp.employeeId,
      };
    });

    // Deduct approved leaves
    leaveRequests.forEach((request) => {
      if (request.status === "approved" && balances[request.employeeId]) {
        const balance = balances[request.employeeId];
        const fieldMap = {
          "Annual Leave": "annualLeave",
          "Sick Leave": "sickLeave",
          "Personal Leave": "personalLeave",
        };

        const field = fieldMap[request.type];
        if (field) {
          balance[field] = Math.max(0, balance[field] - (request.days || 1));
        }
      }
    });

    setLeaveBalances(balances);
  };

  // Filter and search requests
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
  }, [user]);

  useEffect(() => {
    if (leaveRequests.length > 0) {
      loadLeaveBalances();
    }
  }, [leaveRequests]);

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

  const handleStatusUpdate = async (leaveId, newStatus) => {
    try {
      if (leaveApi?.update) {
        await leaveApi.update(leaveId, {
          status: newStatus,
          actionBy: user?.name || "Admin",
        });
      } else {
        // Mock update for testing
        console.log(`Updating leave ${leaveId} to ${newStatus}`);
      }

      toast({
        title: "Success",
        description: `Leave request ${newStatus} successfully`,
      });

      loadLeaveRequests(); // Refresh the list
      loadLeaveBalances(); // Refresh balances
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      });
    }
  };

  // Get remaining days for an employee
  const getRemainingDays = (employeeId, type) => {
    const balance = leaveBalances[employeeId];
    if (!balance) return 0;

    const balanceMap = {
      "Annual Leave": balance.annualLeave,
      "Sick Leave": balance.sickLeave,
      "Personal Leave": balance.personalLeave,
    };

    return balanceMap[type] || 0;
  };

  // Get balance color based on remaining days
  const getBalanceColor = (days) => {
    if (days >= 4) return "text-green-600";
    if (days >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  // Export leave balances to CSV
  const exportBalancesToCSV = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Email",
      "Annual Leave",
      "Sick Leave",
      "Personal Leave",
    ];
    const csvData = Object.values(leaveBalances).map((balance) => [
      balance.employeeId,
      balance.employeeName,
      balance.employeeEmail,
      balance.annualLeave,
      balance.sickLeave,
      balance.personalLeave,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leave-balances.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Leave Management</h2>
          <p className="text-muted-foreground">
            Manage all employee leave requests and balances
          </p>
        </div>
      </div>

      {/* Tabs for Admin/HR */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            <FileText className="w-4 h-4 mr-2 inline" />
            Leave Requests
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "balances"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("balances")}
          >
            <TrendingDown className="w-4 h-4 mr-2 inline" />
            Leave Balances
          </button>
        </div>
      </div>

      {/* LEAVE REQUESTS TAB */}
      {activeTab === "requests" && (
        <>
          {/* Filters and Search */}
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
                  <RotateCcw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

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
                No leave requests found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No requests match your filters"
                  : "No leave requests have been submitted yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const LeaveTypeIcon = getLeaveTypeIcon(request.type);
                const remainingDays = getRemainingDays(
                  request.employeeId,
                  request.type
                );

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
                              className="bg-blue-50 text-blue-700"
                            >
                              Balance: {remainingDays} days
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  request.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
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
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>
                                {request.employee} ({request.employeeId})
                              </span>
                            </div>
                            <div className="truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Applied:{" "}
                            {new Date(request.appliedDate).toLocaleDateString()}
                            {request.approvedDate && (
                              <span className="ml-4">
                                Approved:{" "}
                                {new Date(
                                  request.approvedDate
                                ).toLocaleDateString()}{" "}
                                by {request.approvedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(
                                request._id || request.id,
                                "approved"
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(
                                request._id || request.id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* LEAVE BALANCES TAB (Admin/HR only) */}
      {activeTab === "balances" && (
        <div className="space-y-6">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={exportBalancesToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(leaveBalances).map((balance) => (
              <Card key={balance.employeeId} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{balance.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {balance.employeeId} • {balance.employeeEmail}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Annual Leave</span>
                      <span
                        className={`font-bold ${getBalanceColor(
                          balance.annualLeave
                        )}`}
                      >
                        {balance.annualLeave}/6
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Sick Leave</span>
                      <span
                        className={`font-bold ${getBalanceColor(
                          balance.sickLeave
                        )}`}
                      >
                        {balance.sickLeave}/6
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Personal Leave
                      </span>
                      <span
                        className={`font-bold ${getBalanceColor(
                          balance.personalLeave
                        )}`}
                      >
                        {balance.personalLeave}/6
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveSection;
