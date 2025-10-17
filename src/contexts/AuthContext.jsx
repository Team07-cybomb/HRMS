import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("hrms_user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Enhanced user data with employee info
      const userData = {
        _id: data._id,
        email: data.email,
        role: data.role,
        name: data.name || email.split("@")[0],
        employeeId: data.employeeId,
        permissions: data.permissions || getDefaultPermissions(data.role),
      };

      const token = data.token;

      if (userData && token) {
        setUser(userData);
        localStorage.setItem("hrms_user", JSON.stringify(userData));
        localStorage.setItem("hrms_token", token);

        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${userData.role}.`,
        });

        return { success: true };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  // Get default permissions based on role
  const getDefaultPermissions = (role) => {
    const permissions = {
      employer: [
        "view:all",
        "create:all",
        "edit:all",
        "delete:all",
        "approve:leave",
        "reject:leave",
      ],
      hr: [
        "view:employees",
        "create:employees",
        "edit:employees",
        "approve:leave",
        "reject:leave",
      ],
      employee: ["view:self", "edit:self", "create:leave", "cancel:own_leave"],
    };
    return permissions[role] || [];
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setOriginalUser(null);
    localStorage.removeItem("hrms_user");
    localStorage.removeItem("hrms_token");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Enhanced permission check
  const can = (action, resource = null) => {
    if (!user) return false;

    // Check if user has explicit permission
    if (user.permissions && user.permissions.includes(action)) {
      return true;
    }

    // Role-based fallback permissions
    const { role } = user;

    switch (action) {
      case "view:employee_list":
      case "create:employee":
      case "delete:employee":
      case "view:all_attendance":
      case "approve:timesheet":
      case "approve:manual_attendance":
      case "approve:leave":
      case "reject:leave":
        return ["hr", "employer"].includes(role);

      case "view:employee_details":
        if (["hr", "employer"].includes(role)) return true;
        if (resource?.id === user.employeeId) return true;
        return false;

      case "edit:employee_core":
        return ["hr", "employer"].includes(role);

      case "edit:employee_basic":
        return (
          resource?.id === user.employeeId || ["hr", "employer"].includes(role)
        );

      case "create:leave":
      case "cancel:own_leave":
        return true; // All authenticated users can apply for leave

      default:
        return false;
    }
  };

  // Check if user can manage leaves (approve/reject)
  const canManageLeaves = () => {
    return can("approve:leave") || can("reject:leave");
  };

  // Impersonate role
  const impersonate = async (role) => {
    if (user.role !== "employer") {
      toast({
        title: "Permission Denied",
        description: "Only employers can impersonate roles.",
        variant: "destructive",
      });
      return;
    }
    if (!originalUser) setOriginalUser(user);

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/impersonate/${role}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to impersonate");

      const targetUser = data.user;
      if (targetUser) {
        setUser(targetUser);
        toast({
          title: "Impersonation Started",
          description: `You are now acting as ${role}.`,
        });
      }
    } catch (err) {
      toast({
        title: "Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Stop impersonation
  const stopImpersonating = () => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
      toast({
        title: "Impersonation Stopped",
        description: "You are back to your original role.",
      });
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    impersonate,
    stopImpersonating,
    isImpersonating: !!originalUser,
    can,
    canManageLeaves,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
