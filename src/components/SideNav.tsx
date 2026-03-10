'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Bus,
    Calendar,
    ClipboardList,
    Settings,
    LogOut,
    Ticket,
    BarChart3
} from 'lucide-react';

const SideNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { path: '/', label: 'ໜ້າຫຼັກ (Dashboard)', icon: LayoutDashboard },
        { path: '/bus-schedule', label: 'ຕາຕະລາງເດີນລົດ', icon: Calendar },
        { path: '/bus-management', label: 'ຈັດການລົດເມ', icon: Bus },
        { path: '/passenger-management', label: 'ຈັດການຜູ້ໂດຍສານ', icon: Users },
        { path: '/check-in-out', label: 'ລະບົບ Check-in/out', icon: Ticket },
        { path: '/report', label: 'ລາຍງານ', icon: BarChart3 },
        { path: '/setting', label: 'ຕັ້ງຄ່າ', icon: Settings },
    ];

    const handleLogout = () => {
        // Implement logout logic here
        router.push('/login');
    };

    return (
        <div className="w-64 bg-bg-secondary shadow-lg flex flex-col h-full border-r border-border">
            {/* Logo */}
            <div className="p-8 border-b border-border flex flex-col items-center">
                <div className="h-14 w-14 bg-gradient-to-br from-primary to-blue-700 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform hover:rotate-3 transition-transform">
                    <Bus className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-text-primary">Easy<span className="text-primary italic">Bus</span></h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary mt-1 font-bold">Station Manager</p>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-8">
                <ul className="space-y-2 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`flex items-center px-5 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-blue-50 text-primary shadow-sm ring-1 ring-blue-100'
                                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                        }`}
                                >
                                    {isActive && (
                                        <span className="absolute left-1 w-1.5 h-6 bg-primary rounded-full" />
                                    )}
                                    <Icon className={`h-5 w-5 mr-4 transition-colors ${isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-primary'}`} />
                                    <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-error hover:bg-error-light rounded-lg transition-colors"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    ອອກຈາກລະບົບ
                </button>
            </div>
        </div>
    );
};

export default SideNav;
