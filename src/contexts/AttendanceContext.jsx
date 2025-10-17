

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hrms_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

// In your AuthContext.jsx - Enhanced login function
const login = async (email, password) => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    // Enhanced user data with all required properties
    const userData = {
      id: data._id || data.id,
      _id: data._id,
      email: data.email,
      role: data.role,
      name: data.name || email.split('@')[0], // Fallback name
      teamId: data.teamId || 1, // Default team ID
      teamIds: data.teamIds || [data.teamId || 1], // Array of team IDs
      // Add any other fields your backend expects
      employeeId: data._id || data.id, // Ensure employeeId is set
    };
    
    const token = data.token;

    if (userData && token) {
      setUser(userData);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      localStorage.setItem('hrms_token', token);

      console.log('User data after login:', userData); // Debug log

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${userData.role}.`,
      });

      return { success: true };
    } else {
      throw new Error('Invalid response from server');
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

  // Logout function
  const logout = () => {
    setUser(null);
    setOriginalUser(null);
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('hrms_token');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Role-based permission check
  const can = (action, target) => {
    if (!user) return false;
    const { role, id: userId, teamIds } = user;

    switch (action) {
      case 'view:employee_list':
      case 'create:employee':
      case 'delete:employee':
      case 'view:all_attendance':
      case 'approve:timesheet':
      case 'approve:manual_attendance':
      case 'approve:leave':
        return ['hr', 'employer'].includes(role);

      case 'view:employee_details':
        if (['hr', 'employer'].includes(role)) return true;
        if (target.id === userId) return true;
        if (target.teamId && teamIds.includes(target.teamId)) return 'basic';
        return false;

      case 'edit:employee_core':
        return ['hr', 'employer'].includes(role);

      case 'edit:employee_basic':
        return target.id === userId || ['hr', 'employer'].includes(role);

      default:
        return false;
    }
  };

  // Impersonate role
  const impersonate = async (role) => {
    if (user.role !== 'employer') {
      toast({ title: "Permission Denied", description: "Only employers can impersonate roles.", variant: "destructive" });
      return;
    }
    if (!originalUser) setOriginalUser(user);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/impersonate/${role}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to impersonate');

      const targetUser = data.user;
      if (targetUser) {
        setUser(targetUser);
        toast({ title: "Impersonation Started", description: `You are now acting as ${role}.` });
      }
    } catch (err) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  // Stop impersonation
  const stopImpersonating = () => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
      toast({ title: "Impersonation Stopped", description: "You are back to your original role." });
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
