'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Calendar, Clock, IndianRupee, Edit2, X, Check } from 'lucide-react';
import { getAllServices, createService, updateService, toggleServiceActivation } from '../../services/backendServices/services';
import NewOfferPopUp from './newOfferPopUp';

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [updatingOffer, setUpdatingOffer] = useState(null);
    const [newOffer, setNewOffer] = useState({
        title: '',
        description: '',
        duration_mins: '',
        price: '',
        end_date: ''
    });

    // Fetch offers on component mount
    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAllServices();
            console.log('📦 All Services Response:', response);
            
            // Filter only services with category "Limited Time Offers"
            const limitedTimeOffers = (response.data || []).filter(
                service => service.category === 'Limited Time Offers'
            );
            
            setOffers(limitedTimeOffers);
        } catch (err) {
            console.error('❌ Error fetching offers:', err);
            setError(err.message || 'Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const handleOfferChange = (field, value) => {
        setNewOffer({
            ...newOffer,
            [field]: value
        });
    };

    const handleAddOffer = async (e) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            const offerData = {
                title: newOffer.title,
                description: newOffer.description,
                duration_mins: parseInt(newOffer.duration_mins),
                price: parseFloat(newOffer.price),
                category: 'Limited Time Offers', // Hidden from user, always set to this
                start_date: today,
                end_date: newOffer.end_date
            };

            await createService(offerData);
            
            // Refresh offers list
            await fetchOffers();
            
            // Reset form and close
            setNewOffer({
                title: '',
                description: '',
                duration_mins: '',
                price: '',
                end_date: ''
            });
            setShowAddForm(false);
            
            console.log('✅ Offer created successfully');
        } catch (error) {
            console.error('❌ Error creating offer:', error);
            alert('Failed to create offer: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditClick = (offer) => {
        setEditingOffer({
            _id: offer._id,
            title: offer.title,
            description: offer.description,
            duration_mins: offer.duration_mins,
            price: offer.price
        });
    };

    const handleEditChange = (field, value) => {
        setEditingOffer({
            ...editingOffer,
            [field]: value
        });
    };

    const handleEditSave = async (offerId) => {
        setUpdatingOffer(offerId);
        try {
            await updateService(offerId, {
                title: editingOffer.title,
                description: editingOffer.description,
                duration_mins: parseInt(editingOffer.duration_mins),
                price: parseFloat(editingOffer.price),
                category: 'Limited Time Offers' // Ensure category remains the same
            });

            // Update local state
            setOffers(offers.map(offer =>
                offer._id === offerId ? { ...offer, ...editingOffer } : offer
            ));

            setEditingOffer(null);
            console.log('✅ Offer updated successfully');
        } catch (error) {
            console.error('❌ Error updating offer:', error);
            alert('Failed to update offer: ' + error.message);
        } finally {
            setUpdatingOffer(null);
        }
    };

    const handleEditCancel = () => {
        setEditingOffer(null);
    };

    const handleToggleActivation = async (offerId, currentStatus) => {
        setUpdatingOffer(offerId);
        try {
            await toggleServiceActivation(offerId, !currentStatus);

            // Update local state
            setOffers(offers.map(offer =>
                offer._id === offerId ? { ...offer, isActive: !currentStatus } : offer
            ));

            console.log('✅ Offer activation toggled successfully');
        } catch (error) {
            console.error('❌ Error toggling offer activation:', error);
            alert('Failed to toggle offer: ' + error.message);
        } finally {
            setUpdatingOffer(null);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No expiry';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Check if offer is expired
    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date();
    };

    return (
        <div className="p-6 bg-black min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Offers & Marketing
                        </h1>
                        <p className="text-gray-400">
                            Create and manage promotional offers
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Offer
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-gray-400">Loading offers...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 mb-6">
                        <p className="text-red-400">Error: {error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && offers.length === 0 && (
                    <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
                        <div className="text-6xl mb-4">🎁</div>
                        <h3 className="text-2xl font-semibold text-white mb-2">
                            No Offers Yet
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Create your first promotional offer to attract customers
                        </p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Offer
                        </button>
                    </div>
                )}

                {/* Offers Grid */}
                {!loading && !error && offers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map((offer) => {
                            const isEditing = editingOffer?._id === offer._id;
                            const isUpdating = updatingOffer === offer._id;
                            const expired = isExpired(offer.end_date);

                            return (
                                <div
                                    key={offer._id}
                                    className={`bg-gray-900 rounded-2xl border p-6 transition-all ${
                                        expired
                                            ? 'border-red-800/50 opacity-60'
                                            : offer.isActive
                                            ? 'border-green-800/50'
                                            : 'border-gray-800'
                                    }`}
                                >
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                expired
                                                    ? 'bg-red-900/30 text-red-400'
                                                    : offer.isActive
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : 'bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            {expired ? 'Expired' : offer.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <div className="flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEditSave(offer._id)}
                                                        disabled={isUpdating}
                                                        className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Save"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleEditCancel}
                                                        disabled={isUpdating}
                                                        className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(offer)}
                                                    className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editingOffer.title}
                                            onChange={(e) => handleEditChange('title', e.target.value)}
                                            className="w-full mb-3 px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-xl font-bold"
                                        />
                                    ) : (
                                        <h3 className="text-xl font-bold text-white mb-3">
                                            {offer.title}
                                        </h3>
                                    )}

                                    {/* Description */}
                                    {isEditing ? (
                                        <textarea
                                            value={editingOffer.description}
                                            onChange={(e) => handleEditChange('description', e.target.value)}
                                            className="w-full mb-4 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg resize-none"
                                            rows="2"
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {offer.description}
                                        </p>
                                    )}

                                    {/* Price and Duration */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-gray-500" />
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editingOffer.price}
                                                    onChange={(e) => handleEditChange('price', e.target.value)}
                                                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 text-white rounded"
                                                    min="0"
                                                />
                                            ) : (
                                                <span className="text-white font-semibold">₹{offer.price}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editingOffer.duration_mins}
                                                    onChange={(e) => handleEditChange('duration_mins', e.target.value)}
                                                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 text-white rounded"
                                                    min="1"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-sm">{offer.duration_mins} mins</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Validity */}
                                    {offer.end_date && (
                                        <div className="flex items-center gap-2 mb-4 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className={expired ? 'text-red-400' : 'text-gray-400'}>
                                                Valid until {formatDate(offer.end_date)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Toggle Active/Inactive */}
                                    {!isEditing && !expired && (
                                        <button
                                            onClick={() => handleToggleActivation(offer._id, offer.isActive)}
                                            disabled={isUpdating}
                                            className={`w-full py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                                                offer.isActive
                                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                            }`}
                                        >
                                            {isUpdating ? 'Updating...' : offer.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Add Offer Popup */}
                <NewOfferPopUp
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onSubmit={handleAddOffer}
                    newOffer={newOffer}
                    onOfferChange={handleOfferChange}
                    isCreating={isCreating}
                />
            </div>
        </div>
    );
}