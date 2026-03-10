'use client';

import { useRouter } from 'next/navigation';
import {
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    UserIcon,
    TruckIcon
} from '@heroicons/react/24/outline';

interface Activity {
    id: string;
    type: 'checkin' | 'checkout' | 'delay' | 'issue' | 'arrival';
    title: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
}

const activities: Activity[] = [
    {
        id: '1',
        type: 'checkin',
        title: 'Passenger Check-In',
        description: 'Somsri Jaidee - Trip BKK-CNX 14:30',
        time: '2 minutes ago',
        status: 'success'
    },
    {
        id: '2',
        type: 'delay',
        title: 'Trip BKK-HDY Delayed',
        description: 'Approx. 15 minutes due to traffic',
        time: '5 minutes ago',
        status: 'warning'
    },
    {
        id: '3',
        type: 'arrival',
        title: 'Trip CNX-BKK Arrived',
        description: 'Bus No. 1234 has arrived at terminal',
        time: '8 minutes ago',
        status: 'info'
    },
    {
        id: '4',
        type: 'checkin',
        title: 'Passenger Check-In',
        description: 'Wichai Raksuk - Trip BKK-KKC 15:00',
        time: '12 minutes ago',
        status: 'success'
    },
    {
        id: '5',
        type: 'issue',
        title: 'Issue Reported',
        description: '2nd floor restroom is out of service',
        time: '15 minutes ago',
        status: 'error'
    },
    {
        id: '6',
        type: 'checkout',
        title: 'Bus Departed',
        description: 'Trip BKK-UBN 13:45 has departed',
        time: '20 minutes ago',
        status: 'info'
    }
];

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'checkin':
        case 'checkout':
            return UserIcon;
        case 'delay':
            return ClockIcon;
        case 'issue':
            return ExclamationTriangleIcon;
        case 'arrival':
            return TruckIcon;
        default:
            return CheckCircleIcon;
    }
};

const getStatusColor = (status: Activity['status']) => {
    switch (status) {
        case 'success':
            return 'bg-success-light text-success';
        case 'warning':
            return 'bg-warning-light text-warning';
        case 'error':
            return 'bg-error-light text-error';
        case 'info':
            return 'bg-info-light text-info';
        default:
            return 'bg-bg-elevated text-text-secondary';
    }
};

export default function RecentActivity() {
    const router = useRouter();

    const handleViewAllClick = () => {
        router.push('/activities');
    };

    return (
        <div className="bg-bg-secondary rounded-lg shadow-md p-6 border border-border h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
                <button
                    onClick={handleViewAllClick}
                    className="text-sm text-primary hover:text-primary-hover font-medium hover:underline"
                >
                    View All
                </button>
            </div>

            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {activities.map((activity, activityIdx) => {
                        const Icon = getActivityIcon(activity.type);
                        const statusColor = getStatusColor(activity.status);

                        return (
                            <li key={activity.id}>
                                <div className="relative pb-8">
                                    {activityIdx !== activities.length - 1 ? (
                                        <span
                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-bg-secondary ${statusColor}`}>
                                                <Icon className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                                                <p className="text-sm text-text-tertiary">{activity.description}</p>
                                            </div>
                                            <div className="whitespace-nowrap text-right text-sm text-text-tertiary">
                                                <time>{activity.time}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
