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
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CalendarDays,
  MoreVertical,
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
  const { leaveRequests: leaveApi, logAction, employees } = useAppContext();
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [isApplyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Add this temporary function to debug the user-employee mapping
  const debugEmployeeMapping = () => {
    console.log("=== EMPLOYEE MAPPING DEBUG ===");
    console.log("Current User:", user);
    console.log("All Employees:", employees.getAll());
    console.log("Resolved Employee ID:", getEmployeeId());
    console.log("Resolved Employee Name:", getEmployeeName());

    // Test email matching
    if (user?.email) {
      const matchedEmployee = employees
        .getAll()
        .find(
          (emp) =>
            emp.email && emp.email.toLowerCase() === user.email.toLowerCase()
        );
      console.log("Email match result:", matchedEmployee);
    }
    console.log("=== END DEBUG ===");
  };

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      let requests = [];

      if (can("approve:leave")) {
        // HR/Admin can see all leaves
        requests = await leaveApi.getAllForHR();
      } else {
        // Regular employees see only their leaves
        const employeeId = getEmployeeId();
        if (employeeId) {
          console.log("Loading leaves for employee ID:", employeeId);
          requests = await leaveApi.getLeavesByEmployee(employeeId);
        } else {
          console.warn("No employee ID found, user object:", user);
          // Fallback if no employeeId
          requests = await leaveApi.getAll();
        }
      }

      setLeaveRequests(requests);
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

      await leaveApi.add(newRequest);
      await loadLeaveRequests(); // Reload the data

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

  const handleUpdateRequest = async (id, status) => {
    if (!can("approve:leave")) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    try {
      const request = leaveRequests.find(
        (req) => req._id === id || req.id === id
      );
      await leaveApi.update(id, { status });
      await loadLeaveRequests(); // Reload the data
      logAction(`Leave Request ${status}`, { id, employee: request.employee });
      toast({
        title: `Request ${status}`,
        description: `Leave request from ${request.employee} has been ${status}.`,
      });
    } catch (error) {
      console.error("Error updating leave request:", error);
      toast({
        title: "Error",
        description: "Failed to update leave request.",
        variant: "destructive",
      });
    }
  };

  const leavePolicies = [
    { id: "LP001", name: "Annual Leave", allocation: 25 },
    { id: "LP002", name: "Sick Leave", allocation: 12 },
  ];
  const leaveBalances = [
    { employee: "Sarah Johnson", annual: 17, sick: 10 },
    { employee: "Alex Rodriguez", annual: 15, sick: 9 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredRequests = leaveRequests.filter((request) =>
    request.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderLeaveRequests = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search leave requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => toast({ title: "Filter clicked" })}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          Loading leave requests...
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request, index) => (
              <motion.div
                key={request._id || request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.employee}
                        </h3>
                        <p className="text-sm text-gray-500">{request.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(request.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(request.status)}
                          <span>{request.status}</span>
                        </div>
                      </Badge>
                      {can("approve:leave") && (
                        <button
                          onClick={() => toast({ title: "Options clicked" })}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Start:{" "}
                        {request.startDate
                          ? new Date(request.startDate).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        End:{" "}
                        {request.endDate
                          ? new Date(request.endDate).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Days: {request.days}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{request.reason}</p>
                  {can("approve:leave") && request.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateRequest(
                            request._id || request.id,
                            "approved"
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleUpdateRequest(
                            request._id || request.id,
                            "rejected"
                          )
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleUpdateRequest(request._id || request.id, "hold")
                        }
                      >
                        Hold
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No leave requests found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderLeaveBalances = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">My Leave Balance</h3>
        <div className="space-y-4">
          {leavePolicies.map((policy) => (
            <div
              key={policy.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium">{policy.name}</span>
              <span className="text-blue-600 font-semibold">
                {policy.allocation} days
              </span>
            </div>
          ))}
        </div>
      </Card>
      {can("view:leave:balances") && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Team Leave Balances</h3>
          <div className="space-y-3">
            {leaveBalances.map((balance, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{balance.employee}</span>
                <div className="flex space-x-4">
                  <span className="text-sm">Annual: {balance.annual}</span>
                  <span className="text-sm">Sick: {balance.sick}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Leave Management | HRMS</title>
      </Helmet>

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

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Leave Management
            </h1>
            <p className="text-muted-foreground">
              Manage and track employee leave requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setApplyLeaveOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Apply Leave
            </Button>
            {/* Temporary debug button - remove after testing */}
            <Button variant="outline" onClick={debugEmployeeMapping}>
              Debug Mapping
            </Button>
          </div>
        </div>

        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab("balances")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "balances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Leave Balances
            </button>
          </nav>
        </div>

        {activeTab === "requests" && renderLeaveRequests()}
        {activeTab === "balances" && renderLeaveBalances()}
      </div>
    </>
  );
};

export default LeaveSection;
