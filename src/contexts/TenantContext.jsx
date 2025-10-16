import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedTenant = localStorage.getItem('hrms_tenant');
    if (storedTenant) {
      setTenant(JSON.parse(storedTenant));
    } else {
      // Default tenant configuration
      const defaultTenant = {
        id: 'default',
        name: 'HRMS Pro Company',
        country: 'USA',
        currency: 'USD',
        timezone: 'America/New_York',
        locale: 'en-US',
        settings: {
          payrollFrequency: 'monthly',
          fiscalYearStart: '01-01',
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          workingHours: 8,
          overtimeRules: 'standard',
          leaveAccrual: 'monthly'
        }
      };
      setTenant(defaultTenant);
      localStorage.setItem('hrms_tenant', JSON.stringify(defaultTenant));
    }
    setLoading(false);
  }, []);

  const updateTenant = (updates) => {
    const updatedTenant = { ...tenant, ...updates };
    setTenant(updatedTenant);
    localStorage.setItem('hrms_tenant', JSON.stringify(updatedTenant));
  };

  const value = {
    tenant,
    updateTenant,
    loading
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};