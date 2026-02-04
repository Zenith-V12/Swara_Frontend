import api from '../../utils/api';

/**
 * Create a new user
 * @param {Object} userData - User data including name, age, gender, phoneNumber
 * @returns {Promise} API response
 */
export const createUser = async (userData) => {
    try {
        const response = await api.post('/api/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Get all users for a tenant
 * @param {Object} params - Query parameters (tenantId, name, phoneNumber)
 * @returns {Promise} API response with users array
 */
export const getAllUsers = async (params = {}) => {
    try {
        const response = await api.get('/api/users', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

/**
 * Get a specific user by ID
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise} API response with user data
 */
export const getUserById = async (userId, tenantId) => {
    try {
        const response = await api.get(`/api/users/${userId}`, {
            params: { tenantId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

/**
 * Update user information
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} API response
 */
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/api/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Delete a user
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise} API response
 */
export const deleteUser = async (userId, tenantId) => {
    try {
        const response = await api.delete(`/api/users/${userId}`, {
            params: { tenantId }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

/**
 * Add a dependent to a user
 * @param {string} userId - User ID
 * @param {Object} dependentData - Dependent data (name, age, gender, phone)
 * @returns {Promise} API response
 */
export const addDependent = async (userId, dependentData) => {
    try {
        const response = await api.post(`/api/users/${userId}/dependents`, dependentData);
        return response.data;
    } catch (error) {
        console.error('Error adding dependent:', error);
        throw error;
    }
};

/**
 * Remove a dependent from a user
 * @param {string} userId - User ID
 * @param {string} dependentPhone - Phone number of the dependent
 * @param {string} tenantId - Tenant ID
 * @returns {Promise} API response
 */
export const removeDependent = async (userId, dependentPhone, tenantId) => {
    try {
        const response = await api.delete(`/api/users/${userId}/dependents/${dependentPhone}`, {
            params: { tenantId }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing dependent:', error);
        throw error;
    }
};
