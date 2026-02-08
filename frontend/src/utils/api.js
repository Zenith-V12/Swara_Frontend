/**
 * API Utility for making HTTP requests to the backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint (e.g., '/api/bookings')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                url,
                data
            });
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        // Don't log here - let calling functions decide whether to log
        throw error;
    }
};

/**
 * GET request
 */
export const get = (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return apiRequest(url, {
        method: 'GET',
    });
};

/**
 * POST request
 */
export const post = (endpoint, data) => {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

/**
 * PUT request
 */
export const put = (endpoint, data) => {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

/**
 * DELETE request
 */
export const del = (endpoint, data = {}) => {
    return apiRequest(endpoint, {
        method: 'DELETE',
        body: JSON.stringify(data),
    });
};

export default {
    get,
    post,
    put,
    delete: del,
};
