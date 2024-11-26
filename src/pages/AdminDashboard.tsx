import React, { useState } from 'react';
import { 
  LayoutGrid, 
  ListFilter, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Redirect if not admin
  React.useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search facilities..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border rounded-lg"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                  <ListFilter className="w-5 h-5" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Admin Dashboard Coming Soon</h2>
              <p className="text-gray-600">
                We're working on building out the admin features. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}