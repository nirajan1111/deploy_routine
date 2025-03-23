import axios from 'axios';

const API_BASE_URL = '${BACKEND_URL}';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',    
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;
    
    // Check if the error is due to an expired token
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.code === 'TOKEN_EXPIRED'
    ) {
      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);


export const routineApi = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  
  // Routine endpoints
  getSchedules: () => api.get('/routines/'),
  optimizeRoutine: (params) => api.post('/routines/optimize_routine/', params),
  queryRoutine: (query) => api.post('/routines/natural_language_query/', { query }),
  
  // Other endpoints
  getTeachers: () => api.get('/teachers/'),
  getRooms: () => api.get('/rooms/'),
  getSubjects: () => api.get('/subjects/'),
  getHolidays: () => api.get('/holidays/'),
  
};

export default api; 