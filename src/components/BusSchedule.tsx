
'use client';

import { useState } from 'react';
import {
    Clock,
    MapPin,
    Users,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Plus,
    Search,
    Filter,
    Pencil,
    Trash2,
    Calendar
} from 'lucide-react';


interface BusTrip {
    id: string;
    routeNumber: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    status: 'ontime' | 'delayed' | 'boarding' | 'departed' | 'cancelled' | 'waiting';
    passengers: {
        booked: number;
        checkedIn: number;
        capacity: number;
    };
    delayMinutes?: number;
    gate?: string;
    price: number;
    date: string;
}

const mockBusTrips: BusTrip[] = [
    {
        id: '1',
        routeNumber: 'VTE-LPB-001',
        from: 'ວຽງຈັນ',
        to: 'ຫຼວງພະບາງ',
        departureTime: '14:30',
        arrivalTime: '23:45',
        status: 'boarding',
        passengers: { booked: 42, checkedIn: 38, capacity: 45 },
        gate: 'A1',
        price: 180000,
        date: '2025-07-24'
    },
    {
        id: '2',
        routeNumber: 'VTE-PKS-002',
        from: 'ວຽງຈັນ',
        to: 'ປາກເຊ',
        departureTime: '15:00',
        arrivalTime: '03:30',
        status: 'delayed',
        passengers: { booked: 35, checkedIn: 28, capacity: 40 },
        delayMinutes: 15,
        gate: 'B2',
        price: 220000,
        date: '2025-07-24'
    },
    {
        id: '3',
        routeNumber: 'VTE-SVK-003',
        from: 'ວຽງຈັນ',
        to: 'ສະຫວັນນະເຂດ',
        departureTime: '15:15',
        arrivalTime: '21:00',
        status: 'waiting',
        passengers: { booked: 28, checkedIn: 15, capacity: 45 },
        gate: 'A3',
        price: 150000,
        date: '2025-07-24'
    },
    {
        id: '4',
        routeNumber: 'VTE-ODX-004',
        from: 'ວຽງຈັນ',
        to: 'ອຸດົມໄຊ',
        departureTime: '15:45',
        arrivalTime: '23:30',
        status: 'waiting',
        passengers: { booked: 32, checkedIn: 8, capacity: 40 },
        gate: 'B1',
        price: 190000,
        date: '2025-07-24'
    },
    {
        id: '5',
        routeNumber: 'LPB-VTE-005',
        from: 'ຫຼວງພະບາງ',
        to: 'ວຽງຈັນ',
        departureTime: '16:00',
        arrivalTime: '01:15',
        status: 'departed',
        passengers: { booked: 40, checkedIn: 40, capacity: 45 },
        price: 180000,
        date: '2025-07-24'
    },
    {
        id: '6',
        routeNumber: 'VTE-VVG-006',
        from: 'ວຽງຈັນ',
        to: 'ວັງວຽງ',
        departureTime: '17:00',
        arrivalTime: '05:00',
        status: 'waiting',
        passengers: { booked: 25, checkedIn: 5, capacity: 45 },
        gate: 'C1',
        price: 80000,
        date: '2025-07-24'
    }
];

export default function BusSchedule() {
    const [filter, setFilter] = useState<'all' | 'ontime' | 'delayed' | 'boarding' | 'waiting'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [trips, setTrips] = useState<BusTrip[]>(mockBusTrips);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTrip, setNewTrip] = useState<Partial<BusTrip>>({
        routeNumber: '',
        from: '',
        to: '',
        departureTime: '',
        arrivalTime: '',
        status: 'waiting',
        passengers: { booked: 0, checkedIn: 0, capacity: 45 },
        price: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const filteredTrips = trips.filter(trip => {
        const matchesFilter = filter === 'all' || trip.status === filter;
        const matchesSearch =
            trip.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.to.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusInfo = (status: BusTrip['status']) => {
        switch (status) {
            case 'ontime':
                return {
                    label: 'ກົງເວລາ',
                    color: 'text-success bg-success-light',
                    icon: CheckCircle
                };
            case 'delayed':
                return {
                    label: 'ລ່າຊ້າ',
                    color: 'text-warning bg-warning-light',
                    icon: AlertTriangle
                };
            case 'boarding':
                return {
                    label: 'ກຳລັງຂຶ້ນລົດ',
                    color: 'text-info bg-info-light',
                    icon: Users
                };
            case 'waiting':
                return {
                    label: 'ລໍຖ້າ',
                    color: 'text-purple-400 bg-purple-900/20',
                    icon: Clock
                };
            case 'departed':
                return {
                    label: 'ອອກເດີນທາງແລ້ວ',
                    color: 'text-text-secondary bg-bg-elevated',
                    icon: CheckCircle
                };
            case 'cancelled':
                return {
                    label: 'ຍົກເລີກ',
                    color: 'text-error bg-error-light',
                    icon: XCircle
                };
            default:
                return {
                    label: 'ບໍ່ຮູ້ສະຖານະ',
                    color: 'text-text-secondary bg-bg-elevated',
                    icon: Clock
                };
        }
    };

    const handleAddTrip = () => {
        if (!newTrip.routeNumber || !newTrip.from || !newTrip.to) {
            alert('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ');
            return;
        }

        const trip: BusTrip = {
            ...newTrip as BusTrip,
            id: String(Date.now()),
            passengers: { booked: 0, checkedIn: 0, capacity: 45 }
        };

        setTrips([trip, ...trips]);
        setShowAddModal(false);
        setNewTrip({
            routeNumber: '',
            from: '',
            to: '',
            departureTime: '',
            arrivalTime: '',
            status: 'waiting',
            passengers: { booked: 0, checkedIn: 0, capacity: 45 },
            price: 0,
            date: new Date().toISOString().split('T')[0]
        });
        alert('ເພີ່ມຖ້ຽວລົດສຳເລັດ');
    };

    const handleDeleteTrip = (id: string) => {
        if (confirm('ທ່ານຕ້ອງການລຶບຖ້ຽວລົດນີ້ແມ່ນບໍ່?')) {
            setTrips(trips.filter(t => t.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">ຕາຕະລາງການເດີນທາງ</h1>
                    <p className="text-sm text-text-secondary">ຈັດການຕາຕະລາງເດີນທາງແລະສະຖານະ</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2"
                >
                    <Plus className="h-5 w-5" />
                    <span>ເພີ່ມຖ້ຽວລົດ</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-between">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ຄົ້ນຫາຖ້ຽວລົດ, ຕົ້ນທາງ, ປາຍທາງ..."
                                className="w-full pl-10 pr-4 py-2 border-2 border-border bg-bg-tertiary rounded-lg text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex space-x-1 overflow-x-auto pb-2 md:pb-0">
                        {[
                            { key: 'all', label: 'ທັງໝົດ' },
                            { key: 'waiting', label: 'ລໍຖ້າ' },
                            { key: 'boarding', label: 'ກຳລັງຂຶ້ນລົດ' },
                            { key: 'ontime', label: 'ກົງເວລາ' },
                            { key: 'delayed', label: 'ລ່າຊ້າ' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as any)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === tab.key
                                    ? 'bg-primary-light text-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bus Trips List */}
            <div className="space-y-4">
                {filteredTrips.map((trip) => {
                    const statusInfo = getStatusInfo(trip.status);
                    const StatusIcon = statusInfo.icon;
                    const occupancyRate = (trip.passengers.booked / trip.passengers.capacity) * 100;

                    return (
                        <div key={trip.id} className="bg-bg-secondary border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                                    <span className="font-mono text-lg font-bold text-text-primary">{trip.routeNumber}</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusInfo.label}
                                        {trip.delayMinutes && ` (${trip.delayMinutes} ນທ)`}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {trip.gate && (
                                        <span className="px-3 py-1 bg-bg-tertiary text-text-secondary rounded-lg text-sm font-medium">
                                            ປະຕູ {trip.gate}
                                        </span>
                                    )}
                                    <div className="flex space-x-1">
                                        <button className="p-2 text-text-tertiary hover:text-info rounded-full hover:bg-info-light transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTrip(trip.id)}
                                            className="p-2 text-text-tertiary hover:text-error rounded-full hover:bg-error-light transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Route Info */}
                                <div className="col-span-1 md:col-span-1">
                                    <div className="flex items-center text-text-tertiary mb-1">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-medium uppercase tracking-wider">ເສັ້ນທາງ</span>
                                    </div>
                                    <div className="font-medium text-text-primary">
                                        {trip.from} <span className="text-text-tertiary mx-2">→</span> {trip.to}
                                    </div>
                                    <div className="text-sm text-text-secondary mt-1">
                                        {trip.date}
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="col-span-1 md:col-span-1">
                                    <div className="flex items-center text-text-tertiary mb-1">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-medium uppercase tracking-wider">ເວລາ</span>
                                    </div>
                                    <div className="font-medium text-text-primary">
                                        {trip.departureTime} <span className="text-text-tertiary mx-2">-</span> {trip.arrivalTime}
                                    </div>
                                    <div className="text-sm text-text-secondary mt-1">
                                        ລາຄາ: {trip.price.toLocaleString()} ກີບ
                                    </div>
                                </div>

                                {/* Passenger Info */}
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex items-center text-text-tertiary mb-1">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-medium uppercase tracking-wider">ຜູ້ໂດຍສານ</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-text-primary">
                                            {trip.passengers.checkedIn} ເຊັກອິນ / {trip.passengers.booked} ຈອງແລ້ວ
                                        </span>
                                        <span className="text-sm text-text-secondary">
                                            ຄວາມຈຸ {trip.passengers.capacity}
                                        </span>
                                    </div>
                                    <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-500 ${occupancyRate >= 90 ? 'bg-error' :
                                                occupancyRate >= 70 ? 'bg-warning' : 'bg-success'
                                                }`}
                                            style={{ width: `${occupancyRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTrips.length === 0 && (
                <div className="text-center py-12 bg-bg-secondary rounded-lg border border-dashed border-border">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-text-tertiary" />
                    <h3 className="text-lg font-medium text-text-primary">ບໍ່ພົບຂໍ້ມູນການເດີນທາງ</h3>
                    <p className="text-text-secondary">ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາຂອງທ່ານ</p>
                </div>
            )}

            {/* Add Trip Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-text-primary">ເພີ່ມຖ້ຽວລົດໃໝ່</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-text-tertiary hover:text-text-primary"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ໝາຍເລກຖ້ຽວ</label>
                                        <input
                                            type="text"
                                            value={newTrip.routeNumber}
                                            onChange={(e) => setNewTrip({ ...newTrip, routeNumber: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                            placeholder="VTE-LPB-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ວັນທີ</label>
                                        <input
                                            type="date"
                                            value={newTrip.date}
                                            onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ຕົ້ນທາງ</label>
                                        <input
                                            type="text"
                                            value={newTrip.from}
                                            onChange={(e) => setNewTrip({ ...newTrip, from: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                            placeholder="ວຽງຈັນ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ປາຍທາງ</label>
                                        <input
                                            type="text"
                                            value={newTrip.to}
                                            onChange={(e) => setNewTrip({ ...newTrip, to: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                            placeholder="ຫຼວງພະບາງ"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ເວລາອອກ</label>
                                        <input
                                            type="time"
                                            value={newTrip.departureTime}
                                            onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ເວລາຮອດ</label>
                                        <input
                                            type="time"
                                            value={newTrip.arrivalTime}
                                            onChange={(e) => setNewTrip({ ...newTrip, arrivalTime: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ລາຄາ (ກີບ)</label>
                                        <input
                                            type="number"
                                            value={newTrip.price}
                                            onChange={(e) => setNewTrip({ ...newTrip, price: Number(e.target.value) })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                            placeholder="150000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">ປະຕູ</label>
                                        <input
                                            type="text"
                                            value={newTrip.gate}
                                            onChange={(e) => setNewTrip({ ...newTrip, gate: e.target.value })}
                                            className="w-full border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                            placeholder="A1"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-text-secondary bg-bg-elevated rounded-lg hover:bg-bg-tertiary transition-colors"
                                    >
                                        ຍົກເລີກ
                                    </button>
                                    <button
                                        onClick={handleAddTrip}
                                        className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                                    >
                                        ຢືນຢັນ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
