import axios from 'axios';

// Detectar URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
});

// Afegir token a totes les peticions
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 1. APOSTES
export const bets = {
    getAll: async () => {
        try {
            const response = await api.get('/bets');
            return response.data;
        } catch (error) {
            console.error("Error bets:", error);
            return [];
        }
    },
    getPublic: async () => {
        try {
            const response = await api.get('/bets/public');
            return response.data;
        } catch (error) {
            console.error("Error public bets:", error);
            return [];
        }
    },
    getMyBets: async () => {
        try {
            const response = await api.get('/bets/my');
            return response.data;
        } catch (error) {
            console.error("Error my bets:", error);
            return [];
        }
    },
    getMy: async () => {
        try {
            const response = await api.get('/bets/my');
            return response.data;
        } catch (error) {
            console.error("Error my bets:", error);
            return [];
        }
    },
    getMyParlays: async () => {
        try {
            const response = await api.get('/bets/my-parlays');
            return response.data;
        } catch (error) {
            console.error("Error my parlays:", error);
            return [];
        }
    },
    create: async (data) => {
        const response = await api.post('/bets', data);
        return response.data;
    },
    createParlay: async (data) => {
        const response = await api.post('/bets/parlay', data);
        return response.data;
    },
    cancel: async (id) => {
        const response = await api.post(`/bets/${id}/cancel`);
        return response;
    },
    cancelParlay: async (id) => {
        const response = await api.post(`/bets/parlay/${id}/cancel`);
        return response;
    },
    delete: async (id) => {
        await api.delete(`/bets/${id}`);
        return id;
    }
};

// 2. PARTITS
export const matches = {
    getAll: async () => {
        try {
            const response = await api.get('/matches');
            return response.data;
        } catch (error) {
            console.error("Error matches:", error);
            return [];
        }
    },
    getOpen: async () => {
        try {
            const response = await api.get('/matches/open');
            return response.data;
        } catch (error) {
            console.error("Error open matches:", error);
            return [];
        }
    },
    create: async (data) => {
        const response = await api.post('/matches', data);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(`/matches/${id}`);
        return id;
    },
    getTeams: async () => {
        try {
            const response = await api.get('/matches/teams');
            return response.data;
        } catch (error) {
            console.error("Error teams:", error);
            return [];
        }
    },
    setResult: async (matchId, scoreTeam1, scoreTeam2) => {
        const response = await api.put(`/matches/${matchId}/result`, {
            score_team1: scoreTeam1,
            score_team2: scoreTeam2
        });
        return response.data;
    }
};

// 3. USUARIS
export const users = {
    getAll: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error("Error users:", error);
            return [];
        }
    },
    getLeaderboard: async () => {
        try {
            const response = await api.get('/users/leaderboard');
            return response.data;
        } catch (error) {
            console.error("Error leaderboard:", error);
            return [];
        }
    },
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            return null;
        }
    },
    updateCoins: async (userId, coins, reason) => {
        const response = await api.put(`/users/${userId}/coins`, {
            coins,
            reason
        });
        return response.data;
    },
    getTransactions: async () => {
        try {
            const response = await api.get('/users/transactions');
            return response.data;
        } catch (error) {
            console.error("Error transactions:", error);
            return [];
        }
    }
};

// 4. FANTASY (El que fallava ara)
export const fantasy = {
    getClassification: async () => {
        try {
            const response = await api.get('/fantasy/classification');
            return response.data;
        } catch (error) {
            console.error("Error fantasy:", error);
            return [];
        }
    },
    updatePoints: async () => {
        try {
            const response = await api.post('/fantasy/calculate');
            return response.data;
        } catch (error) {
            console.error("Error calculating points:", error);
            throw error;
        }
    }
};

// 5. AUTH (Per prevenir el proper error)
export const auth = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }
};

export default api;
