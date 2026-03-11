'use client';

import { useState, useEffect } from 'react';
import {
    Clock, MapPin, Users, AlertTriangle, CheckCircle, XCircle,
    Plus, Search, Filter, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2, Bus
} from 'lucide-react';
import MainLayout from './MainLayout';

interface BusOption { _id: string; name: string; licensePlate: string; company: string; capacity: number; }

interface Schedule {
    _id: string;
    busId: BusOption | null;
    route: { from: string; to: string };
    departureTime: string;
    arrivalTime: string;
    duration: string;
    date: string;
    price: number;
    pricePerSeat: number;
    availableSeats: number;
    status: 'active' | 'inactive' | 'in-progress' | 'completed' | 'cancelled';
}

const EMPTY_FORM = {
    busId: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: '',
    date: new Date().toISOString().split('T')[0], price: 0, pricePerSeat: 0, availableSeats: 40, status: 'active' as Schedule['status']
};

export default function BusSchedule() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [buses, setBuses] = useState<BusOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | Schedule['status']>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` });

    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500); };

    // ── Fetch data ────────────────────────────────────────────────────────────
    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/schedules?limit=100`);
            const data = await res.json();
            if (data.success) setSchedules(data.data);
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setLoading(false); }
    };

    const fetchBuses = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/buses?limit=100`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (data.success) setBuses(data.data);
        } catch { /* silent */ }
    };

    useEffect(() => { fetchSchedules(); fetchBuses(); }, []);

    // ── CRUD handlers ─────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!formData.busId || !formData.from || !formData.to || !formData.departureTime || !formData.date) {
            setErrorMsg('ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ'); return;
        }
        setSubmitting(true); setErrorMsg(null);
        const body = {
            busId: formData.busId,
            route: { from: formData.from, to: formData.to },
            departureTime: formData.departureTime,
            arrivalTime: formData.arrivalTime || formData.departureTime,
            duration: formData.duration || '2h',
            date: formData.date,
            price: formData.price,
            pricePerSeat: formData.pricePerSeat || formData.price,
            availableSeats: formData.availableSeats,
            status: formData.status,
        };
        try {
            const res = await fetch(`${API_BASE}/api/schedules`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) { showSuccess('ເພີ່ມຕາຕະລາງສຳເລັດ'); setShowAddModal(false); setFormData(EMPTY_FORM); fetchSchedules(); }
            else setErrorMsg(data.message || 'ເພີ່ມຕາຕະລາງບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const handleUpdate = async () => {
        if (!selectedSchedule) return;
        setSubmitting(true); setErrorMsg(null);
        const body = {
            busId: formData.busId,
            route: { from: formData.from, to: formData.to },
            departureTime: formData.departureTime,
            arrivalTime: formData.arrivalTime || formData.departureTime,
            duration: formData.duration || '2h',
            date: formData.date,
            price: formData.price,
            pricePerSeat: formData.pricePerSeat || formData.price,
            availableSeats: formData.availableSeats,
            status: formData.status,
        };
        try {
            const res = await fetch(`${API_BASE}/api/schedules/${selectedSchedule._id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) { showSuccess('ແກ້ໄຂຕາຕະລາງສຳເລັດ'); setShowEditModal(false); setSelectedSchedule(null); fetchSchedules(); }
            else setErrorMsg(data.message || 'ແກ້ໄຂບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!selectedSchedule) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/schedules/${selectedSchedule._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (data.success) { showSuccess('ລຶບຕາຕະລາງສຳເລັດ'); setShowDeleteModal(false); setSelectedSchedule(null); fetchSchedules(); }
            else setErrorMsg(data.message || 'ລຶບບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const openEdit = (s: Schedule) => {
        setSelectedSchedule(s);
        setFormData({
            busId: typeof s.busId === 'object' ? s.busId?._id || '' : s.busId || '',
            from: s.route.from, to: s.route.to,
            departureTime: s.departureTime, arrivalTime: s.arrivalTime, duration: s.duration,
            date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
            price: s.price, pricePerSeat: s.pricePerSeat, availableSeats: s.availableSeats, status: s.status
        });
        setErrorMsg(null);
        setShowEditModal(true);
    };

    const openDelete = (s: Schedule) => { setSelectedSchedule(s); setShowDeleteModal(true); };

    // ── Display helpers ────────────────────────────────────────────────────────
    const getStatusInfo = (status: Schedule['status']) => {
        const map: Record<string, { label: string; color: string }> = {
            active:       { label: 'ກຳລັງໃຊ້ງານ',    color: 'text-success bg-success-light' },
            inactive:     { label: 'ປິດໃຊ້ງານ',       color: 'text-text-secondary bg-bg-elevated' },
            'in-progress':{ label: 'ກຳລັງເດີນທາງ',   color: 'text-info bg-info-light' },
            completed:    { label: 'ສຳເລັດ',          color: 'text-text-secondary bg-bg-elevated' },
            cancelled:    { label: 'ຍົກເລີກ',         color: 'text-error bg-error-light' },
        };
        return map[status] || { label: status, color: 'text-text-secondary bg-bg-elevated' };
    };

    const filteredSchedules = schedules.filter(s => {
        const matchesFilter = filter === 'all' || s.status === filter;
        const from = s.route?.from?.toLowerCase() || '';
        const to = s.route?.to?.toLowerCase() || '';
        const plate = (typeof s.busId === 'object' ? s.busId?.licensePlate : '') || '';
        const term = searchTerm.toLowerCase();
        const matchesSearch = from.includes(term) || to.includes(term) || plate.toLowerCase().includes(term);
        return matchesFilter && matchesSearch;
    });

    // ── Schedule form (shared between add/edit) ───────────────────────────────
    const ScheduleFormFields = () => (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-text-secondary mb-1 block">ລົດເມ *</label>
                <select className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.busId} onChange={e => { const bus = buses.find(b => b._id === e.target.value); setFormData(p => ({ ...p, busId: e.target.value, availableSeats: bus?.capacity || p.availableSeats })); }}>
                    <option value="">ເລືອກລົດເມ</option>
                    {buses.map(b => <option key={b._id} value={b._id}>{b.licensePlate} — {b.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ຕົ້ນທາງ *</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="ວຽງຈັນ" value={formData.from} onChange={e => setFormData(p => ({ ...p, from: e.target.value }))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ປາຍທາງ *</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="ຫຼວງພະບາງ" value={formData.to} onChange={e => setFormData(p => ({ ...p, to: e.target.value }))} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ເວລາອອກ *</label>
                    <input type="time" className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.departureTime} onChange={e => setFormData(p => ({ ...p, departureTime: e.target.value }))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ເວລາຮອດ</label>
                    <input type="time" className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.arrivalTime} onChange={e => setFormData(p => ({ ...p, arrivalTime: e.target.value }))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ໄລຍະເວລາ</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="9h 30m" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ວັນທີ *</label>
                    <input type="date" className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ລາຄາ / ບ່ອນ (ກີບ) *</label>
                    <input type="number" min={0} className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="150000" value={formData.pricePerSeat || ''} onChange={e => setFormData(p => ({ ...p, pricePerSeat: Number(e.target.value), price: Number(e.target.value) }))} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ບ່ອນວ່າງ</label>
                    <input type="number" min={0} className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.availableSeats} onChange={e => setFormData(p => ({ ...p, availableSeats: Number(e.target.value) }))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ສະຖານະ</label>
                    <select className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as Schedule['status'] }))}>
                        <option value="active">ກຳລັງໃຊ້ງານ</option>
                        <option value="inactive">ປິດໃຊ້ງານ</option>
                        <option value="cancelled">ຍົກເລີກ</option>
                    </select>
                </div>
            </div>
        </div>
    );

    // ── Modal wrapper ─────────────────────────────────────────────────────────
    const Modal = ({ title, onClose, onSubmit, submitLabel }: any) => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                    <h3 className="text-lg font-black text-text-primary">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-xl transition-colors"><XCircle className="w-5 h-5 text-text-tertiary" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {errorMsg && <div className="bg-error-light border border-error/20 text-error p-3 rounded-xl flex items-center text-xs font-bold mb-4"><AlertCircle className="w-4 h-4 mr-2" />{errorMsg}</div>}
                    <ScheduleFormFields />
                </div>
                <div className="flex gap-3 px-6 pb-6 flex-shrink-0">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-bg-tertiary text-text-primary rounded-xl text-sm font-bold hover:bg-border transition-colors">ຍົກເລີກ</button>
                    <button onClick={onSubmit} disabled={submitting} className="flex-[2] py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">ຕາຕະລາງການເດີນທາງ</h1>
                        <p className="text-sm text-text-secondary">ຈັດການຕາຕະລາງເດີນທາງແລະສະຖານະ</p>
                    </div>
                    <button onClick={() => { setFormData(EMPTY_FORM); setErrorMsg(null); setShowAddModal(true); }} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2">
                        <Plus className="h-5 w-5" /><span>ເພີ່ມຖ້ຽວລົດ</span>
                    </button>
                </div>

                {/* Success alert */}
                {successMsg && <div className="bg-success-light border border-success/20 text-success p-3 rounded-xl flex items-center text-sm font-medium animate-in slide-in-from-top-4 duration-300"><CheckCircle2 className="w-5 h-5 mr-2" />{successMsg}</div>}

                {/* Filters */}
                <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1 max-w-md relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ຄົ້ນຫາຕົ້ນທາງ, ປາຍທາງ, ທະບຽນລົດ..." className="w-full pl-10 pr-4 py-2 border border-border bg-bg-tertiary rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {[['all', 'ທັງໝົດ'], ['active', 'ກຳລັງໃຊ້ງານ'], ['in-progress', 'ກຳລັງເດີນທາງ'], ['completed', 'ສຳເລັດ'], ['cancelled', 'ຍົກເລີກ']].map(([key, label]) => (
                                <button key={key} onClick={() => setFilter(key as any)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === key ? 'bg-primary-light text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Schedule list */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center"><Loader2 className="h-10 w-10 text-text-tertiary animate-spin mb-4" /><p className="text-text-tertiary">ກຳລັງໂຫລດ...</p></div>
                    ) : filteredSchedules.length === 0 ? (
                        <div className="text-center py-12 bg-bg-secondary rounded-lg border border-dashed border-border">
                            <Bus className="h-12 w-12 mx-auto mb-2 text-text-tertiary" />
                            <h3 className="text-lg font-medium text-text-primary">ບໍ່ພົບຂໍ້ມູນການເດີນທາງ</h3>
                            <p className="text-text-secondary">ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ເພີ່ມຖ້ຽວລົດໃໝ່</p>
                        </div>
                    ) : filteredSchedules.map((s) => {
                        const statusInfo = getStatusInfo(s.status);
                        const busInfo = typeof s.busId === 'object' ? s.busId : null;
                        const occupancyRate = busInfo ? ((busInfo.capacity - s.availableSeats) / busInfo.capacity) * 100 : 0;
                        return (
                            <div key={s._id} className="bg-bg-secondary border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                                        <span className="font-mono text-lg font-bold text-text-primary">{busInfo?.licensePlate || 'N/A'}</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openEdit(s)} className="p-2 text-text-tertiary hover:text-info rounded-full hover:bg-info-light transition-colors" title="ແກ້ໄຂ"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => openDelete(s)} className="p-2 text-text-tertiary hover:text-error rounded-full hover:bg-error-light transition-colors" title="ລຶບ"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <div className="flex items-center text-text-tertiary mb-1"><MapPin className="h-4 w-4 mr-2" /><span className="text-xs font-medium uppercase tracking-wider">ເສັ້ນທາງ</span></div>
                                        <div className="font-medium text-text-primary">{s.route?.from} <span className="text-text-tertiary mx-2">→</span> {s.route?.to}</div>
                                        <div className="text-sm text-text-secondary mt-1">{s.date ? new Date(s.date).toLocaleDateString('lo-LA') : ''}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-text-tertiary mb-1"><Clock className="h-4 w-4 mr-2" /><span className="text-xs font-medium uppercase tracking-wider">ເວລາ</span></div>
                                        <div className="font-medium text-text-primary">{s.departureTime} <span className="text-text-tertiary mx-2">-</span> {s.arrivalTime}</div>
                                        <div className="text-sm text-text-secondary mt-1">ລາຄາ: {(s.pricePerSeat || s.price || 0).toLocaleString()} ກີບ</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-text-tertiary mb-1"><Bus className="h-4 w-4 mr-2" /><span className="text-xs font-medium uppercase tracking-wider">ລົດ</span></div>
                                        <div className="font-medium text-text-primary">{busInfo?.name || '—'}</div>
                                        <div className="text-sm text-text-secondary mt-1">{busInfo?.company || ''}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-text-tertiary mb-1"><Users className="h-4 w-4 mr-2" /><span className="text-xs font-medium uppercase tracking-wider">ບ່ອນນັ່ງ</span></div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-text-primary">ວ່າງ {s.availableSeats} / {busInfo?.capacity ?? '—'}</span>
                                        </div>
                                        {busInfo && (
                                            <div className="w-full bg-bg-tertiary rounded-full h-2">
                                                <div className={`h-2 rounded-full ${occupancyRate >= 90 ? 'bg-error' : occupancyRate >= 70 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${occupancyRate}%` }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── ADD MODAL ── */}
                {showAddModal && <Modal title="ເພີ່ມຖ້ຽວລົດໃໝ່" onClose={() => { setShowAddModal(false); setErrorMsg(null); }} onSubmit={handleCreate} submitLabel="ເພີ່ມຖ້ຽວລົດ" />}

                {/* ── EDIT MODAL ── */}
                {showEditModal && selectedSchedule && <Modal title={`ແກ້ໄຂ: ${selectedSchedule.route?.from} → ${selectedSchedule.route?.to}`} onClose={() => { setShowEditModal(false); setErrorMsg(null); }} onSubmit={handleUpdate} submitLabel="ບັນທຶກການແກ້ໄຂ" />}

                {/* ── DELETE MODAL ── */}
                {showDeleteModal && selectedSchedule && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="h-16 w-16 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8" /></div>
                            <h3 className="text-xl font-black text-text-primary mb-2">ຢືນຢັນການລຶບ?</h3>
                            <p className="text-text-tertiary text-sm mb-6">ລຶບຖ້ຽວລົດ <span className="font-bold text-text-primary">{selectedSchedule.route?.from} → {selectedSchedule.route?.to}</span> ວັນທີ {selectedSchedule.date ? new Date(selectedSchedule.date).toLocaleDateString('lo-LA') : ''}</p>
                            {errorMsg && <div className="bg-error-light text-error p-3 rounded-xl text-xs font-bold mb-4 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{errorMsg}</div>}
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDeleteModal(false); setErrorMsg(null); }} className="flex-1 py-3 bg-bg-tertiary rounded-xl text-sm font-bold">ຍົກເລີກ</button>
                                <button onClick={handleDelete} disabled={submitting} className="flex-1 py-3 bg-error text-white rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}ຢືນຢັນລຶບ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
