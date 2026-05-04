// ────────────────────────────────────────────────────────────
// Scripts Globais - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from './api-client.js';

/* Verificar se usuário está logado */
function checkUserLogin() {
  const currentPage = window.location.pathname;
  
  if (!APIClient.isAuthenticated() && !currentPage.includes('login')) {
    // Redirecionar para login se não estiver autenticado
    window.location.href = '/Login/login.html';
  }
}

/* Logout do usuário */
function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    APIClient.logout();
  }
}

/* Máscaras de entrada */
function maskCPF(element) {
  let value = element.value.replace(/\D/g, '');
  value = value.substring(0, 11);
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  element.value = value;
}

function maskPhone(element) {
  let value = element.value.replace(/\D/g, '');
  value = value.substring(0, 11);
  value = value.replace(/(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  element.value = value;
}

function maskCEP(element) {
  let value = element.value.replace(/\D/g, '');
  value = value.substring(0, 8);
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  element.value = value;
}

/* Toast/Notificação */
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast') || createToastElement();
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function createToastElement() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  document.body.appendChild(toast);
  return toast;
}

/* Modal genérico */
function openModal(title, content, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline modal-cancel">Cancelar</button>
        <button class="btn btn-primary modal-confirm">Confirmar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-confirm').addEventListener('click', () => {
    onConfirm?.();
    modal.remove();
  });
  
  return modal;
}

/* Atualizar avatar com iniciais */
function updateAvatar() {
  const nomeInput = document.getElementById('nome');
  const sobrenomeInput = document.getElementById('sobrenome');
  const avatarElement = document.getElementById('avatar');
  
  if (nomeInput && avatarElement) {
    const nome = nomeInput.value.charAt(0).toUpperCase();
    const sobrenome = sobrenomeInput?.value.charAt(0).toUpperCase() || '';
    avatarElement.textContent = (nome + sobrenome) || '?';
  }
}

/* Validação de formulário básica */
function validateForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return false;
  
  const inputs = form.querySelectorAll('[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });
  
  return isValid;
}

/* Inicialização ao carregar a página */
document.addEventListener('DOMContentLoaded', () => {
  // Remover comentário para ativar verificação de login
  // checkUserLogin();
});

// Exportar funções (se usar módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    maskCPF,
    maskPhone,
    maskCEP,
    showToast,
    openModal,
    updateAvatar,
    validateForm,
    logout,
    checkUserLogin
  };
}
