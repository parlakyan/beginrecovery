import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Star, 
  Ban, 
  CheckCircle, 
  Clock, 
  XCircle,
  Building2,
  AlertCircle,
  KeyRound,
  Mail
} from 'lucide-react';
import { usersService } from '../../services/users';
import { User, UserStats } from '../../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({});
  const [loading, setLoading] = useState(true);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [fetchedUsers, userStats] = await Promise.all([
          usersService.getUsers(),
          usersService.getUserStats()
        ]);
        setUsers(fetchedUsers);
        setStats(userStats);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      await usersService.updateUser(userId, {
        isSuspended: !currentStatus
      });
      // Refresh users list
      const updatedUsers = await usersService.getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error toggling user suspension:', error);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      setResettingPassword(email);
      await usersService.resetUserPassword(email);
      alert('Password reset email sent successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to send password reset email');
    } finally {
      setResettingPassword(null);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (user: User) => {
    if (user.isSuspended) {
      return <Ban className="w-4 h-4 text-red-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-400">Total Users</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</h3>
              <p className="text-sm text-gray-500">Active accounts</p>
            </div>
            <div className="flex items-center text-green-600">
              <span className="text-sm font-medium">+{stats.newUsersThisMonth || 0} this month</span>
            </div>
          </div>
        </div>

        {/* Total Listings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-400">Total Listings</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalListings || 0}</h3>
              <p className="text-sm text-gray-500">
                {stats.verifiedListings || 0} verified
              </p>
            </div>
            <div className="flex items-center text-green-600">
              <span className="text-sm font-medium">{Math.round(((stats.verifiedListings || 0) / (stats.totalListings || 1)) * 100)}% verified</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-400">Active Users</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</h3>
              <p className="text-sm text-gray-500">Last active {formatDate(stats.lastLogin)}</p>
            </div>
          </div>
        </div>

        {/* User Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-400">User Status</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {users.filter(user => !user.isSuspended).length}
              </h3>
              <p className="text-sm text-gray-500">
                {users.filter(user => user.isSuspended).length} suspended
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-600">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Listings</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Last Login</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">Created {formatDate(user.createdAt)}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user)}
                      <span className={`text-sm font-medium ${user.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <span className="font-medium">{user.verifiedListings || 0}</span>
                      <span className="text-gray-500"> verified of </span>
                      <span className="font-medium">{user.totalListings || 0}</span>
                      <span className="text-gray-500"> total</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetPassword(user.email)}
                        disabled={resettingPassword === user.email}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors border-gray-200 text-gray-600 hover:bg-gray-50 ${
                          resettingPassword === user.email ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {resettingPassword === user.email ? (
                          <Mail className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4 mr-1.5" />
                        )}
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(user.id, user.isSuspended || false)}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                          user.isSuspended
                            ? 'border-green-200 text-green-600 hover:bg-green-50'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {user.isSuspended ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Reactivate
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1.5" />
                            Suspend
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
