// ────────────────────────────────────────────────────────────
// Cliente API - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import CONFIG from './config.js';

class APIClient {
  /**
   * Faz uma requisição autenticada à API
   * @param {string} endpoint - O endpoint da API
   * @param {Object} options - Opções da requisição (method, body, etc)
   * @returns {Promise<Object>} - Resposta da API
   */
  static async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Adiciona o token de acesso se existir
    const accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers
      });

      // Se o token expirou (401), tenta renovar
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Tenta a requisição novamente com o novo token
          const newAccessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(url, {
            ...options,
            headers
          });
        } else {
          // Refresh falhou, redireciona para login
          this.logout();
          return { error: 'Sessão expirada. Faça login novamente.' };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      return { error: error.message };
    }
  }

  /**
   * Renova o access token usando o refresh token
   * @returns {Promise<boolean>} - true se renovado com sucesso
   */
  static async refreshAccessToken() {
    const refreshToken = localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao renovar token');
      }

      const data = await response.json();
      
      if (data.accessToken) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }

  /**
   * Faz login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Dados do login (tokens, etc)
   */
  static async login(email, senha) {
    const response = await this.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    if (response.accessToken) {
      // Armazena os tokens e dados do usuário
      localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_EMAIL, email);
      localStorage.setItem('userLogged', 'true');
    }

    return response;
  }

  /**
   * Registra um novo usuário
   * @param {string} nome - Nome do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Dados do registro
   */
  static async register(nome, email, senha) {
    const response = await this.request(CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha })
    });

    if (response.accessToken) {
      // Auto login após registro
      localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_EMAIL, email);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NOME, nome);
      localStorage.setItem('userLogged', 'true');
    }

    return response;
  }

  /**
   * Faz logout do usuário
   * @returns {Promise<Object>} - Resposta da API
   */
  static async logout() {
    await this.request(CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST'
    });

    // Limpa os dados armazenados
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ID);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_NOME);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem('userLogged');

    // Redireciona para login
    window.location.href = '/Login/login.html';
  }

  /**
   * Obtém a lista de usuários
   * @returns {Promise<Array>} - Lista de usuários
   */
  static async getUsuarios() {
    const response = await this.request(CONFIG.ENDPOINTS.USUARIOS.LIST);
    return response.usuarios || response;
  }

  /**
   * Obtém dados de um usuário específico
   * @param {number} id - ID do usuário
   * @returns {Promise<Object>} - Dados do usuário
   */
  static async getUsuario(id) {
    return await this.request(CONFIG.ENDPOINTS.USUARIOS.GET(id));
  }

  /**
   * Cria um novo usuário
   * @param {Object} dados - Dados do usuário (nome, email, senha, role, etc)
   * @returns {Promise<Object>} - Usuário criado
   */
  static async createUsuario(dados) {
    return await this.request(CONFIG.ENDPOINTS.USUARIOS.CREATE, {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  /**
   * Atualiza dados de um usuário
   * @param {number} id - ID do usuário
   * @param {Object} dados - Dados a atualizar
   * @returns {Promise<Object>} - Usuário atualizado
   */
  static async updateUsuario(id, dados) {
    return await this.request(CONFIG.ENDPOINTS.USUARIOS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  /**
   * Deleta um usuário
   * @param {number} id - ID do usuário
   * @returns {Promise<Object>} - Resposta da API
   */
  static async deleteUsuario(id) {
    return await this.request(CONFIG.ENDPOINTS.USUARIOS.DELETE(id), {
      method: 'DELETE'
    });
  }

  /**
   * Obtém a lista de certificados
   * @returns {Promise<Array>} - Lista de certificados
   */
  static async getCertificados() {
    const response = await this.request(CONFIG.ENDPOINTS.CERTIFICADOS.LIST);
    return response.certificados || response;
  }

  /**
   * Obtém um certificado específico
   * @param {number} id - ID do certificado
   * @returns {Promise<Object>} - Dados do certificado
   */
  static async getCertificado(id) {
    return await this.request(CONFIG.ENDPOINTS.CERTIFICADOS.GET(id));
  }

  /**
   * Faz upload de um certificado
   * @param {FormData} formData - FormData com o arquivo do certificado
   * @returns {Promise<Object>} - Certificado criado
   */
  static async uploadCertificado(formData) {
    const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CERTIFICADOS.CREATE}`;
    const accessToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao fazer upload');
      }

      return data;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return { error: error.message };
    }
  }

  /**
   * Aceita um certificado
   * @param {number} id - ID do certificado
   * @returns {Promise<Object>} - Resposta da API
   */
  static async aceitarCertificado(id) {
    return await this.request(CONFIG.ENDPOINTS.CERTIFICADOS.ACCEPT(id), {
      method: 'PATCH'
    });
  }

  /**
   * Rejeita um certificado
   * @param {number} id - ID do certificado
   * @param {string} motivo - Motivo da rejeição
   * @returns {Promise<Object>} - Resposta da API
   */
  static async rejeitarCertificado(id, motivo = '') {
    return await this.request(CONFIG.ENDPOINTS.CERTIFICADOS.REJECT(id), {
      method: 'PATCH',
      body: JSON.stringify({ motivo })
    });
  }

  /**
   * Obtém dados do dashboard
   * @returns {Promise<Object>} - Dados do dashboard
   */
  static async getDashboard() {
    return await this.request(CONFIG.ENDPOINTS.DASHBOARD);
  }

  /**
   * Obtém histórico do usuário
   * @returns {Promise<Array>} - Histórico
   */
  static async getHistorico() {
    return await this.request(CONFIG.ENDPOINTS.HISTORICO);
  }

  /**
   * Obtém notificações
   * @returns {Promise<Array>} - Lista de notificações
   */
  static async getNotificacoes() {
    return await this.request(CONFIG.ENDPOINTS.NOTIFICACOES);
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} - true se autenticado
   */
  static isAuthenticated() {
    return !!localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtém o token de acesso atual
   * @returns {string} - Token de acesso
   */
  static getAccessToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtém os dados do usuário armazenados no localStorage
   * @returns {Object} - Dados do usuário
   */
  static getCurrentUser() {
    return {
      email: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_EMAIL),
      nome: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_NOME),
      id: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID),
      role: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ROLE)
    };
  }
}

export default APIClient;
