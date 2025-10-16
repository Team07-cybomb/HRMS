import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { format } from 'date-fns';
import {
  Shield,
  Search,
  Filter,
  User,
  Clock,
  MoreVertical,
  Download,
  FileJson
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const AuditSection = () => {
  const { auditLogs } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const handleAction = (action, item = null) => {
    toast({
      title: action,
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.details && typeof log.details === 'string' && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Helmet>
        <title>Audit Trail - HRMS Pro</title>
        <meta name="description" content="Track all system activities and changes with the comprehensive audit trail in HRMS Pro" />
      </Helmet>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed view of the recorded action.
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">Before</h4>
                <pre className="bg-gray-100 p-4 rounded-md text-xs">
                  {JSON.stringify(selectedLog.before, null, 2) || 'N/A'}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">After</h4>
                <pre className="bg-gray-100 p-4 rounded-md text-xs">
                  {JSON.stringify(selectedLog.after, null, 2) || 'N/A'}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-gray-600 mt-2">Track all system activities and changes for compliance and security</p>
          </div>
          <Button
            onClick={() => handleAction('Export Logs')}
            className="mt-4 sm:mt-0"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs by user, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => handleAction('Filter Logs')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{log.action}</h3>
                      <p className="text-sm text-gray-500">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                    {(log.before || log.after) && (
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                        <FileJson className="w-4 h-4" />
                      </Button>
                    )}
                    <button
                      onClick={() => handleAction('Log Options', log)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{log.user} ({log.role})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(log.timestamp), "PPpp")}</span>
                  </div>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default AuditSection;