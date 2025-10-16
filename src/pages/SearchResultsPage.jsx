import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  Briefcase,
  User
} from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  // Dummy data for search results
  const searchResults = {
    employees: [
      { id: 'EMP001', name: 'Sarah Johnson', designation: 'Senior Software Engineer' },
      { id: 'EMP002', name: 'Mike Chen', designation: 'Engineering Manager' },
    ],
    teams: [
      { id: 1, name: 'Engineering', lead: 'Mike Chen' },
    ],
    documents: [
      { id: 'DOC01', name: 'Employee Handbook 2024', type: 'Policy' },
      { id: 'DOC02', name: 'Q1 Performance Review Template', type: 'Template' },
    ],
  };

  const renderResultItem = (item, type) => {
    let icon, title, subtitle, link;

    switch (type) {
      case 'employee':
        icon = <User className="w-5 h-5 text-primary" />;
        title = item.name;
        subtitle = item.designation;
        link = `/employees/${item.id}`;
        break;
      case 'team':
        icon = <Users className="w-5 h-5 text-green-500" />;
        title = item.name;
        subtitle = `Lead: ${item.lead}`;
        link = `/teams`;
        break;
      case 'document':
        icon = <FileText className="w-5 h-5 text-purple-500" />;
        title = item.name;
        subtitle = `Type: ${item.type}`;
        link = `/hr-letters`;
        break;
      default:
        return null;
    }

    return (
      <Link to={link}>
        <Card className="p-4 flex items-center space-x-4 card-hover">
          <div className="p-2 bg-secondary rounded-lg">{icon}</div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <Helmet>
        <title>Search Results for "{query}" - HRMS Pro</title>
        <meta name="description" content={`Search results for ${query} in HRMS Pro.`} />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          <p className="text-muted-foreground mt-2">Showing results for: <span className="text-primary font-semibold">"{query}"</span></p>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" /> Employees <Badge variant="secondary" className="ml-2">{searchResults.employees.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.employees.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }}>
                  {renderResultItem(item, 'employee')}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" /> Teams <Badge variant="secondary" className="ml-2">{searchResults.teams.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.teams.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }}>
                  {renderResultItem(item, 'team')}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Documents <Badge variant="secondary" className="ml-2">{searchResults.documents.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.documents.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }}>
                  {renderResultItem(item, 'document')}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SearchResultsPage;