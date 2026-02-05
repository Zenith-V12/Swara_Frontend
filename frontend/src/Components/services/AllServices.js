'use client';

import { useState, useEffect } from 'react';
import { List, Plus, Check, X, Edit2, IndianRupee, Clock } from 'lucide-react';
import { getAllServices, createService, updateService, toggleServiceActivation } from '../../services/backendServices/services';
import NewServicePopUp from './newServicePopUp';

export default function AllServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [updatingService, setUpdatingService] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({
        title: '',
        description: '',
        duration_mins: '',
        price: '',
        category: ''
    });

    // Fetch services on component mount
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAllServices();
            console.log('📦 Services Response:', response);
            
            // Filter out services with category "Limited Time Offers"
            const filteredServices = (response.data || []).filter(
                service => service.category !== 'Limited Time Offers'
            );
            
            setServices(filteredServices);
        } catch (err) {
            console.error('❌ Error fetching services:', err);
            setError(err.message || 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit mode
    const handleEditClick = (service) => {
        setEditingService({
            _id: service._id,
            title: service.title,
            description: service.description,
            duration_mins: service.duration_mins,
            price: service.price
        });
    };

    const handleEditChange = (field, value) => {
        setEditingService({
            ...editingService,
            [field]: value
        });
    };

    const handleEditSave = async (serviceId) => {
        setUpdatingService(serviceId);
        try {
            await updateService(serviceId, {
                title: editingService.title,
                description: editingService.description,
                duration_mins: parseInt(editingService.duration_mins),
                price: parseFloat(editingService.price)
            });

            // Update local state
            setServices(services.map(service =>
                service._id === serviceId ? { ...service, ...editingService } : service
            ));

            setEditingService(null);
            console.log('✅ Service updated successfully');
        } catch (error) {
            console.error('❌ Error updating service:', error);
            alert('Failed to update service: ' + error.message);
        } finally {
            setUpdatingService(null);
        }
    };

    const handleEditCancel = () => {
        setEditingService(null);
    };

    // Handle toggle activation
    const handleToggleActivation = async (serviceId, currentStatus) => {
        setUpdatingService(serviceId);
        try {
            await toggleServiceActivation(serviceId, !currentStatus);

            // Update local state
            setServices(services.map(service =>
                service._id === serviceId ? { ...service, isActive: !currentStatus } : service
            ));

            console.log(`✅ Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('❌ Error toggling service activation:', error);
            alert('Failed to toggle service activation: ' + error.message);
        } finally {
            setUpdatingService(null);
        }
    };

    // Handle add new service
    const handleAddChange = (field, value) => {
        setNewService({
            ...newService,
            [field]: value
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setUpdatingService('new');

        try {
            const response = await createService({
                title: newService.title,
                description: newService.description,
                duration_mins: parseInt(newService.duration_mins),
                price: parseFloat(newService.price),
                category: newService.category
            });

            setServices([response.data, ...services]);
            setNewService({ title: '', description: '', duration_mins: '', price: '', category: '' });
            setShowAddForm(false);
            console.log('✅ Service created successfully');
        } catch (error) {
            console.error('❌ Error creating service:', error);
            alert('Failed to create service: ' + error.message);
        } finally {
            setUpdatingService(null);
        }
    };

    const handleAddCancel = () => {
        setNewService({ title: '', description: '', duration_mins: '', price: '', category: '' });
        setShowAddForm(false);
    };

    return (
        <div className="p-6 bg-black min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <List className="w-8 h-8" />
                            All Services
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Service
                    </button>
                </div>

                {/* Add New Service Modal */}
                <NewServicePopUp
                    isOpen={showAddForm}
                    onClose={handleAddCancel}
                    onSubmit={handleAddSubmit}
                    newService={newService}
                    onServiceChange={handleAddChange}
                    isCreating={updatingService === 'new'}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-900 border border-red-800 rounded-2xl p-6 text-center">
                        <p className="text-red-300 text-lg">❌ {error}</p>
                        <button
                            onClick={fetchServices}
                            className="mt-4 px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Services List */}
                {!loading && !error && (
                    <>
                        {/* Stats */}
                        <div className="bg-gray-900 rounded-xl shadow-lg p-4 mb-6 border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Total Services</p>
                                    <p className="text-2xl font-bold text-white">{services.length}</p>
                                </div>
                                <List className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        {/* Services Grid */}
                        {services.length === 0 ? (
                            <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-2xl font-semibold text-white mb-2">
                                    No Services Found
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Get started by adding your first service
                                </p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Service
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => {
                                    const isEditing = editingService?._id === service._id;
                                    const isUpdating = updatingService === service._id;

                                    return (
                                        <div
                                            key={service._id}
                                            className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
                                        >
                                            {isEditing ? (
                                                // Edit Mode
                                                <div className="p-6 space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editingService.title}
                                                        onChange={(e) => handleEditChange('title', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-lg font-semibold"
                                                        disabled={isUpdating}
                                                    />
                                                    <textarea
                                                        value={editingService.description}
                                                        onChange={(e) => handleEditChange('description', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                                        rows="3"
                                                        disabled={isUpdating}
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Duration (mins)</label>
                                                            <input
                                                                type="number"
                                                                value={editingService.duration_mins}
                                                                onChange={(e) => handleEditChange('duration_mins', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                                                min="1"
                                                                disabled={isUpdating}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Price (₹)</label>
                                                            <input
                                                                type="number"
                                                                value={editingService.price}
                                                                onChange={(e) => handleEditChange('price', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                                                                min="0"
                                                                step="0.01"
                                                                disabled={isUpdating}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleEditSave(service._id)}
                                                            disabled={isUpdating}
                                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {isUpdating ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={handleEditCancel}
                                                            disabled={isUpdating}
                                                            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode
                                                <>
                                                    <div className="p-6">
                                                        <h3 className="text-xl font-bold text-white mb-2">
                                                            {service.title}
                                                        </h3>
                                                        <p className="text-gray-400 text-sm mb-4">
                                                            {service.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="flex items-center gap-2 text-gray-300">
                                                                <Clock className="w-4 h-4" />
                                                                <span className="text-sm">{service.duration_mins} mins</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-green-400 font-semibold">
                                                                <IndianRupee className="w-4 h-4" />
                                                                <span>{service.price}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-800 px-6 py-3 flex gap-2 items-center justify-between">
                                                        <button
                                                            onClick={() => handleEditClick(service)}
                                                            disabled={isUpdating}
                                                            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-medium ${service.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                                                {service.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <button
                                                                onClick={() => handleToggleActivation(service._id, service.isActive)}
                                                                disabled={isUpdating}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 ${service.isActive ? 'bg-green-600' : 'bg-gray-600'
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${service.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}