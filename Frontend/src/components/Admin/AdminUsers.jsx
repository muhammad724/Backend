import React, { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../Services/api';
import { Users, UserPlus, Edit, Trash2, TrendingUp, Shield, Stethoscope, User } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  // new-user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    specialization: ''
  });

  // editing
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        setUsers(res.data?.users || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load users'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewUser((u) => ({ ...u, [name]: value }));
  };

  const submitNewUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newUser, role: newUser.role.toLowerCase() };
      await api.post('/admin/users', payload);
      setNewUser({ name: '', email: '', password: '', role: 'doctor', specialization: '' });
      setShowAddForm(false);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleEditClick = (u) => {
    setEditingUser({ ...u, password: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((u) => ({ ...u, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingUser, role: editingUser.role.toLowerCase() };
      await api.put(`/users/${editingUser._id}`, payload);
      setEditingUser(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users size={16} />
          <span>{users.length} Total Users</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{roleStats.doctor || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Stethoscope size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Receptionists</p>
              <p className="text-3xl font-bold text-gray-900">{roleStats.receptionist || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <User size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Admins</p>
              <p className="text-3xl font-bold text-gray-900">{roleStats.admin || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Shield size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" size={20} />
            User Role Distribution
          </h2>
          <Doughnut
            data={roleDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
              },
            }}
          />
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-purple-500" size={20} />
            Subscription Plans
          </h2>
          <Bar
            data={subscriptionData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      {/* User Management Actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus size={18} />
              <span>Add User</span>
            </button>
          )}
        </div>

        {/* add user form */}
        {showAddForm && (
          <form onSubmit={submitNewUser} className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlus className="mr-2 text-blue-500" size={20} />
              Create New User
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={newUser.name}
                  onChange={handleAddChange}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleAddChange}
                  placeholder="user@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleAddChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              {newUser.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    name="specialization"
                    value={newUser.specialization}
                    onChange={handleAddChange}
                    placeholder="e.g., Cardiology"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <UserPlus size={18} />
                <span>Create User</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Edit user form */}
        {editingUser && (
          <form onSubmit={submitEdit} className="mb-6 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Edit className="mr-2 text-yellow-500" size={20} />
              Edit User
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={editingUser.name || ''}
                  onChange={handleEditChange}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email || ''}
                  onChange={handleEditChange}
                  placeholder="user@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={editingUser.role || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              {editingUser.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    name="specialization"
                    value={editingUser.specialization || ''}
                    onChange={handleEditChange}
                    placeholder="e.g., Cardiology"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit size={18} />
                <span>Update User</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      {/* Users Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'receptionist' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {u.subscriptionPlan || 'free'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.patch(`/admin/upgrade-subscription/${u._id}`);
                              refresh();
                            } catch {
                              // ignore for now
                            }
                          }}
                          className={`transition-colors p-1 rounded ${
                            u.subscriptionPlan === 'Pro'
                              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={u.subscriptionPlan === 'Pro' ? 'Downgrade' : 'Upgrade'}
                        >
                          <TrendingUp size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminUsers;

