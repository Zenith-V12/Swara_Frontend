'use client';

import { useState, use, useEffect } from 'react';
import AllBookings from '@/Components/bookings/AllBookings';
import AllServices from '@/Components/services/AllServices';
import DailySchedule from '@/Components/timings/dailySchedule';
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
            icon: '📅',
            component: AllBookings,
        },
        {
            id: 'services',
            label: 'Services',
            icon: '💅',
            component: AllServices,
        },
        {
            id: 'timings',
            label: 'Timings',
            icon: '⏰',
            component: DailySchedule,
        },
        {
            id: 'offers',
            label: 'Offers',
            icon: '🎁',
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
                <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800 to-gray-900">
                    <h1 className="text-2xl font-bold text-white mb-1">
                        Swara Beauty
                    </h1>
                    <p className="text-sm text-gray-400">
                        Dashboard
                    </p>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3 rounded-xl
                                transition-all duration-300 font-medium
                                ${activeTab === tab.id
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-102'
                                }
                            `}
                        >
                            <span className="text-2xl">{tab.icon}</span>
                            <span className="text-lg">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800">
                    <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Tenant ID</p>
                        <p className="text-sm font-mono font-semibold text-white">
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