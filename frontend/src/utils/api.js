import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor per afegir token a totes les requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  register: (username, password) => api.post('/auth/register', { username, password }),
  login: (username, password) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me')
};

// Matches
export const matches = {
  getAll: () => api.get('/matches'),
  getOpen: () => api.get('/matches/open'),
  getById: (id) => api.get(`/matches/${id}`),
  getTeams: () => api.get('/matches/teams'),
  create: (data) => api.post('/matches', data),
  setResult: (id, score_team1, score_team2) =>
    api.put(`/matches/${id}/result`, { score_team1, score_team2 }),
  getBets: (id) => api.get(`/matches/${id}/bets`)
};

// Bets
export const bets = {
  getMy: () => api.get('/bets/my'),
  getMyParlays: () => api.get('/bets/my/parlays'),
  getPublic: () => api.get('/bets/public'),
  create: (data) => api.post('/bets', data),
  createParlay: (data) => api.post('/bets/parlay', data),
  cancel: (id) => api.delete(`/bets/${id}`),
  cancelParlay: (id) => api.delete(`/bets/parlay/${id}`),
  getById: (id) => api.get(`/bets/${id}`)
};

// Users
export const users = {
  getAll: () => api.get('/users'),
  getLeaderboard: () => api.get('/users/leaderboard'),
  getTransactions: () => api.get('/users/me/transactions'),
  getById: (id) => api.get(`/users/${id}`),
  cashOut: (id) => api.post(`/users/${id}/cash-out`),
  updateCoins: (id, coins, reason) => api.put(`/users/${id}/coins`, { coins, reason })
};

// Fantasy
export const fantasy = {
  getClassification: () => api.get('/fantasy/classification'),
  getByMatchday: (matchday) => api.get(`/fantasy/matchdays/${matchday}`),
  getAllScores: () => api.get('/fantasy/all'),
  getTeamHistory: (team) => api.get(`/fantasy/team/${team}`),
  addScores: (scores) => api.post('/fantasy/scores', { scores })
};

export default api;
