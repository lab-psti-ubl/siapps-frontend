const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    console.log(`API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    if (options.body) {
      console.log('Request body:', options.body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    console.log(`API Response (${response.status}):`, data);

    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  adminLogin: (credentials: { username: string; password: string }) =>
    apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  userLogin: (qrCode: string) =>
    apiRequest('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    }),
};

// Employees API
export const employeesAPI = {
  getAll: (params?: { search?: string; position?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.position) queryParams.append('position', params.position);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/employees?${queryParams.toString()}`);
  },

  getById: (id: string) =>
    apiRequest(`/employees/${id}`),

  create: (employeeData: any) =>
    apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),

  update: (id: string, employeeData: any) =>
    apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    }),

  delete: (id: string) =>
    apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    }),

  getAttendance: (id: string, params?: { month?: string; year?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year);
    
    return apiRequest(`/employees/${id}/attendance?${queryParams.toString()}`);
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: (params?: { date?: string; employeeId?: string; month?: string; year?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) {
      // Validate and format date properly
      const dateObj = new Date(params.date);
      if (!isNaN(dateObj.getTime())) {
        const formattedDate = dateObj.toISOString().split('T')[0];
        queryParams.append('date', formattedDate);
        console.log('API request for date:', formattedDate, 'from input:', params.date);
      } else {
        console.error('Invalid date provided to API:', params.date);
        // Use today's date as fallback
        const today = new Date().toISOString().split('T')[0];
        queryParams.append('date', today);
        console.log('Using fallback date:', today);
      }
    }
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/attendance?${queryParams.toString()}`;
    console.log('Making attendance API request to:', url);
    return apiRequest(url);
  },

  checkIn: (data: {
    employeeId: string;
    checkInPhoto?: string;
    location?: { latitude: number; longitude: number };
    method?: string;
  }) =>
    apiRequest('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkOut: (data: {
    employeeId: string;
    checkOutPhoto?: string;
    location?: { latitude: number; longitude: number };
    method?: string;
  }) =>
    apiRequest('/attendance/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  qrScan: (qrCode: string) =>
    apiRequest('/attendance/qr-scan', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    }),

  getDailyStats: (date?: string) => {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    
    return apiRequest(`/attendance/stats/daily?${queryParams.toString()}`);
  },

  getSummary: (employeeId: string, params?: { month?: string; year?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year);
    
    return apiRequest(`/attendance/summary/${employeeId}?${queryParams.toString()}`);
  },
};

// Leave Requests API
export const leaveRequestsAPI = {
  getAll: (params?: { employeeId?: string; status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/leave-requests?${queryParams.toString()}`);
  },

  getById: (id: string) =>
    apiRequest(`/leave-requests/${id}`),

  create: (data: {
    employeeId: string;
    reason: string;
    startDate: string;
    endDate: string;
    days: number;
  }) =>
    apiRequest('/leave-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(response => {
      // Ensure we always return a proper response format
      if (response && typeof response === 'object') {
        // Ensure submittedAt is properly formatted
        if (response.data && response.data.createdAt) {
          response.data.submittedAt = response.data.createdAt;
        }
        return response;
      }
      // If response is not in expected format, assume success
      return {
        success: true,
        message: 'Pengajuan izin berhasil dikirim',
        data: response
      };
    }).catch(error => {
      console.error('Leave request API error:', error);
      // Re-throw with proper error format
      throw new Error(error.message || 'Gagal mengirim pengajuan izin');
    }),

  updateStatus: (id: string, data: { status: string; reviewNotes?: string }) =>
    apiRequest(`/leave-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getStats: (params?: { employeeId?: string; month?: string; year?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year);
    
    return apiRequest(`/leave-requests/stats/summary?${queryParams.toString()}`);
  },
};

// Notifications API
export const notificationsAPI = {
  getByEmployee: (employeeId: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/notifications/employee/${employeeId}?${queryParams.toString()}`);
  },

  markAsRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: (employeeId: string) =>
    apiRequest(`/notifications/employee/${employeeId}/read-all`, {
      method: 'PUT',
    }),

  delete: (id: string) =>
    apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  getUnreadCount: (employeeId: string) =>
    apiRequest(`/notifications/employee/${employeeId}/unread-count`),
};

// Settings API
export const settingsAPI = {
  getWorkSettings: () =>
    apiRequest('/settings/work'),

  updateWorkSettings: (data: {
    checkInTime: string;
    checkOutTime: string;
    lateThresholdMinutes: number;
    earlyLeaveThresholdMinutes: number;
    companyLatitude?: number;
    companyLongitude?: number;
    radiusMeters?: number;
  }) =>
    apiRequest('/settings/work', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getLocationSettings: () =>
    apiRequest('/settings/location'),
};

// RFID Devices API
export const rfidDevicesAPI = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/rfid-devices?${queryParams.toString()}`);
  },

  getById: (id: string) =>
    apiRequest(`/rfid-devices/${id}`),

  create: (deviceData: {
    name: string;
    macAddress: string;
    location: string;
    description?: string;
  }) =>
    apiRequest('/rfid-devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    }),

  update: (id: string, deviceData: {
    name: string;
    macAddress: string;
    location: string;
    description?: string;
  }) =>
    apiRequest(`/rfid-devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    }),

  delete: (id: string) =>
    apiRequest(`/rfid-devices/${id}`, {
      method: 'DELETE',
    }),

  getUnregisteredCards: () =>
    apiRequest('/rfid-devices/unregistered-cards'),

  removeUnregisteredCard: (guid: string) =>
    apiRequest(`/rfid-devices/unregistered-cards/${guid}`, {
      method: 'DELETE',
    }),
};

// RFID Attendance API
export const rfidAttendanceAPI = {
  tap: (data: { mac: string; guid: string }) =>
    apiRequest('/rfid-attendance/tap', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLogs: (params?: { date?: string; deviceId?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/rfid-attendance/logs?${queryParams.toString()}`);
  },
};

// Divisions API
export const divisionsAPI = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/divisions?${queryParams.toString()}`);
  },

  getById: (id: string) =>
    apiRequest(`/divisions/${id}`),

  create: (divisionData: {
    name: string;
    description?: string;
  }) =>
    apiRequest('/divisions', {
      method: 'POST',
      body: JSON.stringify(divisionData),
    }),

  update: (id: string, divisionData: {
    name: string;
    description?: string;
  }) =>
    apiRequest(`/divisions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(divisionData),
    }),

  delete: (id: string) =>
    apiRequest(`/divisions/${id}`, {
      method: 'DELETE',
    }),
};

// Salary API
export const salaryAPI = {
  getAll: (params?: { period?: string; employeeId?: string; status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/salary?${queryParams.toString()}`);
  },

  getById: (id: string) =>
    apiRequest(`/salary/${id}`),

  calculate: (data: { employeeId: string; period: string }) =>
    apiRequest('/salary/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  calculateAll: (data: { period: string }) =>
    apiRequest('/salary/calculate-all', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: { status: string }) =>
    apiRequest(`/salary/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  preview: (data: { employeeId: string; period: string }) =>
    apiRequest('/salary/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBreakdown: (id: string) =>
    apiRequest(`/salary/${id}/breakdown`),
  getPeriods: () =>
    apiRequest('/salary/periods'),

  getReport: (id: string) =>
    apiRequest(`/salary/${id}/report`),

  getByEmployee: (employeeId: string, params?: { period?: string; status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/salary/employee/${employeeId}?${queryParams.toString()}`);
  },
};

// Salary Settings API
export const salarySettingsAPI = {
  get: () =>
    apiRequest('/salary-settings'),

  update: (data: {
    absentDeduction: number;
    leaveDeduction: number;
    lateDeduction: number;
    earlyLeaveDeduction: number;
    lateTimeBlock: number;
    earlyLeaveTimeBlock: number;
    workingDaysPerWeek: number[];
    salaryPaymentDate: number;
    holidays: string[];
  }) =>
    apiRequest('/salary-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Work Shifts API
export const workShiftsAPI = {
  getAll: () =>
    apiRequest('/work-shifts'),

  getById: (id: string) =>
    apiRequest(`/work-shifts/${id}`),

  updateBulk: (shifts: Array<{
    name: string;
    checkInTime: string;
    checkOutTime: string;
    lateThresholdMinutes: number;
    earlyLeaveThresholdMinutes: number;
  }>) =>
    apiRequest('/work-shifts/bulk', {
      method: 'POST',
      body: JSON.stringify({ shifts }),
    }),
};