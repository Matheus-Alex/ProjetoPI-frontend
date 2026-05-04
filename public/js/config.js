// ────────────────────────────────────────────────────────────
// Configuração da API - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

const CONFIG = {
  // URL base da API (ajuste conforme seu ambiente)
  API_BASE_URL: process.env.API_URL || 'http://localhost:3000/api',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh'
    },
    USUARIOS: {
      LIST: '/usuarios',
      GET: (id) => `/usuarios/${id}`,
      CREATE: '/usuarios',
      UPDATE: (id) => `/usuarios/${id}`,
      DELETE: (id) => `/usuarios/${id}`
    },
    CERTIFICADOS: {
      LIST: '/certificados',
      GET: (id) => `/certificados/${id}`,
      CREATE: '/certificados',
      ACCEPT: (id) => `/certificados/${id}/aceitar`,
      REJECT: (id) => `/certificados/${id}/rejeitar`
    },
    CURSOS: {
      LIST: '/cursos',
      GET: (id) => `/cursos/${id}`
    },
    MATRICULAS: {
      LIST: '/matriculas',
      GET: (id) => `/matriculas/${id}`
    },
    DASHBOARD: '/dashboard',
    HISTORICO: '/historico',
    NOTIFICACOES: '/notificacoes'
  },

  // Tempo de expiração do token (em minutos)
  TOKEN_EXPIRATION: 15,
  REFRESH_TOKEN_EXPIRATION: 10 * 60, // 10 horas
  
  // Chaves de localStorage
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    USER_EMAIL: 'userEmail',
    USER_NOME: 'userName',
    USER_ROLE: 'userRole'
  }
};

export default CONFIG;
