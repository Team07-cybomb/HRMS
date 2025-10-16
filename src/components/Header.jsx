
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useTheme } from '@/contexts/ThemeProvider';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import {
  Menu,
  Bell,
  Search,
  Globe,
  LogOut,
  User,
  Settings,
  LifeBuoy,
  Users,
  Briefcase,
  Shield,
  Repeat,
  Sun,
  Moon,
  Palette,
  Mail,
  MailOpen,
  Building2,
  BookOpen
} from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { user, logout, impersonate, stopImpersonating, isImpersonating } = useAuth();
  const { tenant } = useTenant();
  const { setTheme } = useTheme();
  const { notifications, markAsRead, markAllAsRead } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-card shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {tenant?.country} • {tenant?.timezone}
              </span>
            </div>
            {user?.role !== 'employee' && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/teams')}>
                  <Users className="w-4 h-4 mr-2" /> Teams
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/organization')}>
                  <Building2 className="w-4 h-4 mr-2" /> Organization
                </Button>
              </>
            )}
             <Button variant="ghost" size="sm" onClick={() => navigate('/company-policy')}>
              <BookOpen className="w-4 h-4 mr-2" /> Company Policy
            </Button>
          </div>
        </div>

        <div className="flex-1 max-w-xs mx-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">{unreadCount}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex justify-between items-center px-2 py-1">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <Button variant="link" size="sm" onClick={markAllAsRead}>Mark all as read</Button>
              </div>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className={`flex flex-col items-start ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => markAsRead(notification.id)}>
                  <div className="flex items-center w-full">
                    {notification.read ? <MailOpen className="mr-2 h-4 w-4 text-muted-foreground" /> : <Mail className="mr-2 h-4 w-4 text-primary" />}
                    <p className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{notification.description}</p>
                </DropdownMenuItem>
              )) : <p className="text-sm text-muted-foreground text-center p-4">No new notifications.</p>}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: 'Support', description: 'Feature not implemented.' })}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {user?.role === 'employer' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Repeat className="mr-2 h-4 w-4" />
                      <span>Impersonate Role</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => impersonate('hr')}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>HR</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => impersonate('employee')}>
                          <Users className="mr-2 h-4 w-4" />
                          <span>Employee</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </>
              )}

              {isImpersonating && (
                <DropdownMenuItem onClick={stopImpersonating} className="text-blue-600">
                  <Repeat className="mr-2 h-4 w-4" />
                  <span>Stop Impersonating</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
