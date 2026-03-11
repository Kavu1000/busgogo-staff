'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ──────────────────────────────────────────────────────────
// Status configuration — matches the picture exactly
// ──────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<string, {
    label: string;
    bg: string;
    ring: string;
    pulse: string;
    tailwind: string;
    badgeBg: string;
    badgeText: string;
}> = {
    active:      { label: 'ພວມເດີນທາງ',    bg: '#22c55e', ring: '#16a34a', pulse: 'rgba(34,197,94,0.35)',   tailwind: 'bg-green-500',  badgeBg: '#dcfce7', badgeText: '#15803d' },
    delayed:     { label: 'ລ່າຊ້າ',          bg: '#f59e0b', ring: '#d97706', pulse: 'rgba(245,158,11,0.35)', tailwind: 'bg-yellow-400', badgeBg: '#fef9c3', badgeText: '#854d0e' },
    maintenance: { label: 'ພວມສ້ອມແປງ',   bg: '#ef4444', ring: '#dc2626', pulse: 'rgba(239,68,68,0.35)',   tailwind: 'bg-red-500',    badgeBg: '#fee2e2', badgeText: '#b91c1c' },
    waiting:     { label: 'ດຳເນີນອາກິດ',   bg: '#3b82f6', ring: '#2563eb', pulse: 'rgba(59,130,246,0.35)', tailwind: 'bg-blue-500',   badgeBg: '#e0f2fe', badgeText: '#0369a1' },
    'off-duty':  { label: 'ປິດສະຕິບັດງານ', bg: '#9ca3af', ring: '#6b7280', pulse: 'rgba(156,163,175,0.35)',tailwind: 'bg-gray-400',   badgeBg: '#f3f4f6', badgeText: '#374151' },
};

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ──────────────────────────────────────────────────────────
// Bus icon factory
// ──────────────────────────────────────────────────────────
const createBusIcon = (status: string) => {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG['waiting'];

    const html = `
    <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:52px;height:52px;border-radius:50%;background:${c.pulse};animation:busRingPulse 2s ease-out infinite;"></div>
      <div style="position:absolute;width:44px;height:44px;border-radius:50%;border:3px solid ${c.ring};background:white;box-shadow:0 4px 14px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${c.bg}" stroke="${c.ring}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="14" rx="3" ry="3"/>
          <path d="M2 10h20" stroke="white" stroke-width="1"/>
          <path d="M7 18v2M17 18v2" stroke="${c.ring}" stroke-width="2"/>
          <circle cx="7" cy="17" r="1.5" fill="white"/>
          <circle cx="17" cy="17" r="1.5" fill="white"/>
          <path d="M6 7h4M14 7h4" stroke="white" stroke-width="1.2"/>
        </svg>
      </div>
      <div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${c.ring};"></div>
    </div>
    <style>
      @keyframes busRingPulse {
        0%   { transform:scale(0.8); opacity:0.8; }
        70%  { transform:scale(1.4); opacity:0; }
        100% { transform:scale(0.8); opacity:0; }
      }
    </style>`;

    return L.divIcon({ html, className: '', iconSize: [52, 60], iconAnchor: [26, 60], popupAnchor: [0, -64] });
};

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export interface BusLocation {
    busId: string;
    plateNumber: string;
    lat: number;
    lng: number;
    locationName?: string;
    status: string;
    route?: string;
    driver?: string;
}

interface BusMapProps {
    buses?: BusLocation[];          // optional — if omitted, the map fetches its own data
    center?: [number, number];
    zoom?: number;
    singleBus?: boolean;
    apiUrl?: string;                // base URL for /api/buses/locations
    token?: string;                 // auth token
}

// Re-center map when center changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center[0] !== 0 || center[1] !== 0) {
            map.flyTo(center, zoom, { animate: true, duration: 1 });
        }
    }, [center, zoom, map]);
    return null;
}

// ──────────────────────────────────────────────────────────
// BusMap
// ──────────────────────────────────────────────────────────
const REFRESH_SECONDS = REFRESH_INTERVAL_MS / 1000;

export default function BusMap({
    buses: externalBuses,
    center = [17.9757, 102.6331],
    zoom = 12,
    singleBus = false,
    apiUrl,
    token,
}: BusMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [internalBuses, setInternalBuses] = useState<BusLocation[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState(REFRESH_SECONDS);
    const [refreshing, setRefreshing] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Only fetch internally when no external buses are passed
    const selfManaged = externalBuses === undefined;

    const fetchLocations = useCallback(async () => {
        if (!selfManaged) return;
        setRefreshing(true);
        try {
            const base = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${base}/api/buses`, { headers });
            if (!res.ok) throw new Error('fetch failed');
            const json = await res.json();

            // Normalise — backend may return an array or { data: [] }
            const list: any[] = Array.isArray(json) ? json : (json.data ?? json.buses ?? []);

            const mapped: BusLocation[] = list
                .filter((b: any) => b.currentLocation?.coordinates?.length === 2)
                .map((b: any) => ({
                    busId:        b._id,
                    plateNumber:  b.plateNumber || b.plate || '—',
                    lat:          b.currentLocation.coordinates[1],
                    lng:          b.currentLocation.coordinates[0],
                    locationName: b.currentLocationName || '',
                    status:       b.status || 'waiting',
                    route:        b.route || '',
                    driver:       b.driver?.name || '',
                }));

            setInternalBuses(mapped);
            setLastUpdated(new Date());
        } catch (e) {
            // silently keep old data on error
        } finally {
            setRefreshing(false);
        }
    }, [selfManaged, apiUrl, token]);

    // Start 5-minute auto-refresh
    const startRefreshCycle = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        setCountdown(REFRESH_SECONDS);

        timerRef.current = setInterval(() => {
            fetchLocations();
            setCountdown(REFRESH_SECONDS);
        }, REFRESH_INTERVAL_MS);

        countdownRef.current = setInterval(() => {
            setCountdown(prev => (prev <= 1 ? REFRESH_SECONDS : prev - 1));
        }, 1000);
    }, [fetchLocations]);

    useEffect(() => {
        setIsMounted(true);
        if (selfManaged) {
            fetchLocations();
            startRefreshCycle();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [selfManaged, fetchLocations, startRefreshCycle]);

    const handleManualRefresh = () => {
        fetchLocations();
        startRefreshCycle();
    };

    if (!isMounted) {
        return (
            <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-sm">
                ກຳລັງໂຫລດແຜນທີ່...
            </div>
        );
    }

    const buses = externalBuses ?? internalBuses;
    const validBuses = buses.filter(b => b.lat && b.lng && b.lat !== 0 && b.lng !== 0);
    const mapCenter: [number, number] = validBuses.length === 1
        ? [validBuses[0].lat, validBuses[0].lng]
        : center;

    // Count buses per status
    const statusCounts = Object.fromEntries(
        Object.keys(STATUS_CONFIG).map(k => [k, validBuses.filter(b => b.status === k).length])
    );

    const fmtTime = (d: Date) =>
        d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const fmtCountdown = (s: number) => {
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        return `${m}:${sec}`;
    };

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={!singleBus}
                attributionControl={!singleBus}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapCenter} zoom={zoom} />

                {validBuses.map((bus) => {
                    const cfg = STATUS_CONFIG[bus.status] || STATUS_CONFIG['waiting'];
                    return (
                        <Marker
                            key={bus.busId}
                            position={[bus.lat, bus.lng]}
                            icon={createBusIcon(bus.status)}
                        >
                            <Popup className="custom-bus-popup" maxWidth={240}>
                                <div className="p-1 min-w-[200px] font-sans">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cfg.bg }} />
                                        <span className="font-bold text-sm text-gray-900">{bus.plateNumber}</span>
                                        <span
                                            className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                            style={{ background: cfg.badgeBg, color: cfg.badgeText }}
                                        >
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    {bus.route && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                                            <span>🛣️</span>
                                            <span>{bus.route}</span>
                                        </div>
                                    )}

                                    {/* Driver */}
                                    {bus.driver && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                                            <span>🧑‍✈️</span>
                                            <span>{bus.driver}</span>
                                        </div>
                                    )}

                                    {/* Location */}
                                    <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-1.5">
                                        <span className="mt-0.5">📍</span>
                                        <span>{bus.locationName || 'ກຳລັງເດີນທາງ'}</span>
                                    </div>

                                    {/* Coordinates */}
                                    <div className="text-[10px] text-gray-400 flex gap-3 border-t border-gray-100 pt-1.5 mt-1.5">
                                        <span>Lat: {bus.lat.toFixed(5)}</span>
                                        <span>Lng: {bus.lng.toFixed(5)}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* ── Legend + status counts ── */}
            {!singleBus && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-gray-200 shadow-lg min-w-[170px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">ສະຖານະລົດ</p>
                    <div className="flex flex-col gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <div key={key} className="flex items-center gap-2.5">
                                {/* Dot matches picture (larger, filled circle) */}
                                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: cfg.bg }} />
                                <span className="text-[12px] text-gray-700 flex-1">{cfg.label}</span>
                                {statusCounts[key] > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
                                        {statusCounts[key]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Auto-refresh countdown */}
                    {selfManaged && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">ໂຫລດໃໝ່ໃນ</p>
                                    <p className="text-[13px] font-bold text-blue-600 font-mono">{fmtCountdown(countdown)}</p>
                                </div>
                                <button
                                    onClick={handleManualRefresh}
                                    disabled={refreshing}
                                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50"
                                    title="ໂຫລດໃໝ່ດຽວນີ້"
                                >
                                    <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            {lastUpdated && (
                                <p className="text-[9px] text-gray-400 mt-1">ອັບເດດ: {fmtTime(lastUpdated)}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Live indicator + refresh button (top-right) ── */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
                {selfManaged && (
                    <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-gray-200 shadow-md text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                        <svg className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {refreshing ? 'ໂຫລດ...' : 'ໂຫລດໃໝ່'}
                    </button>
                )}

                <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-gray-200 shadow-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Live</span>
                </div>
            </div>

            {/* ── Bus count badge ── */}
            {!singleBus && validBuses.length > 0 && (
                <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-md flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">ລົດທັງໝົດ</span>
                    <span className="text-[13px] font-bold text-blue-600">{validBuses.length}</span>
                </div>
            )}

            {/* ── No buses message ── */}
            {validBuses.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl border border-gray-200 shadow-lg text-center">
                        <div className="text-3xl mb-2">🚌</div>
                        <p className="text-sm font-semibold text-gray-700">ບໍ່ມີລົດທີ່ມີຂໍ້ມູນທີ່ຕັ້ງ</p>
                        <p className="text-xs text-gray-400 mt-1">ລໍຖ້າຂໍ້ມູນ GPS ຈາກລົດ...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
