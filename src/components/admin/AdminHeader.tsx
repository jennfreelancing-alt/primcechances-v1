import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
const AdminHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-600">Comprehensive platform management and analytics</p>
      </div>
      {/* Removed action buttons for better mobile responsiveness */}
    </div>
  );
};
export default AdminHeader;