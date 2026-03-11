'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, ChevronRight, X, Clock, MapPin, Loader2 } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import TripChat from './TripChat';

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

export default function ChatSidebar() {
    const { socket, connected } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(false);
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
                // Only show active or in-progress trips for chat
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
        if (isOpen && trips.length === 0) {
            fetchTrips();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!socket) return;

        // Listen for new messages to show unread badges
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

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleSelectTrip = (trip: Trip) => {
        setSelectedTrip(trip);
        setUnreadMessages(prev => ({ ...prev, [trip._id]: false }));
    };

    return (
        <>
            {/* Toggle Button in Sidebar (to be integrated or floating) */}
            <button
                onClick={toggleSidebar}
                className="relative p-3 rounded-xl bg-bg-secondary border border-border shadow-md hover:bg-bg-tertiary transition-all group"
                title="ເປີດການສົນທະນາ (Open Chat)"
            >
                <MessageSquare className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                {Object.values(unreadMessages).some(val => val) && (
                    <span className="absolute top-2 right-2 h-3 w-3 bg-error rounded-full border-2 border-bg-secondary animate-pulse" />
                )}
            </button>

            {/* Chat Drawer */}
            <div className={`fixed inset-y-0 right-0 w-[400px] bg-bg-secondary border-l border-border shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-bg-tertiary">
                        <div>
                            <h2 className="font-bold text-text-primary text-lg flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                                ສົນທະນາກັບໂຊເຟີ (Driver Chat)
                            </h2>
                            <p className="text-[10px] text-text-tertiary">ສື່ສານກັບໂຊເຟີໃນແຕ່ງວດເດີນທາງ</p>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-tertiary hover:text-text-primary"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {selectedTrip ? (
                            <div className="absolute inset-0 z-10 bg-bg-secondary">
                                <TripChat
                                    tripId={selectedTrip._id}
                                    tripName={`${selectedTrip.routeNumber}: ${selectedTrip.route.from} - ${selectedTrip.route.to}`}
                                    onClose={() => setSelectedTrip(null)}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col h-full p-4">
                                {/* Search */}
                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="ຄົ້ນຫາຖ້ຽວລົດ... (Search trip)"
                                        className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                                    />
                                </div>

                                {/* Trip List */}
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                                                className={`w-full p-4 rounded-xl border transition-all flex items-center group relative overflow-hidden ${unreadMessages[trip._id]
                                                    ? 'bg-primary/5 border-primary shadow-sm'
                                                    : 'bg-bg-tertiary border-border hover:border-primary/30 hover:bg-bg-secondary'
                                                    }`}
                                            >
                                                {/* Left Indicator */}
                                                {unreadMessages[trip._id] && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                )}

                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                                                            {trip.routeNumber}
                                                        </span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${trip.status === 'in-progress' ? 'bg-primary/20 text-primary' : 'bg-success-light text-success'
                                                            }`}>
                                                            {trip.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-text-secondary mb-1">
                                                        <MapPin className="h-3 w-3 mr-1 opacity-60" />
                                                        {trip.route.from} → {trip.route.to}
                                                    </div>
                                                    <div className="flex items-center text-[10px] text-text-tertiary">
                                                        <Clock className="h-3 w-3 mr-1 opacity-60" />
                                                        {trip.departureTime}
                                                    </div>
                                                </div>
                                                <ChevronRight className={`h-5 w-5 ml-2 transition-all ${unreadMessages[trip._id] ? 'text-primary' : 'text-text-tertiary opacity-40 group-hover:translate-x-1'
                                                    }`} />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
                                            <div className="p-4 bg-bg-tertiary rounded-full mb-3">
                                                <MessageSquare className="h-8 w-8 opacity-20" />
                                            </div>
                                            <p className="text-sm">ບໍ່ພົບຖ້ຽວລົດທີ່ກຳລັງເດີນທາງ</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] animate-in fade-in duration-300"
                />
            )}
        </>
    );
}
