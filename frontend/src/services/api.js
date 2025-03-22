import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',    
  },
  withCredentials: true,
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
  (response) => {
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
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