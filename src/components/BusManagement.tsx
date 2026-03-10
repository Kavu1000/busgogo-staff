'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    AlertTriangle,
    Wrench,
    XCircle,
    Clock,
    Plus,
    Filter,
    Search,
    MapPin
} from 'lucide-react';
import MainLayout from './MainLayout';

interface Bus {
    id: string;
    plateNumber: string;
    route: string;
    driver: string;
    status: 'active' | 'delayed' | 'maintenance' | 'waiting' | 'off-duty';
    location: string;
    passengers: { current: number; capacity: number };
    fuelLevel: number;
    lastUpdate: string;
    estimatedArrival?: string;
    departureTime?: string;
    issues?: string[];
}

const mockBuses: Bus[] = [
    {
        id: '1',
        plateNumber: 'ກກ-1234',
        route: 'ວຽງຈັນ → ຫຼວງພະບາງ',
        driver: 'ສົມຊາຍ ແກ້ວມະນີ',
        status: 'active',
        location: 'ວັງວຽງ',
        passengers: { current: 42, capacity: 45 },
        fuelLevel: 75,
        lastUpdate: '10 ນາທີຜ່ານມາ',
        estimatedArrival: '23:45',
        departureTime: '14:30'
    },
    {
        id: '2',
        plateNumber: 'ຂຂ-5678',
        route: 'ວຽງຈັນ → ປາກເຊ',
        driver: 'ວິໄຊ ໃຈດີ',
        status: 'delayed',
        location: 'ທ່າແຂກ',
        passengers: { current: 35, capacity: 40 },
        fuelLevel: 90,
        lastUpdate: '5 ນາທີຜ່ານມາ',
        issues: ['ການຈາລະຈອນແອອັດ'],
        estimatedArrival: '03:45',
        departureTime: '15:00'
    },
    {
        id: '3',
        plateNumber: 'ຄຄ-9012',
        route: 'ວຽງຈັນ → ສະຫວັນນະເຂດ',
        driver: 'ສຸລິຍາ ຮັກຊາດ',
        status: 'maintenance',
        location: 'ອູ່ສ້ອມແປງ',
        passengers: { current: 0, capacity: 45 },
        fuelLevel: 30,
        lastUpdate: '2 ຊົ່ວໂມງຜ່ານມາ',
        issues: ['ບັນຫາເຄື່ອງຈັກ', 'ແອບໍ່ເຢັນ']
    },
    {
        id: '4',
        plateNumber: 'ງງ-3456',
        route: 'ຫຼວງພະບາງ → ວຽງຈັນ',
        driver: 'ປະສິດ ຕັ້ງໃຈ',
        status: 'active',
        location: 'ໂພນໂຮງ',
        passengers: { current: 38, capacity: 45 },
        fuelLevel: 60,
        lastUpdate: '15 ນາທີຜ່ານມາ',
        estimatedArrival: '01:15',
        departureTime: '16:00'
    },
    {
        id: '5',
        plateNumber: 'ຈຈ-7890',
        route: 'ວຽງຈັນ → ອຸດົມໄຊ',
        driver: 'ອານຸສອນ ພ້ອມພຽງ',
        status: 'waiting',
        location: 'ສະຖານີຂົນສົ່ງສາຍເໜືອ',
        passengers: { current: 25, capacity: 40 },
        fuelLevel: 95,
        lastUpdate: '2 ນາທີຜ່ານມາ',
        departureTime: '18:30'
    },
    {
        id: '6',
        plateNumber: 'ສສ-2468',
        route: 'ວຽງຈັນ → ວັງວຽງ',
        driver: 'ສົມໝາຍ ໃຈກວ້າງ',
        status: 'waiting',
        location: 'ສະຖານີຂົນສົ່ງສາຍເໜືອ',
        passengers: { current: 12, capacity: 45 },
        fuelLevel: 85,
        lastUpdate: '1 ນາທີຜ່ານມາ',
        departureTime: '19:00'
    }
];

export default function BusManagement() {
    const router = useRouter();
    const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'delayed' | 'maintenance' | 'waiting'>('all');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [newStatus, setNewStatus] = useState<Bus['status']>('active');
    const [reportText, setReportText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBuses = mockBuses.filter(bus => {
        const matchesFilter = filter === 'all' || bus.status === filter;
        const matchesSearch = bus.plateNumber.includes(searchTerm) ||
            bus.route.includes(searchTerm) ||
            bus.driver.includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    const getStatusInfo = (status: Bus['status']) => {
        switch (status) {
            case 'active':
                return {
                    label: 'ພວມເດີນທາງ',
                    color: 'text-success bg-success-light',
                    icon: CheckCircle
                };
            case 'delayed':
                return {
                    label: 'ລ່າຊ້າ',
                    color: 'text-warning bg-warning-light',
                    icon: AlertTriangle
                };
            case 'maintenance':
                return {
                    label: 'ພວມສ້ອມແປງ',
                    color: 'text-error bg-error-light',
                    icon: Wrench
                };
            case 'off-duty':
                return {
                    label: 'ບໍ່ປະຕິບັດງານ',
                    color: 'text-text-secondary bg-bg-elevated',
                    icon: XCircle
                };
            case 'waiting':
                return {
                    label: 'ລໍຖ້າອອກລົດ',
                    color: 'text-info bg-info-light',
                    icon: Clock
                };
            default:
                return {
                    label: 'ບໍ່ຮູ້ສະຖານະ',
                    color: 'text-text-secondary bg-bg-elevated',
                    icon: XCircle
                };
        }
    };

    const getFuelColor = (level: number) => {
        if (level >= 70) return 'bg-green-500';
        if (level >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getOccupancyColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getTimeUntilDeparture = (departureTime: string) => {
        if (!departureTime) return '';
        const now = new Date();
        const [hours, minutes] = departureTime.split(':').map(Number);
        const departure = new Date();
        departure.setHours(hours, minutes, 0, 0);

        // If departure time has passed today, assume it's tomorrow
        if (departure < now) {
            departure.setDate(departure.getDate() + 1);
        }

        const diffMs = departure.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours} ຊມ ${diffMinutes} ນທ`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} ນທ`;
        } else {
            return 'ໝົດເວລາ';
        }
    };

    const handleContactDriver = () => {
        setShowContactModal(true);
    };

    const handleUpdateStatus = () => {
        setNewStatus(selectedBus?.status || 'active');
        setShowStatusModal(true);
    };

    const handleReportProblem = () => {
        setReportText('');
        setShowReportModal(true);
    };

    const handleStatusUpdate = () => {
        if (selectedBus) {
            alert(`ສະຖານະລົດ ${selectedBus.plateNumber} ໄດ້ຖືກອັບເດດເປັນ "${getStatusInfo(newStatus).label}" ແລ້ວ`);
            setShowStatusModal(false);
            setSelectedBus(null);
        }
    };

    const handleSubmitReport = () => {
        if (selectedBus && reportText.trim()) {
            alert(`ລາຍງານບັນຫາສຳລັບລົດ ${selectedBus.plateNumber} ຖືກສົ່ງຮຽບຮ້ອຍແລ້ວ:\n"${reportText}"`);
            setShowReportModal(false);
            setReportText('');
            setSelectedBus(null);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-text-primary">ຈັດການຂໍ້ມູນລົດເມ</h1>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover">
                        <Plus className="w-5 h-5" />
                        ເພີ່ມລົດເມໃໝ່
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-bg-secondary border border-border p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Filter className="w-5 h-5" />
                        <span className="font-medium">ຕົວກອງ:</span>
                    </div>

                    <select
                        className="border border-border bg-bg-tertiary text-text-primary rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                    >
                        <option value="all">ສະຖານະທັງໝົດ</option>
                        <option value="active">ພວມເດີນທາງ</option>
                        <option value="delayed">ລ່າຊ້າ</option>
                        <option value="maintenance">ພວມສ້ອມແປງ</option>
                        <option value="waiting">ລໍຖ້າອອກລົດ</option>
                    </select>

                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="ຄົ້ນຫາທະບຽນລົດ, ເສັ້ນທາງ, ຫຼື ຄົນຂັບ..."
                            className="w-full pl-10 pr-4 py-1.5 border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-md focus:ring-2 focus:ring-primary outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Bus List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuses.map((bus) => {
                        const statusInfo = getStatusInfo(bus.status);
                        const StatusIcon = statusInfo.icon;
                        const occupancy = Math.round((bus.passengers.current / bus.passengers.capacity) * 100);

                        return (
                            <div key={bus.id} onClick={() => setSelectedBus(bus)} className="bg-bg-secondary rounded-lg shadow-sm border border-border hover:border-border-hover hover:shadow-md transition-all cursor-pointer">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary">{bus.plateNumber}</h3>
                                            <p className="text-sm text-text-secondary">{bus.route}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">ຄົນຂັບ:</span>
                                            <span className="font-medium text-text-primary">{bus.driver}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">ຈຸດປັດຈຸບັນ:</span>
                                            <span className="font-medium text-text-primary flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-text-tertiary" />
                                                {bus.location}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-text-secondary">
                                                <span>ຜູ້ໂດຍສານ ({occupancy}%)</span>
                                                <span>{bus.passengers.current}/{bus.passengers.capacity}</span>
                                            </div>
                                            <div className="w-full bg-bg-elevated rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${getOccupancyColor(occupancy)}`}
                                                    style={{ width: `${occupancy}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                            <div>
                                                <p className="text-xs text-text-secondary">ອອກເດີນທາງ</p>
                                                <p className="font-semibold text-text-primary">{bus.departureTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-secondary">ຄາດວ່າຈະຮອດ</p>
                                                <p className="font-semibold text-text-primary">{bus.estimatedArrival}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-bg-tertiary border-t border-border flex justify-between items-center rounded-b-lg">
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <div className={`w-2 h-2 rounded-full ${getFuelColor(bus.fuelLevel)}`}></div>
                                        <span>ນ້ຳມັນ {bus.fuelLevel}%</span>
                                    </div>
                                    <span className="text-primary font-medium text-sm">
                                        ເບິ່ງລາຍລະອຽດ
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bus Detail Modal */}
                {selectedBus && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-border flex justify-between items-start sticky top-0 bg-bg-secondary z-10">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold text-text-primary">
                                            {selectedBus.plateNumber}
                                        </h2>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedBus.status).color}`}>
                                            {getStatusInfo(selectedBus.status).label}
                                        </span>
                                    </div>
                                    <p className="text-text-secondary mt-1">{selectedBus.route}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedBus(null)}
                                    className="p-2 hover:bg-bg-tertiary hover:text-text-primary rounded-full transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-text-tertiary" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Status Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleContactDriver}
                                        className="flex items-center justify-center gap-2 p-4 border border-border rounded-xl hover:bg-bg-tertiary transition-colors group"
                                    >
                                        <div className="p-2 bg-info-light rounded-lg group-hover:bg-bg-elevated transition-colors">
                                            <CheckCircle className="w-5 h-5 text-info" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-text-primary">ຕິດຕໍ່ຄົນຂັບ</div>
                                            <div className="text-xs text-text-secondary">ໂທ ຫຼື ສົ່ງຂໍ້ຄວາມ</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleUpdateStatus}
                                        className="flex items-center justify-center gap-2 p-4 border border-border rounded-xl hover:bg-bg-tertiary transition-colors group"
                                    >
                                        <div className="p-2 bg-primary-light rounded-lg group-hover:bg-bg-elevated transition-colors">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-text-primary">ອັບເດດສະຖານະ</div>
                                            <div className="text-xs text-text-secondary">ປ່ຽນສະຖານະການເດີນທາງ</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-text-primary border-b border-border pb-2">ຂໍ້ມູນການເດີນທາງ</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">ຄົນຂັບ</span>
                                                <span className="font-medium text-text-primary">{selectedBus.driver}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">ຕຳແໜ່ງປັດຈຸບັນ</span>
                                                <span className="font-medium text-text-primary">{selectedBus.location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">ເວລາອອກລົດ</span>
                                                <span className="font-medium text-text-primary">{selectedBus.departureTime || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary">ເວລາເຖິງໂດຍປະມານ</span>
                                                <span className="font-medium text-text-primary">{selectedBus.estimatedArrival || '-'}</span>
                                            </div>
                                            {selectedBus.departureTime && (
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">ນັບຖອຍຫຼັງ</span>
                                                    <span className="font-medium text-warning">{getTimeUntilDeparture(selectedBus.departureTime)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-text-primary border-b border-border pb-2">ສະຖານະລົດ</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-text-secondary">ນ້ຳມັນ</span>
                                                    <span className="font-medium text-text-primary">{selectedBus.fuelLevel}%</span>
                                                </div>
                                                <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getFuelColor(selectedBus.fuelLevel)}`}
                                                        style={{ width: `${selectedBus.fuelLevel}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-text-secondary">ຜູ້ໂດຍສານ</span>
                                                    <span className="font-medium text-text-primary">{selectedBus.passengers.current}/{selectedBus.passengers.capacity}</span>
                                                </div>
                                                <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getOccupancyColor(Math.round((selectedBus.passengers.current / selectedBus.passengers.capacity) * 100))}`}
                                                        style={{ width: `${(selectedBus.passengers.current / selectedBus.passengers.capacity) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {selectedBus.issues && selectedBus.issues.length > 0 && (
                                            <div className="bg-error-light p-4 rounded-lg mt-4">
                                                <div className="flex items-center gap-2 mb-2 text-error font-medium">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>ບັນຫາທີ່ພົບ</span>
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-error space-y-1">
                                                    {selectedBus.issues.map((issue, idx) => (
                                                        <li key={idx}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="pt-4 mt-4 border-t border-border">
                                    <button
                                        onClick={handleReportProblem}
                                        className="w-full py-3 text-error font-medium hover:bg-error-light rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Wrench className="w-4 h-4" />
                                        ແຈ້ງບັນຫາ / ສ້ອມແປງ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Status Modal */}
                {showStatusModal && selectedBus && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4 text-text-primary">ອັບເດດສະຖານະ</h3>
                            <div className="space-y-2">
                                {['active', 'delayed', 'maintenance', 'waiting', 'off-duty'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setNewStatus(s as Bus['status'])}
                                        className={`w-full p-3 rounded-lg text-left flex items-center gap-3 ${newStatus === s ? 'bg-primary-light border-primary ring-1 ring-primary text-text-primary' : 'hover:bg-bg-tertiary text-text-secondary'
                                            }`}
                                    >
                                        <span className={`w-3 h-3 rounded-full ${s === 'active' ? 'bg-green-500' :
                                            s === 'delayed' ? 'bg-yellow-500' :
                                                s === 'maintenance' ? 'bg-red-500' :
                                                    s === 'waiting' ? 'bg-blue-500' : 'bg-gray-500'
                                            }`} />
                                        {getStatusInfo(s as Bus['status']).label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 py-2 text-text-secondary hover:bg-bg-tertiary rounded-lg"
                                >
                                    ຍົກເລີກ
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                                >
                                    ບັນທຶກ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Driver Modal */}
                {showContactModal && selectedBus && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-sm text-center">
                            <h3 className="text-lg font-bold mb-2 text-text-primary">ຕິດຕໍ່ຄົນຂັບ</h3>
                            <p className="text-text-secondary mb-6">
                                ທ່ານຕ້ອງການຕິດຕໍ່ <strong className="text-text-primary">{selectedBus.driver}</strong> ບໍ?
                            </p>
                            <div className="flex flex-col gap-3">
                                <a href="tel:02012345678" className="w-full py-3 bg-success text-white rounded-lg hover:bg-[#16a34a] font-medium">
                                    ໂທຫາຄົນຂັບ (020 1234 5678)
                                </a>
                                <button className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium">
                                    ສົ່ງຂໍ້ຄວາມ
                                </button>
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="w-full py-3 text-text-secondary hover:bg-bg-tertiary rounded-lg mt-2"
                                >
                                    ປິດ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Modal */}
                {showReportModal && selectedBus && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-error">
                                <Wrench className="w-5 h-5" />
                                ແຈ້ງບັນຫາ / ສ້ອມແປງ
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    ະລາຍລະອຽດບັນຫາ
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full border border-border bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="ລະບຸບັນຫາທີ່ພົບ..."
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-text-secondary hover:bg-bg-tertiary rounded-lg"
                                >
                                    ຍົກເລີກ
                                </button>
                                <button
                                    onClick={handleSubmitReport}
                                    disabled={!reportText.trim()}
                                    className="px-4 py-2 bg-error text-white rounded-lg hover:bg-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ສົ່ງລາຍງານ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}