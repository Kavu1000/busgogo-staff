'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TripChat from '@/components/TripChat';
import { TruckIcon, ChatBubbleLeftEllipsisIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import MainLayout from '@/components/MainLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Schedule {
    _id: string;
    busId: { name: string; licensePlate: string } | null;
    route: { from: string; to: string };
    departureTime: string;
    arrivalTime: string;
    date: string;
    status: 'active' | 'inactive' | 'in-progress' | 'completed' | 'cancelled';
    driverId?: { _id: string; username: string; email: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
    'in-progress': 'ກຳລັງເດີນທາງ',
    completed: 'ສຳເລັດແລ້ວ',
    cancelled: 'ຍົກເລີກ',
    active: 'ລໍຖ້າອອກເດີນທາງ',
    inactive: 'ລໍຖ້າອອກເດີນທາງ',
};

const STATUS_CLS: Record<string, string> = {
    'in-progress': 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-bg-elevated text-text-secondary border-border',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function DriverReportsContent() {
    const searchParams = useSearchParams();
    const initialTripId = searchParams.get('tripId');
    const { token } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Schedule | null>(null);
    // Track which trip IDs have unread messages from drivers
    const [unreadTrips, setUnreadTrips] = useState<Set<string>>(new Set());

    const fetchSchedules = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/schedules?limit=5000`);
            const json = await res.json();
            if (json.data) {
                // Only consider trips that actually have a driver assigned
                // because you can't chat with a trip that has no driver!
                const withDrivers = json.data.filter((s: Schedule) => s.driverId != null);

                // Split into in-progress, active, and others
                const inProgress = withDrivers.filter((s: Schedule) => s.status === 'in-progress');
                // For active but not started, we only want ones from today or yesterday mostly, or just closest ones
                const active = withDrivers.filter((s: Schedule) => s.status === 'active');

                // Sort active ascending (soonest first)
                active.sort((a: Schedule, b: Schedule) => {
                    const tA = new Date(`${a.date?.slice(0, 10)}T${a.departureTime}`).getTime();
                    const tB = new Date(`${b.date?.slice(0, 10)}T${b.departureTime}`).getTime();
                    return isNaN(tA) || isNaN(tB) ? 0 : tA - tB;
                });

                const others = withDrivers
                    .filter((s: Schedule) => s.status !== 'active' && s.status !== 'in-progress')
                    .sort((a: Schedule, b: Schedule) => {
                        const tA = new Date(`${a.date?.slice(0, 10)}T${a.departureTime}`).getTime();
                        const tB = new Date(`${b.date?.slice(0, 10)}T${b.departureTime}`).getTime();
                        // Descending for others (newest completed first)
                        return isNaN(tB) || isNaN(tA) ? 0 : tB - tA;
                    });

                // Combine: in-progress at very top, then soonest active, then most recent others. Limit others so it's not huge.
                const list = [...inProgress, ...active, ...others.slice(0, 15)];

                setSchedules(list);

                // Auto select from query param if provided
                if (initialTripId) {
                    const matched = list.find((s: Schedule) => s._id === initialTripId);
                    if (matched) setSelected(matched);
                }
            }
        } catch (err) {
            console.error('Failed to fetch schedules', err);
        } finally {
            setLoading(false);
        }
    }, [initialTripId]);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

    // Mock socket implementation for now.
    // Listen for real-time driver messages from the global admin socket
    const { socket } = useAdminSocket();

    useEffect(() => {
        if (!socket) return;

        const handleDriverMessage = ({ tripId }: { tripId: string }) => {
            // Only mark unread if this trip is NOT currently open
            if (selected?._id !== tripId) {
                setUnreadTrips(prev => new Set([...prev, tripId]));
            }
        };

        const handleScheduleUpdated = () => {
            fetchSchedules();
        };

        // @ts-ignore
        socket.on('driverMessage', handleDriverMessage);
        // @ts-ignore
        socket.on('scheduleUpdated', handleScheduleUpdated);

        return () => {
            // @ts-ignore
            socket.off('driverMessage', handleDriverMessage);
            // @ts-ignore
            socket.off('scheduleUpdated', handleScheduleUpdated);
        };
    }, [socket, selected?._id, fetchSchedules]);

    const openChat = (s: Schedule) => {
        setSelected(s);
        // Mark as read when opened
        setUnreadTrips(prev => {
            const next = new Set(prev);
            next.delete(s._id);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-text-tertiary">
                ກຳລັງໂຫຼດ...
            </div>
        );
    }

    const tripLabel = selected
        ? `${selected.driverId?.username ?? 'ໂຊເຟີ'} – ${selected.busId?.name ?? 'ລົດເມ'} (${selected.route.from} ➔ ${selected.route.to})`
        : '';

    return (
        <div className="flex overflow-hidden bg-bg-secondary h-[calc(100vh-140px)] rounded-xl border border-border shadow-sm">

            {/* ══ LEFT: trip / conversation list ══ */}
            <div
                className={`flex flex-col border-r border-border bg-bg-secondary shrink-0
                    w-full md:w-[320px] lg:w-[360px]
                    ${selected ? 'hidden md:flex' : 'flex'}`}
            >
                <div className="px-4 pt-5 pb-3 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-text-primary">ລາຍງານ & ສົນທະນາ</h1>
                    <p className="text-xs text-text-tertiary mt-0.5">Driver Reports &amp; Chat</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 text-sm">
                            <TruckIcon className="w-10 h-10" />
                            <p>ບໍ່ມີທ່ຽວລົດ</p>
                        </div>
                    ) : (
                        schedules.map(s => {
                            const isSelected = selected?._id === s._id;
                            const hasUnread = unreadTrips.has(s._id);
                            const statusCls = STATUS_CLS[s.status] ?? 'bg-blue-50 text-blue-700 border-blue-200';
                            return (
                                <button
                                    key={s._id}
                                    onClick={() => openChat(s)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-100 transition-colors
                                        ${isSelected ? 'bg-blue-50' : hasUnread ? 'bg-orange-50' : 'hover:bg-bg-tertiary'}`}
                                >
                                    {/* Avatar circle */}
                                    <div className="relative">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0
                                            ${s.status === 'in-progress' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                            <TruckIcon className={`w-6 h-6 ${s.status === 'in-progress' ? 'text-green-600' : 'text-blue-500'}`} />
                                        </div>
                                        {/* Unread dot */}
                                        {hasUnread && (
                                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`font-semibold text-sm truncate ${hasUnread ? 'text-text-primary' : 'text-text-primary'}`}>
                                                {s.busId?.name || 'ລົດເມ'}
                                            </span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 ${statusCls}`}>
                                                {STATUS_LABEL[s.status] ?? s.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-tertiary truncate">{s.route.from} → {s.route.to}</p>
                                        <p className="text-xs text-text-tertiary mt-0.5">
                                            {s.departureTime}
                                            {s.driverId
                                                ? <> · <span className="text-text-tertiary">{s.driverId.username}</span></>
                                                : <> · <span className="text-red-400">ບໍ່ໄດ້ໝາຍ</span></>
                                            }
                                        </p>
                                    </div>

                                    <div className="relative shrink-0">
                                        <ChatBubbleLeftEllipsisIcon
                                            className={`w-5 h-5 ${isSelected ? 'text-blue-500' : hasUnread ? 'text-orange-500' : 'text-gray-300'}`}
                                        />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ══ RIGHT: full-height chat panel ══ */}
            {selected && token ? (
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Chat title bar */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white shrink-0 shadow-sm">
                        <button
                            onClick={() => setSelected(null)}
                            className="md:hidden p-1.5 hover:bg-blue-700 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                            <TruckIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{selected.busId?.name ?? 'ລົດເມ'}</p>
                            <p className="text-xs text-blue-100 truncate">
                                {selected.route.from} → {selected.route.to}
                                {selected.driverId && <> · {selected.driverId.username}</>}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <TripChat
                            tripId={selected._id}
                            token={token}
                            partnerLabel={tripLabel}
                            hideHeader
                        />
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-300 gap-3">
                    <ChatBubbleLeftEllipsisIcon className="w-16 h-16" />
                    <p className="text-base font-medium text-text-tertiary">ເລືອກທ່ຽວລົດເພື່ອສົນທະນາ</p>
                    <p className="text-sm text-gray-300">Select a trip to start chatting</p>
                </div>
            )}
        </div>
    );
}

export default function DriverReportsPage() {
    return (
        <MainLayout>
            <Suspense fallback={<div className="flex h-[60vh] items-center justify-center text-text-tertiary">ກຳລັງໂຫຼດ...</div>}>
                <DriverReportsContent />
            </Suspense>
        </MainLayout>
    );
}
