import axios from 'axios';

// Get API URL from environment or use production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://cafe-pos-system-fqo7.onrender.com/api';

console.log('🌐 API Configuration:', {
  baseURL: API_URL,
  env: import.meta.env.MODE
});

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false, // ⚠️ Change to false for cross-origin
  timeout: 30000 // 30 second timeout
});

// ✅ REQUEST INTERCEPTOR - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Request with token to:', config.url);
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('🔒 401 Unauthorized - Clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// =====================
// AUTH APIs
// =====================
export const authAPI = {
  login: (credentials) => {
    console.log('🔐 Attempting login...');
    return api.post('/auth/login', credentials);
  },
  
  getCurrentUser: () => {
    console.log('👤 Fetching current user...');
    return api.get('/auth/me');
  },
  
  register: (userData) => {
    console.log('📝 Registering new user...');
    return api.post('/auth/register', userData);
  }
};

// =====================
// TABLE APIs
// =====================
export const tableAPI = {
  getAll: () => {
    console.log('🪑 Fetching all tables...');
    return api.get('/tables');
  },
  
  create: (tableData) => {
    console.log('➕ Creating new table...');
    return api.post('/tables', tableData);
  },
  
  updateStatus: (id, status) => {
    console.log(`🔄 Updating table ${id} status to ${status}...`);
    return api.put(`/tables/${id}/status`, { status });
  },
  
  assignWaiter: (id) => {
    console.log(`👨‍💼 Assigning waiter to table ${id}...`);
    return api.put(`/tables/${id}/assign-waiter`);
  }
};

// =====================
// MENU APIs
// =====================
export const menuAPI = {
  getAll: (params) => {
    console.log('🍽️ Fetching menu items...');
    return api.get('/menu', { params });
  },
  
  create: (menuItem) => {
    console.log('➕ Creating menu item...');
    return api.post('/menu', menuItem);
  },
  
  update: (id, menuItem) => {
    console.log(`✏️ Updating menu item ${id}...`);
    return api.put(`/menu/${id}`, menuItem);
  },
  
  delete: (id) => {
    console.log(`🗑️ Deleting menu item ${id}...`);
    return api.delete(`/menu/${id}`);
  },
  
  toggleAvailability: (id) => {
    console.log(`🔄 Toggling availability for item ${id}...`);
    return api.put(`/menu/${id}/availability`);
  }
};

// =====================
// ORDER APIs
// =====================
export const orderAPI = {
  getAll: (params) => {
    console.log('📋 Fetching orders...');
    return api.get('/orders', { params });
  },
  
  getById: (id) => {
    console.log(`📋 Fetching order ${id}...`);
    return api.get(`/orders/${id}`);
  },
  
  create: (orderData) => {
    console.log('➕ Creating new order...');
    return api.post('/orders', orderData);
  },
  
  updateItemStatus: (id, itemId, status) => {
    console.log(`🔄 Updating order ${id}, item ${itemId} to ${status}...`);
    return api.put(`/orders/${id}/item-status`, { itemId, status });
  },
  
  requestBill: (id) => {
    console.log(`💰 Requesting bill for order ${id}...`);
    return api.post(`/orders/${id}/request-bill`);
  }
};

// =====================
// PAYMENT APIs
// =====================
export const paymentAPI = {
  process: (paymentData) => {
    console.log('💳 Processing payment...');
    return api.post('/payments', paymentData);
  },
  
  getAll: () => {
    console.log('💳 Fetching all payments...');
    return api.get('/payments');
  }
};

// =====================
// ANALYTICS APIs
// =====================
export const analyticsAPI = {
  getRevenue: (params) => {
    console.log('📊 Fetching revenue analytics...');
    return api.get('/analytics/revenue', { params });
  },
  
  getTopItems: (params) => {
    console.log('🏆 Fetching top selling items...');
    return api.get('/analytics/top-items', { params });
  },
  
  getDailySummary: () => {
    console.log('📅 Fetching daily summary...');
    return api.get('/analytics/daily-summary');
  }
};

// =====================
// EXPORT DEFAULT
// =====================
export default api;