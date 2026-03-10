interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const colorClasses = {
    blue: {
        bg: 'bg-info-light',
        icon: 'text-info',
        border: 'border-info'
    },
    green: {
        bg: 'bg-success-light',
        icon: 'text-success',
        border: 'border-success'
    },
    yellow: {
        bg: 'bg-warning-light',
        icon: 'text-warning',
        border: 'border-warning'
    },
    purple: {
        bg: 'bg-purple-900/20',
        icon: 'text-purple-400',
        border: 'border-purple-500/30'
    },
    red: {
        bg: 'bg-error-light',
        icon: 'text-error',
        border: 'border-error'
    }
};

export default function StatsCard({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    trend
}: StatsCardProps) {
    const colors = colorClasses[color];

    return (
        <div className={`bg-bg-secondary rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-border relative overflow-hidden group`}>
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-text-primary tracking-tight">{value}</p>
                        {trend && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend.isPositive ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}%
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-text-tertiary mt-2 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`${colors.bg} rounded-2xl p-4 shadow-inner ring-1 ring-white/20`}>
                    <Icon className={`h-7 w-7 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
}
