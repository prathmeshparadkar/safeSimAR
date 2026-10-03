const BASE_URL = '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  timestamp: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('suraksha_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data.data;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    getMe: () => request<any>('/auth/me'),
  },

  analytics: {
    getDashboard: () => request<any>('/analytics/dashboard'),
  },

  workers: {
    list: (params: { search?: string; status?: string; page?: number; limit?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const qs = query.toString();
      return request<{
        workers: any[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/workers${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<any>(`/workers/${id}`),
  },

  modules: {
    list: () => request<any[]>('/modules'),
    getById: (id: string) => request<any>(`/modules/${id}`),
  },

  certificates: {
    list: () => request<any[]>('/certificates'),
    verify: (certNumber: string) =>
      request<{
        is_valid: boolean;
        certificate?: any;
        status?: string;
        message: string;
      }>('/certificates/verify', {
        method: 'POST',
        body: JSON.stringify({ certificate_number: certNumber }),
      }),
  },

  health: {
    check: () => request<any>('/health'),
  },

  attempts: {
    record: (data: any) =>
      request<any>('/attempts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (limit = 20) => request<any[]>(`/attempts?limit=${limit}`),
  },
};
