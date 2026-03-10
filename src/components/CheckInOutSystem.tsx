
'use client';

import { useState, useRef } from 'react';
import {
    QrCode,
    Search,
    CheckCircle,
    XCircle,
    User,
    Ticket,
    Clock,
    AlertTriangle
} from 'lucide-react';


interface Passenger {
    id: string;
    name: string;
    ticketNumber: string;
    route: string;
    seatNumber: string;
    departureTime: string;
    status: 'pending' | 'checked-in' | 'cancelled';
    phoneNumber: string;
}

// Mock passenger data
const mockPassengers: Passenger[] = [
    {
        id: '1',
        name: 'ນາງ ສົມສີ ໃຈດີ',
        ticketNumber: 'VTE001234',
        route: 'ວຽງຈັນ → ຫຼວງພະບາງ',
        seatNumber: 'A12',
        departureTime: '14:30',
        status: 'pending',
        phoneNumber: '020 5555 1234'
    },
    {
        id: '2',
        name: 'ທ້າວ ວິໄຊ ຮັກສຸກ',
        ticketNumber: 'VTE001235',
        route: 'ວຽງຈັນ → ປາກເຊ',
        seatNumber: 'B08',
        departureTime: '15:00',
        status: 'checked-in',
        phoneNumber: '020 9999 5678'
    }
];

export default function CheckInOutSystem() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Passenger[]>([]);
    const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const results = mockPassengers.filter(passenger =>
            passenger.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.phoneNumber.includes(searchTerm)
        );

        setSearchResults(results);
    };

    const handleCheckIn = (passenger: Passenger) => {
        // Simulate check-in process
        const updatedPassenger = { ...passenger, status: 'checked-in' as const };
        setSelectedPassenger(updatedPassenger);

        // Update in mock data (in real app, this would be an API call)
        const index = mockPassengers.findIndex(p => p.id === passenger.id);
        if (index !== -1) {
            mockPassengers[index] = updatedPassenger;
        }

        // Show success message
        alert(`ເຊັກອິນສຳເລັດ: ${passenger.name} ທີ່ນັ່ງ ${passenger.seatNumber}`);
    };

    const handleQRScan = () => {
        setIsScanning(true);
        // Simulate QR code scanning
        setTimeout(() => {
            setIsScanning(false);
            // Simulate found passenger
            const foundPassenger = mockPassengers[0];
            setSelectedPassenger(foundPassenger);
            setSearchResults([foundPassenger]);
            alert('ສະແກນ QR Code ສຳເລັດ');
        }, 2000);
    };

    const getStatusColor = (status: Passenger['status']) => {
        switch (status) {
            case 'checked-in':
                return 'text-success bg-success-light';
            case 'pending':
                return 'text-warning bg-warning-light';
            case 'cancelled':
                return 'text-error bg-error-light';
            default:
                return 'text-text-secondary bg-bg-elevated';
        }
    };

    const getStatusText = (status: Passenger['status']) => {
        switch (status) {
            case 'checked-in':
                return 'ເຊັກອິນແລ້ວ';
            case 'pending':
                return 'ລໍຖ້າເຊັກອິນ';
            case 'cancelled':
                return 'ຍົກເລີກ';
            default:
                return 'ບໍ່ຮູ້ສະຖານະ';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">ລະບົບ ເຊັກອິນ/ເຊັກເອົາ</h1>
                    <p className="text-sm text-text-secondary">ຈັດການການເຊັກອິນຜູ້ໂດຍສານ</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Scanner */}
                <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                        <QrCode className="h-5 w-5 mr-2 text-primary" />
                        ສະແກນ QR Code
                    </h3>

                    <div className="text-center">
                        <div className="mb-4">
                            <div className={`mx-auto w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center ${isScanning ? 'border-primary bg-primary-light' : 'border-border'
                                }`}>
                                {isScanning ? (
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-primary">ກຳລັງສະແກນ...</p>
                                    </div>
                                ) : (
                                    <QrCode className="h-16 w-16 text-text-tertiary" />
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleQRScan}
                            disabled={isScanning}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors font-medium"
                        >
                            {isScanning ? 'ກຳລັງສະແກນ...' : 'ເລີ່ມສະແກນ QR Code'}
                        </button>

                        <p className="text-xs text-text-secondary mt-2">
                            ຫຼື ແນບໄຟລ໌ QR Code
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    alert('ຟີເຈີການອັບໂຫລດໄຟລ໌ QR Code ຈະພັດທະນາໃນເວີຊັນຖັດໄປ');
                                }
                            }}
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 text-sm text-primary hover:text-primary-hover font-medium"
                        >
                            ເລືອກໄຟລ໌ QR Code
                        </button>
                    </div>
                </div>

                {/* Manual Search */}
                <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                        <Search className="h-5 w-5 mr-2 text-success" />
                        ຄົ້ນຫາປີ້
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                ໝາຍເລກປີ້ / ຊື່ຜູ້ໂດຍສານ / ເບີໂທ
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 border-2 border-border bg-bg-tertiary rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none shadow-sm transition-all"
                                    placeholder="ພິມເພື່ອຄົ້ນຫາ..."
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-success text-white px-6 py-3 rounded-lg hover:bg-[#16a34a] transition-colors font-medium shadow-sm"
                                >
                                    ຄົ້ນຫາ
                                </button>
                            </div>
                        </div>

                        <div className="text-sm text-text-secondary bg-bg-tertiary p-4 rounded-lg">
                            <p className="font-medium mb-2">ຕົວຢ່າງການຄົ້ນຫາ:</p>
                            <ul className="space-y-1 text-text-secondary list-disc list-inside">
                                <li>ໝາຍເລກປີ້: VTE001234</li>
                                <li>ຊື່ຜູ້ໂດຍສານ: ນາງ ສົມສີ ໃຈດີ</li>
                                <li>ເບີໂທ: 020 5555 1234</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">ຜົນການຄົ້ນຫາ</h3>

                    <div className="space-y-4">
                        {searchResults.map((passenger) => (
                            <div
                                key={passenger.id}
                                className="border border-border rounded-lg p-4 hover:border-primary transition-colors bg-primary-light"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="font-bold text-text-primary">{passenger.name}</p>
                                                <div className="flex items-center text-sm text-text-secondary mt-1">
                                                    <Ticket className="h-4 w-4 mr-1" />
                                                    {passenger.ticketNumber}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-text-primary font-medium">{passenger.route}</p>
                                                <div className="flex items-center text-sm text-text-secondary mt-1">
                                                    <User className="h-4 w-4 mr-1" />
                                                    ທີ່ນັ່ງ: {passenger.seatNumber}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center text-sm text-text-secondary">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    ເວລາອອກ: {passenger.departureTime}
                                                </div>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(passenger.status)}`}>
                                                        {getStatusText(passenger.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                        {passenger.status === 'pending' ? (
                                            <button
                                                onClick={() => handleCheckIn(passenger)}
                                                className="w-full md:w-auto bg-success text-white px-6 py-2 rounded-lg hover:bg-[#16a34a] transition-colors font-medium shadow-sm flex items-center justify-center"
                                            >
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                ເຊັກອິນ
                                            </button>
                                        ) : (
                                            <div className="flex items-center text-success bg-success-light px-4 py-2 rounded-lg">
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                <span className="font-medium">ເຊັກອິນແລ້ວ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Check-ins */}
            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">ເຊັກອິນຫຼ້າສຸດ</h3>

                <div className="space-y-3">
                    {mockPassengers
                        .filter(p => p.status === 'checked-in')
                        .slice(0, 5)
                        .map((passenger) => (
                            <div key={passenger.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-bg-tertiary p-2 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-success-light rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">{passenger.name}</p>
                                        <p className="text-sm text-text-secondary">{passenger.route}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-medium text-text-primary">ທີ່ນັ່ງ {passenger.seatNumber}</p>
                                    <div className="flex items-center justify-end text-success">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        <p className="text-xs">ເຊັກອິນແລ້ວ</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {mockPassengers.filter(p => p.status === 'checked-in').length === 0 && (
                        <div className="text-center py-8 text-text-secondary">
                            <p>ຍັງບໍ່ມີການເຊັກອິນໃນມື້ນີ້</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
