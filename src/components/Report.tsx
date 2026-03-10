
'use client';

import { useState } from 'react';
import {
    BarChart3,
    FileBarChart,
    Calendar,
    Users,
    Truck,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Filter,
    FileDown,
    Clock,
    MapPin
} from 'lucide-react';


interface DailyStats {
    date: string;
    totalPassengers: number;
    totalRevenue: number;
    busesOperating: number;
    avgOccupancy: number;
    onTimePerformance: number;
}

interface RouteStats {
    route: string;
    totalPassengers: number;
    revenue: number;
    avgOccupancy: number;
    onTimeRate: number;
}

const mockDailyStats: DailyStats[] = [
    {
        date: '2025-07-23',
        totalPassengers: 1250,
        totalRevenue: 425000,
        busesOperating: 15,
        avgOccupancy: 85,
        onTimePerformance: 92
    },
    {
        date: '2025-07-22',
        totalPassengers: 1180,
        totalRevenue: 398000,
        busesOperating: 14,
        avgOccupancy: 82,
        onTimePerformance: 88
    },
    {
        date: '2025-07-21',
        totalPassengers: 1320,
        totalRevenue: 445000,
        busesOperating: 16,
        avgOccupancy: 88,
        onTimePerformance: 95
    }
];

const mockRouteStats: RouteStats[] = [
    {
        route: 'Bangkok → Chiang Mai',
        totalPassengers: 450,
        revenue: 202500,
        avgOccupancy: 90,
        onTimeRate: 94
    },
    {
        route: 'Bangkok → Phuket',
        totalPassengers: 380,
        revenue: 247000,
        avgOccupancy: 85,
        onTimeRate: 91
    },
    {
        route: 'Bangkok → Khon Kaen',
        totalPassengers: 420,
        revenue: 147000,
        avgOccupancy: 88,
        onTimeRate: 89
    }
];

interface ChartData {
    hour: string;
    onTimeRate: number;
    totalBuses: number;
}

const mockHourlyPerformance: ChartData[] = [
    { hour: '06:00', onTimeRate: 98, totalBuses: 5 },
    { hour: '07:00', onTimeRate: 95, totalBuses: 8 },
    { hour: '08:00', onTimeRate: 89, totalBuses: 12 },
    { hour: '09:00', onTimeRate: 92, totalBuses: 10 },
    { hour: '10:00', onTimeRate: 94, totalBuses: 8 },
    { hour: '11:00', onTimeRate: 96, totalBuses: 6 },
    { hour: '12:00', onTimeRate: 88, totalBuses: 14 },
    { hour: '13:00', onTimeRate: 85, totalBuses: 16 },
    { hour: '14:00', onTimeRate: 90, totalBuses: 15 },
    { hour: '15:00', onTimeRate: 87, totalBuses: 18 },
    { hour: '16:00', onTimeRate: 83, totalBuses: 20 },
    { hour: '17:00', onTimeRate: 79, totalBuses: 22 },
    { hour: '18:00', onTimeRate: 82, totalBuses: 19 },
    { hour: '19:00', onTimeRate: 88, totalBuses: 16 },
    { hour: '20:00', onTimeRate: 93, totalBuses: 12 },
    { hour: '21:00', onTimeRate: 96, totalBuses: 8 }
];

interface WeeklyTrend {
    date: string;
    day: string;
    onTimeRate: number;
    occupancyRate: number;
    totalTrips: number;
}

const mockWeeklyTrend: WeeklyTrend[] = [
    { date: '18/07', day: 'Mon', onTimeRate: 88, occupancyRate: 82, totalTrips: 45 },
    { date: '19/07', day: 'Tue', onTimeRate: 92, occupancyRate: 85, totalTrips: 48 },
    { date: '20/07', day: 'Wed', onTimeRate: 89, occupancyRate: 88, totalTrips: 52 },
    { date: '21/07', day: 'Thu', onTimeRate: 95, occupancyRate: 88, totalTrips: 50 },
    { date: '22/07', day: 'Fri', onTimeRate: 88, occupancyRate: 82, totalTrips: 47 },
    { date: '23/07', day: 'Sat', onTimeRate: 85, occupancyRate: 90, totalTrips: 55 },
    { date: '24/07', day: 'Sun', onTimeRate: 92, occupancyRate: 85, totalTrips: 49 }
];

export default function Reports() {
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [selectedReport, setSelectedReport] = useState<'overview' | 'routes' | 'performance'>('overview');

    const todayStats = mockDailyStats[0];
    const yesterdayStats = mockDailyStats[1];

    const getPercentageChange = (current: number, previous: number) => {
        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change > 0
        };
    };

    const generateReport = () => {
        alert(`Generating ${selectedReport} report for period: ${selectedPeriod}...`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Reports & Statistics</h1>
                    <p className="text-sm text-text-secondary">Analyze operational data and performance</p>
                </div>

                <div className="flex space-x-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                        className="border-2 border-border bg-bg-secondary rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none font-medium"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    <button
                        onClick={generateReport}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2"
                    >
                        <FileDown className="h-5 w-5" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="bg-bg-secondary border-b border-border px-6 rounded-lg shadow-sm">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: 'overview', label: 'Overview', icon: BarChart3 },
                        { key: 'routes', label: 'Routes', icon: MapPin },
                        { key: 'performance', label: 'Performance', icon: Clock }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedReport(tab.key as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${selectedReport === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div>
                {selectedReport === 'overview' && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Passengers */}
                            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-text-secondary">Total Passengers</p>
                                        <p className="text-2xl font-bold text-text-primary">{todayStats.totalPassengers.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-primary-light rounded-lg flex items-center justify-center">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    {(() => {
                                        const change = getPercentageChange(todayStats.totalPassengers, yesterdayStats.totalPassengers);
                                        return (
                                            <div className={`flex items-center ${change.isPositive ? 'text-success' : 'text-error'}`}>
                                                {change.isPositive ?
                                                    <TrendingUp className="h-4 w-4 mr-1" /> :
                                                    <TrendingDown className="h-4 w-4 mr-1" />
                                                }
                                                <span className="text-sm font-medium">{change.value}%</span>
                                            </div>
                                        );
                                    })()}
                                    <span className="text-sm text-text-tertiary ml-2">vs. yesterday</span>
                                </div>
                            </div>

                            {/* Revenue */}
                            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-text-secondary">Revenue</p>
                                        <p className="text-2xl font-bold text-text-primary">฿{todayStats.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-success-light rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-success" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    {(() => {
                                        const change = getPercentageChange(todayStats.totalRevenue, yesterdayStats.totalRevenue);
                                        return (
                                            <div className={`flex items-center ${change.isPositive ? 'text-success' : 'text-error'}`}>
                                                {change.isPositive ?
                                                    <TrendingUp className="h-4 w-4 mr-1" /> :
                                                    <TrendingDown className="h-4 w-4 mr-1" />
                                                }
                                                <span className="text-sm font-medium">{change.value}%</span>
                                            </div>
                                        );
                                    })()}
                                    <span className="text-sm text-text-tertiary ml-2">vs. yesterday</span>
                                </div>
                            </div>

                            {/* Buses Operating */}
                            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-text-secondary">Buses Operating</p>
                                        <p className="text-2xl font-bold text-text-primary">{todayStats.busesOperating}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-warning-light rounded-lg flex items-center justify-center">
                                        <Truck className="h-6 w-6 text-warning" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-sm text-text-tertiary">Operational units</span>
                                </div>
                            </div>

                            {/* Average Occupancy */}
                            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-text-secondary">Avg. Occupancy Rate</p>
                                        <p className="text-2xl font-bold text-text-primary">{todayStats.avgOccupancy}%</p>
                                    </div>
                                    <div className="h-12 w-12 bg-[#fef08a] rounded-lg flex items-center justify-center">
                                        <BarChart3 className="h-6 w-6 text-[#ca8a04]" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-bg-tertiary rounded-full h-2">
                                        <div
                                            className="bg-warning h-2 rounded-full"
                                            style={{ width: `${todayStats.avgOccupancy}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Chart Area */}
                        <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-text-primary">Hourly On-Time Performance</h3>
                                <div className="text-sm text-text-secondary">
                                    Today: {todayStats.onTimePerformance}% overall
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="h-80">
                                {/* Chart Legend */}
                                <div className="flex items-center justify-center space-x-6 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary rounded"></div>
                                        <span className="text-sm text-text-secondary">On-Time Rate (%)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-text-tertiary rounded"></div>
                                        <span className="text-sm text-text-secondary">Bus Count</span>
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className="relative h-64 bg-bg-elevated border border-border rounded-lg p-4">
                                    {/* Y-axis labels */}
                                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-tertiary py-4 pl-2">
                                        <span>100%</span>
                                        <span>75%</span>
                                        <span>50%</span>
                                        <span>25%</span>
                                        <span>0%</span>
                                    </div>

                                    {/* Chart bars and line */}
                                    <div className="ml-8 h-full relative">
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between">
                                            {[0, 1, 2, 3, 4].map((i) => (
                                                <div key={i} className="border-t border-border w-full"></div>
                                            ))}
                                        </div>

                                        {/* Chart content */}
                                        <div className="relative h-full flex items-end justify-between px-2">
                                            {mockHourlyPerformance.map((data, index) => {
                                                const barHeight = (data.totalBuses / 22) * 100; // Max 22 buses
                                                const lineHeight = data.onTimeRate;

                                                return (
                                                    <div key={data.hour} className="flex flex-col items-center relative group">
                                                        {/* Tooltip */}
                                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-text-primary text-bg-primary text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                            <div>Time: {data.hour}</div>
                                                            <div>On-Time: {data.onTimeRate}%</div>
                                                            <div>Buses: {data.totalBuses}</div>
                                                        </div>

                                                        {/* Performance line point */}
                                                        <div
                                                            className="absolute w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 z-20"
                                                            style={{
                                                                bottom: `${lineHeight}%`,
                                                                left: '50%'
                                                            }}
                                                        ></div>

                                                        {/* Bus count bar */}
                                                        <div
                                                            className="w-4 bg-border rounded-t hover:bg-text-tertiary transition-colors"
                                                            style={{ height: `${barHeight}%` }}
                                                        ></div>

                                                        {/* Hour label */}
                                                        <span className="text-xs text-text-tertiary mt-1 transform -rotate-45 origin-top-left">
                                                            {data.hour}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Performance line */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                            <path
                                                d={`M ${mockHourlyPerformance.map((data, index) => {
                                                    const x = (index / (mockHourlyPerformance.length - 1)) * 100;
                                                    const y = 100 - data.onTimeRate;
                                                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                                                }).join(' ')}`}
                                                strokeWidth="2"
                                                fill="none"
                                                className="stroke-primary drop-shadow-sm"
                                            />
                                        </svg>
                                    </div>

                                    {/* X-axis title */}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-text-secondary mt-2">
                                        Time (hr)
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-success">
                                            {Math.max(...mockHourlyPerformance.map(d => d.onTimeRate))}%
                                        </div>
                                        <div className="text-xs text-text-secondary">Peak Performance</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-error">
                                            {Math.min(...mockHourlyPerformance.map(d => d.onTimeRate))}%
                                        </div>
                                        <div className="text-xs text-text-secondary">Lowest Performance</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-primary">
                                            {Math.max(...mockHourlyPerformance.map(d => d.totalBuses))}
                                        </div>
                                        <div className="text-xs text-text-secondary">Peak Buses/Hour</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'routes' && (
                    <div className="space-y-6">
                        <div className="bg-bg-secondary border border-border rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border">
                                <h3 className="text-lg font-semibold text-text-primary">Route Report</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-bg-tertiary">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Route
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Passengers
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Revenue
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Occupancy Rate
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                On Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-transparent divide-y divide-border">
                                        {mockRouteStats.map((route, index) => (
                                            <tr key={index} className="hover:bg-bg-elevated">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                                                    {route.route}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                    {route.totalPassengers.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                    ฿{route.revenue.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-1 bg-bg-tertiary rounded-full h-2 mr-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{ width: `${route.avgOccupancy}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-text-primary">{route.avgOccupancy}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${route.onTimeRate >= 90
                                                        ? 'bg-success-light text-success'
                                                        : route.onTimeRate >= 80
                                                            ? 'bg-warning-light text-warning'
                                                            : 'bg-error-light text-error'
                                                        }`}>
                                                        {route.onTimeRate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'performance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">On-Time Performance</h3>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-success mb-2">
                                        {todayStats.onTimePerformance}%
                                    </div>
                                    <p className="text-text-secondary">Buses arrived on time</p>
                                </div>
                            </div>

                            <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Occupancy Rate</h3>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        {todayStats.avgOccupancy}%
                                    </div>
                                    <p className="text-text-secondary">Average occupancy rate</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bg-secondary border border-border rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">7-Day Trend</h3>

                            {/* Chart Container */}
                            <div className="h-80">
                                {/* Chart Legend */}
                                <div className="flex items-center justify-center space-x-6 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success rounded"></div>
                                        <span className="text-sm text-text-secondary">On-Time Rate (%)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary rounded"></div>
                                        <span className="text-sm text-text-secondary">Occupancy Rate (%)</span>
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className="relative h-64 bg-bg-elevated border border-border rounded-lg p-4">
                                    {/* Y-axis labels */}
                                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-tertiary py-4 pl-2">
                                        <span>100%</span>
                                        <span>80%</span>
                                        <span>60%</span>
                                        <span>40%</span>
                                        <span>20%</span>
                                    </div>

                                    {/* Chart content */}
                                    <div className="ml-8 h-full relative">
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between">
                                            {[0, 1, 2, 3, 4].map((i) => (
                                                <div key={i} className="border-t border-border w-full"></div>
                                            ))}
                                        </div>

                                        {/* Data points and labels */}
                                        <div className="relative h-full flex items-end justify-between px-4">
                                            {mockWeeklyTrend.map((data, index) => (
                                                <div key={data.date} className="flex flex-col items-center relative group">
                                                    {/* Tooltip */}
                                                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-text-primary text-bg-primary text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        <div className="font-medium">{data.day}</div>
                                                        <div>On-Time: {data.onTimeRate}%</div>
                                                        <div>Occupancy: {data.occupancyRate}%</div>
                                                        <div>Trips: {data.totalTrips}</div>
                                                    </div>

                                                    {/* On-time performance point */}
                                                    <div
                                                        className="absolute w-3 h-3 bg-success rounded-full border-2 border-bg-secondary transform -translate-x-1/2 z-20 shadow-sm"
                                                        style={{
                                                            bottom: `${(data.onTimeRate / 100) * 100}%`,
                                                            left: '50%'
                                                        }}
                                                    ></div>

                                                    {/* Occupancy rate point */}
                                                    <div
                                                        className="absolute w-3 h-3 bg-primary rounded-full border-2 border-bg-secondary transform -translate-x-1/2 z-20 shadow-sm"
                                                        style={{
                                                            bottom: `${(data.occupancyRate / 100) * 100}%`,
                                                            left: '50%'
                                                        }}
                                                    ></div>

                                                    {/* Day label */}
                                                    <div className="text-center mt-2">
                                                        <div className="text-xs font-medium text-text-primary">{data.date}</div>
                                                        <div className="text-xs text-text-secondary">{data.day}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* On-time performance line */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none ml-4">
                                            <path
                                                d={`M ${mockWeeklyTrend.map((data, index) => {
                                                    const x = (index / (mockWeeklyTrend.length - 1)) * 85 + 7.5; // Adjust for padding
                                                    const y = 100 - data.onTimeRate;
                                                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                                                }).join(' ')}`}
                                                strokeWidth="2"
                                                fill="none"
                                                className="stroke-success drop-shadow-sm"
                                            />
                                        </svg>

                                        {/* Occupancy rate line */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none ml-4">
                                            <path
                                                d={`M ${mockWeeklyTrend.map((data, index) => {
                                                    const x = (index / (mockWeeklyTrend.length - 1)) * 85 + 7.5; // Adjust for padding
                                                    const y = 100 - data.occupancyRate;
                                                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                                                }).join(' ')}`}
                                                strokeWidth="2"
                                                fill="none"
                                                className="stroke-primary drop-shadow-sm"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Weekly Summary */}
                                <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-success">
                                            {(mockWeeklyTrend.reduce((sum, d) => sum + d.onTimeRate, 0) / mockWeeklyTrend.length).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-text-secondary">Avg. On-Time</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-primary">
                                            {(mockWeeklyTrend.reduce((sum, d) => sum + d.occupancyRate, 0) / mockWeeklyTrend.length).toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-text-secondary">Avg. Occupancy</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-warning">
                                            {mockWeeklyTrend.reduce((sum, d) => sum + d.totalTrips, 0)}
                                        </div>
                                        <div className="text-xs text-text-secondary">Total Trips</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-text-primary">
                                            {Math.max(...mockWeeklyTrend.map(d => d.onTimeRate))}%
                                        </div>
                                        <div className="text-xs text-text-secondary">Peak</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
