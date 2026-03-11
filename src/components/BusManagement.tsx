'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle, AlertTriangle, Wrench, XCircle, Clock, Plus,
    Filter, Search, MapPin, Map as MapIcon, LayoutGrid, Edit2,
    Trash2, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import MainLayout from './MainLayout';
import dynamic from 'next/dynamic';
import { useSocket } from '@/context/SocketContext';

const BusMap = dynamic(() => import('./BusMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-bg-tertiary animate-pulse rounded-xl flex items-center justify-center text-text-tertiary text-sm">ກຳລັງໂຫລດແຜນທີ່...</div>
});

interface Bus {
    _id: string;
    name: string;
    company: string;
    licensePlate: string;
    capacity: number;
    phone: string;
    status: 'active' | 'delayed' | 'maintenance' | 'waiting' | 'off-duty';
    lat: number | null;
    lng: number | null;
    locationName: string;
    fuelLevel?: number;
    passengers?: { current: number; capacity: number };
    issues?: string[];
}

const EMPTY_FORM = { name: '', company: '', licensePlate: '', capacity: 40, phone: '', status: 'waiting' as Bus['status'] };

export default function BusManagement() {
    const router = useRouter();
    const { socket } = useSocket();
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'delayed' | 'maintenance' | 'waiting'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    // ── API ──────────────────────────────────────────────────────────────────
    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/buses`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (data.success) {
                setBuses(data.data.map((b: any) => ({
                    ...b,
                    status: b.status || 'waiting',
                    fuelLevel: b.fuelLevel ?? Math.floor(Math.random() * 50) + 50,
                    passengers: b.passengers || { current: Math.floor(Math.random() * 30), capacity: b.capacity || 40 },
                    issues: b.issues || []
                })));
            }
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setLoading(false); }
    };

    const handleCreate = async () => {
        setSubmitting(true); setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/buses`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(formData) });
            const data = await res.json();
            if (data.success) { showSuccess('ເພີ່ມລົດເມສຳເລັດ'); setShowAddModal(false); setFormData(EMPTY_FORM); fetchBuses(); }
            else setErrorMsg(data.message || 'ເພີ່ມລົດເມບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const handleUpdate = async () => {
        if (!selectedBus) return;
        setSubmitting(true); setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/buses/${selectedBus._id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(formData) });
            const data = await res.json();
            if (data.success) { showSuccess('ແກ້ໄຂຂໍ້ມູນລົດເມສຳເລັດ'); setShowEditModal(false); setSelectedBus(null); fetchBuses(); }
            else setErrorMsg(data.message || 'ແກ້ໄຂບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!selectedBus) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/buses/${selectedBus._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            if (data.success) { showSuccess('ລຶບລົດເມສຳເລັດ'); setShowDeleteModal(false); setSelectedBus(null); fetchBuses(); }
            else setErrorMsg(data.message || 'ລຶບບໍ່ສຳເລັດ');
        } catch { setErrorMsg('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'); }
        finally { setSubmitting(false); }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    useEffect(() => {
        fetchBuses();
        if (socket) {
            socket.on('bus_location_update', (data: { busId: string; lat: number; lng: number; locationName: string }) => {
                setBuses(prev => prev.map(bus => bus._id === data.busId ? { ...bus, lat: data.lat, lng: data.lng, locationName: data.locationName } : bus));
            });
        }
        return () => { if (socket) socket.off('bus_location_update'); };
    }, [socket]);

    const filteredBuses = buses.filter(bus => {
        const matchesFilter = filter === 'all' || bus.status === filter;
        const matchesSearch = bus.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bus.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusInfo = (status: Bus['status']) => {
        const map = {
            active:      { label: 'ພວມເດີນທາງ', color: 'text-success bg-success-light', icon: CheckCircle },
            delayed:     { label: 'ລ່າຊ້າ',      color: 'text-warning bg-warning-light', icon: AlertTriangle },
            maintenance: { label: 'ພວມສ້ອມແປງ', color: 'text-error bg-error-light',    icon: Wrench },
            'off-duty':  { label: 'ບໍ່ປະຕິບັດງານ', color: 'text-text-secondary bg-bg-elevated', icon: XCircle },
            waiting:     { label: 'ລໍຖ້າ',       color: 'text-info bg-info-light',      icon: Clock },
        };
        return map[status] || { label: 'ບໍ່ຮູ້', color: 'text-text-secondary bg-bg-elevated', icon: XCircle };
    };

    const getFuelColor = (l: number) => l >= 70 ? 'bg-green-500' : l >= 30 ? 'bg-yellow-500' : 'bg-red-500';
    const getOccupancyColor = (p: number) => p >= 90 ? 'bg-red-500' : p >= 70 ? 'bg-yellow-500' : 'bg-green-500';

    const openEdit = (bus: Bus, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedBus(bus);
        setFormData({ name: bus.name, company: bus.company, licensePlate: bus.licensePlate, capacity: bus.capacity, phone: bus.phone || '', status: bus.status });
        setShowEditModal(true);
    };

    const openDelete = (bus: Bus, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedBus(bus);
        setShowDeleteModal(true);
    };

    // ── Shared form fields ────────────────────────────────────────────────────
    const BusFormFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ຊື່ລົດ *</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Laos-Bus VTE01" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ບໍລິສັດ *</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Laos-Bus" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ທະບຽນລົດ *</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="ກທ-1234" value={formData.licensePlate} onChange={e => setFormData(p => ({ ...p, licensePlate: e.target.value }))} required />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ຈຳນວນບ່ອນນັ່ງ *</label>
                    <input type="number" min={1} max={100} className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.capacity} onChange={e => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ເບີໂທ</label>
                    <input className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" placeholder="020..." value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                    <label className="text-xs font-bold text-text-secondary mb-1 block">ສະຖານະ</label>
                    <select className="w-full px-3 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm text-text-primary focus:ring-2 focus:ring-primary/50 outline-none" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as Bus['status'] }))}>
                        <option value="waiting">ລໍຖ້າ</option>
                        <option value="active">ພວມເດີນທາງ</option>
                        <option value="delayed">ລ່າຊ້າ</option>
                        <option value="maintenance">ພວມສ້ອມແປງ</option>
                        <option value="off-duty">ບໍ່ປະຕິບັດງານ</option>
                    </select>
                </div>
            </div>
        </div>
    );

    // ── MODAL wrapper ─────────────────────────────────────────────────────────
    const Modal = ({ title, onClose, onSubmit, submitLabel, submitClass = 'bg-primary', children }: any) => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-200">
            <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                    <h3 className="text-lg font-black text-text-primary">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-xl transition-colors"><XCircle className="w-5 h-5 text-text-tertiary" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {errorMsg && (
                        <div className="bg-error-light border border-error/20 text-error p-3 rounded-xl flex items-center text-xs font-bold mb-4">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />{errorMsg}
                        </div>
                    )}
                    {children}
                </div>
                <div className="flex gap-3 px-6 pb-6 flex-shrink-0">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-bg-tertiary text-text-primary rounded-xl text-sm font-bold hover:bg-border transition-colors">ຍົກເລີກ</button>
                    <button onClick={onSubmit} disabled={submitting} className={`flex-[2] py-2.5 text-white rounded-xl text-sm font-bold flex items-center justify-center ${submitClass} disabled:opacity-50`}>
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
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-text-primary">ຈັດການຂໍ້ມູນລົດເມ</h1>
                    <button onClick={() => { setFormData(EMPTY_FORM); setErrorMsg(null); setShowAddModal(true); }} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition-colors">
                        <Plus className="w-5 h-5" />ເພີ່ມລົດເມໃໝ່
                    </button>
                </div>

                {/* Alerts */}
                {successMsg && <div className="bg-success-light border border-success/20 text-success p-3 rounded-xl flex items-center text-sm font-medium animate-in slide-in-from-top-4 duration-300"><CheckCircle2 className="w-5 h-5 mr-2" />{successMsg}</div>}

                {/* Filters */}
                <div className="bg-bg-secondary border border-border p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-text-secondary"><Filter className="w-5 h-5" /><span className="font-medium">ຕົວກອງ:</span></div>
                    <select className="border border-border bg-bg-tertiary text-text-primary rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="all">ສະຖານະທັງໝົດ</option>
                        <option value="active">ພວມເດີນທາງ</option>
                        <option value="delayed">ລ່າຊ້າ</option>
                        <option value="maintenance">ພວມສ້ອມແປງ</option>
                        <option value="waiting">ລໍຖ້າ</option>
                    </select>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <input type="text" placeholder="ຄົ້ນຫາທະບຽນລົດ, ເສັ້ນທາງ..." className="w-full pl-10 pr-4 py-1.5 border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-md focus:ring-2 focus:ring-primary outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex bg-bg-tertiary rounded-md p-1 border border-border">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-bg-secondary text-primary shadow-sm' : 'text-text-tertiary'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-bg-secondary text-primary shadow-sm' : 'text-text-tertiary'}`}><MapIcon className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Map View */}
                {viewMode === 'map' && (
                    <div className="h-[500px] w-full animate-in fade-in zoom-in-95 duration-300">
                        <BusMap buses={filteredBuses.map(b => ({ busId: b._id, plateNumber: b.licensePlate, lat: b.lat || 0, lng: b.lng || 0, locationName: b.locationName, status: b.status }))} />
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="col-span-full py-20 text-center flex flex-col items-center">
                                <Loader2 className="w-10 h-10 text-text-tertiary animate-spin mb-4" />
                                <p className="text-text-tertiary font-medium">ກຳລັງໂຫລດ...</p>
                            </div>
                        ) : filteredBuses.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-text-tertiary">
                                <p className="text-lg font-medium">ບໍ່ພົບລົດເມ</p>
                            </div>
                        ) : filteredBuses.map((bus) => {
                            const statusInfo = getStatusInfo(bus.status);
                            const StatusIcon = statusInfo.icon;
                            const occupancy = Math.round(((bus.passengers?.current || 0) / (bus.passengers?.capacity || 40)) * 100);
                            return (
                                <div key={bus._id} className="bg-bg-secondary rounded-lg shadow-sm border border-border hover:border-border-hover hover:shadow-md transition-all">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-text-primary">{bus.licensePlate}</h3>
                                                <p className="text-sm text-text-secondary">{bus.name}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3" />{statusInfo.label}
                                                </span>
                                                <button onClick={(e) => openEdit(bus, e)} className="p-1.5 hover:bg-bg-tertiary rounded-lg text-info transition-colors" title="ແກ້ໄຂ"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={(e) => openDelete(bus, e)} className="p-1.5 hover:bg-error-light rounded-lg text-error transition-colors" title="ລຶບ"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm"><span className="text-text-secondary">ບໍລິສັດ:</span><span className="font-medium text-text-primary">{bus.company}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-text-secondary">ຈຸດປັດຈຸບັນ:</span><span className="font-medium text-text-primary flex items-center gap-1"><MapPin className="w-4 h-4 text-text-tertiary" />{bus.locationName || 'ບໍ່ມີຂໍ້ມູນ'}</span></div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs text-text-secondary"><span>ຜູ້ໂດຍສານ ({occupancy}%)</span><span>{bus.passengers?.current || 0}/{bus.passengers?.capacity || 40}</span></div>
                                                <div className="w-full bg-bg-elevated rounded-full h-1.5"><div className={`h-1.5 rounded-full ${getOccupancyColor(occupancy)}`} style={{ width: `${occupancy}%` }} /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-bg-tertiary border-t border-border flex justify-between items-center rounded-b-lg">
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <div className={`w-2 h-2 rounded-full ${getFuelColor(bus.fuelLevel || 0)}`} />
                                            <span>ນ້ຳມັນ {bus.fuelLevel || 0}%</span>
                                        </div>
                                        <span className="text-xs text-text-tertiary">ຄວາມຈຸ {bus.capacity} ບ່ອນ</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── ADD MODAL ── */}
                {showAddModal && (
                    <Modal title="ເພີ່ມລົດເມໃໝ່" onClose={() => { setShowAddModal(false); setErrorMsg(null); }} onSubmit={handleCreate} submitLabel="ເພີ່ມລົດເມ">
                        <BusFormFields />
                    </Modal>
                )}

                {/* ── EDIT MODAL ── */}
                {showEditModal && selectedBus && (
                    <Modal title={`ແກ້ໄຂ: ${selectedBus.licensePlate}`} onClose={() => { setShowEditModal(false); setErrorMsg(null); }} onSubmit={handleUpdate} submitLabel="ບັນທຶກການແກ້ໄຂ">
                        <BusFormFields />
                    </Modal>
                )}

                {/* ── DELETE MODAL ── */}
                {showDeleteModal && selectedBus && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
                        <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="h-16 w-16 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8" /></div>
                            <h3 className="text-xl font-black text-text-primary mb-2">ຢືນຢັນການລຶບ?</h3>
                            <p className="text-text-tertiary text-sm mb-6">ທ່ານຕ້ອງການລຶບລົດ <span className="font-bold text-text-primary">{selectedBus.licensePlate}</span> ແມ່ນບໍ່? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.</p>
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