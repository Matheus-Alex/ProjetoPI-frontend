// ────────────────────────────────────────────────────────────
// Histórico Script - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

// Verifica autenticação ao carregar a página
checkUserLogin();

let historicoData = [];

// Inicializa quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHistorico);
} else {
  initHistorico();
}

function initHistorico() {
  const user = APIClient.getCurrentUser();
  
  // Atualiza o perfil na sidebar
  updateProfileInfo(user);

  // Setup event listeners
  const marcarTodosCheckbox = document.getElementById('marcar-todos');
  const linhasCheckboxes = document.querySelectorAll('.linha-check');
  const btnExcluir = document.querySelector('.btn-excluir');
  const inputBusca = document.getElementById('busca');

  // Marcar/desmarcar todos
  if (marcarTodosCheckbox) {
    marcarTodosCheckbox.addEventListener('change', (e) => {
      linhasCheckboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
      });
      atualizarEstadoBotaoExcluir();
    });
  }

  // Atualizar estado ao clicar em checkboxes individuais
  linhasCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // Se todos estão marcados, marca o "marcar todos"
      const todosChecados = Array.from(linhasCheckboxes).every(cb => cb.checked);
      if (marcarTodosCheckbox) {
        marcarTodosCheckbox.checked = todosChecados;
      }
      atualizarEstadoBotaoExcluir();
    });
  });

  // Botão excluir
  if (btnExcluir) {
    btnExcluir.addEventListener('click', excluirSelecionados);
  }

  // Busca em tempo real
  if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
      filtrarTabela(e.target.value);
    });
  }

  // Carrega histórico do servidor
  carregarHistorico();
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

// Carrega histórico da API
async function carregarHistorico() {
  try {
    historicoData = await APIClient.getHistorico();

    if (historicoData.error) {
      showToast('Erro ao carregar histórico', 'error');
      return;
    }

    // Se for array, renderiza
    if (Array.isArray(historicoData) && historicoData.length > 0) {
      renderizarHistorico(historicoData);
    } else {
      // Se não houver dados, mostra mensagem
      console.log('Nenhum histórico encontrado');
    }
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    // Mantém os dados estáticos se houver erro
  }
}

// Renderiza histórico na tabela
function renderizarHistorico(dados) {
  const tbody = document.querySelector('#tabela-historico tbody');
  if (!tbody) return;

  // Limpa linhas existentes (exceto as que já têm dados)
  const linhasExistentes = tbody.querySelectorAll('tr');
  if (linhasExistentes.length > dados.length) {
    for (let i = dados.length; i < linhasExistentes.length; i++) {
      linhasExistentes[i].remove();
    }
  }

  // Renderiza cada registro
  dados.forEach((item, index) => {
    let row = tbody.rows[index];
    
    if (!row) {
      row = tbody.insertRow();
    }

    const dataFormatada = new Date(item.data_criacao || item.criado_em).toLocaleDateString('pt-BR');
    const statusClass = item.status === 'aprovado' ? 'badge-aprovado' : 
                        item.status === 'avaliacao' || item.status === 'pendente' ? 'badge-avaliacao' : 
                        'badge-rejeitado';
    const statusTexto = item.status === 'aprovado' ? 'Aprovado' :
                        item.status === 'avaliacao' || item.status === 'pendente' ? 'Em avaliação' :
                        'Rejeitado';

    row.innerHTML = `
      <td><input type="checkbox" class="linha-check" aria-label="Selecionar linha"></td>
      <td class="td-id">#${item.id || '000000'}</td>
      <td class="td-nome">${item.nome_usuario || item.nome || 'N/A'}</td>
      <td class="td-curso">${item.nome_curso || item.curso || 'N/A'}</td>
      <td>
        <a href="#" class="cert-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Ver
        </a>
      </td>
      <td><span class="badge ${statusClass}">${statusTexto}</span></td>
      <td>${dataFormatada}</td>
    `;

    // Readiciona event listeners aos checkboxes
    const checkbox = row.querySelector('.linha-check');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        atualizarEstadoBotaoExcluir();
      });
    }
  });

  // Atualiza total
  const totalBar = document.querySelector('.total-bar');
  if (totalBar) {
    totalBar.textContent = `Total: ${dados.length > 0 ? dados.length : historicoData.length} registros`;
  }
}

// Atualiza estado do botão excluir
function atualizarEstadoBotaoExcluir() {
  const btnExcluir = document.querySelector('.btn-excluir');
  const linhasChecadas = document.querySelectorAll('.linha-check:checked');

  if (btnExcluir) {
    if (linhasChecadas.length > 0) {
      btnExcluir.disabled = false;
      btnExcluir.textContent = `Excluir selecionados (${linhasChecadas.length})`;
    } else {
      btnExcluir.disabled = true;
      btnExcluir.textContent = 'Excluir selecionados';
    }
  }
}

// Filtra tabela por busca
function filtrarTabela(termo) {
  const linhas = document.querySelectorAll('#tabela-historico tbody tr');
  
  linhas.forEach(linha => {
    const nome = linha.querySelector('.td-nome')?.textContent || '';
    const matricula = linha.querySelector('.td-id')?.textContent || '';
    
    const match = nome.toLowerCase().includes(termo.toLowerCase()) ||
                  matricula.toLowerCase().includes(termo.toLowerCase());
    
    linha.style.display = match ? '' : 'none';
  });
}

// Exclui linhas selecionadas
function excluirSelecionados() {
  const selecionadas = document.querySelectorAll('.linha-check:checked');

  if (selecionadas.length === 0) {
    showToast('Selecione pelo menos uma linha', 'warning');
    return;
  }

  if (confirm(`Tem certeza que deseja excluir ${selecionadas.length} registro(s)?`)) {
    selecionadas.forEach(checkbox => {
      const row = checkbox.closest('tr');
      if (row) {
        row.style.transition = 'opacity 0.3s ease';
        row.style.opacity = '0';
        
        setTimeout(() => {
          row.remove();
          
          // Atualiza total
          const totalBar = document.querySelector('.total-bar');
          const linhasRestantes = document.querySelectorAll('#tabela-historico tbody tr');
          if (totalBar) {
            totalBar.textContent = `Total: ${linhasRestantes.length} registros`;
          }
          
          // Desmarca "marcar todos"
          document.getElementById('marcar-todos').checked = false;
          atualizarEstadoBotaoExcluir();
        }, 300);
      }
    });

    showToast(`${selecionadas.length} registro(s) excluído(s)`, 'success');
  }
}

// Exporta para uso global
window.APIClient = APIClient;
