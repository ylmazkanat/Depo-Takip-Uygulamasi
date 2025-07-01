import axios from 'axios';

// API bağlantı yapılandırması
// Ortam değişkenlerinden API ayarlarını al
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_PATH = import.meta.env.VITE_API_PATH || '';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: `${BASE_URL}${API_PATH}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    logout: () => api.post('/api/auth/logout'),
    register: (userData) => api.post('/api/auth/register', userData),
    getMe: () => api.get('/api/auth/me'),
    getAllUsers: () => api.get('/api/auth/users'), // Normal kullanıcılar için
};

// Home API endpoints
export const homeAPI = {
    getHome: () => api.get('/api/home'),
};

// Products API endpoints
export const productsAPI = {
    getAllProducts: (params = {}) => api.get('/api/products', { params }),
    getProductById: (id) => api.get(`/api/products/${id}`),
    createProduct: (productData) => api.post('/api/products', productData),
    updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
    deleteProduct: (id) => api.delete(`/api/products/${id}`),
    getWarehouseStats: () => api.get('/api/products/stats'),
    getLocationCategories: () => api.get('/api/products/locations'),
    borrowProduct: (id, borrowData) => api.post(`/api/products/${id}/borrow`, borrowData),
    returnProduct: (id, returnData) => api.post(`/api/products/${id}/return`, returnData),
    getProductByBarcode: (barcode) => api.get(`/api/products/barcode/${barcode}`),
};

// Users API endpoints (for admin panel)
export const usersAPI = {
    getAllUsers: () => api.get('/api/admin/users'),
    getUserById: (id) => api.get(`/api/admin/users/${id}`),
    createUser: (userData) => api.post('/api/admin/users', userData),
    updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    toggleUserStatus: (id) => api.patch(`/api/admin/users/${id}/toggle-status`),
};

// Admin API endpoints
export const adminAPI = {
    getSystemStats: () => api.get('/api/admin/stats'),
    getSystemLogs: () => api.get('/api/admin/logs'),
    backupDatabase: () => api.post('/api/admin/backup'),
    syncDatabase: () => api.post('/api/admin/sync-db'),
};

// Upload API endpoints
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadSingleImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadImages: (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        return api.post('/api/upload/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

// Locations API endpoints
export const locationsAPI = {
    getAllLocations: (params = {}) => api.get('/api/locations', { params }),
    getLocationById: (id) => api.get(`/api/locations/${id}`),
    createLocation: (locationData) => api.post('/api/locations', locationData),
    updateLocation: (id, locationData) => api.put(`/api/locations/${id}`, locationData),
    deleteLocation: (id) => api.delete(`/api/locations/${id}`),
    toggleLocationStatus: (id) => api.patch(`/api/locations/${id}/toggle`),
};

// Geliştirilmiş resim URL yapılandırması
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // Eğer zaten tam bir URL ise (backend'den gelen yeni format)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Backend'den gelen path varsa (eski format uyumluluğu için)
    if (imagePath.includes('/uploads/')) {
        // Sadece dosya adını al
        const filename = imagePath.split('/uploads/')[1];
        return `${BASE_URL}/uploads/${filename}`;
    }
    
    // Sadece dosya adı varsa
    if (imagePath.includes('image-') || imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${BASE_URL}/uploads/${imagePath.replace(/^\//, '')}`;
    }
    
    // Legacy format - /uploads ile başlıyorsa
    if (imagePath.startsWith('/uploads/')) {
        return `${BASE_URL}${imagePath}`;
    }
    
    // Diğer relative path'ler
    return `${BASE_URL}/uploads/${imagePath.replace(/^\//, '')}`;
};

export { api };

export default {
    BASE_URL,
    API_PATH,
    getImageUrl
}; 