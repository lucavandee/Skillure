/**
 * Centralized API service layer for Skillure frontend.
 *
 * All backend communication flows through this module so that:
 *   - The base URL is configured once (via env var or fallback)
 *   - Auth tokens are injected automatically
 *   - Error handling is consistent
 *   - Components never hardcode URLs
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type') || 'bearer';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }

  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = { ...getAuthHeaders(), ...(options.headers as Record<string, string> ?? {}) };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    const message = body.detail ?? body.message ?? `API error ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  candidate_profile?: CandidateProfileResponse | null;
}

export const auth = {
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(data: { email: string; full_name: string; password: string; role: string }) {
    return request<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  me() {
    return request<UserProfile>('/auth/me');
  },

  verifyToken() {
    return request<{ valid: boolean; user_id: number; role: string; email: string }>(
      '/auth/verify-token',
    );
  },
};

// ──────────────────────────────────────────────
// Candidates
// ──────────────────────────────────────────────

export interface CandidateSkillResponse {
  id: number;
  skill_name: string;
  level: number;
}

export interface CandidateProfileResponse {
  id: number;
  user_id: number;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  github_url?: string | null;
  kaggle_url?: string | null;
  linkedin_url?: string | null;
  big_number?: string | null;
  availability?: string | null;
  skills: CandidateSkillResponse[];
}

export const candidates = {
  getMyProfile() {
    return request<CandidateProfileResponse>('/candidates/me/profile');
  },

  updateProfile(data: Record<string, unknown>) {
    return request<CandidateProfileResponse>('/candidates/me/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  search(params: { skill?: string; location?: string; availability?: string; skip?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params.skill) query.set('skill', params.skill);
    if (params.location) query.set('location', params.location);
    if (params.availability) query.set('availability', params.availability);
    if (params.skip !== undefined) query.set('skip', String(params.skip));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    return request<CandidateProfileResponse[]>(`/candidates/search?${query}`);
  },

  getProfile(candidateId: number) {
    return request<CandidateProfileResponse>(`/candidates/${candidateId}/profile`);
  },

  getMyStats() {
    return request<{
      profile_completed: boolean;
      completion_percentage?: number;
      skills_count: number;
      profile_views: number;
      applications_sent: number;
    }>('/candidates/me/stats');
  },

  addSkill(skillName: string, level: number) {
    return request<CandidateProfileResponse>('/candidates/me/skills', {
      method: 'POST',
      body: JSON.stringify({ skill_name: skillName, level }),
    });
  },

  removeSkill(skillId: number) {
    return request<{ message: string }>(`/candidates/me/skills/${skillId}`, {
      method: 'DELETE',
    });
  },
};

// ──────────────────────────────────────────────
// Vacancies
// ──────────────────────────────────────────────

export interface VacancyResponse {
  id: number;
  title: string;
  description: string;
  branch: string;
  location: string;
  duration: string;
  rate_min: number;
  rate_max: number;
  status: string;
  owner_id: number;
  big_number?: string | null;
  availability: string;
  created_at: string;
  updated_at?: string | null;
}

export interface VacancyCreateData {
  title: string;
  description: string;
  branch: string;
  location: string;
  duration: string;
  rate_min: number;
  rate_max: number;
  big_number?: string;
  availability: string;
}

export const vacancies = {
  list(params?: { status_filter?: string; branch_filter?: string; location_filter?: string; skip?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status_filter) query.set('status_filter', params.status_filter);
    if (params?.branch_filter) query.set('branch_filter', params.branch_filter);
    if (params?.location_filter) query.set('location_filter', params.location_filter);
    if (params?.skip !== undefined) query.set('skip', String(params.skip));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    return request<VacancyResponse[]>(`/vacancies/?${query}`);
  },

  get(id: number) {
    return request<VacancyResponse>(`/vacancies/${id}`);
  },

  create(data: VacancyCreateData) {
    return request<VacancyResponse>('/vacancies/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: number, data: Partial<VacancyCreateData & { status?: string }>) {
    return request<VacancyResponse>(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: number) {
    return request<{ message: string }>(`/vacancies/${id}`, {
      method: 'DELETE',
    });
  },

  changeStatus(id: number, status: string) {
    return request<VacancyResponse>(`/vacancies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  publish(id: number) {
    return request<VacancyResponse>(`/vacancies/${id}/publish`, { method: 'POST' });
  },

  pause(id: number) {
    return request<VacancyResponse>(`/vacancies/${id}/pause`, { method: 'POST' });
  },

  resume(id: number) {
    return request<VacancyResponse>(`/vacancies/${id}/resume`, { method: 'POST' });
  },

  close(id: number, reason: string = 'filled') {
    return request<VacancyResponse>(`/vacancies/${id}/close?reason=${reason}`, { method: 'POST' });
  },

  archive(id: number) {
    return request<VacancyResponse>(`/vacancies/${id}/archive`, { method: 'POST' });
  },

  getStats(id: number) {
    return request<{
      vacancy_id: number;
      days_active: number;
      views: number;
      applications: number;
      matches: number;
      status: string;
    }>(`/vacancies/${id}/stats`);
  },

  getSummaryStats() {
    return request<Record<string, number>>('/vacancies/stats/summary');
  },

  getMy(params?: { status_filter?: string }) {
    const query = new URLSearchParams();
    if (params?.status_filter) query.set('status_filter', params.status_filter);
    return request<VacancyResponse[]>(`/vacancies/my?${query}`);
  },

  advancedSearch(params: Record<string, string | number | undefined>) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') query.set(key, String(val));
    });
    return request<VacancyResponse[]>(`/vacancies/search/advanced?${query}`);
  },
};

// ──────────────────────────────────────────────
// ATS / Pipeline
// ──────────────────────────────────────────────

export interface ApplicationResponse {
  application_id: number;
  candidate_id?: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string | null;
  candidate_location?: string | null;
  vacancy_title?: string;
  company_name?: string;
  status: string;
  applied_at: string;
  updated_at?: string;
  match_score: number;
  notes?: string | null;
}

export const ats = {
  apply(vacancyId: number) {
    return request<{ detail: string; application_id: number }>('/ats/apply', {
      method: 'POST',
      body: JSON.stringify({ vacancy_id: vacancyId }),
    });
  },

  getMyApplications() {
    return request<ApplicationResponse[]>('/ats/my-applications');
  },

  getPipeline(vacancyId: number) {
    return request<ApplicationResponse[]>(`/ats/pipeline/${vacancyId}`);
  },

  updateApplicationStatus(applicationId: number, status: string, notes?: string) {
    const data: Record<string, string> = { status };
    if (notes) data.notes = notes;
    return request<{ detail: string; new_status: string }>(`/ats/application/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getPipelineStats(vacancyId: number) {
    return request<{
      total_applications: number;
      ingediend: number;
      screening: number;
      interview: number;
      aanbieding: number;
      afgewezen: number;
      geplaatst: number;
      avg_match_score: number;
    }>(`/ats/pipeline-stats/${vacancyId}`);
  },
};

// ──────────────────────────────────────────────
// Company / Opdrachtgever
// ──────────────────────────────────────────────

export const company = {
  getMe() {
    return request<UserProfile>('/company/me');
  },

  getDashboard() {
    return request<{
      stats: Record<string, number>;
      recent_vacancies: Array<{
        id: number;
        title: string;
        status: string;
        created_at: string;
        branch: string;
        location: string;
      }>;
      notifications: unknown[];
      quick_actions: Array<{ label: string; action: string }>;
    }>('/company/dashboard');
  },

  getStats() {
    return request<{
      total_vacancies: number;
      live_vacancies: number;
      draft_vacancies: number;
      filled_vacancies: number;
      fill_rate: number;
      active_rate: number;
    }>('/company/stats');
  },

  getVacancyCandidates(vacancyId: number) {
    return request<CandidateProfileResponse[]>(`/company/vacancies/${vacancyId}/candidates`);
  },

  searchCandidates(params: { skill?: string; location?: string; availability?: string; min_level?: number }) {
    const query = new URLSearchParams();
    if (params.skill) query.set('skill', params.skill);
    if (params.location) query.set('location', params.location);
    if (params.availability) query.set('availability', params.availability);
    if (params.min_level !== undefined) query.set('min_level', String(params.min_level));
    return request<CandidateProfileResponse[]>(`/company/candidates/search?${query}`);
  },
};

// ──────────────────────────────────────────────
// Global search
// ──────────────────────────────────────────────

export const search = {
  global(q: string, entityType: string = 'all', skip = 0, limit = 50) {
    const query = new URLSearchParams({ q, entity_type: entityType, skip: String(skip), limit: String(limit) });
    return request<{
      vacancies: Array<{ id: number; title: string; branch: string; location: string; status: string; type: string }>;
      candidates: Array<{ id: number; name: string; location: string; summary: string; type: string }>;
    }>(`/search?${query}`);
  },
};

// ──────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────

export const admin = {
  getUsers(skip = 0, limit = 100) {
    return request<UserProfile[]>(`/admin/users?skip=${skip}&limit=${limit}`);
  },

  getStats() {
    return request<{
      total_users: number;
      total_candidates: number;
      total_recruiters: number;
      total_companies: number;
      total_vacancies: number;
      live_vacancies: number;
      total_applications: number;
      platform_health: string;
    }>('/admin/stats');
  },
};

// ──────────────────────────────────────────────
// Public
// ──────────────────────────────────────────────

export const publicApi = {
  getStats() {
    return request<{
      live_vacancies: number;
      active_candidates: number;
      platform_status: string;
    }>('/stats/public');
  },

  healthCheck() {
    return request<{ status: string; message: string; version: string }>('/health');
  },
};

// Re-export API_BASE for components that need it (e.g. file uploads)
export { API_BASE };
