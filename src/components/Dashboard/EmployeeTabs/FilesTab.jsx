import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FilesTab = () => {
  const { employees: employeesApi } = useAppContext();
  const { user } = useAuth();
  const employee = employeesApi.getById(user.id);

  const handleAction = (action, fileName) => {
    toast({ title: action, description: `${fileName} action triggered.` });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Files</CardTitle>
        <Button onClick={() => handleAction('Upload New File', '')}><Upload className="mr-2 h-4 w-4" /> Upload File</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Date Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employee?.documents?.length > 0 ? employee.documents.map(doc => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center"><FileText className="w-4 h-4 mr-2 text-muted-foreground" />{doc.name}</TableCell>
                <TableCell>{doc.size}</TableCell>
                <TableCell>{doc.uploaded}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleAction('Download', doc.name)}><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleAction('Delete', doc.name)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan="4" className="h-24 text-center">No files found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FilesTab;