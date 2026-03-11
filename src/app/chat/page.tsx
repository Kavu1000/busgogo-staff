'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, ChevronRight, Clock, MapPin, Loader2, Inbox } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import TripChat from '@/components/TripChat';

interface Trip {
    _id: string;
    routeNumber: string;
    route: {
        from: string;
        to: string;
    };
    departureTime: string;
    status: string;
}

export default function ChatPage() {
    const { socket, connected } = useSocket();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/schedules`);
            const data = await response.json();
            if (data.success) {
                // Show active or in-progress trips
                const activeTrips = data.data.filter((t: Trip) =>
                    ['active', 'in-progress'].includes(t.status)
                );
                setTrips(activeTrips);
            }
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: any) => {
            if (!selectedTrip || selectedTrip._id !== msg.tripId) {
                setUnreadMessages(prev => ({ ...prev, [msg.tripId]: true }));
            }
        };

        socket.on('driver_message', handleNewMessage);
        return () => {
            socket.off('driver_message', handleNewMessage);
        };
    }, [socket, selectedTrip]);

    const filteredTrips = trips.filter(trip => {
        const routeNumber = trip.routeNumber || '';
        const from = trip.route?.from || '';
        const to = trip.route?.to || '';
        const search = searchTerm.toLowerCase();

        return routeNumber.toLowerCase().includes(search) ||
            from.toLowerCase().includes(search) ||
            to.toLowerCase().includes(search);
    });

    const handleSelectTrip = (trip: Trip) => {
        setSelectedTrip(trip);
        setUnreadMessages(prev => ({ ...prev, [trip._id]: false }));
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-bg-secondary rounded-2xl border border-border shadow-sm overflow-hidden m-4">
            {/* Sidebar: Trip List */}
            <div className="w-80 border-r border-border flex flex-col bg-bg-tertiary/20">
                <div className="p-6 border-b border-border bg-bg-secondary">
                    <h1 className="text-xl font-bold text-text-primary flex items-center mb-4">
                        <MessageSquare className="h-6 w-6 mr-3 text-primary" />
                        ສົນທະນາ (Chat)
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ຄົ້ນຫາຖ້ຽວລົດ..."
                            className="w-full pl-10 pr-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p className="text-sm">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
                        </div>
                    ) : filteredTrips.length > 0 ? (
                        filteredTrips.map(trip => (
                            <button
                                key={trip._id}
                                onClick={() => handleSelectTrip(trip)}
                                className={`w-full p-4 rounded-xl border transition-all flex items-center group relative overflow-hidden ${selectedTrip?._id === trip._id
                                        ? 'bg-primary/10 border-primary shadow-sm'
                                        : unreadMessages[trip._id]
                                            ? 'bg-primary/5 border-primary/30'
                                            : 'bg-bg-secondary border-border hover:border-primary/30 hover:bg-bg-primary'
                                    }`}
                            >
                                {unreadMessages[trip._id] && !selectedTrip?._id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}

                                <div className="flex-1 text-left">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-bold text-sm transition-colors ${selectedTrip?._id === trip._id ? 'text-primary' : 'text-text-primary'}`}>
                                            {trip.routeNumber}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${trip.status === 'in-progress' ? 'bg-primary/20 text-primary' : 'bg-success-light text-success'
                                            }`}>
                                            {trip.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-text-secondary mb-1">
                                        <MapPin className="h-3 w-3 mr-1 opacity-60" />
                                        {trip.route?.from} → {trip.route?.to}
                                    </div>
                                    <div className="flex items-center text-[10px] text-text-tertiary font-medium">
                                        <Clock className="h-3 w-3 mr-1 opacity-60" />
                                        {trip.departureTime}
                                    </div>
                                </div>
                                <ChevronRight className={`h-5 w-5 ml-2 transition-all ${selectedTrip?._id === trip._id ? 'text-primary' : 'text-text-tertiary opacity-40 group-hover:translate-x-1'
                                    }`} />
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
                            <Inbox className="h-10 w-10 opacity-10 mb-2" />
                            <p className="text-sm">ບໍ່ພົບຖ້ຽວລົດ</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: Chat Window */}
            <div className="flex-1 bg-bg-primary flex flex-col relative">
                {selectedTrip ? (
                    <div className="absolute inset-0 flex flex-col">
                        <TripChat
                            tripId={selectedTrip._id}
                            tripName={`${selectedTrip.routeNumber}: ${selectedTrip.route?.from} - ${selectedTrip.route?.to}`}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary p-12 text-center">
                        <div className="h-24 w-24 bg-bg-tertiary rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-border">
                            <MessageSquare className="h-12 w-12 text-primary opacity-40" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">ຍິນດີຕ້ອນຮັບສູ່ລະບົບສົນທະນາ</h2>
                        <p className="max-w-md text-sm leading-relaxed">
                            ກະລຸນາເລືອກຖ້ຽວລົດຈາກລາຍການດ້ານຊ້າຍມື ເພື່ອເລີ່ມການສົນທະນາກັບໂຊເຟີໃນແຕ່ງວດເດີນທາງ.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
