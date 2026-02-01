import { get, post, put, del } from '../../utils/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANTID;

/**
 * Services API Module
 * Handles all service-related API calls for beauty parlour services
 */

/**
 * Get all services for the tenant
 * @param {object} filters - Optional filters (minPrice, maxPrice, maxDuration)
 * @returns {Promise<object>} - Services data
 */
export const getAllServices = async (filters = {}) => {
    try {
        const params = {
            tenantId: TENANT_ID,
            ...filters,
        };

        const response = await get('/api/services', params);
        return response;
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};

/**
 * Get a single service by ID
 * @param {string} serviceId - Service ID (MongoDB _id)
 * @returns {Promise<object>} - Service data
 */
export const getServiceById = async (serviceId) => {
    try {
        const response = await get(`/api/services/${serviceId}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error fetching service:', error);
        throw error;
    }
};

/**
 * Create a new service
 * @param {object} serviceData - Service details
 * @param {string} serviceData.title - Service title
 * @param {string} serviceData.description - Service description
 * @param {number} serviceData.duration_mins - Duration in minutes
 * @param {number} serviceData.price - Service price
 * @returns {Promise<object>} - Created service
 */
export const createService = async (serviceData) => {
    try {
        const response = await post('/api/services', {
            tenantId: TENANT_ID,
            ...serviceData,
        });
        return response;
    } catch (error) {
        console.error('Error creating service:', error);
        throw error;
    }
};

/**
 * Update an existing service
 * @param {string} serviceId - Service ID (MongoDB _id)
 * @param {object} updateData - Updated service details
 * @param {string} updateData.title - Service title
 * @param {string} updateData.description - Service description
 * @param {number} updateData.duration_mins - Duration in minutes
 * @param {number} updateData.price - Service price
 * @returns {Promise<object>} - Updated service
 */
export const updateService = async (serviceId, updateData) => {
    try {
        const response = await put(`/api/services/${serviceId}`, {
            tenantId: TENANT_ID,
            ...updateData,
        });
        return response;
    } catch (error) {
        console.error('Error updating service:', error);
        throw error;
    }
};

/**
 * Delete a service
 * @param {string} serviceId - Service ID (MongoDB _id)
 * @returns {Promise<object>} - Deleted service
 */
export const deleteService = async (serviceId) => {
    try {
        const response = await del(`/api/services/${serviceId}`, {
            tenantId: TENANT_ID,
        });
        return response;
    } catch (error) {
        console.error('Error deleting service:', error);
        throw error;
    }
};

/**
 * Get services by price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Promise<object>} - Filtered services
 */
export const getServicesByPriceRange = async (minPrice, maxPrice) => {
    try {
        const response = await getAllServices({
            minPrice: minPrice.toString(),
            maxPrice: maxPrice.toString(),
        });
        return response;
    } catch (error) {
        console.error('Error fetching services by price range:', error);
        throw error;
    }
};

/**
 * Get services by maximum duration
 * @param {number} maxDuration - Maximum duration in minutes
 * @returns {Promise<object>} - Filtered services
 */
export const getServicesByDuration = async (maxDuration) => {
    try {
        const response = await getAllServices({
            maxDuration: maxDuration.toString(),
        });
        return response;
    } catch (error) {
        console.error('Error fetching services by duration:', error);
        throw error;
    }
};

/**
 * Search services by title (client-side filtering)
 * @param {string} searchTerm - Search term
 * @returns {Promise<object>} - Filtered services
 */
export const searchServices = async (searchTerm) => {
    try {
        const response = await getAllServices();

        if (!searchTerm || searchTerm.trim() === '') {
            return response;
        }

        const filteredData = response.data.filter(service =>
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
            ...response,
            count: filteredData.length,
            data: filteredData,
        };
    } catch (error) {
        console.error('Error searching services:', error);
        throw error;
    }
};

/**
 * Get popular services (sorted by price, descending)
 * @param {number} limit - Number of services to return
 * @returns {Promise<object>} - Popular services
 */
export const getPopularServices = async (limit = 5) => {
    try {
        const response = await getAllServices();

        const sortedData = [...response.data]
            .sort((a, b) => b.price - a.price)
            .slice(0, limit);

        return {
            ...response,
            count: sortedData.length,
            data: sortedData,
        };
    } catch (error) {
        console.error('Error fetching popular services:', error);
        throw error;
    }
};

/**
 * Get quick services (duration <= 30 minutes)
 * @returns {Promise<object>} - Quick services
 */
export const getQuickServices = async () => {
    try {
        const response = await getServicesByDuration(30);
        return response;
    } catch (error) {
        console.error('Error fetching quick services:', error);
        throw error;
    }
};

/**
 * Get affordable services (price <= specified amount)
 * @param {number} maxPrice - Maximum price
 * @returns {Promise<object>} - Affordable services
 */
export const getAffordableServices = async (maxPrice = 500) => {
    try {
        const response = await getServicesByPriceRange(0, maxPrice);
        return response;
    } catch (error) {
        console.error('Error fetching affordable services:', error);
        throw error;
    }
};

/**
 * Validate service data before submission
 * @param {object} serviceData - Service data to validate
 * @returns {object} - Validation result { valid: boolean, errors: string[] }
 */
export const validateServiceData = (serviceData) => {
    const errors = [];

    if (!serviceData.title || serviceData.title.trim() === '') {
        errors.push('Service title is required');
    }

    if (!serviceData.description || serviceData.description.trim() === '') {
        errors.push('Service description is required');
    }

    if (!serviceData.duration_mins || serviceData.duration_mins <= 0) {
        errors.push('Duration must be greater than 0 minutes');
    }

    if (!serviceData.price || serviceData.price <= 0) {
        errors.push('Price must be greater than 0');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export default {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getServicesByPriceRange,
    getServicesByDuration,
    searchServices,
    getPopularServices,
    getQuickServices,
    getAffordableServices,
    validateServiceData,
};
