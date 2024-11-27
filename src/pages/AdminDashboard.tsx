import React, { useState, useEffect } from 'react';
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
  X,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const listings = await facilitiesService.getAllListingsForAdmin();
        setFacilities(listings);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Filter facilities based on search and status
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || facility.moderationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
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
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Facilities Found</h2>
                <p className="text-gray-600">
                  No facilities match your current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 font-semibold">Facility</th>
                      <th className="text-left py-4 px-4 font-semibold">Location</th>
                      <th className="text-left py-4 px-4 font-semibold">Status</th>
                      <th className="text-left py-4 px-4 font-semibold">Verification</th>
                      <th className="text-left py-4 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFacilities.map((facility) => (
                      <tr key={facility.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium">{facility.name}</div>
                          <div className="text-sm text-gray-500">{facility.phone}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{facility.location}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.moderationStatus)}`}>
                            {facility.moderationStatus.charAt(0).toUpperCase() + facility.moderationStatus.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${facility.isVerified ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                            {facility.isVerified ? (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                Verified
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-4 h-4" />
                                Unverified
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {facility.moderationStatus === 'pending' && (
                              <>
                                <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
