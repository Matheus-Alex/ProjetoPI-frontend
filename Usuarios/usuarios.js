// ────────────────────────────────────────────────────────────
// Usuários Script - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

// Verifica autenticação ao carregar a página
checkUserLogin();

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUsuarios);
} else {
  initUsuarios();
}

function initUsuarios() {
  const user = APIClient.getCurrentUser();
  
  // Atualiza o perfil na sidebar
  updateProfileInfo(user);

  // Carrega lista de usuários
  carregarUsuarios();

  // Setup de event listeners
  const formulario = document.getElementById('usuariosForm');
  if (formulario) {
    formulario.addEventListener('submit', handleSubmitForm);
  }

  const btnNew = document.getElementById('btnNovoUsuario');
  if (btnNew) {
    btnNew.addEventListener('click', abrirNovoUsuario);
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

// Carrega lista de usuários
async function carregarUsuarios() {
  try {
    const usuarios = await APIClient.getUsuarios();

    if (usuarios.error) {
      showToast('Erro ao carregar usuários', 'error');
      return;
    }

    const tabela = document.querySelector('tbody');
    if (tabela && Array.isArray(usuarios)) {
      tabela.innerHTML = '';

      usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${usuario.nome || 'N/A'}</td>
          <td>${usuario.email || 'N/A'}</td>
          <td>${usuario.role || 'aluno'}</td>
          <td>${usuario.ativo ? 'Ativo' : 'Inativo'}</td>
          <td>
            <button class="btn btn-small" onclick="editarUsuario(${usuario.id})">Editar</button>
            <button class="btn btn-small btn-danger" onclick="deletarUsuario(${usuario.id})">Deletar</button>
          </td>
        `;
        tabela.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    showToast('Erro ao carregar usuários', 'error');
  }
}

// Abre formulário para novo usuário
function abrirNovoUsuario() {
  const form = document.getElementById('usuariosForm');
  if (form) {
    form.reset();
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

// Edita um usuário
async function editarUsuario(id) {
  try {
    const usuario = await APIClient.getUsuario(id);

    if (usuario.error) {
      showToast('Erro ao carregar usuário', 'error');
      return;
    }

    // Popula o formulário com dados do usuário
    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('role').value = usuario.role || 'aluno';

    // Mostra o formulário
    const form = document.getElementById('usuariosForm');
    if (form) {
      form.style.display = 'block';
    }
  } catch (error) {
    showToast('Erro ao carregar usuário', 'error');
  }
}

// Deleta um usuário
async function deletarUsuario(id) {
  if (!confirm('Tem certeza que deseja deletar este usuário?')) {
    return;
  }

  try {
    const response = await APIClient.deleteUsuario(id);

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast('Usuário deletado com sucesso', 'success');
      carregarUsuarios();
    }
  } catch (error) {
    showToast('Erro ao deletar usuário', 'error');
  }
}

// Handle do envio do formulário
async function handleSubmitForm(e) {
  e.preventDefault();

  const id = document.getElementById('usuarioId')?.value;
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const role = document.getElementById('role').value;
  const senha = document.getElementById('senha').value;

  if (!nome || !email) {
    showToast('Preencha todos os campos obrigatórios', 'warning');
    return;
  }

  try {
    let response;

    if (id) {
      // Atualiza usuário existente
      response = await APIClient.updateUsuario(id, { nome, email, role });
    } else {
      // Cria novo usuário
      if (!senha) {
        showToast('Digite uma senha para o novo usuário', 'warning');
        return;
      }
      response = await APIClient.createUsuario({ nome, email, role, senha });
    }

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast(`Usuário ${id ? 'atualizado' : 'criado'} com sucesso`, 'success');
      document.getElementById('usuariosForm').reset();
      document.getElementById('usuariosForm').style.display = 'none';
      carregarUsuarios();
    }
  } catch (error) {
    showToast('Erro ao salvar usuário', 'error');
  }
}

// Exporta funções para uso global
window.APIClient = APIClient;
window.editarUsuario = editarUsuario;
window.deletarUsuario = deletarUsuario;
