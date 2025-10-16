
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckSquare,
  Calendar,
  User,
  DollarSign,
  Clock,
  Check,
  X,
  Eye
} from 'lucide-react';

const ApprovalsSection = () => {
  const { leaveRequests, employees } = useAppContext();
  const { user, can } = useAuth();

  const handleAction = (api, id, status) => {
    if (!can('approve:leave')) {
      toast({ title: 'Permission Denied', variant: 'destructive' });
      return;
    }
    api.update(id, { status });
    toast({
      title: `Request ${status}`,
      description: `The request status has been updated.`,
    });
  };

  const getApprovalItems = () => {
    if (user.role === 'employee') {
      return leaveRequests.getAll().filter(req => req.employeeId === user.id);
    }
    return leaveRequests.getAll().filter(req => req.status === 'pending');
  };

  const approvalItems = getApprovalItems();

  return (
    <>
      <Helmet>
        <title>Approvals - HRMS Pro</title>
        <meta name="description" content="Manage all pending approvals for leave, timesheets, expenses, and more in one place." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
          <p className="text-muted-foreground mt-2">
            {user.role === 'employee' ? 'Track the status of your requests.' : 'Review and process all pending requests.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {approvalItems.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.type}</h3>
                        <p className="text-sm text-muted-foreground">From: {item.employee}</p>
                        <p className="text-sm text-muted-foreground">{item.startDate} to {item.endDate}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                      {user.role !== 'employee' ? (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(leaveRequests, item.id, 'approved')}>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(leaveRequests, item.id, 'rejected')}>
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast({ title: "Viewing details...", description: item.reason })}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>{item.status}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {approvalItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">There are no pending approvals at the moment.</p>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ApprovalsSection;
