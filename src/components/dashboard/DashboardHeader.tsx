import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Search, Settings, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import SearchBar from '@/components/SearchBar';

interface DashboardHeaderProps {
  user: any;
  isAdmin: boolean;
  adminCheckComplete: boolean;
  onResultSelect: (result: any) => void;
  onSignOut: () => void;
}

const DashboardHeader = ({ user, isAdmin, adminCheckComplete, onResultSelect, onSignOut }: DashboardHeaderProps) => {
  const [isStaffAdmin, setIsStaffAdmin] = useState(false);

  useEffect(() => {
    const checkStaffAdminRole = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'staff_admin')
          .maybeSingle();
        setIsStaffAdmin(!!data);
      }
    };
    checkStaffAdminRole();
  }, [user]);
  const navigate = useNavigate();

  const getUserInitials = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleAdminClick = () => {
    navigate('/administrator');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-md border-b border-[#e6f5ec]/30 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <img src="/assets/img/logo.jpg" alt="App Logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-[#008000]">PrimeChances</span>
            </div>
            <span className="text-xs text-gray-500 ml-10">Find your next opportunity</span>
          </div>

          {/* Search Bar - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
            <SearchBar onResultSelect={onResultSelect} />
          </div>

          {/* AI Assistant and Staff Admin Buttons - Desktop only */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ai-assistant')}
              className="bg-[#008000]/10 border-[#008000]/30 text-[#008000] hover:bg-[#218c1b]/20 hover:border-[#218c1b]/50 transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            {isStaffAdmin && (
              <Button
                asChild
                className="bg-[#008000] text-white px-4 py-2 font-semibold rounded-lg shadow hover:bg-[#008000]/90 transition-all duration-200"
              >
                <Link to="/staff-admin">Staff Admin Dashboard</Link>
              </Button>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="md:hidden p-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-xl hover:bg-[#e6f5ec]/30 transition-all duration-200"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-[#008000]/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-[#008000] text-white text-xs sm:text-sm">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[#384040]">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </motion.button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border border-[#e6f5ec]/50">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/ai-assistant" className="flex items-center gap-2 cursor-pointer">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/subscription" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Subscription
                  </Link>
                </DropdownMenuItem>

                {adminCheckComplete && isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
