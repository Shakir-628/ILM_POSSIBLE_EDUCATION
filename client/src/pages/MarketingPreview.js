import React from 'react';
import {
    AcademicCapIcon,
    UserGroupIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CalendarIcon,
    TruckIcon,
    ClockIcon,
    PresentationChartLineIcon,
    MegaphoneIcon,
    QrCodeIcon,
    PhoneIcon,
    GlobeAltIcon,
    MapPinIcon,
    DocumentChartBarIcon,
    Cog6ToothIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PKRIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <text x="1" y="18" className="font-black text-[12px]" fill="currentColor" stroke="none">₨</text>
    </svg>
);

const MarketingPreview = () => {
    const wheelFeatures = [
        { title: "Time Table", icon: ClockIcon, colors: ["#00f2fe", "#4facfe"] }, // Blue Cyan
        { title: "Staff HR", icon: UserGroupIcon, colors: ["#43e97b", "#38f9d7"] }, // Green
        { title: "Fee Management", icon: PKRIcon, colors: ["#667eea", "#764ba2"] }, // Purple
        { title: "Attendance", icon: ClipboardDocumentCheckIcon, colors: ["#f6d365", "#fda085"] }, // Sunset
        { title: "Grades", icon: AcademicCapIcon, colors: ["#ff0844", "#ffb199"] }, // Red Pink
        { title: "Analytics", icon: PresentationChartLineIcon, colors: ["#fa709a", "#fee140"] }, // Pink Yellow
        { title: "Transport", icon: TruckIcon, colors: ["#243949", "#517fa4"] }, // Steel
        { title: "Dashboards", icon: ChartBarIcon, colors: ["#4facfe", "#00f2fe"] }, // Sky
        { title: "QR Certs", icon: QrCodeIcon, colors: ["#b721ff", "#21d4fd"] }, // Violet Cyan
        { title: "Library", icon: BookOpenIcon, colors: ["#f093fb", "#f5576c"] }, // Pink Purple
        { title: "Reports", icon: DocumentChartBarIcon, colors: ["#5ee7df", "#b490ca"] }, // Teal Mist
        { title: "Settings", icon: Cog6ToothIcon, colors: ["#30cfd0", "#330867"] }, // Deep Sea
    ];

    // SVG calculation helpers
    const radius = 380;
    const innerRadius = 180;
    const center = 500;

    const getArcPath = (startAngle, endAngle) => {
        const startOuter = polarToCartesian(center, center, radius, endAngle);
        const endOuter = polarToCartesian(center, center, radius, startAngle);
        const startInner = polarToCartesian(center, center, innerRadius, endAngle);
        const endInner = polarToCartesian(center, center, innerRadius, startAngle);

        return [
            "M", startOuter.x, startOuter.y,
            "A", radius, radius, 0, 0, 0, endOuter.x, endOuter.y,
            "L", endInner.x, endInner.y,
            "A", innerRadius, innerRadius, 0, 0, 1, startInner.x, startInner.y,
            "Z"
        ].join(" ");
    };

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 font-sans">
            {/* Primary Container */}
            <div className="relative w-full max-w-[1000px] aspect-square bg-white shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[4rem] overflow-hidden p-10 border border-gray-100">

                {/* Background Tech Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Main Hub Branding */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 text-center">
                    <div className="bg-white border-b-8 border-indigo-900 rounded-[3rem] px-16 py-4 shadow-2xl scale-110">
                        <h2 className="text-4xl font-black text-indigo-950 uppercase tracking-tighter leading-none">
                            ILM <span className="text-red-600 italic font-black">POSSIBLE</span>
                        </h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-[.4em] mt-1 ml-2">Smart Management</p>
                    </div>
                </div>

                {/* The Wheel Visual */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 1000 1000" className="w-[95%] h-[95%] drop-shadow-2xl">
                        <defs>
                            {wheelFeatures.map((f, i) => (
                                <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={f.colors[0]} />
                                    <stop offset="100%" stopColor={f.colors[1]} />
                                </linearGradient>
                            ))}
                        </defs>

                        {wheelFeatures.map((f, i) => {
                            const startAngle = i * (360 / 12);
                            const endAngle = (i + 1) * (360 / 12);
                            const midAngle = startAngle + (360 / 24);
                            const labelPos = polarToCartesian(center, center, radius * 0.75, midAngle);
                            const iconPos = polarToCartesian(center, center, radius * 0.55, midAngle);

                            return (
                                <g key={i} className="cursor-pointer">
                                    {/* Segment Block */}
                                    <path
                                        d={getArcPath(startAngle + 1, endAngle - 1)}
                                        fill={`url(#grad-${i})`}
                                    />

                                    {/* Feature Icon */}
                                    <foreignObject x={iconPos.x - 30} y={iconPos.y - 30} width="60" height="60">
                                        <div className="w-full h-full flex items-center justify-center text-white/50">
                                            <f.icon className="w-12 h-12" />
                                        </div>
                                    </foreignObject>

                                    {/* Feature Text Line */}
                                    <foreignObject x={labelPos.x - 75} y={labelPos.y - 25} width="150" height="50">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-white text-[16px] font-black uppercase text-center leading-[1.1] tracking-tighter drop-shadow-md">
                                                {f.title}
                                            </span>
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}

                        {/* Center Hub Glass Effect */}
                        <circle cx="500" cy="500" r="160" fill="white" className="shadow-inner" />
                        <circle cx="500" cy="500" r="150" fill="#0ea5e9" opacity="0.05" />
                    </svg>

                    {/* Central Logo Overlay */}
                    <div className="absolute inset-0 m-auto w-72 h-72 flex flex-col items-center justify-center z-20">
                        <div className="h-36 w-36 bg-white rounded-full p-6 shadow-glow mb-4 border-4 border-slate-50">
                            <img src="/logos/Logo_IP.png" alt="Center" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-center group">
                            <h2 className="text-3xl font-black text-indigo-900 leading-none">SCHOOL</h2>
                            <h2 className="text-4xl font-black text-red-600 leading-none tracking-[0.2em] bg-white px-3 mt-1">SYSTEM</h2>
                        </div>
                    </div>
                </div>

                {/* Modern Footer Branding */}
                <div className="absolute bottom-10 left-0 w-full h-20 flex items-center justify-between px-16 z-30">
                    <div className="flex items-center space-x-5">
                        <div className="h-12 w-12 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <PhoneIcon className="h-7 w-7" />
                        </div>
                        <div className="text-left">
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Call Now</p>
                            <p className="text-2xl font-black text-indigo-950 tracking-tight">+92 323 2207839</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="px-8 py-3 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-[.3em] shadow-2xl">
                            Enterprise Ready
                        </div>
                    </div>

                    <div className="flex items-center space-x-5">
                        <div className="text-right">
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Explore</p>
                            <p className="text-2xl font-black text-indigo-950 italic tracking-tight">www.ilmpossible.com</p>
                        </div>
                        <div className="h-12 w-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <GlobeAltIcon className="h-7 w-7" />
                        </div>
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-red-50 rounded-full blur-[100px] opacity-60"></div>
            </div>

            {/* Helper Instructions */}
            <div className="fixed top-8 right-8 text-black/30 text-[10px] font-black uppercase tracking-widest vertical-text pointer-events-none">
                Circular Ecosystem View • Pro Screenshot 1:1
            </div>
        </div>
    );
};

export default MarketingPreview;
