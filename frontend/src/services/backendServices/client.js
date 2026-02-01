import { get, post, put, del } from '../../utils/api';

/**
 * Client API Module
 * Handles all client/tenant-related API calls
 */

/**
 * Get client by tenant ID
 * @param {string} tenantId - Tenant ID to validate
 * @returns {Promise<object>} - Client data
 */
export const getClientByTenantId = async (tenantId) => {
    try {
        const response = await get(`/api/clients/${tenantId}`);
        return response;
    } catch (error) {
        console.error('Error fetching client:', error);
        throw error;
    }
};

/**
 * Validate if tenant ID exists
 * @param {string} tenantId - Tenant ID to validate
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
export const validateTenantId = async (tenantId) => {
    try {
        // Call API directly to avoid logging expected 404 errors
        const response = await get(`/api/clients/${tenantId}`);
        return response.success === true;
    } catch (error) {
        // Silently return false for invalid tenant IDs (expected behavior)
        // Only log if it's not a 404 error
        if (!error.message?.includes('Client not found')) {
            console.error('Error validating tenant:', error);
        }
        return false;
    }
};

/**
 * Get all clients
 * @returns {Promise<object>} - All clients
 */
export const getAllClients = async () => {
    try {
        const response = await get('/api/clients');
        return response;
    } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
    }
};

/**
 * Create a new client
 * @param {object} clientData - Client data
 * @param {string} clientData.tenantId - Tenant ID
 * @param {string} clientData.businessName - Business name
 * @returns {Promise<object>} - Created client
 */
export const createClient = async (clientData) => {
    try {
        const response = await post('/api/clients', clientData);
        return response;
    } catch (error) {
        console.error('Error creating client:', error);
        throw error;
    }
};

/**
 * Update client
 * @param {string} tenantId - Tenant ID
 * @param {object} updateData - Update data
 * @returns {Promise<object>} - Updated client
 */
export const updateClient = async (tenantId, updateData) => {
    try {
        const response = await put(`/api/clients/${tenantId}`, updateData);
        return response;
    } catch (error) {
        console.error('Error updating client:', error);
        throw error;
    }
};

/**
 * Delete client
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<object>} - Deleted client
 */
export const deleteClient = async (tenantId) => {
    try {
        const response = await del(`/api/clients/${tenantId}`);
        return response;
    } catch (error) {
        console.error('Error deleting client:', error);
        throw error;
    }
};

export default {
    getClientByTenantId,
    validateTenantId,
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
};
