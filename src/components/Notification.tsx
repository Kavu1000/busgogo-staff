'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import NotificationDetail from './NotificationDetail';

interface Notification {
    id: string;
    type: 'warning' | 'info' | 'success' | 'error';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    details?: string;
    actions?: {
        label: string;
        action: () => void;
    }[];
}

const notifications: Notification[] = [
    {
        id: '1',
        type: 'warning',
        title: 'Trip BKK-HDY Delayed',
        message: 'Trip BKK-HDY-002 is delayed 15 minutes due to heavy traffic',
        time: '5 minutes ago',
        isRead: false,
        details: 'Trip BKK-HDY-002 originally scheduled at 14:30 is expected to depart approximately 15 minutes late due to traffic congestion on the main road. Passengers may wait at platform 3.',
        actions: [
            {
                label: 'View Trip Details',
                action: () => console.log('Navigate to bus details')
            },
            {
                label: 'Announce to Passengers',
                action: () => console.log('Make announcement')
            }
        ]
    },
    {
        id: '2',
        type: 'error',
        title: 'Restroom Issue Reported',
        message: '2nd floor restroom is out of service. Urgent repair needed.',
        time: '15 minutes ago',
        isRead: false,
        details: 'The women\'s restroom on the 2nd floor east wing has a plumbing issue and is currently out of service. Maintenance has been contacted and repair is expected to take 2-3 hours.',
        actions: [
            {
                label: 'Contact Maintenance Team',
                action: () => console.log('Contact maintenance team')
            },
            {
                label: 'Put Up Warning Sign',
                action: () => console.log('Put warning sign')
            }
        ]
    },
    {
        id: '3',
        type: 'info',
        title: 'Trip CNX-BKK Arrived',
        message: 'Bus No. 1234 has arrived. Passengers may disembark.',
        time: '8 minutes ago',
        isRead: true,
        details: 'Trip CNX-BKK-001, bus No. 1234, has arrived on time at platform 7. All 45 passengers may now disembark.',
        actions: [
            {
                label: 'Verify Passenger Count',
                action: () => console.log('Check passenger count')
            }
        ]
    },
    {
        id: '4',
        type: 'success',
        title: 'Payment System Restored',
        message: 'Payment system is back to normal operation after maintenance.',
        time: '1 hour ago',
        isRead: true,
        details: 'The electronic payment system that had issues this morning has been fully resolved. Credit/debit card and QR Code payments are now working normally.'
    }
];

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'warning':
            return ExclamationTriangleIcon;
        case 'info':
            return InformationCircleIcon;
        case 'success':
            return CheckCircleIcon;
        case 'error':
            return ExclamationTriangleIcon;
        default:
            return InformationCircleIcon;
    }
};

const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
        case 'warning':
            return 'text-yellow-600';
        case 'info':
            return 'text-blue-600';
        case 'success':
            return 'text-green-600';
        case 'error':
            return 'text-red-600';
        default:
            return 'text-text-secondary';
    }
};

interface NotificationsProps {
    onClose: () => void;
}

export default function Notifications({ onClose }: NotificationsProps) {
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
    };

    const handleViewAllNotifications = () => {
        router.push('/notifications');
        onClose();
    };

    return (
        <div className="absolute right-0 top-12 w-96 bg-bg-secondary rounded-lg shadow-lg border border-border z-50" ref={panelRef}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
                <button
                    onClick={onClose}
                    className="text-text-tertiary hover:text-text-secondary"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);

                    return (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-bg-tertiary transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 ${iconColor}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0">
                                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                                    <div className="flex items-center mt-2 text-xs text-text-tertiary">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {notification.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleViewAllNotifications}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                    View All Notifications
                </button>
            </div>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <NotificationDetail
                    notification={selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                />
            )}
        </div>
    );
}
