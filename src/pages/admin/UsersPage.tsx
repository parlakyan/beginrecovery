import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Ban,
  RotateCcw,
  AlertCircle,
  Mail,
  ExternalLink,
  Clock,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usersService } from '../../services/users';
import { User, UserStats } from '../../types';
import ConfirmationDialog from '../../components/ConfirmationDialog';

export default function UsersPage(): JSX.Element {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [loading, setLoading] = useState(true);

  // Confirmation dialogs
  const [suspendDialog, setSuspendDialog] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ isOpen: boolean; email: string | null }>({
    isOpen: false,
    email: null
  });

  // Fetch users and their stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const allUsers = await usersService.getAllUsers();
      setUsers(allUsers);

      // Fetch stats for each user
      const stats: Record<string, UserStats> = {};
      await Promise.all(
        allUsers.map(async (user) => {
          const userStats = await usersService.getUserStats(user.id);
          if (userStats) {
            stats[user.id] = userStats;
          }
        })
      );
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (userStats[user.id]?.status || '').toLowerCase().includes(searchLower);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !user.isSuspended) ||
      (statusFilter === 'suspended' && user.isSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSuspend = async (userId: string) => {
    try {
      setLoading(true);
      await usersService.suspendUser(userId);
      await fetchData();
      setSuspendDialog({ isOpen: false, userId: null });
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      setLoading(true);
      await usersService.unsuspendUser(userId);
      await fetchData();
    } catch (error) {
      console.error('Error unsuspending user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      setLoading(true);
      await usersService.resetUserPassword(email);
      setResetPasswordDialog({ isOpen: false, email: null });
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by email, role, or status..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="user">User</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Users Found</h2>
            <p className="text-gray-600">
              No users match your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">User</th>
                  <th className="text-left py-4 px-4 font-semibold">Role</th>
                  <th className="text-left py-4 px-4 font-semibold">Listings</th>
                  <th className="text-left py-4 px-4 font-semibold">Last Login</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const stats = userStats[user.id];
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          Joined {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'owner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{stats?.totalListings || 0} total</div>
                            <div className="text-sm text-gray-500">
                              {stats?.verifiedListings || 0} verified
                            </div>
                          </div>
                          {stats?.totalListings > 0 && (
                            <a 
                              href={`/admin/users/${user.id}/listings`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {formatDate(stats?.lastLogin || '')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isSuspended
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {user.isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(user.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded flex items-center gap-1"
                              title="Unsuspend User"
                            >
                              <RotateCcw className="w-5 h-5" />
                              <span className="text-sm">Unsuspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSuspendDialog({ isOpen: true, userId: user.id })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Suspend User"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setResetPasswordDialog({ isOpen: true, email: user.email })}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Reset Password"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend Confirmation */}
      <ConfirmationDialog
        isOpen={suspendDialog.isOpen}
        onClose={() => setSuspendDialog({ isOpen: false, userId: null })}
        onConfirm={() => {
          if (suspendDialog.userId) {
            handleSuspend(suspendDialog.userId);
          }
        }}
        title="Suspend User"
        message="Are you sure you want to suspend this user? Their listings will also be suspended."
        type="warning"
      />

      {/* Reset Password Confirmation */}
      <ConfirmationDialog
        isOpen={resetPasswordDialog.isOpen}
        onClose={() => setResetPasswordDialog({ isOpen: false, email: null })}
        onConfirm={() => {
          if (resetPasswordDialog.email) {
            handleResetPassword(resetPasswordDialog.email);
          }
        }}
        title="Reset Password"
        message="Are you sure you want to send a password reset email to this user?"
        type="warning"
      />
    </div>
  );
}
