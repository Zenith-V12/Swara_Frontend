'use client';

import { useState, use, useEffect } from 'react';
import { CalendarPlus, List, Clock, TicketPercent } from 'lucide-react';
import AllBookings from '@/Components/bookings/AllBookings';
import AllServices from '@/Components/services/AllServices';
import DailySchedule from '@/Components/timings/workingHours';
import Offers from '@/Components/offersAndMarketing/Offers';
import { validateTenantId } from '@/services/backendServices/client';

export default function Dashboard({ params }) {
    const { tenantId } = use(params);
    const [activeTab, setActiveTab] = useState('bookings');
    const [isValidating, setIsValidating] = useState(true);
    const [isValidTenant, setIsValidTenant] = useState(false);

    // Validate tenant ID on mount
    useEffect(() => {
        const checkTenant = async () => {
            try {
                console.log('🔍 Validating tenant ID:', tenantId);
                const isValid = await validateTenantId(tenantId);
                console.log('✅ Tenant validation result:', isValid);
                setIsValidTenant(isValid);
            } catch (error) {
                console.error('❌ Error validating tenant:', error);
                setIsValidTenant(false);
            } finally {
                setIsValidating(false);
            }
        };

        checkTenant();
    }, [tenantId]);

    const tabs = [
        {
            id: 'bookings',
            label: 'Bookings',
            icon: CalendarPlus,
            component: AllBookings,
        },
        {
            id: 'services',
            label: 'Services',
            icon: List,
            component: AllServices,
        },
        {
            id: 'timings',
            label: 'Timings',
            icon: Clock,
            component: DailySchedule,
        },
        {
            id: 'offers',
            label: 'Offers',
            icon: TicketPercent,
            component: Offers,
        },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    // Loading state
    if (isValidating) {
        return (
            <div className="flex h-screen bg-black items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Validating Tenant ID...</p>
                    <p className="text-gray-400 text-sm mt-2">{tenantId}</p>
                </div>
            </div>
        );
    }

    // Invalid tenant error state
    if (!isValidTenant) {
        return (
            <div className="flex h-screen bg-black items-center justify-center">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-red-900 border-2 border-red-700 rounded-2xl p-8 text-center">
                        <div className="text-6xl mb-4">🚫</div>
                        <h1 className="text-3xl font-bold text-white mb-3">
                            Invalid Tenant ID
                        </h1>
                        <p className="text-red-200 mb-4">
                            The tenant ID you're trying to access does not exist or is invalid.
                        </p>
                        <div className="bg-red-950 rounded-lg p-3 mb-6">
                            <p className="text-xs text-red-300 mb-1">Tenant ID</p>
                            <p className="text-sm font-mono font-semibold text-white">
                                {tenantId}
                            </p>
                        </div>
                        <p className="text-red-300 text-sm">
                            Please check the URL and try again, or contact support if you believe this is an error.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Valid tenant - show dashboard
    return (
        <div className="flex h-screen bg-black">
            {/* Vertical Navbar */}
            <aside className="w-64 bg-gray-900 shadow-2xl flex flex-col border-r border-gray-800">
                {/* Logo/Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        {/* Logo Placeholder */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 flex items-center justify-center flex-shrink-0">
                            {/* User can add image here later */}
                            <div className="text-gray-400 text-xs font-semibold">LOGO</div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                Swara Beauty Saloon
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-1">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-200 font-medium text-sm
                                    ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-md'
                                        : 'text-gray-300 hover:bg-gray-800'
                                    }
                                `}
                            >
                                <IconComponent className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800">
                    <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Admin ID</p>
                        <p className="text-xs font-mono font-semibold text-white truncate">
                            {tenantId}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-black">
                {/* Tab Content with Animation */}
                <div className="animate-fadeIn">
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </main>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}