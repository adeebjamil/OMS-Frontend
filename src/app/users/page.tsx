'use client';

import { useEffect, useState } from 'react';
import { userAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Mail, Phone, Calendar, Edit, Trash2, X, User as UserIcon, Shield, Eye, MapPin, Building, Briefcase, Clock, AlertCircle } from 'lucide-react';

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'intern' | 'employee';
  internId?: string; // Unique employee ID (EMP26-0001)
  employeeId?: string; // Alias for internId
  department?: string;
  position?: string;
  internshipRole?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  supervisor?: string;
  supervisorId?: string;
  college?: string;
  address?: string;
  status?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'intern',
    department: '',
    position: '',
    phone: '',
    startDate: '',
    endDate: '',
    supervisor: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.createUser(formData);
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updateData: any = { ...formData };
      if (!updateData.password) delete updateData.password;
      await userAPI.updateUser(editingUser._id, updateData);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.deleteUser(id);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'intern',
      department: '',
      position: '',
      phone: '',
      startDate: '',
      endDate: '',
      supervisor: '',
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      position: user.position || '',
      phone: user.phone || '',
      startDate: user.startDate ? user.startDate.split('T')[0] : '',
      endDate: user.endDate ? user.endDate.split('T')[0] : '',
      supervisor: user.supervisor || '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage admins and employees</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-5 w-5" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="intern">Employees</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === 'intern').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user._id} className="border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Card Header with Avatar and Actions */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="h-14 w-14 rounded-full object-cover ring-3 ring-white shadow-md"
                      />
                    ) : (
                      <div className={`h-14 w-14 rounded-full flex items-center justify-center ring-3 ring-white shadow-md ${
                        user.role === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="h-7 w-7 text-white" />
                        ) : (
                          <UserIcon className="h-7 w-7 text-white" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{user.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${
                          user.role === 'admin' 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}>
                          {user.role === 'intern' ? 'Employee' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        {user.internId && (
                          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200 font-mono text-xs px-2 py-0.5">
                            {user.internId.replace('INT', 'EMP')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Body with Details */}
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600 truncate flex-1">{user.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">{user.phone || 'No phone'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-600 truncate flex-1">
                    {user.department || 'No dept'} {user.position ? `• ${user.position}` : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-gray-600">
                    {user.startDate ? new Date(user.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                  </span>
                </div>
              </CardContent>
              
              {/* Card Footer with Actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingUser(user)}
                  className="h-9 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(user)}
                  className="h-9 px-3 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user._id)}
                  className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No users found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <Card className="border-0 shadow-2xl">
              <CardHeader className="border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {editingUser ? 'Edit User' : 'Create New User'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingUser(null);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Full Name *
                        </label>
                        <Input
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Email *
                        </label>
                        <Input
                          required
                          type="email"
                          placeholder="admin@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Security</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Password {editingUser && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editingUser}
                          minLength={6}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Role *
                        </label>
                        <select
                          required
                          className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="intern">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Professional Details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Department
                        </label>
                        <Input
                          placeholder="Engineering"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Position
                        </label>
                        <Input
                          placeholder="Software Developer"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Employment Details (for all non-admin users) */}
                  {(formData.role === 'intern' || formData.role === 'employee') && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Employment Details</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Supervisor
                        </label>
                        <Input
                          placeholder="Supervisor name"
                          value={formData.supervisor}
                          onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t">
                    <Button type="submit" className="flex-1 h-11">
                      {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingUser(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <Card className="border-0 shadow-2xl overflow-hidden">
              {/* Header with gradient background */}
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingUser(null)}
                  className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-5">
                  {viewingUser.avatar ? (
                    <img 
                      src={viewingUser.avatar} 
                      alt={viewingUser.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30 shadow-xl"
                    />
                  ) : (
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center ring-4 ring-white/30 shadow-xl ${
                      viewingUser.role === 'admin' ? 'bg-white/20' : 'bg-white/20'
                    }`}>
                      {viewingUser.role === 'admin' ? (
                        <Shield className="h-10 w-10 text-white" />
                      ) : (
                        <UserIcon className="h-10 w-10 text-white" />
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{viewingUser.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs font-semibold px-3 py-1 ${
                        viewingUser.role === 'admin' 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white/20 text-white border border-white/30'
                      }`}>
                        {viewingUser.role === 'intern' ? 'Employee' : viewingUser.role.charAt(0).toUpperCase() + viewingUser.role.slice(1)}
                      </Badge>
                      {viewingUser.internId && (
                        <Badge className="bg-white/20 text-white border border-white/30 font-mono text-xs px-3 py-1">
                          {viewingUser.internId}
                        </Badge>
                      )}
                      <Badge className={`text-xs px-3 py-1 ${
                        viewingUser.status === 'active' 
                          ? 'bg-green-400/30 text-white border border-green-300/50' 
                          : 'bg-gray-400/30 text-white border border-gray-300/50'
                      }`}>
                        ● {viewingUser.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-5 bg-white">
                {/* Contact Information */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="font-medium text-gray-900 text-sm">{viewingUser.email}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="font-medium text-gray-900 text-sm">{viewingUser.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                    <p className="font-medium text-gray-900 text-sm">{viewingUser.address || '—'}</p>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Professional Details</h3>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                      <p className="font-medium text-gray-900 text-sm">{viewingUser.department || '—'}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Position</p>
                      <p className="font-medium text-gray-900 text-sm">{viewingUser.position || viewingUser.internshipRole || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">College</p>
                      <p className="font-medium text-gray-900 text-sm">{viewingUser.college || '—'}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Supervisor</p>
                      <p className="font-medium text-gray-900 text-sm">{viewingUser.supervisor || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Employment Period */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-orange-50 px-4 py-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-800">Employment Period</h3>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {viewingUser.startDate 
                          ? new Date(viewingUser.startDate).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            })
                          : '—'}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Date</p>
                      <p className="font-medium text-sm">
                        {viewingUser.endDate 
                          ? new Date(viewingUser.endDate).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            })
                          : <span className="text-green-600 font-semibold">● Currently Working</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {viewingUser.emergencyContact && (viewingUser.emergencyContact.name || viewingUser.emergencyContact.phone) && (
                  <div className="rounded-xl border border-red-100 overflow-hidden">
                    <div className="bg-red-50 px-4 py-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-gray-800">Emergency Contact</h3>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-red-100">
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                        <p className="font-medium text-gray-900 text-sm">{viewingUser.emergencyContact.name || '—'}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                        <p className="font-medium text-gray-900 text-sm">{viewingUser.emergencyContact.phone || '—'}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Relation</p>
                        <p className="font-medium text-gray-900 text-sm">{viewingUser.emergencyContact.relation || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Information */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-600" />
                    <h3 className="font-semibold text-gray-800">System Information</h3>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                      <p className="font-mono text-xs text-gray-600 break-all">{viewingUser._id || viewingUser.id}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Employee ID</p>
                      <p className="font-mono text-sm text-gray-900">{viewingUser.internId || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {new Date(viewingUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {viewingUser.updatedAt 
                          ? new Date(viewingUser.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => {
                      setViewingUser(null);
                      openEditModal(viewingUser);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit User
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => setViewingUser(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
