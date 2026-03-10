
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Users,
    Search,
    Plus,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Phone,
    Mail,
    Ticket,
    MapPin,
    Clock,
    Filter
} from 'lucide-react';
import MainLayout from './MainLayout';

interface Passenger {
    id: string;
    name: string;
    phone: string;
    email: string;
    ticketNumber: string;
    route: string;
    seatNumber: string;
    departureTime: string;
    departureDate: string;
    status: 'confirmed' | 'checked-in' | 'cancelled' | 'no-show';
    price: number;
    busPlateNumber: string;
    bookingDate: string;
    notes?: string;
}

const mockPassengers: Passenger[] = [
    {
        id: '1',
        name: 'ນາງ ສົມສີ ໃຈດີ',
        phone: '020 5555 1234',
        email: 'somsri@email.com',
        ticketNumber: 'VTE001234',
        route: 'ວຽງຈັນ → ຫຼວງພະບາງ',
        seatNumber: 'A12',
        departureTime: '14:30',
        departureDate: '2025-07-24',
        status: 'confirmed',
        price: 150000,
        busPlateNumber: 'ກກ-1234',
        bookingDate: '2025-07-20'
    },
    {
        id: '2',
        name: 'ທ້າວ ວິໄຊ ຮັກສຸກ',
        phone: '020 9999 5678',
        email: 'wichai@email.com',
        ticketNumber: 'VTE001235',
        route: 'ວຽງຈັນ → ປາກເຊ',
        seatNumber: 'B08',
        departureTime: '15:00',
        departureDate: '2025-07-23',
        status: 'checked-in',
        price: 180000,
        busPlateNumber: 'ຂຂ-5678',
        bookingDate: '2025-07-22'
    },
    {
        id: '3',
        name: 'ນາງ ມາລີ ສວຍງາມ',
        phone: '020 7777 8901',
        email: 'malee@email.com',
        ticketNumber: 'VTE001236',
        route: 'ວຽງຈັນ → ສະຫວັນນະເຂດ',
        seatNumber: 'C15',
        departureTime: '18:30',
        departureDate: '2025-07-23',
        status: 'confirmed',
        price: 120000,
        busPlateNumber: 'ຄຄ-9012',
        bookingDate: '2025-07-21'
    },
    {
        id: '4',
        name: 'ທ້າວ ສົມຊາຍ ໃຈກວ້າງ',
        phone: '020 2222 3456',
        email: 'somchai@email.com',
        ticketNumber: 'VTE001237',
        route: 'ວຽງຈັນ → ອຸດົມໄຊ',
        seatNumber: 'A05',
        departureTime: '19:00',
        departureDate: '2025-07-23',
        status: 'confirmed',
        price: 160000,
        busPlateNumber: 'ງງ-3456',
        bookingDate: '2025-07-23'
    },
    {
        id: '5',
        name: 'ນາງ ນັນທາ ຮັກຮຽນ',
        phone: '020 8888 9012',
        email: 'nanta@email.com',
        ticketNumber: 'VTE001238',
        route: 'ວຽງຈັນ → ວັງວຽງ',
        seatNumber: 'B20',
        departureTime: '14:30',
        departureDate: '2025-07-22',
        status: 'cancelled',
        price: 80000,
        busPlateNumber: 'ຈຈ-7890',
        bookingDate: '2025-07-19'
    }
];

export default function PassengerManagement() {
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'checked-in' | 'pending' | 'completed'>('all');
    const [passengers, setPassengers] = useState(mockPassengers);
    const [showAddModal, setShowAddModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | Passenger['status']>('all');
    const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Check for action parameter to auto-open add modal
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            setShowAddModal(true);
        }
    }, [searchParams]);

    // Form state for adding new passenger
    const [newPassenger, setNewPassenger] = useState<Omit<Passenger, 'id'>>({
        name: '',
        phone: '',
        email: '',
        ticketNumber: '',
        route: '',
        seatNumber: '',
        departureTime: '',
        departureDate: '',
        status: 'confirmed',
        price: 0,
        busPlateNumber: '',
        bookingDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const filteredPassengers = passengers.filter(passenger => {
        const matchesSearch =
            passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.phone.includes(searchTerm) ||
            passenger.route.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || passenger.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusInfo = (status: Passenger['status']) => {
        switch (status) {
            case 'confirmed':
                return {
                    label: 'ຢືນຢັນແລ້ວ',
                    color: 'text-blue-700 bg-blue-100',
                    icon: CheckCircle
                };
            case 'checked-in':
                return {
                    label: 'ເຊັກອິນແລ້ວ',
                    color: 'text-green-700 bg-green-100',
                    icon: CheckCircle
                };
            case 'cancelled':
                return {
                    label: 'ຍົກເລີກ',
                    color: 'text-red-700 bg-red-100',
                    icon: XCircle
                };
            case 'no-show':
                return {
                    label: 'ບໍ່ມາຂຶ້ນລົດ',
                    color: 'text-text-secondary bg-bg-elevated',
                    icon: XCircle
                };
            default:
                return {
                    label: 'ບໍ່ຮູ້ສະຖານະ',
                    color: 'text-text-secondary bg-bg-elevated',
                    icon: XCircle
                };
        }
    };

    const handleEditPassenger = (passenger: Passenger) => {
        setSelectedPassenger(passenger);
        setShowEditModal(true);
    };

    const handleDeletePassenger = (passenger: Passenger) => {
        if (confirm(`ທ່ານຕ້ອງການລຶບຂໍ້ມູນຜູ້ໂດຍສານ "${passenger.name}" ແມ່ນບໍ່?`)) {
            alert(`ລຶບຂໍ້ມູນຜູ້ໂດຍສານ "${passenger.name}" ຮຽບຮ້ອຍແລ້ວ`);
        }
    };

    const handleStatusChange = (passenger: Passenger, newStatus: Passenger['status']) => {
        // Update local state for immediate feedback
        const updatedPassengers = passengers.map(p =>
            p.id === passenger.id ? { ...p, status: newStatus } : p
        );
        setPassengers(updatedPassengers);
        alert(`ປ່ຽນສະຖານະຜູ້ໂດຍສານ "${passenger.name}" ເປັນ "${getStatusInfo(newStatus).label}" ແລ້ວ`);
    };

    const handleAddPassenger = () => {
        // Validate required fields
        if (!newPassenger.name || !newPassenger.phone || !newPassenger.route || !newPassenger.departureDate) {
            alert('ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ');
            return;
        }

        // Generate ticket number
        const ticketNumber = `VTE${String(Date.now()).slice(-6)}`;

        const createdPassenger: Passenger = {
            ...newPassenger,
            id: String(Date.now()),
            ticketNumber
        };

        setPassengers([createdPassenger, ...passengers]);
        alert(`ເພີ່ມຜູ້ໂດຍສານ "${newPassenger.name}" ຮຽບຮ້ອຍແລ້ວ\nໝາຍເລກປີ້: ${ticketNumber}`);

        // Reset form
        resetAddForm();
        setShowAddModal(false);
    };

    const resetAddForm = () => {
        setNewPassenger({
            name: '',
            phone: '',
            email: '',
            ticketNumber: '',
            route: '',
            seatNumber: '',
            departureTime: '',
            departureDate: '',
            status: 'confirmed',
            price: 0,
            busPlateNumber: '',
            bookingDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    // Available routes and buses for dropdown
    const availableRoutes = [
        'ວຽງຈັນ → ຫຼວງພະບາງ',
        'ວຽງຈັນ → ປາກເຊ',
        'ວຽງຈັນ → ສະຫວັນນະເຂດ',
        'ວຽງຈັນ → ອຸດົມໄຊ',
        'ວຽງຈັນ → ວັງວຽງ',
        'ຫຼວງພະບາງ → ວຽງຈັນ'
    ];

    const availableBuses = [
        { plate: 'ກກ-1234', route: 'ວຽງຈັນ → ຫຼວງພະບາງ' },
        { plate: 'ຂຂ-5678', route: 'ວຽງຈັນ → ປາກເຊ' },
        { plate: 'ຄຄ-9012', route: 'ວຽງຈັນ → ສະຫວັນນະເຂດ' },
        { plate: 'ງງ-3456', route: 'ວຽງຈັນ → ອຸດົມໄຊ' },
        { plate: 'ຈຈ-7890', route: 'ວຽງຈັນ → ວັງວຽງ' },
        { plate: 'ສສ-2468', route: 'ຫຼວງພະບາງ → ວຽງຈັນ' }
    ];

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">ຈັດການຜູ້ໂດຍສານ</h1>
                        <p className="text-sm text-text-secondary">ຈັດການຂໍ້ມູນແລະການຈອງຂອງຜູ້ໂດຍສານ</p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus className="h-5 w-5" />
                        <span>ເພີ່ມຜູ້ໂດຍສານ</span>
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-bg-secondary rounded-lg shadow-sm p-4">
                    <div className="flex space-x-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ຄົ້ນຫາຊື່, ໝາຍເລກປີ້, ເບີໂທ, ເສັ້ນທາງ..."
                                    className="w-full pl-10 pr-4 py-3 border-2 border-border bg-bg-secondary rounded-lg text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-text-tertiary" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm font-medium"
                            >
                                <option value="all">ທຸກສະຖານະ</option>
                                <option value="confirmed">ຢືນຢັນແລ້ວ</option>
                                <option value="checked-in">ເຊັກອິນແລ້ວ</option>
                                <option value="cancelled">ຍົກເລີກ</option>
                                <option value="no-show">ບໍ່ມາຂຶ້ນລົດ</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-bg-secondary rounded-lg shadow-sm p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {passengers.filter(p => p.status === 'confirmed').length}
                            </div>
                            <div className="text-sm text-text-secondary">ຢືນຢັນແລ້ວ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {passengers.filter(p => p.status === 'checked-in').length}
                            </div>
                            <div className="text-sm text-text-secondary">ເຊັກອິນແລ້ວ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {passengers.filter(p => p.status === 'cancelled').length}
                            </div>
                            <div className="text-sm text-text-secondary">ຍົກເລີກ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-text-secondary">
                                {filteredPassengers.length}
                            </div>
                            <div className="text-sm text-text-secondary">ລາຍການທີ່ສະແດງ</div>
                        </div>
                    </div>
                </div>

                {/* Passengers Table */}
                <div className="bg-bg-secondary rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-bg-tertiary">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        ຜູ້ໂດຍສານ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        ການເດີນທາງ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        ທີ່ນັ່ງ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        ສະຖານະ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        ລາຄາ
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                        ຈັດການ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-bg-secondary divide-y divide-border">
                                {filteredPassengers.map((passenger) => {
                                    const statusInfo = getStatusInfo(passenger.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={passenger.id} className="hover:bg-bg-tertiary">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-text-primary">
                                                                {passenger.name}
                                                            </div>
                                                            <div className="text-sm text-text-tertiary flex items-center space-x-2">
                                                                <span className="flex items-center">
                                                                    <Phone className="h-3 w-3 mr-1" />
                                                                    {passenger.phone}
                                                                </span>
                                                                {passenger.email && (
                                                                    <span className="flex items-center">
                                                                        <Mail className="h-3 w-3 mr-1" />
                                                                        {passenger.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-text-tertiary flex items-center mt-1">
                                                                <Ticket className="h-3 w-3 mr-1" />
                                                                {passenger.ticketNumber}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-primary">
                                                    <div className="flex items-center mb-1">
                                                        <MapPin className="h-4 w-4 mr-1 text-text-tertiary" />
                                                        {passenger.route}
                                                    </div>
                                                    <div className="flex items-center text-text-tertiary">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {passenger.departureDate} {passenger.departureTime}
                                                    </div>
                                                    <div className="text-xs text-text-tertiary">
                                                        ລົດ: {passenger.busPlateNumber}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-primary">
                                                    {passenger.seatNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-primary">
                                                    ₭{passenger.price.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Status Change Dropdown */}
                                                    <select
                                                        value={passenger.status}
                                                        onChange={(e) => handleStatusChange(passenger, e.target.value as Passenger['status'])}
                                                        className="text-xs border-2 border-border bg-bg-secondary rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-medium text-text-primary"
                                                    >
                                                        <option value="confirmed">ຢືນຢັນແລ້ວ</option>
                                                        <option value="checked-in">ເຊັກອິນແລ້ວ</option>
                                                        <option value="cancelled">ຍົກເລີກ</option>
                                                        <option value="no-show">ບໍ່ມາຂຶ້ນລົດ</option>
                                                    </select>

                                                    <button
                                                        onClick={() => handleEditPassenger(passenger)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeletePassenger(passenger)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredPassengers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-text-tertiary" />
                            <h3 className="mt-2 text-sm font-medium text-text-primary">ບໍ່ພົບຜູ້ໂດຍສານ</h3>
                            <p className="mt-1 text-sm text-text-tertiary">
                                ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ເພີ່ມຜູ້ໂດຍສານໃໝ່
                            </p>
                        </div>
                    )}
                </div>

                {/* Add Passenger Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-bg-secondary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-text-primary">ເພີ່ມຜູ້ໂດຍສານໃໝ່</h3>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetAddForm();
                                        }}
                                        className="text-text-tertiary hover:text-text-secondary"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); handleAddPassenger(); }} className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-text-primary mb-4">ຂໍ້ມູນສ່ວນຕົວ</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ຊື່-ນາມສະກຸນ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPassenger.name}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, name: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    placeholder="ກະລຸນາປ້ອນຊື່-ນາມສະກຸນ"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ເບີໂທລະສັບ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={newPassenger.phone}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, phone: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    placeholder="020 xxxx xxxx"
                                                    required
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ອີເມວ
                                                </label>
                                                <input
                                                    type="email"
                                                    value={newPassenger.email}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, email: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    placeholder="example@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Travel Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-text-primary mb-4">ຂໍ້ມູນການເດີນທາງ</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ເສັ້ນທາງ <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={newPassenger.route}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, route: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm font-medium"
                                                    required
                                                >
                                                    <option value="">ເລືອກເສັ້ນທາງ</option>
                                                    {availableRoutes.map((route) => (
                                                        <option key={route} value={route}>{route}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ລົດບັດ
                                                </label>
                                                <select
                                                    value={newPassenger.busPlateNumber}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, busPlateNumber: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm font-medium"
                                                >
                                                    <option value="">ເລືອກລົດບັດ</option>
                                                    {availableBuses
                                                        .filter(bus => !newPassenger.route || bus.route === newPassenger.route)
                                                        .map((bus) => (
                                                            <option key={bus.plate} value={bus.plate}>
                                                                {bus.plate} ({bus.route})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ວັນທີເດີນທາງ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newPassenger.departureDate}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, departureDate: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ເວລາອອກເດີນທາງ
                                                </label>
                                                <input
                                                    type="time"
                                                    value={newPassenger.departureTime}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, departureTime: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ໝາຍເລກທີ່ນັ່ງ
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPassenger.seatNumber}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, seatNumber: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    placeholder="A12"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ລາຄາ (ກີບ)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newPassenger.price || ''}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, price: Number(e.target.value) })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    placeholder="150000"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-text-primary mb-4">ຂໍ້ມູນເພີ່ມເຕີມ</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ສະຖານະ
                                                </label>
                                                <select
                                                    value={newPassenger.status}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, status: e.target.value as Passenger['status'] })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm font-medium"
                                                >
                                                    <option value="confirmed">ຢືນຢັນແລ້ວ</option>
                                                    <option value="checked-in">ເຊັກອິນແລ້ວ</option>
                                                    <option value="cancelled">ຍົກເລີກ</option>
                                                    <option value="no-show">ບໍ່ມາຂຶ້ນລົດ</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ວັນທີຈອງ
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newPassenger.bookingDate}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, bookingDate: e.target.value })}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-text-primary mb-2">
                                                    ໝາຍເຫດ
                                                </label>
                                                <textarea
                                                    value={newPassenger.notes || ''}
                                                    onChange={(e) => setNewPassenger({ ...newPassenger, notes: e.target.value })}
                                                    rows={3}
                                                    className="w-full border-2 border-border bg-bg-secondary rounded-lg px-4 py-3 text-text-primary placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                                                    placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                resetAddForm();
                                            }}
                                            className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 font-medium shadow-sm transition-colors"
                                        >
                                            ຍົກເລີກ
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
                                        >
                                            ເພີ່ມຜູ້ໂດຍສານ
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
