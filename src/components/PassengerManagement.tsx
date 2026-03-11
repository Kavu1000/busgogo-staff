'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Users, Search, Plus, Pencil, Trash2, CheckCircle, XCircle,
    Phone, Mail, Ticket, MapPin, Clock, Filter, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import MainLayout from './MainLayout';

interface Booking {
    _id: string;
    userId: { _id: string; username: string; email: string; phone: string } | null;
    busId: { _id: string; name: string; company: string; licensePlate: string } | null;
    seatNumber: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    price: number;
    status: 'booked' | 'cancelled' | 'completed' | 'expired';
    paymentStatus: 'pending' | 'completed' | 'refunded' | 'failed';
    bookingDate: string;
    passengerDetails?: { name?: string };
}

const STATUS_OPTIONS: { value: Booking['status']; label: string }[] = [
    { value: 'booked', label: 'ຈອງແລ້ວ' },
    { value: 'completed', label: 'ສຳເລັດ' },
    { value: 'cancelled', label: 'ຍົກເລີກ' },
    { value: 'expired', label: 'ໝົດອາຍຸ' },
];

export default function PassengerManagement() {
    const searchParams = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Booking['status']>('all');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Add form state
    const emptyForm = { passengerName: '', phone: '', email: '', departureStation: '', arrivalStation: '', seatNumber: '', departureTime: '', price: 0, status: 'booked' as Booking['status'], paymentStatus: 'pending' as Booking['paymentStatus'] };
    const [addForm, setAddForm] = useState(emptyForm);
    const [editForm, setEditForm] = useState({ seatNumber: '', departureStation: '', arrivalStation: '', price: 0, status: 'booked' as Booking['status'], paymentStatus: 'pending' as Booking['paymentStatus'] });

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` });
    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500); };

    // ── Check for action param ─────────────────────────────────────────────── 
    useEffect(() => {
        if (searchParams.get('action') === 'add') setShowAddModal(true);
    }, [searchParams]);

    // ── Fetch bookings ─────────────────────────────────────────────────────────
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/bookings?limit=100`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (data.success) setBookings(data.data);
            else setErrorMsg(data.message || 'ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBookings(); }, []);

    // ── Status update inline ──────────────────────────────────────────────────
    const handleStatusChange = async (booking: Booking, newStatus: Booking['status']) => {
        try {
            const res = await fetch(`${API_BASE}/api/bookings/${booking._id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: newStatus }) });
            const data = await res.json();
            if (data.success) {
                setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: newStatus } : b));
                showSuccess('ອັບເດດສະຖານະສຳເລັດ');
            } else setErrorMsg(data.message || 'ອັບເດດບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
    };

    // ── Edit booking ──────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (!selectedBooking) return;
        setSubmitting(true); setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/bookings/${selectedBooking._id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(editForm) });
            const data = await res.json();
            if (data.success) { showSuccess('ແກ້ໄຂຂໍ້ມູນສຳເລັດ'); setShowEditModal(false); setSelectedBooking(null); fetchBookings(); }
            else setErrorMsg(data.message || 'ແກ້ໄຂບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    // ── Cancel/Delete booking ─────────────────────────────────────────────────
    const handleCancel = async () => {
        if (!selectedBooking) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/bookings/${selectedBooking._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (data.success) { showSuccess('ຍົກເລີກການຈອງສຳເລັດ'); setShowDeleteModal(false); setSelectedBooking(null); fetchBookings(); }
            else setErrorMsg(data.message || 'ຍົກເລີກບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const openEdit = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditForm({ seatNumber: booking.seatNumber, departureStation: booking.departureStation, arrivalStation: booking.arrivalStation, price: booking.price, status: booking.status, paymentStatus: booking.paymentStatus });
        setErrorMsg(null);
        setShowEditModal(true);
    };

    // ── Filters ────────────────────────────────────────────────────────────────
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const name = b.passengerDetails?.name?.toLowerCase() || b.userId?.username?.toLowerCase() || '';
        const ticket = b._id.slice(-6);
        const phone = b.userId?.phone || '';
        const route = `${b.departureStation} ${b.arrivalStation}`.toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || ticket.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm) || route.includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusInfo = (status: Booking['status']) => {
        const map: Record<string, { label: string; color: string }> = {
            booked:    { label: 'ຈອງແລ້ວ',  color: 'text-blue-700 bg-blue-100' },
            completed: { label: 'ສຳເລັດ',    color: 'text-success bg-success-light' },
            cancelled: { label: 'ຍົກເລີກ',   color: 'text-error bg-error-light' },
            expired:   { label: 'ໝົດອາຍຸ',   color: 'text-text-secondary bg-bg-elevated' },
        };
        return map[status] || { label: status, color: 'text-text-secondary bg-bg-elevated' };
    };

    const getPaymentInfo = (status: Booking['paymentStatus']) => {
        const map: Record<string, { label: string; color: string }> = {
            pending:   { label: 'ລໍຖ້າ',   color: 'text-warning' },
            completed: { label: 'ຈ່າຍແລ້ວ', color: 'text-success' },
            refunded:  { label: 'ຄືນເງິນ',  color: 'text-info' },
            failed:    { label: 'ລົ້ມເຫລວ',  color: 'text-error' },
        };
        return map[status] || { label: status, color: '' };
    };

    const displayName = (b: Booking) => b.passengerDetails?.name || b.userId?.username || '—';

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">ຈັດການຜູ້ໂດຍສານ</h1>
                        <p className="text-sm text-text-secondary">ຈັດການຂໍ້ມູນການຈອງແລະສະຖານະ</p>
                    </div>
                </div>

                {/* Alerts */}
                {successMsg && <div className="bg-success-light border border-success/20 text-success p-3 rounded-xl flex items-center text-sm font-medium animate-in slide-in-from-top-4 duration-300"><CheckCircle2 className="w-5 h-5 mr-2" />{successMsg}</div>}
                {errorMsg && !showEditModal && !showDeleteModal && <div className="bg-error-light border border-error/20 text-error p-3 rounded-xl flex items-center text-sm font-medium"><AlertCircle className="w-4 h-4 mr-2" />{errorMsg}</div>}

                {/* Filters */}
                <div className="bg-bg-secondary rounded-lg shadow-sm p-4">
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[220px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ຄົ້ນຫາຊື່, ID, ເບີໂທ, ເສັ້ນທາງ..." className="w-full pl-10 pr-4 py-3 border-2 border-border bg-bg-secondary rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-text-tertiary" />
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-primary outline-none font-medium">
                                <option value="all">ທຸກສະຖານະ</option>
                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-bg-secondary rounded-lg shadow-sm p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'ຈອງແລ້ວ', count: bookings.filter(b => b.status === 'booked').length, color: 'text-blue-600' },
                            { label: 'ສຳເລັດ', count: bookings.filter(b => b.status === 'completed').length, color: 'text-success' },
                            { label: 'ຍົກເລີກ', count: bookings.filter(b => b.status === 'cancelled').length, color: 'text-error' },
                            { label: 'ທັງໝົດ (ສະແດງ)', count: filteredBookings.length, color: 'text-text-secondary' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                                <div className="text-sm text-text-secondary">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-bg-secondary rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-bg-tertiary">
                                <tr>
                                    {['ຜູ້ໂດຍສານ', 'ການເດີນທາງ', 'ທີ່ນັ່ງ', 'ສະຖານະ', 'ລາຄາ', 'ການຊຳລະ', 'ຈັດການ'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-bg-secondary divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-text-tertiary" /></td></tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr><td colSpan={7} className="py-12 text-center">
                                        <Users className="mx-auto h-12 w-12 text-text-tertiary mb-2" />
                                        <p className="text-text-secondary">ບໍ່ພົບຂໍ້ມູນ</p>
                                    </td></tr>
                                ) : filteredBookings.map(booking => {
                                    const statusInfo = getStatusInfo(booking.status);
                                    const payInfo = getPaymentInfo(booking.paymentStatus);
                                    return (
                                        <tr key={booking._id} className="hover:bg-bg-tertiary transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-primary">{displayName(booking)}</div>
                                                {booking.userId?.phone && <div className="text-xs text-text-tertiary flex items-center mt-0.5"><Phone className="h-3 w-3 mr-1" />{booking.userId.phone}</div>}
                                                {booking.userId?.email && <div className="text-xs text-text-tertiary flex items-center mt-0.5"><Mail className="h-3 w-3 mr-1" />{booking.userId.email}</div>}
                                                <div className="text-xs text-text-tertiary flex items-center mt-0.5"><Ticket className="h-3 w-3 mr-1" />#{booking._id.slice(-6).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-primary flex items-center"><MapPin className="h-4 w-4 mr-1 text-text-tertiary" />{booking.departureStation} → {booking.arrivalStation}</div>
                                                <div className="text-xs text-text-tertiary flex items-center mt-1"><Clock className="h-3 w-3 mr-1" />{booking.departureTime ? new Date(booking.departureTime).toLocaleString('lo-LA') : ''}</div>
                                                {booking.busId && <div className="text-xs text-text-tertiary mt-1">ລົດ: {booking.busId.licensePlate}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-text-primary bg-bg-tertiary border border-border px-2 py-1 rounded-lg">{booking.seatNumber}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-primary">₭{(booking.price || 0).toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-xs font-medium ${payInfo.color}`}>{payInfo.label}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Quick status change */}
                                                    <select value={booking.status} onChange={e => handleStatusChange(booking, e.target.value as Booking['status'])} className="text-xs border border-border bg-bg-secondary rounded px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none text-text-primary">
                                                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                    <button onClick={() => openEdit(booking)} className="text-info hover:text-info p-1 hover:bg-info-light rounded" title="ແກ້ໄຂ"><Pencil className="h-4 w-4" /></button>
                                                    <button onClick={() => { setSelectedBooking(booking); setErrorMsg(null); setShowDeleteModal(true); }} className="text-error hover:text-error p-1 hover:bg-error-light rounded" title="ຍົກເລີກ"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── EDIT MODAL ── */}
                {showEditModal && selectedBooking && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                                <h3 className="text-lg font-black text-text-primary">ແກ້ໄຂ: #{selectedBooking._id.slice(-6).toUpperCase()}</h3>
                                <button onClick={() => { setShowEditModal(false); setErrorMsg(null); }} className="p-2 hover:bg-bg-tertiary rounded-xl"><XCircle className="w-5 h-5 text-text-tertiary" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                {errorMsg && <div className="bg-error-light text-error p-3 rounded-xl text-xs font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{errorMsg}</div>}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary mb-1 block">ຕົ້ນທາງ</label>
                                        <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={editForm.departureStation} onChange={e => setEditForm(p => ({ ...p, departureStation: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary mb-1 block">ປາຍທາງ</label>
                                        <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={editForm.arrivalStation} onChange={e => setEditForm(p => ({ ...p, arrivalStation: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary mb-1 block">ໝາຍເລກທີ່ນັ່ງ</label>
                                        <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={editForm.seatNumber} onChange={e => setEditForm(p => ({ ...p, seatNumber: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary mb-1 block">ລາຄາ (ກີບ)</label>
                                        <input type="number" min={0} className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: Number(e.target.value) }))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary mb-1 block">ສະຖານະ</label>
                                        <select className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as Booking['status'] }))}>
                                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary mb-1 block">ການຊຳລະ</label>
                                        <select className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={editForm.paymentStatus} onChange={e => setEditForm(p => ({ ...p, paymentStatus: e.target.value as Booking['paymentStatus'] }))}>
                                            <option value="pending">ລໍຖ້າ</option>
                                            <option value="completed">ຈ່າຍແລ້ວ</option>
                                            <option value="refunded">ຄືນເງິນ</option>
                                            <option value="failed">ລົ້ມເຫລວ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 px-6 pb-6">
                                <button onClick={() => { setShowEditModal(false); setErrorMsg(null); }} className="flex-1 py-2.5 bg-bg-tertiary text-text-primary rounded-xl text-sm font-bold hover:bg-border">ຍົກເລີກ</button>
                                <button onClick={handleUpdate} disabled={submitting} className="flex-[2] py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}ບັນທຶກການແກ້ໄຂ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CANCEL/DELETE MODAL ── */}
                {showDeleteModal && selectedBooking && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="h-16 w-16 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8" /></div>
                            <h3 className="text-xl font-black text-text-primary mb-2">ຢືນຢັນການຍົກເລີກ?</h3>
                            <p className="text-text-tertiary text-sm mb-2">ຍົກເລີກການຈອງ #<span className="font-bold text-text-primary">{selectedBooking._id.slice(-6).toUpperCase()}</span></p>
                            <p className="text-text-tertiary text-xs mb-6">ຜູ້ໂດຍສານ: {displayName(selectedBooking)}</p>
                            {errorMsg && <div className="bg-error-light text-error p-3 rounded-xl text-xs font-bold mb-4 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{errorMsg}</div>}
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDeleteModal(false); setErrorMsg(null); }} className="flex-1 py-3 bg-bg-tertiary rounded-xl text-sm font-bold">ກັບຄືນ</button>
                                <button onClick={handleCancel} disabled={submitting} className="flex-1 py-3 bg-error text-white rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}ຍົກເລີກການຈອງ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
