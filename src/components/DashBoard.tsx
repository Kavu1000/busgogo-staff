'use client';

import { useState } from 'react';
import {
    HomeIcon,
    TicketIcon,
    TruckIcon,
    ChartBarIcon,
    BellIcon,
    UsersIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import {
    BellIcon as BellSolidIcon
} from '@heroicons/react/24/solid';

import MainLayout from './MainLayout';
import StatsCard from './StatsCard';
import QuickActions from './QuickAction';
import RecentActivity from './RecentActivity';
import BusSchedule from './BusSchedule';
import { RevenueBarChart } from './Charts';

interface WeeklyTrend {
    date: string;
    day: string;
    onTimeRate: number;
    occupancyRate: number;
    totalTrips: number;
    revenue: number;
}

const mockWeeklyTrend: WeeklyTrend[] = [
    { date: '18/07', day: 'Mon', onTimeRate: 88, occupancyRate: 82, totalTrips: 45, revenue: 385000 },
    { date: '19/07', day: 'Tue', onTimeRate: 92, occupancyRate: 85, totalTrips: 48, revenue: 412000 },
    { date: '20/07', day: 'Wed', onTimeRate: 89, occupancyRate: 88, totalTrips: 52, revenue: 445000 },
    { date: '21/07', day: 'Thu', onTimeRate: 95, occupancyRate: 88, totalTrips: 50, revenue: 428000 },
    { date: '22/07', day: 'Fri', onTimeRate: 88, occupancyRate: 82, totalTrips: 47, revenue: 398000 },
    { date: '23/07', day: 'Sat', onTimeRate: 85, occupancyRate: 90, totalTrips: 55, revenue: 475000 },
    { date: '24/07', day: 'Sun', onTimeRate: 92, occupancyRate: 85, totalTrips: 49, revenue: 425000 }
];

interface DashboardStats {
    totalPassengers: number;
    checkedIn: number;
    pending: number;
    activeBuses: number;
    onTime: number;
    delayed: number;
    revenue: number;
    alerts: number;
}

export default function Dashboard() {
    // Mock data for dashboard
    const [stats] = useState<DashboardStats>({
        totalPassengers: 342,
        checkedIn: 289,
        pending: 53,
        activeBuses: 24,
        onTime: 20,
        delayed: 4,
        revenue: 125400,
        alerts: 3
    });


    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Today's Passengers"
                        value={stats.totalPassengers.toLocaleString('en-US')}
                        icon={UsersIcon}
                        color="blue"
                        subtitle={`${stats.checkedIn} checked in`}
                    />
                    <StatsCard
                        title="Pending Check-In"
                        value={stats.pending.toLocaleString('en-US')}
                        icon={TicketIcon}
                        color="yellow"
                        subtitle="Needs attention"
                    />
                    <StatsCard
                        title="Active Buses"
                        value={stats.activeBuses.toLocaleString('en-US')}
                        icon={TruckIcon}
                        color="green"
                        subtitle={`On time ${stats.onTime} | Delayed ${stats.delayed}`}
                    />
                    <StatsCard
                        title="Today's Revenue"
                        value={`₭${stats.revenue.toLocaleString('en-US')}`}
                        icon={ChartBarIcon}
                        color="purple"
                        subtitle="Last updated"
                    />
                </div>

                {/* Quick Actions, Schedule and Revenue Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <QuickActions />
                        {/* Revenue Trend on Dashboard */}
                        <div className="bg-bg-secondary rounded-lg shadow-md p-6 border border-border">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Revenue Trend (7 Days)</h3>
                            <div className="h-48">
                                <RevenueBarChart data={mockWeeklyTrend} />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <BusSchedule />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentActivity />

                    {/* Status Overview */}
                    <div className="bg-bg-secondary rounded-lg shadow-md p-6 border border-border">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CheckCircleIcon className="h-5 w-5 text-success" />
                                    <span className="text-success font-medium">Booking System</span>
                                </div>
                                <span className="text-success text-sm">Operational</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CheckCircleIcon className="h-5 w-5 text-success" />
                                    <span className="text-success font-medium">Payment System</span>
                                </div>
                                <span className="text-success text-sm">Operational</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
                                    <span className="text-warning font-medium">SMS Notifications</span>
                                </div>
                                <span className="text-warning text-sm">Minor Delay</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CheckCircleIcon className="h-5 w-5 text-success" />
                                    <span className="text-success font-medium">Bus Tracking</span>
                                </div>
                                <span className="text-success text-sm">Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
