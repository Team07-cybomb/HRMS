import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { format, parseISO } from 'date-fns';
import { Rss, UserCircle } from 'lucide-react';

const FeedsTab = () => {
  const { companyMessages } = useAppContext();
  const messages = companyMessages.getAll();

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = parseISO(dateString);
    return !isNaN(date.getTime());
  };

  return (
    <div className="space-y-6">
      {messages.length > 0 ? messages.map(message => (
        <Card key={message.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{message.title}</CardTitle>
                <CardDescription>
                  {isValidDate(message.date) ? `Posted on ${format(parseISO(message.date), 'PPP')}` : 'Date not available'}
                </CardDescription>
              </div>
              <Rss className="w-6 h-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{message.content}</p>
          </CardContent>
          <CardFooter>
            <div className="flex items-center text-xs text-muted-foreground">
              <UserCircle className="w-4 h-4 mr-2" />
              <span>Posted by {message.author}</span>
            </div>
          </CardFooter>
        </Card>
      )) : (
        <Card>
          <CardContent className="text-center p-12">
            <p className="text-muted-foreground">No company feeds or announcements at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedsTab;