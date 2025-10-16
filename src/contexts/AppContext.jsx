import React, { createContext, useContext, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const initialEmployees = [
  {
    id: "EMP001",
    name: "Sarah Johnson",
    email: "employee@company.com",
    phone: "+1 (555) 123-4567",
    department: "Technology",
    designation: "Senior Software Engineer",
    manager: "Mike Chen",
    reportingManager: "Mike Chen",
    doj: "2022-03-15",
    status: "active",
    location: "New York",
    avatar: null,
    teamId: 1,
    tenantId: "TENANT01",
    dob: "1990-05-20",
    country: "USA",
    address: "123 Main St, New York, NY",
    emergencyContact: { name: "John Johnson", phone: "+1 (555) 987-6543" },
    salaryStructure: { base: 90000, bonus: 15000, hra: 20000, total: 125000 },
    documents: [
      {
        id: uuidv4(),
        name: "Offer Letter.pdf",
        type: "pdf",
        size: "256KB",
        uploaded: "2022-03-01",
      },
      {
        id: uuidv4(),
        name: "Passport.pdf",
        type: "pdf",
        size: "512KB",
        uploaded: "2022-03-10",
      },
    ],
    leaveBalances: { sick: 8, casual: 12, earned: 5 },
    identityInformation: [
      { id: uuidv4(), type: "Passport", number: "US12345678", country: "USA" },
    ],
    workExperience: [
      {
        id: uuidv4(),
        company: "Tech Solutions Inc.",
        title: "Software Engineer",
        from: "2020-01-01",
        to: "2022-03-14",
      },
    ],
    educationDetails: [
      {
        id: uuidv4(),
        institution: "State University",
        degree: "B.S. in Computer Science",
        from: "2016-09-01",
        to: "2020-05-15",
      },
    ],
    complianceDetails: [
      { id: uuidv4(), type: "UAN", number: "123456789012" },
      { id: uuidv4(), type: "PAN", number: "ABCDE1234F" },
      { id: uuidv4(), type: "Aadhar", number: "1234-5678-9012" },
    ],
    bankDetails: [
      {
        id: uuidv4(),
        accountName: "Sarah Johnson",
        accountNumber: "1234567890",
        ifscCode: "HDFC0001234",
        bankName: "HDFC Bank",
        branch: "New York Branch",
      },
    ],
  },
  {
    id: "EMP002",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    phone: "+1 (555) 234-5678",
    department: "Technology",
    designation: "Engineering Manager",
    manager: "David Wilson",
    reportingManager: "David Wilson",
    doj: "2021-01-10",
    status: "active",
    location: "San Francisco",
    avatar: null,
    teamId: 1,
    tenantId: "TENANT01",
    dob: "1985-11-12",
    country: "USA",
    address: "456 Market St, San Francisco, CA",
    emergencyContact: { name: "Jane Chen", phone: "+1 (555) 876-5432" },
    salaryStructure: { base: 120000, bonus: 25000, hra: 20000, total: 165000 },
    documents: [],
    leaveBalances: { sick: 10, casual: 12, earned: 15 },
    identityInformation: [
      { id: uuidv4(), type: "Passport", number: "US87654321", country: "USA" },
    ],
    workExperience: [
      {
        id: uuidv4(),
        company: "Innovate Corp",
        title: "Senior Developer",
        from: "2018-06-01",
        to: "2020-12-31",
      },
    ],
    educationDetails: [
      {
        id: uuidv4(),
        institution: "Tech Institute",
        degree: "M.S. in Software Engineering",
        from: "2016-09-01",
        to: "2018-05-15",
      },
    ],
    complianceDetails: [
      { id: uuidv4(), type: "UAN", number: "123456789013" },
      { id: uuidv4(), type: "PAN", number: "BCDEF2345G" },
    ],
    bankDetails: [
      {
        id: uuidv4(),
        accountName: "Mike Chen",
        accountNumber: "2345678901",
        ifscCode: "ICICI0002345",
        bankName: "ICICI Bank",
        branch: "San Francisco Branch",
      },
    ],
  },
  {
    id: "EMP003",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    phone: "+1 (555) 345-6789",
    department: "Marketing",
    designation: "Marketing Manager",
    manager: "Lisa Anderson",
    reportingManager: "Lisa Anderson",
    doj: "2022-07-20",
    status: "active",
    location: "Remote",
    avatar: null,
    teamId: 2,
    tenantId: "TENANT01",
    dob: "1992-02-28",
    country: "Canada",
    address: "789 Queen St, Toronto, ON",
    emergencyContact: { name: "Robert Davis", phone: "+1 (555) 765-4321" },
    salaryStructure: { base: 75000, bonus: 10000, hra: 10000, total: 95000 },
    documents: [],
    leaveBalances: { sick: 5, casual: 10, earned: 8 },
    identityInformation: [
      {
        id: uuidv4(),
        type: "Passport",
        number: "CA1234567",
        country: "Canada",
      },
    ],
    workExperience: [
      {
        id: uuidv4(),
        company: "Creative Ads",
        title: "Marketing Specialist",
        from: "2019-03-01",
        to: "2022-07-19",
      },
    ],
    educationDetails: [
      {
        id: uuidv4(),
        institution: "University of Toronto",
        degree: "B.A. in Marketing",
        from: "2015-09-01",
        to: "2019-05-15",
      },
    ],
    complianceDetails: [{ id: uuidv4(), type: "SIN", number: "123-456-789" }],
    bankDetails: [
      {
        id: uuidv4(),
        accountName: "Emily Davis",
        accountNumber: "3456789012",
        ifscCode: "RBC00003456",
        bankName: "Royal Bank of Canada",
        branch: "Toronto Branch",
      },
    ],
  },
];

const initialTeams = [
  {
    id: 1,
    name: "Engineering",
    lead: "Mike Chen",
    members: ["EMP001", "EMP002"],
    department: "Technology",
    location: "New York",
    budget: "$2.4M",
    status: "active",
    tenantId: "TENANT01",
  },
  {
    id: 2,
    name: "Product Design",
    lead: "Mike Chen",
    members: [],
    department: "Design",
    location: "San Francisco",
    budget: "$800K",
    status: "active",
    tenantId: "TENANT01",
  },
  {
    id: 3,
    name: "Marketing",
    lead: "Emily Davis",
    members: ["EMP003"],
    department: "Marketing",
    location: "Remote",
    budget: "$1.2M",
    status: "active",
    tenantId: "TENANT01",
  },
];

const initialDepartments = [
  {
    id: 1,
    name: "Technology",
    headcount: 45,
    target: 50,
    budget: "$3.2M",
    head: "Sarah Johnson",
    teams: ["Engineering", "DevOps", "QA"],
    status: "active",
  },
  {
    id: 2,
    name: "Sales & Marketing",
    headcount: 32,
    target: 35,
    budget: "$2.1M",
    head: "Mike Chen",
    teams: ["Sales", "Marketing", "Business Development"],
    status: "active",
  },
];

const initialDesignations = [
  {
    id: 1,
    title: "Software Engineer",
    level: "L3",
    department: "Technology",
    minSalary: "$80K",
    maxSalary: "$120K",
    count: 15,
  },
  {
    id: 2,
    title: "Senior Software Engineer",
    level: "L4",
    department: "Technology",
    minSalary: "$120K",
    maxSalary: "$160K",
    count: 8,
  },
];

const initialLocations = [
  {
    id: 1,
    name: "New York HQ",
    address: "123 Business Ave, New York, NY 10001",
    employees: 85,
    shifts: ["Day Shift", "Night Shift"],
    timezone: "EST",
  },
  {
    id: 2,
    name: "San Francisco Office",
    address: "456 Tech Street, San Francisco, CA 94105",
    employees: 42,
    shifts: ["Day Shift", "Flexible"],
    timezone: "PST",
  },
];

const initialMessages = [
  {
    id: 1,
    title: "Q4 All-Hands Meeting",
    content:
      "Join us for our quarterly all-hands meeting to review achievements and set goals for 2025.",
    author: "CEO Office",
    date: "2025-09-20",
    priority: "high",
    audience: "All Employees",
  },
  {
    id: 2,
    title: "New WFH Policy Update",
    content:
      "The work from home policy has been updated. Please review the new guidelines in the policy section.",
    author: "HR Department",
    date: "2025-09-18",
    priority: "medium",
    audience: "All Employees",
  },
];

const initialOnboarding = [
  {
    id: "ON001",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    position: "Software Engineer",
    department: "Technology",
    startDate: "2025-10-15",
    progress: 75,
    status: "in-progress",
    currentStep: "Background Check",
    completedSteps: 6,
    totalSteps: 8,
    assignedTo: "Sarah Johnson",
  },
  {
    id: "ON002",
    name: "Maria Garcia",
    email: "maria.garcia@company.com",
    position: "Marketing Specialist",
    department: "Marketing",
    startDate: "2025-10-20",
    progress: 45,
    status: "in-progress",
    currentStep: "Document Collection",
    completedSteps: 3,
    totalSteps: 8,
    assignedTo: "Emily Davis",
  },
];

const initialOffboarding = [
  {
    id: "OFF001",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    position: "Senior Developer",
    department: "Technology",
    lastWorkingDay: "2025-10-31",
    reason: "resignation",
    progress: 60,
    status: "in-progress",
    currentStep: "Asset Recovery",
    completedSteps: 4,
    totalSteps: 7,
    assignedTo: "Sarah Johnson",
  },
  {
    id: "OFF002",
    name: "Jennifer Davis",
    email: "jennifer.davis@company.com",
    position: "Marketing Manager",
    department: "Marketing",
    lastWorkingDay: "2025-11-15",
    reason: "termination",
    progress: 85,
    status: "pending-final",
    currentStep: "F&F Calculation",
    completedSteps: 6,
    totalSteps: 7,
    assignedTo: "Emily Davis",
  },
];

const initialRoles = [
  {
    id: "role_admin",
    name: "Admin",
    description: "Full access to all system features.",
    permissions: { employees: "crud", payroll: "crud", settings: "crud" },
  },
  {
    id: "role_hr",
    name: "HR Manager",
    description: "Manages employees, onboarding, and leave.",
    permissions: { employees: "crud", payroll: "read", settings: "read" },
  },
  {
    id: "role_employee",
    name: "Employee",
    description: "Access to self-service features.",
    permissions: {
      employees: "read-self",
      payroll: "read-self",
      settings: "none",
    },
  },
];

const initialShifts = [
  {
    id: "shift_day",
    name: "Day Shift",
    startTime: "09:00",
    endTime: "18:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
  {
    id: "shift_night",
    name: "Night Shift",
    startTime: "21:00",
    endTime: "06:00",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
];

const initialCompanySettings = {
  name: "HRMS Pro Company",
  website: "https://hrmspro.com",
  logo: null,
};

const initialLeaveRequests = [
  {
    id: "LR001",
    employee: "Sarah Johnson",
    employeeId: "EMP001",
    type: "Annual Leave",
    startDate: "2025-10-15",
    endDate: "2025-10-19",
    days: 5,
    status: "approved",
    reason: "Family vacation",
    appliedDate: "2025-10-05",
    approver: "Mike Chen",
  },
  {
    id: "LR002",
    employee: "Mike Chen",
    employeeId: "EMP002",
    type: "Sick Leave",
    startDate: "2025-10-10",
    endDate: "2025-10-12",
    days: 3,
    status: "approved",
    reason: "Medical treatment",
    appliedDate: "2025-10-09",
    approver: "David Wilson",
  },
  {
    id: "LR003",
    employee: "Emily Davis",
    employeeId: "EMP003",
    type: "Personal Leave",
    startDate: "2025-10-20",
    endDate: "2025-10-20",
    days: 1,
    status: "rejected",
    reason: "Personal work",
    appliedDate: "2025-10-18",
    approver: "Lisa Anderson",
  },
  {
    id: "LR004",
    employee: "Sarah Johnson",
    employeeId: "EMP001",
    type: "Sick Leave",
    startDate: "2025-11-01",
    endDate: "2025-11-01",
    days: 1,
    status: "pending",
    reason: "Feeling unwell",
    appliedDate: "2025-10-31",
    approver: "Mike Chen",
  },
];

const initialNotifications = [
  {
    id: 1,
    title: "New leave request",
    description: "John Doe requested 3 days off.",
    read: true,
    date: "2025-09-24T10:00:00Z",
  },
  {
    id: 2,
    title: "Payroll processed",
    description: "September payroll has been successfully processed.",
    read: true,
    date: "2025-09-23T15:30:00Z",
  },
  {
    id: 3,
    title: "Onboarding complete",
    description: "Jane Smith has completed onboarding.",
    read: false,
    date: "2025-09-25T09:00:00Z",
  },
];

const initialPolicies = [
  {
    id: uuidv4(),
    title: "Work From Home Policy",
    category: "General",
    content:
      "Employees are allowed to work from home up to 2 days per week with manager approval.",
  },
  {
    id: uuidv4(),
    title: "Leave Policy",
    category: "HR",
    content: "Annual leave must be requested at least 2 weeks in advance.",
  },
];

const initialCompanyHolidays = [
  { date: "2025-10-31", name: "Halloween" },
  { date: "2025-11-27", name: "Thanksgiving Day" },
  { date: "2025-12-25", name: "Christmas Day" },
];

const initialHrRequests = [
  {
    id: uuidv4(),
    employeeId: "EMP001",
    type: "Designation Change",
    details: "Requesting promotion to Lead Software Engineer.",
    status: "pending",
    requestedDate: "2025-09-20",
  },
];

const API_BASE_URL = "http://localhost:5000/api";

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useLocalStorage("hrms_audit_logs", []);
  const [employees, setEmployees] = useLocalStorage(
    "hrms_employees",
    initialEmployees
  );
  const [teams, setTeams] = useLocalStorage("hrms_teams", initialTeams);
  const [departments, setDepartments] = useLocalStorage(
    "hrms_departments",
    initialDepartments
  );
  const [designations, setDesignations] = useLocalStorage(
    "hrms_designations",
    initialDesignations
  );
  const [locations, setLocations] = useLocalStorage(
    "hrms_locations",
    initialLocations
  );
  const [companyMessages, setCompanyMessages] = useLocalStorage(
    "hrms_company_messages",
    initialMessages
  );
  const [onboarding, setOnboarding] = useLocalStorage(
    "hrms_onboarding",
    initialOnboarding
  );
  const [offboarding, setOffboarding] = useLocalStorage(
    "hrms_offboarding",
    initialOffboarding
  );
  const [roles, setRoles] = useLocalStorage("hrms_roles", initialRoles);
  const [shifts, setShifts] = useLocalStorage("hrms_shifts", initialShifts);
  const [companySettings, setCompanySettings] = useLocalStorage(
    "hrms_company_settings",
    initialCompanySettings
  );
  const [leaveRequests, setLeaveRequests] = useLocalStorage(
    "hrms_leave_requests",
    initialLeaveRequests
  );
  const [notifications, setNotifications] = useLocalStorage(
    "hrms_notifications",
    initialNotifications
  );
  const [policies, setPolicies] = useLocalStorage(
    "hrms_policies",
    initialPolicies
  );
  const [companyHolidays, setCompanyHolidays] = useLocalStorage(
    "hrms_company_holidays",
    initialCompanyHolidays
  );
  const [hrRequests, setHrRequests] = useLocalStorage(
    "hrms_hr_requests",
    initialHrRequests
  );

  const logAction = (action, details = {}, before = null, after = null) => {
    const newLog = {
      id: uuidv4(),
      user: user?.name || "System",
      role: user?.role || "system",
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      status: "success",
      before,
      after,
    };
    setAuditLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: uuidv4(),
      read: false,
      date: new Date().toISOString(),
    };
    setNotifications((prev) =>
      [newNotification, ...prev].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )
    );
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Enhanced API functions for leave requests with better error handling
  const leaveApi = {
    getAll: async () => {
      try {
        console.log("Fetching all leaves from backend...");
        const response = await fetch(`${API_BASE_URL}/leaves`);
        if (response.ok) {
          const data = await response.json();
          console.log("Leaves fetched successfully:", data);
          // Update local state with data from backend
          setLeaveRequests(data);
          return data;
        } else {
          console.error("Failed to fetch leaves, status:", response.status);
          // Fallback to local storage if API fails
          console.log("Using local storage data as fallback");
          return leaveRequests;
        }
      } catch (error) {
        console.error("Error fetching leaves:", error);
        console.log("Using local storage data due to connection error");
        // Fallback to local storage
        return leaveRequests;
      }
    },

    getLeavesByEmployee: async (employeeId) => {
      try {
        if (!employeeId) {
          console.error("No employeeId provided");
          return [];
        }

        console.log("Fetching leaves for employee:", employeeId);
        const response = await fetch(
          `${API_BASE_URL}/leaves/employee/${employeeId}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Leaves fetched for employee:", data);
          return data;
        } else if (response.status === 404) {
          console.log("No leaves found for employee, returning empty array");
          return [];
        } else {
          console.error(
            "Failed to fetch employee leaves, status:",
            response.status
          );
          // Fallback: filter local leave requests by employeeId
          const localLeaves = leaveRequests.filter(
            (req) => req.employeeId === employeeId
          );
          console.log("Using local leaves as fallback:", localLeaves);
          return localLeaves;
        }
      } catch (error) {
        console.error("Error fetching employee leaves:", error);
        // Fallback to local storage filtered by employeeId
        const localLeaves = leaveRequests.filter(
          (req) => req.employeeId === employeeId
        );
        console.log("Using local leaves due to error:", localLeaves);
        return localLeaves;
      }
    },

    getAllForHR: async () => {
      try {
        console.log("Fetching all leaves for HR...");
        const response = await fetch(`${API_BASE_URL}/leaves`);
        if (response.ok) {
          const data = await response.json();
          console.log("All leaves fetched for HR:", data);
          return data;
        } else {
          console.error(
            "Failed to fetch all leaves for HR, status:",
            response.status
          );
          return leaveRequests;
        }
      } catch (error) {
        console.error("Error fetching all leaves for HR:", error);
        return leaveRequests;
      }
    },

    add: async (leaveData) => {
      try {
        console.log("Sending leave data to backend:", leaveData);

        // Validate required fields - IMPROVED VALIDATION
        if (!leaveData.employeeId) {
          console.error("No employeeId provided in leaveData:", leaveData);
          throw new Error("Employee ID is required");
        }

        const response = await fetch(`${API_BASE_URL}/leaves`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leaveData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to create leave request: ${response.status}`
          );
        }

        const newLeave = await response.json();
        console.log("Leave created successfully in database:", newLeave);

        // Update local state
        setLeaveRequests((prev) => [...prev, newLeave]);

        logAction(
          "Create Leave Request",
          { id: newLeave._id, employee: newLeave.employee },
          null,
          newLeave
        );

        addNotification({
          title: "Leave Request Submitted",
          description: `Your ${newLeave.type} request has been submitted for approval.`,
        });

        return newLeave;
      } catch (error) {
        console.error("Error creating leave in backend:", error);
        throw error; // Re-throw to handle in the component
      }
    },

    update: async (id, updatedData) => {
      try {
        console.log("Updating leave status:", id, updatedData);
        const response = await fetch(`${API_BASE_URL}/leaves/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          const updatedLeave = await response.json();
          console.log("Leave updated successfully in database:", updatedLeave);

          // Update local state
          setLeaveRequests((prev) =>
            prev.map((leave) =>
              leave._id === id || leave.id === id ? updatedLeave : leave
            )
          );

          logAction(
            "Update Leave Status",
            { id, status: updatedData.status },
            null,
            updatedLeave
          );

          return updatedLeave;
        } else {
          console.error(
            "Failed to update leave in backend, status:",
            response.status
          );
          throw new Error("Failed to update leave request in backend");
        }
      } catch (error) {
        console.error("Error updating leave in backend:", error);
        // Fallback to local storage
        const updatedLeave = { ...updatedData };
        setLeaveRequests((prev) =>
          prev.map((leave) =>
            leave.id === id ? { ...leave, ...updatedData } : leave
          )
        );

        console.log("Updated leave in local storage as fallback");
        return updatedLeave;
      }
    },

    remove: async (id) => {
      try {
        console.log("Deleting leave:", id);
        const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("Leave deleted successfully from database");
          setLeaveRequests((prev) =>
            prev.filter((leave) => leave._id !== id && leave.id !== id)
          );
          logAction("Delete Leave Request", { id });
        } else {
          console.error(
            "Failed to delete leave from backend, status:",
            response.status
          );
          throw new Error("Failed to delete leave request from backend");
        }
      } catch (error) {
        console.error("Error deleting leave from backend:", error);
        // Fallback to local storage
        setLeaveRequests((prev) => prev.filter((leave) => leave.id !== id));
        console.log("Deleted leave from local storage as fallback");
      }
    },
  };

  const crudOperations = (items, setItems, itemName) => ({
    getAll: () => items,
    getById: (id) => items.find((item) => item.id === id),
    add: (newItemData) => {
      const newItem = { ...newItemData, id: newItemData.id || uuidv4() };
      const newItems = [...items, newItem];
      setItems(newItems);
      logAction(
        `Create ${itemName}`,
        { name: newItem.name || newItem.title },
        null,
        newItem
      );
      if (itemName === "Company Message") {
        addNotification({
          title: `New Company Message: ${newItem.title}`,
          description: newItem.content.substring(0, 50) + "...",
        });
      }
      if (itemName === "HR Request") {
        addNotification({
          title: `New HR Request from ${user?.name}`,
          description: `Type: ${newItem.type}`,
        });
      }
      return newItem;
    },
    update: (id, updatedData) => {
      let oldItem = null;
      const newItems = items.map((item) => {
        if (item.id === id) {
          oldItem = { ...item };
          return { ...item, ...updatedData };
        }
        return item;
      });
      setItems(newItems);
      const updatedItem = newItems.find((item) => item.id === id);
      logAction(
        `Update ${itemName}`,
        { id, name: updatedItem.name || updatedItem.title },
        oldItem,
        updatedItem
      );
      return updatedItem;
    },
    remove: (id) => {
      const itemToRemove = items.find((item) => item.id === id);
      const newItems = items.filter((item) => item.id !== id);
      setItems(newItems);
      logAction(
        `Delete ${itemName}`,
        { id, name: itemToRemove.name || itemToRemove.title },
        itemToRemove,
        null
      );
    },
  });

  const value = {
    auditLogs,
    logAction,
    employees: crudOperations(employees, setEmployees, "Employee"),
    teams: crudOperations(teams, setTeams, "Team"),
    departments: crudOperations(departments, setDepartments, "Department"),
    designations: crudOperations(designations, setDesignations, "Designation"),
    locations: crudOperations(locations, setLocations, "Location"),
    companyMessages: crudOperations(
      companyMessages,
      setCompanyMessages,
      "Company Message"
    ),
    onboarding: crudOperations(
      onboarding,
      setOnboarding,
      "Onboarding Candidate"
    ),
    offboarding: crudOperations(
      offboarding,
      setOffboarding,
      "Offboarding Employee"
    ),
    roles: crudOperations(roles, setRoles, "Role"),
    shifts: crudOperations(shifts, setShifts, "Shift"),
    leaveRequests: leaveApi,
    policies: crudOperations(policies, setPolicies, "Company Policy"),
    hrRequests: crudOperations(hrRequests, setHrRequests, "HR Request"),
    companyHolidays: {
      getAll: () => companyHolidays,
    },
    companySettings: {
      get: () => companySettings,
      update: (newSettings) => {
        const oldSettings = { ...companySettings };
        setCompanySettings((prev) => ({ ...prev, ...newSettings }));
        logAction("Update Company Settings", {}, oldSettings, {
          ...companySettings,
          ...newSettings,
        });
      },
    },
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
