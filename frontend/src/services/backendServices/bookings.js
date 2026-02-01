import { get, post, put, del } from '../../utils/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANTID;

/**
 * Booking Service
 * Handles all booking-related API calls
 */

/**
 * Get all bookings for the tenant
 * @param {object} filters - Optional filters (status, date, userPhone, startDate, endDate)
 * @returns {Promise<object>} - Bookings data
 */
export const getAllBookings = async (filters = {}) => {
    try {
        const params = {
            tenantId: TENANT_ID,
            ...filters,
        };

        console.log('🔑 Using Tenant ID:', TENANT_ID);
        console.log('📤 API Request params:', params);
        console.log('🌐 API URL:', '/api/bookings');

        const response = await get('/api/bookings', params);

        console.log('✅ API Response received:', response);

        return response;
    } catch (error) {
        console.error('❌ Error in getAllBookings:', error);
        throw error;
    }
};

/**
 * Get a single booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object>} - Booking data
 */
export const getBookingById = async (bookingId) => {
    try {
        const response = await get(`/api/bookings/${bookingId}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

/**
 * Create a new booking
 * @param {object} bookingData - Booking details
 * @returns {Promise<object>} - Created booking
 */
export const createBooking = async (bookingData) => {
    try {
        const response = await post('/api/bookings', {
            tenantId: TENANT_ID,
            ...bookingData,
        });
        return response;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

/**
 * Update a booking
 * @param {string} bookingId - Booking ID
 * @param {object} updateData - Updated booking details
 * @returns {Promise<object>} - Updated booking
 */
export const updateBooking = async (bookingId, updateData) => {
    try {
        const response = await put(`/api/bookings/${bookingId}`, {
            tenantId: TENANT_ID,
            ...updateData,
        });
        return response;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

/**
 * Cancel a booking (soft delete)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object>} - Cancelled booking
 */
export const cancelBooking = async (bookingId) => {
    try {
        const response = await del(`/api/bookings/${bookingId}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
    }
};

/**
 * Permanently delete a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object>} - Deleted booking
 */
export const deleteBooking = async (bookingId) => {
    try {
        const response = await del(`/api/bookings/${bookingId}`, {
            tenantId: TENANT_ID,
            permanent: 'true',
        });
        return response;
    } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
    }
};

/**
 * Check slot availability
 * @param {object} slotData - { date, startTime, endTime }
 * @returns {Promise<object>} - Availability status
 */
export const checkSlotAvailability = async ({ date, startTime, endTime }) => {
    try {
        const response = await get('/api/bookings/availability/check', {
            tenantId: TENANT_ID,
            date,
            startTime,
            endTime,
        });
        return response;
    } catch (error) {
        console.error('Error checking availability:', error);
        throw error;
    }
};

/**
 * Get bookings by user phone
 * @param {string} userPhone - User's phone number
 * @returns {Promise<object>} - User's bookings
 */
export const getBookingsByPhone = async (userPhone) => {
    try {
        const response = await getAllBookings({ userPhone });
        return response;
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
    }
};

/**
 * Get bookings by date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object>} - Bookings for the date
 */
export const getBookingsByDate = async (date) => {
    try {
        const response = await getAllBookings({ date });
        return response;
    } catch (error) {
        console.error('Error fetching bookings by date:', error);
        throw error;
    }
};

/**
 * Get bookings by status
 * @param {string} status - Booking status (confirmed, pending, cancelled, etc.)
 * @returns {Promise<object>} - Bookings with the status
 */
export const getBookingsByStatus = async (status) => {
    try {
        const response = await getAllBookings({ status });
        return response;
    } catch (error) {
        console.error('Error fetching bookings by status:', error);
        throw error;
    }
};

/**
 * Get bookings by service-for name (customer name)
 * @param {string} name - Customer name to search for
 * @returns {Promise<object>} - Bookings for the customer
 */
export const getBookingsByServiceFor = async (name) => {
    try {
        const response = await get(`/api/bookings/service-for/${encodeURIComponent(name)}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error fetching bookings by service-for:', error);
        throw error;
    }
};
