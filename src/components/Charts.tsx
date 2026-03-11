'use client';

import { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Donut / Pie Chart  (matches the reference picture)
// ─────────────────────────────────────────────────────────────
interface PieSlice {
    label: string;
    value: number;      // percentage (0-100)
    color: string;
}

interface DonutChartProps {
    slices: PieSlice[];
    title?: string;
    centerLabel?: string;
    centerSub?: string;
}

function DonutChart({ slices, title, centerLabel, centerSub }: DonutChartProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    const R = 80;       // outer radius
    const r = 50;       // inner radius (hole)
    const cx = 110;
    const cy = 110;

    // Build arcs from percentages
    let cumulative = 0;
    const arcs = slices.map((slice, i) => {
        const start = cumulative;
        const end = cumulative + slice.value;
        cumulative = end;

        const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2;
        const endAngle   = (end   / 100) * 2 * Math.PI - Math.PI / 2;

        const x1 = cx + R * Math.cos(startAngle);
        const y1 = cy + R * Math.sin(startAngle);
        const x2 = cx + R * Math.cos(endAngle);
        const y2 = cy + R * Math.sin(endAngle);
        const xi1 = cx + r * Math.cos(startAngle);
        const yi1 = cy + r * Math.sin(startAngle);
        const xi2 = cx + r * Math.cos(endAngle);
        const yi2 = cy + r * Math.sin(endAngle);

        const large = slice.value > 50 ? 1 : 0;

        // label position (midpoint of arc, slightly further out)
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = R + 22;

        return {
            ...slice,
            path: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`,
            labelX: cx + labelR * Math.cos(midAngle),
            labelY: cy + labelR * Math.sin(midAngle),
            midAngle,
        };
    });

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            {/* SVG Donut */}
            <div className="relative flex-shrink-0">
                <svg width="220" height="220" viewBox="0 0 220 220">
                    <defs>
                        {arcs.map((arc, i) => (
                            <filter key={i} id={`shadow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={arc.color} floodOpacity="0.35" />
                            </filter>
                        ))}
                    </defs>
                    {arcs.map((arc, i) => (
                        <path
                            key={i}
                            d={arc.path}
                            fill={arc.color}
                            stroke="white"
                            strokeWidth="2"
                            filter={hovered === i ? `url(#shadow-${i})` : undefined}
                            transform={hovered === i ? `translate(${Math.cos(arc.midAngle) * 4} ${Math.sin(arc.midAngle) * 4})` : undefined}
                            className="transition-all duration-200 cursor-pointer"
                            style={{ opacity: hovered !== null && hovered !== i ? 0.7 : 1 }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        />
                    ))}
                    {/* Center hole */}
                    <circle cx={cx} cy={cy} r={r - 2} fill="var(--color-bg-secondary, white)" />
                    {/* Center text */}
                    {centerLabel && (
                        <>
                            <text x={cx} y={cy - 6} textAnchor="middle" className="text-text-primary" style={{ fontSize: 18, fontWeight: 700, fill: 'currentColor' }}>{centerLabel}</text>
                            {centerSub && <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 11, fill: '#9ca3af' }}>{centerSub}</text>}
                        </>
                    )}
                </svg>

                {/* Tooltip */}
                {hovered !== null && (
                    <div
                        className="absolute bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 pointer-events-none shadow-xl whitespace-nowrap z-10"
                        style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="font-bold">{arcs[hovered].label}</div>
                        <div className="opacity-80">{arcs[hovered].value}%</div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="space-y-3 flex-1 min-w-[160px]">
                {arcs.map((arc, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                            style={{ backgroundColor: arc.color }}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{arc.label}</div>
                            <div className="text-xs text-text-tertiary">{arc.value}%</div>
                        </div>
                        {/* Mini bar */}
                        <div className="w-16 bg-bg-tertiary rounded-full h-1.5 flex-shrink-0">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${arc.value}%`, backgroundColor: arc.color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// RevenuePieChart  — used in Report.tsx (Revenue by Route)
// ─────────────────────────────────────────────────────────────
interface RouteStats {
    route: string;
    revenue: number;
}

const ROUTE_COLORS = ['#2563eb', '#ea580c', '#16a34a', '#9333ea', '#dc2626', '#ca8a04'];

export function RevenuePieChart({ data }: { data: RouteStats[] }) {
    const total = data.reduce((s, d) => s + d.revenue, 0);
    const slices: PieSlice[] = data.map((d, i) => ({
        label: d.route,
        value: Math.round((d.revenue / total) * 100),
        color: ROUTE_COLORS[i % ROUTE_COLORS.length],
    }));

    return (
        <DonutChart
            slices={slices}
            centerLabel={`₭${(total / 1000).toFixed(0)}K`}
            centerSub="Total Revenue"
        />
    );
}

// ─────────────────────────────────────────────────────────────
// Revenue Business Model Donut  (matches the reference picture)
// ─────────────────────────────────────────────────────────────
export function RevenueModelChart() {
    const slices: PieSlice[] = [
        { label: 'Booking Fees',      value: 45, color: '#ea580c' },
        { label: 'B2B Subscription',  value: 45, color: '#1e3a5f' },
        { label: 'Advertising',       value: 10, color: '#16a34a' },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-text-primary">ໂມເດວທາງສ້າງລາຍຮັບ</h3>
                <p className="text-sm text-text-secondary">Business Model Revenue Breakdown</p>
            </div>
            <DonutChart
                slices={slices}
                centerLabel="100%"
                centerSub="Revenue Mix"
            />
            {/* Business detail cards */}
            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-border">
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/20">
                    <div className="w-3 h-3 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                    <div>
                        <div className="text-sm font-bold text-text-primary">Booking Fees — 45%</div>
                        <div className="text-xs text-text-secondary">ລາຍໄດ້ຈາກການຈອງ: ເກັບຄ່າບໍລິການລາຍເດືອນ, ຄ່າບໍລິການໃນປີທໍາອິດ: 1,000,000 ກີບ/ປີ/ເຈົ້າ</div>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20">
                    <div className="w-3 h-3 rounded-full bg-[#1e3a5f] mt-1.5 flex-shrink-0" />
                    <div>
                        <div className="text-sm font-bold text-text-primary">B2B Subscription — 45%</div>
                        <div className="text-xs text-text-secondary">ສ່ວນແບ່ງຄ່າທຳນຽມຈາກການຈອງອອນລາຍ, ຂະຫຍາຍສູ່ Phase B2C ໃນ 5% ຂອງ 3 ປີ</div>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/20">
                    <div className="w-3 h-3 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                    <div>
                        <div className="text-sm font-bold text-text-primary">Advertising — 10%</div>
                        <div className="text-xs text-text-secondary">ລາຍໄດ້ຈາກໂຄສະນາ: ຕ້ອງການທຶນເບື້ອງຕົ້ນ 500,000 ກີບ/ເດືອນ/ນາຍ</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// RevenueBarChart  — weekly revenue trend (clean SVG layout)
// ─────────────────────────────────────────────────────────────
interface WeeklyTrend {
    date: string;
    day: string;
    revenue: number;
    totalTrips: number;
    onTimeRate: number;
    occupancyRate: number;
}

export function RevenueBarChart({ data }: { data: WeeklyTrend[] }) {
    const [hovered, setHovered] = useState<number | null>(null);

    const W = 520;
    const H = 200;
    const MARGIN = { top: 30, right: 16, bottom: 48, left: 58 };
    const chartW = W - MARGIN.left - MARGIN.right;
    const chartH = H - MARGIN.top - MARGIN.bottom;
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const niceMax = Math.ceil(maxRevenue / 100000) * 100000;

    const barW = Math.floor(chartW / data.length) - 8;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
        value: Math.round(niceMax * f),
        y: MARGIN.top + chartH - f * chartH,
    }));

    const bars = data.map((d, i) => {
        const barH = (d.revenue / niceMax) * chartH;
        const x = MARGIN.left + (i / data.length) * chartW + (chartW / data.length - barW) / 2;
        const y = MARGIN.top + chartH - barH;
        return { ...d, x, y, barH, cx: MARGIN.left + (i + 0.5) * (chartW / data.length) };
    });

    return (
        <div className="flex flex-col gap-4 w-full">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ height: H + 16, overflow: 'visible' }}
            >
                {/* ── Y-axis grid lines + labels ── */}
                {yTicks.map(t => (
                    <g key={t.value}>
                        {/* dashed grid line */}
                        <line
                            x1={MARGIN.left} y1={t.y}
                            x2={W - MARGIN.right} y2={t.y}
                            stroke="#e5e7eb" strokeDasharray="4 3" strokeWidth={0.8}
                        />
                        {/* Y label — fixed to left, never overlapping bars */}
                        <text
                            x={MARGIN.left - 6} y={t.y + 4}
                            textAnchor="end"
                            style={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'inherit' }}
                        >
                            ₭{(t.value / 1000).toFixed(0)}K
                        </text>
                    </g>
                ))}

                {/* ── Bars ── */}
                {bars.map((b, i) => {
                    const isHov = hovered === i;
                    return (
                        <g
                            key={b.date}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            className="cursor-pointer"
                        >
                            {/* Bar */}
                            <rect
                                x={b.x} y={b.y}
                                width={barW} height={b.barH}
                                rx={5} ry={5}
                                fill={isHov ? '#1d4ed8' : '#3b82f6'}
                                opacity={hovered !== null && !isHov ? 0.55 : 1}
                                style={{ transition: 'fill 0.15s, opacity 0.15s' }}
                            />
                            {/* Gradient shine stripe */}
                            <rect
                                x={b.x + 2} y={b.y + 2}
                                width={barW / 2 - 4} height={Math.min(b.barH - 4, 20)}
                                rx={3}
                                fill="white" opacity={0.18}
                                style={{ pointerEvents: 'none' }}
                            />

                            {/* Revenue label above bar — only when not hovered-other */}
                            {(hovered === null || isHov) && (
                                <text
                                    x={b.cx} y={b.y - 6}
                                    textAnchor="middle"
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        fill: isHov ? '#1d4ed8' : '#6b7280',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    ₭{(b.revenue / 1000).toFixed(0)}K
                                </text>
                            )}

                            {/* X-axis label: Day */}
                            <text
                                x={b.cx} y={MARGIN.top + chartH + 16}
                                textAnchor="middle"
                                style={{ fontSize: 11, fontWeight: 700, fill: '#374151', fontFamily: 'inherit' }}
                            >
                                {b.day}
                            </text>
                            {/* X-axis label: date */}
                            <text
                                x={b.cx} y={MARGIN.top + chartH + 30}
                                textAnchor="middle"
                                style={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'inherit' }}
                            >
                                {b.date}
                            </text>

                            {/* Hover tooltip */}
                            {isHov && (
                                <g>
                                    <rect
                                        x={b.cx - 46} y={b.y - 52}
                                        width={92} height={44}
                                        rx={7} fill="#111827" opacity={0.92}
                                    />
                                    <text x={b.cx} y={b.y - 36} textAnchor="middle"
                                        style={{ fontSize: 10, fontWeight: 700, fill: 'white', fontFamily: 'inherit' }}>
                                        {b.day} {b.date}
                                    </text>
                                    <text x={b.cx} y={b.y - 23} textAnchor="middle"
                                        style={{ fontSize: 10, fill: '#93c5fd', fontFamily: 'inherit' }}>
                                        ₭{b.revenue.toLocaleString()}
                                    </text>
                                    <text x={b.cx} y={b.y - 12} textAnchor="middle"
                                        style={{ fontSize: 9, fill: '#d1d5db', fontFamily: 'inherit' }}>
                                        {b.totalTrips} ຖ້ຽວ
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}

                {/* Axis bottom line */}
                <line
                    x1={MARGIN.left} y1={MARGIN.top + chartH}
                    x2={W - MARGIN.right} y2={MARGIN.top + chartH}
                    stroke="#d1d5db" strokeWidth={1}
                />
            </svg>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border text-center">
                <div>
                    <div className="text-sm font-bold text-primary">
                        ₭{(data.reduce((s, d) => s + d.revenue, 0) / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-text-tertiary">ລາຍໄດ້ລວມ</div>
                </div>
                <div>
                    <div className="text-sm font-bold text-success">
                        {data.reduce((s, d) => s + d.totalTrips, 0)}
                    </div>
                    <div className="text-xs text-text-tertiary">ຖ້ຽວທັງໝົດ</div>
                </div>
                <div>
                    <div className="text-sm font-bold text-warning">
                        {Math.round(data.reduce((s, d) => s + d.occupancyRate, 0) / data.length)}%
                    </div>
                    <div className="text-xs text-text-tertiary">Avg. Occupancy</div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// OccupancyLineChart  — dual-line: on-time vs occupancy
// ─────────────────────────────────────────────────────────────
export function OccupancyLineChart({ data }: { data: WeeklyTrend[] }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const W = 460;
    const H = 160;
    const PAD = { top: 20, right: 20, bottom: 10, left: 10 };

    const xStep = (W - PAD.left - PAD.right) / (data.length - 1);
    const yScale = (val: number) => H - PAD.bottom - ((val / 100) * (H - PAD.top - PAD.bottom));

    const pointsOnTime    = data.map((d, i) => [PAD.left + i * xStep, yScale(d.onTimeRate)]);
    const pointsOccupancy = data.map((d, i) => [PAD.left + i * xStep, yScale(d.occupancyRate)]);

    const toPath = (pts: number[][]) =>
        pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

    return (
        <div className="w-full relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: 180 }}>
                {/* Grid */}
                {[0, 25, 50, 75, 100].map(pct => {
                    const y = yScale(pct);
                    return (
                        <g key={pct}>
                            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--color-border, #e5e7eb)" strokeDasharray="4 4" strokeWidth={0.8} />
                            <text x={PAD.left - 4} y={y + 4} textAnchor="end" style={{ fontSize: 9, fill: '#9ca3af' }}>{pct}%</text>
                        </g>
                    );
                })}

                {/* Area fills */}
                <path
                    d={`${toPath(pointsOnTime)} L ${pointsOnTime[pointsOnTime.length - 1][0]} ${H} L ${pointsOnTime[0][0]} ${H} Z`}
                    fill="#16a34a" fillOpacity="0.08"
                />
                <path
                    d={`${toPath(pointsOccupancy)} L ${pointsOccupancy[pointsOccupancy.length - 1][0]} ${H} L ${pointsOccupancy[0][0]} ${H} Z`}
                    fill="#2563eb" fillOpacity="0.08"
                />

                {/* Lines */}
                <path d={toPath(pointsOnTime)}    fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={toPath(pointsOccupancy)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {data.map((d, i) => (
                    <g key={i}
                       onMouseEnter={() => setHovered(i)}
                       onMouseLeave={() => setHovered(null)}
                       className="cursor-pointer">
                        <circle cx={pointsOnTime[i][0]}    cy={pointsOnTime[i][1]}    r={hovered === i ? 5 : 3.5} fill="#16a34a" stroke="white" strokeWidth="1.5" />
                        <circle cx={pointsOccupancy[i][0]} cy={pointsOccupancy[i][1]} r={hovered === i ? 5 : 3.5} fill="#2563eb" stroke="white" strokeWidth="1.5" />
                        {/* X-axis label */}
                        <text x={pointsOnTime[i][0]} y={H + 2} textAnchor="middle" style={{ fontSize: 9, fill: '#6b7280' }}>{d.date}</text>
                    </g>
                ))}

                {/* Hover tooltip */}
                {hovered !== null && (
                    <g>
                        <rect
                            x={pointsOnTime[hovered][0] - 50}
                            y={Math.min(pointsOnTime[hovered][1], pointsOccupancy[hovered][1]) - 46}
                            width="100" height="42"
                            rx="6" fill="#111827" opacity={0.9}
                        />
                        <text x={pointsOnTime[hovered][0]} y={Math.min(pointsOnTime[hovered][1], pointsOccupancy[hovered][1]) - 32} textAnchor="middle" style={{ fontSize: 9.5, fill: 'white', fontWeight: 700 }}>{data[hovered].day} {data[hovered].date}</text>
                        <text x={pointsOnTime[hovered][0]} y={Math.min(pointsOnTime[hovered][1], pointsOccupancy[hovered][1]) - 20} textAnchor="middle" style={{ fontSize: 9, fill: '#4ade80' }}>On-Time: {data[hovered].onTimeRate}%</text>
                        <text x={pointsOnTime[hovered][0]} y={Math.min(pointsOnTime[hovered][1], pointsOccupancy[hovered][1]) - 8} textAnchor="middle" style={{ fontSize: 9, fill: '#93c5fd' }}>Occupancy: {data[hovered].occupancyRate}%</text>
                    </g>
                )}
            </svg>
        </div>
    );
}
