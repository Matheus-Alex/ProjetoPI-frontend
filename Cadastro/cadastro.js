// ────────────────────────────────────────────────────────────
// Cadastro Script - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

// Verifica autenticação ao carregar a página
checkUserLogin();

let avatarLetras = 'XX';

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCadastro);
} else {
  initCadastro();
}

function initCadastro() {
  const user = APIClient.getCurrentUser();
  
  // Atualiza o perfil na sidebar
  updateProfileInfo(user);

  // Setup de event listeners
  const formulario = document.getElementById('cadastroForm') || document.querySelector('form');
  if (formulario) {
    formulario.addEventListener('submit', handleSubmitCadastro);
  }

  const btnCadastrar = document.getElementById('btn-cadastrar') || 
                       document.querySelector('button[type="submit"]');
  if (btnCadastrar) {
    btnCadastrar.addEventListener('click', handleSubmitCadastro);
  }
}

// Atualiza informações do perfil na sidebar
function updateProfileInfo(user) {
  const nameEl = document.querySelector('.sb-profile-info .name');
  const roleEl = document.querySelector('.sb-profile-info .role');
  const avatarEl = document.querySelector('.sb-profile .avatar');

  if (nameEl && user.nome) {
    nameEl.textContent = user.nome;
  }

  if (roleEl && user.role) {
    roleEl.textContent = user.role;
  }

  if (avatarEl && user.nome) {
    const initials = user.nome
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    avatarEl.textContent = initials;
  }
}

// Atualiza avatar com base no nome
function updateAvatar() {
  const nomeEl = document.getElementById('nome');
  const avatarEl = document.getElementById('avatar');

  if (nomeEl && avatarEl) {
    const nome = nomeEl.value;
    if (nome) {
      const palavras = nome.trim().split(/\s+/);
      const initials = palavras
        .slice(0, 2)
        .map(p => p.charAt(0).toUpperCase())
        .join('');
      avatarEl.textContent = initials || '?';
      avatarLetras = initials;
    }
  }
}

// Handle do envio do formulário de cadastro
async function handleSubmitCadastro(e) {
  e.preventDefault();

  const nome = document.getElementById('nome')?.value;
  const sobrenome = document.getElementById('sobrenome')?.value;
  const email = document.getElementById('email')?.value;
  const cpf = document.getElementById('cpf')?.value;
  const telefone = document.getElementById('telefone')?.value;
  const cep = document.getElementById('cep')?.value;
  const endereco = document.getElementById('endereco')?.value;
  const numero = document.getElementById('numero')?.value;
  const complemento = document.getElementById('complemento')?.value;
  const cidade = document.getElementById('cidade')?.value;
  const estado = document.getElementById('estado')?.value;
  const nascimento = document.getElementById('nascimento')?.value;

  // Validações básicas
  if (!nome || !email) {
    showToast('Nome e email são obrigatórios', 'warning');
    return;
  }

  const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;

  try {
    // Cria o novo usuário
    const response = await APIClient.createUsuario({
      nome: nomeCompleto,
      email,
      cpf,
      telefone,
      cep,
      endereco,
      numero,
      complemento,
      cidade,
      estado,
      nascimento,
      role: 'aluno',
      ativo: true
    });

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast('Cadastro realizado com sucesso!', 'success');
      
      // Limpa o formulário
      document.querySelector('form').reset();
      document.getElementById('avatar').textContent = '?';
      
      // Redireciona após alguns segundos
      setTimeout(() => {
        window.location.href = '/Dashboard/daskboard.html';
      }, 2000);
    }
  } catch (error) {
    showToast('Erro ao cadastrar usuário', 'error');
    console.error('Erro no cadastro:', error);
  }
}

// Exporta funções para uso global
window.APIClient = APIClient;
window.updateAvatar = updateAvatar;
