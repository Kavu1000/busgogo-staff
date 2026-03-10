'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    TicketIcon,
    TruckIcon,
    ChartBarIcon,
    UsersIcon,
    Cog6ToothIcon,
    BellIcon,
    ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    DocumentChartBarIcon,
    QrCodeIcon,
} from '@heroicons/react/24/outline';

/* ── Nav Items (all in Lao) ───────────────────────────────────────── */
const navigation = [
    {
        group: null,
        items: [
            { name: 'ແຕ່ງວດລວມ', href: '/', icon: HomeIcon },
        ]
    },
    {
        group: 'ການຈັດການລົດໂດຍສານ',
        items: [
            { name: 'ເຊັກອິນ / ເຊັກເອົາ', href: '/checkin', icon: QrCodeIcon },
            { name: 'ສະຖານະລົດໂດຍສານ', href: '/buses', icon: TruckIcon },
            { name: 'ຕາຕະລາງການເດີນທາງ', href: '/schedules', icon: CalendarDaysIcon },
        ]
    },
    {
        group: 'ຜູ້ໃຊ້ ແລະ ການສື່ສານ',
        items: [
            { name: 'ຈັດການຜູ້ໂດຍສານ', href: '/passengers', icon: UsersIcon },
            { name: 'ການແຈ້ງເຕືອນ', href: '/notifications', icon: BellIcon },
            { name: 'ລາຍງານ & ທັດສະຫວາ', href: '/driver-reports', icon: ChatBubbleLeftRightIcon },
        ]
    },
    {
        group: 'ສະຖິຕິ & ລາຍງານ',
        items: [
            { name: 'ປ້ອນທ້ວງການ', href: '/activities', icon: ClipboardDocumentListIcon },
            { name: 'ລາຍງານ & ສະຖິຕິ', href: '/reports', icon: DocumentChartBarIcon },
        ]
    },
    {
        group: 'ລະບົບ',
        items: [
            { name: 'ຕັ້ງຄ່າ', href: '/settings', icon: Cog6ToothIcon },
        ]
    },
];

/* ── Component ────────────────────────────────────────────────────── */
export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div
            className={`bg-bg-secondary border-r border-border shadow-lg transition-all duration-300 flex-shrink-0 ${isCollapsed ? 'w-16' : 'w-64'
                }`}
            style={{ minHeight: '100vh' }}
        >
            <div className="flex flex-col h-full">

                {/* ── Logo ── */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">BS</span>
                            </div>
                            <div>
                                <span className="font-bold text-text-primary text-sm leading-tight block">ສະຖານີລົດໄຟ</span>
                                <span className="text-text-tertiary text-[10px]">Admin Panel</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-secondary transition-colors flex-shrink-0"
                        title={isCollapsed ? 'ຂະຫຍາຍ' : 'ຫຍໍ້'}
                    >
                        {isCollapsed
                            ? <ChevronRightIcon className="h-4 w-4" />
                            : <ChevronLeftIcon className="h-4 w-4" />
                        }
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    {navigation.map((section) => (
                        <div key={section.group ?? 'main'} className="mb-2">
                            {/* Group label */}
                            {section.group && !isCollapsed && (
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary px-3 mb-1 mt-3">
                                    {section.group}
                                </p>
                            )}
                            {section.group && isCollapsed && (
                                <div className="border-t border-border mx-2 my-2" />
                            )}

                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                title={isCollapsed ? item.name : undefined}
                                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${isActive
                                                    ? 'bg-primary-light text-primary'
                                                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                                    }`}
                                            >
                                                {/* Active indicator */}
                                                {isActive && (
                                                    <span className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full -ml-2" />
                                                )}
                                                <Icon
                                                    className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-primary'
                                                        }`}
                                                />
                                                {!isCollapsed && (
                                                    <span className="ml-3 truncate">{item.name}</span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* ── Station Info ── */}
                {!isCollapsed && (
                    <div className="px-4 py-3 border-t border-border">
                        <div className="bg-bg-tertiary rounded-lg p-3 border border-border">
                            <h4 className="text-xs font-semibold text-text-primary mb-0.5">ສະຖານີປັດຈຸບັນ</h4>
                            <p className="text-[11px] text-text-secondary">ໂຮງລົດໄຟ ວຽງຈັນ</p>
                            <p className="text-[11px] text-text-secondary">ວຽງຈັນ, ລາວ</p>
                        </div>
                    </div>
                )}

                {/* ── Logout ── */}
                <div className="px-2 py-3 border-t border-border">
                    <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-error hover:bg-error-light rounded-lg transition-colors group">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                            <span className="ml-3">ອອກຈາກລະບົບ</span>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
