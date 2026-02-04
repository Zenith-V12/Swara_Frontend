import { get, post, put, del } from '../../utils/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANTID;

/**
 * Get all working hours for a tenant (with optional filters)
 * @param {object} filters - Optional filters (startDate, endDate, day)
 * @returns {Promise<object>} - Working hours list
 */
export const getAllWorkingHours = async (filters = {}) => {
    try {
        const params = {
            tenantId: TENANT_ID,
            ...filters,
        };
        const response = await get('/api/workinghours', params);
        return response;
    } catch (error) {
        console.error('Error fetching working hours:', error);
        throw error;
    }
};

/**
 * Get working hours by ID
 * @param {string} id - Working hours entry ID
 * @returns {Promise<object>} - Working hours entry
 */
export const getWorkingHoursById = async (id) => {
    try {
        const response = await get(`/api/workinghours/${id}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error fetching working hours by ID:', error);
        throw error;
    }
};

/**
 * Get working hours by date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<object>} - Working hours entry for the date
 */
export const getWorkingHoursByDate = async (date) => {
    try {
        const response = await get(`/api/workinghours/date/${date}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error fetching working hours by date:', error);
        throw error;
    }
};

/**
 * Create a new working hours entry
 * @param {object} workingHoursData - Working hours data
 * @returns {Promise<object>} - Created working hours entry
 */
export const createWorkingHours = async (workingHoursData) => {
    try {
        const response = await post('/api/workinghours', {
            tenantId: TENANT_ID,
            ...workingHoursData,
        });
        return response;
    } catch (error) {
        console.error('Error creating working hours:', error);
        throw error;
    }
};

/**
 * Create multiple working hours entries at once
 * @param {array} entries - Array of working hours entries
 * @returns {Promise<object>} - Created working hours entries
 */
export const createBulkWorkingHours = async (entries) => {
    try {
        const response = await post('/api/workinghours/bulk', {
            tenantId: TENANT_ID,
            entries,
        });
        return response;
    } catch (error) {
        console.error('Error creating bulk working hours:', error);
        throw error;
    }
};

/**
 * Update a working hours entry
 * @param {string} id - Working hours entry ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} - Updated working hours entry
 */
export const updateWorkingHours = async (id, updateData) => {
    try {
        const response = await put(`/api/workinghours/${id}`, {
            tenantId: TENANT_ID,
            ...updateData,
        });
        return response;
    } catch (error) {
        console.error('Error updating working hours:', error);
        throw error;
    }
};

/**
 * Delete a working hours entry
 * @param {string} id - Working hours entry ID
 * @returns {Promise<object>} - Deleted working hours entry
 */
export const deleteWorkingHours = async (id) => {
    try {
        const response = await del(`/api/workinghours/${id}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error deleting working hours:', error);
        throw error;
    }
};

/**
 * Get working hours for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<object>} - Working hours list for the date range
 */
export const getWorkingHoursByDateRange = async (startDate, endDate) => {
    try {
        const response = await getAllWorkingHours({ startDate, endDate });
        return response;
    } catch (error) {
        console.error('Error fetching working hours by date range:', error);
        throw error;
    }
};

/**
 * Get working hours for a specific day of the week
 * @param {string} day - Day of the week (e.g., 'monday', 'tuesday')
 * @returns {Promise<object>} - Working hours list for the day
 */
export const getWorkingHoursByDay = async (day) => {
    try {
        const response = await getAllWorkingHours({ day: day.toLowerCase() });
        return response;
    } catch (error) {
        console.error('Error fetching working hours by day:', error);
        throw error;
    }
};

/**
 * Detect and notify affected bookings due to schedule changes
 * @param {Array<string>} affectedDates - Array of dates that were changed (optional)
 * @returns {Promise<object>} - Result of detection
 */
export const detectAffectedBookings = async (affectedDates = []) => {
    try {
        const response = await post('/api/workinghours/detect-affected', {
            tenantId: TENANT_ID,
            affectedDates
        });
        return response;
    } catch (error) {
        console.error('Error detecting affected bookings:', error);
        throw error;
    }
};
