const api = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) {
      let errBody;
      try {
        errBody = await res.json();
      } catch (e) {
        errBody = { error: 'An unexpected response was returned by the server.' };
      }
      throw new Error(errBody.error || `HTTP Error ${res.status}`);
    }
    return res.json();
  }
};

export const fetchSkills = () => api.get('/api/skills');
export const fetchRecommendations = (userId) => api.get(`/api/recommendations/${userId}`);
export const fetchRoleDetails = (roleId) => api.get(`/api/roles/${roleId}`);
export const fetchRoleGaps = (roleId, userId) => api.get(`/api/roles/${roleId}/gaps/${userId}`);
export const fetchRoleResources = (roleId) => api.get(`/api/roles/${roleId}/resources`);
export const fetchCareerPath = (userId, roleId) => api.get(`/api/career-path/${userId}/${roleId}`);
export const checkHealth = () => api.get('/api/health');
