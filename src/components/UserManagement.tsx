'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Shield,
    Mail,
    Phone,
    User as UserIcon,
    X,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Loader2,
    Power
} from 'lucide-react';

interface User {
    _id: string;
    username: string;
    email: string;
    phone: string;
    role: 'admin' | 'staff' | 'driver' | 'user';
    isActive: boolean;
    createdAt: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff',
        isActive: true
    });

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // For now we get all, backend supports pagination but we can handle it later if list is large
            const response = await fetch(`${API_BASE}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg('ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ (User created successfully)');
                setIsAddModalOpen(false);
                setFormData({ username: '', email: '', password: '', phone: '', role: 'staff', isActive: true });
                fetchUsers();
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(data.message || 'Failed to create user');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                    isActive: formData.isActive
                })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg('ແກ້ໄຂຂໍ້ມູນສຳເລັດ (User updated successfully)');
                setIsEditModalOpen(false);
                setSelectedUser(null);
                fetchUsers();
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(data.message || 'Failed to update user');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/${selectedUser._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg('ລຶບຜູ້ໃຊ້ສຳເລັດ (User deleted successfully)');
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
                fetchUsers();
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(data.message || 'Failed to delete user');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive,
            password: '' // Keep password empty for edits
        });
        setIsEditModalOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone && user.phone.includes(searchTerm));

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-text-primary flex items-center">
                        <Users className="h-8 w-8 mr-3 text-primary" />
                        ຈັດການຜູ້ໃຊ້ (User Management)
                    </h1>
                    <p className="text-text-tertiary text-sm mt-1">ຈັດການຂໍ້ມູນຜູ້ໃຊ້, ພະນັກງານ ແລະ ໂຊເຟີ ໃນລະບົບ</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ username: '', email: '', password: '', phone: '', role: 'staff', isActive: true });
                        setIsAddModalOpen(true);
                    }}
                    className="btn btn-primary shadow-lg shadow-primary/20 flex items-center px-6 py-3 rounded-xl transform hover:translate-y-[-2px] active:scale-95 duration-200"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    ເພີ່ມຜູ້ໃຊ້ໃຫມ່
                </button>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'ຜູ້ໃຊ້ທັງໝົດ', count: users.length, color: 'text-primary' },
                    { label: 'Admin', count: users.filter(u => u.role === 'admin').length, color: 'text-error' },
                    { label: 'ພະນັກງານ (Staff)', count: users.filter(u => u.role === 'staff').length, color: 'text-info' },
                    { label: 'ໂຊເຟີ (Drivers)', count: users.filter(u => u.role === 'driver').length, color: 'text-success' },
                ].map((stat, i) => (
                    <div key={i} className="bg-bg-secondary p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                        <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">{stat.label}</span>
                        <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
                    </div>
                ))}
            </div>

            {/* Success/Error Alerts */}
            {successMsg && (
                <div className="bg-success-light border border-success/20 text-success p-4 rounded-xl flex items-center animate-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">{successMsg}</span>
                </div>
            )}
            {error && !isAddModalOpen && !isEditModalOpen && (
                <div className="bg-error-light border border-error/20 text-error p-4 rounded-xl flex items-center">
                    <AlertCircle className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-bg-secondary p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="ຄົ້ນຫາຊື່ຜູ້ໃຊ້, ອີເມວ ຫຼື ເບີໂທ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary transition-all"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-10 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary appearance-none font-medium min-w-[150px]"
                        >
                            <option value="all">ທຸກຕຳແໜ່ງ</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="driver">Driver</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2.5 hover:bg-bg-tertiary rounded-xl border border-border transition-colors text-text-secondary"
                    >
                        <Loader2 className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-bg-secondary border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-bg-tertiary/50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">ຂໍ້ມູນຜູ້ໃຊ້</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">ຕຳແໜ່ງ (Role)</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">ຕິດຕໍ່</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">ສະຖານະ</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">ຈັດການ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                                            <p className="text-text-tertiary font-medium">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-bg-tertiary/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${user.role === 'admin' ? 'bg-error-light text-error' :
                                                        user.role === 'driver' ? 'bg-success-light text-success' : 'bg-primary-light text-primary'
                                                    }`}>
                                                    <UserIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary text-sm">{user.username}</p>
                                                    <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-tight">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {user.role === 'admin' ? <Shield className="h-3 w-3 mr-1.5 text-error" /> : null}
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-error-light text-error' :
                                                        user.role === 'staff' ? 'bg-info-light text-info' :
                                                            user.role === 'driver' ? 'bg-success-light text-success' : 'bg-bg-tertiary text-text-tertiary'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-xs text-text-secondary">
                                                    <Mail className="h-3 w-3 mr-1.5 opacity-50" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center text-xs text-text-secondary">
                                                        <Phone className="h-3 w-3 mr-1.5 opacity-50" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className={`h-2 w-2 rounded-full mr-2 ${user.isActive ? 'bg-success animate-pulse' : 'bg-text-tertiary'}`} />
                                                <span className={`text-xs font-bold ${user.isActive ? 'text-success' : 'text-text-tertiary'}`}>
                                                    {user.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 hover:bg-bg-tertiary rounded-lg text-info transition-colors"
                                                    title="ແກ້ໄຂ"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-error-light rounded-lg text-error transition-colors"
                                                    title="ລຶບ"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-text-tertiary">ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals - Adding placeholder styles for modal overlay based on design tokens */}

            {/* Add User Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-bg-secondary w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-black text-lg text-text-primary">
                                {isAddModalOpen ? 'ເພີ່ມຜູ້ໃຊ້ໃຫມ່ (Add User)' : 'ແກ້ໄຂຂໍ້ມູນ (Edit User)'}
                            </h3>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setError(null); }}
                                className="p-2 hover:bg-bg-tertiary rounded-xl transition-colors"
                            >
                                <X className="h-5 w-5 text-text-tertiary" />
                            </button>
                        </div>
                        <form onSubmit={isAddModalOpen ? handleCreateUser : handleUpdateUser} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-error-light border border-error/20 text-error p-3 rounded-xl flex items-center text-xs font-bold">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary px-1">ຊື່ຜູ້ໃຊ້ (Username)</label>
                                    <input
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                                        placeholder="ຊື່ເຂົ້າລະບົບ"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary px-1">ອີເມວ (Email)</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary px-1">ເບີໂທ (Phone)</label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                                            placeholder="020555..."
                                        />
                                    </div>
                                </div>

                                {isAddModalOpen && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary px-1">ລະຫັດຜ່ານ (Password)</label>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary px-1">ຕຳແໜ່ງ (Role)</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary appearance-none font-medium"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                            <option value="driver">Driver</option>
                                            <option value="user">User</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-text-secondary px-1">ສະຖານະ (Status)</label>
                                        <div className="flex items-center h-[46px] px-1">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner border border-border"></div>
                                                <span className="ml-3 text-sm font-medium text-text-secondary">{formData.isActive ? 'Active' : 'Disabled'}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 px-4 py-3 bg-bg-tertiary text-text-primary rounded-xl text-sm font-bold hover:bg-border transition-colors outline-none"
                                >
                                    ຍົກເລີກ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] btn btn-primary px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isAddModalOpen ? 'ເພີ່ມຜູ້ໃຊ້' : 'ບັນທຶກການແກ້ໄຂ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-bg-secondary w-full max-w-sm rounded-2xl border border-border shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="h-16 w-16 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-black text-text-primary mb-2">ຢືນຢັນການລຶບ?</h3>
                        <p className="text-text-tertiary text-sm mb-6 leading-relaxed">
                            ທ່ານໝັ້ນໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ <span className="font-bold text-text-primary">{selectedUser.username}</span>? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-bg-tertiary text-text-primary rounded-xl text-sm font-bold hover:bg-border transition-colors outline-none"
                            >
                                ຍົກເລີກ
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={submitting}
                                className="flex-1 px-4 py-3 bg-error text-white rounded-xl text-sm font-bold hover:bg-error/90 transition-colors shadow-lg shadow-error/20 flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                ຢືນຢັນການລຶບ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
