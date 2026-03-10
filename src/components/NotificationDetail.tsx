'use client';

import { useRouter } from 'next/navigation';
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
    ClockIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

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

interface NotificationDetailProps {
    notification: Notification;
    onClose: () => void;
}

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
            return {
                icon: 'text-yellow-600',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200'
            };
        case 'info':
            return {
                icon: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200'
            };
        case 'success':
            return {
                icon: 'text-green-600',
                bg: 'bg-green-50',
                border: 'border-green-200'
            };
        case 'error':
            return {
                icon: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200'
            };
        default:
            return {
                icon: 'text-text-secondary',
                bg: 'bg-bg-tertiary',
                border: 'border-border'
            };
    }
};

export default function NotificationDetail({ notification, onClose }: NotificationDetailProps) {
    const router = useRouter();
    const Icon = getNotificationIcon(notification.type);
    const colors = getNotificationColor(notification.type);

    const handleActionClick = (actionFn: () => void) => {
        actionFn();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${colors.border} ${colors.bg}`}>
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-bg-secondary ${colors.icon}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-text-primary">{notification.title}</h2>
                            <div className="flex items-center text-sm text-text-tertiary mt-1">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {notification.time}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-tertiary hover:text-text-secondary p-1"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="prose max-w-none">
                        <p className="text-text-secondary text-base leading-relaxed mb-4">
                            {notification.message}
                        </p>

                        {notification.details && (
                            <div className="bg-bg-tertiary border border-border rounded-lg p-4 mb-4">
                                <h3 className="font-semibold text-text-primary mb-2">Additional Details</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {notification.details}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {notification.actions && notification.actions.length > 0 && (
                        <div className="border-t border-border pt-4 mt-6">
                            <h3 className="font-semibold text-text-primary mb-3">Actions</h3>
                            <div className="space-y-2">
                                {notification.actions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleActionClick(action.action)}
                                        className="w-full flex items-center justify-between p-3 bg-bg-tertiary hover:bg-bg-elevated rounded-lg transition-colors text-left"
                                    >
                                        <span className="font-medium text-text-primary">{action.label}</span>
                                        <ArrowRightIcon className="h-4 w-4 text-text-tertiary" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-bg-tertiary rounded-b-lg flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-secondary border border-border rounded-md hover:bg-bg-tertiary"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            router.push('/notifications');
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                        View All Notifications
                    </button>
                </div>
            </div>
        </div>
    );
}
