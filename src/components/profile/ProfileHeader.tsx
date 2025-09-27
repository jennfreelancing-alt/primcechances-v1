import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, Brain } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const ProfileHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <img src="/assets/img/logo.jpg" alt="App Logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-[#008000] hidden sm:block">PrimeChances</span>
            </div>
            <span className="text-xs text-gray-500 ml-10">Find your next opportunity</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/ai-assistant')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Assistant
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900"
            >
              Profile
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Notification Center */}
            <NotificationCenter />
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="p-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Mobile menu button */}
              <div className="sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
