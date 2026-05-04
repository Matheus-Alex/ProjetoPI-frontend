// ────────────────────────────────────────────────────────────
// Histórico Script - Sistema de Certificados Senac (CORRIGIDO)
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

checkUserLogin();

let historicoData = [];

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHistorico);
} else {
  initHistorico();
}

function initHistorico() {
  setupEventListeners();
  carregarHistorico();
  
  // *** ESCUTA EVENTOS DO CERTIFICADO ***
  window.addEventListener('historico:reload', carregarHistorico);
}

function setupEventListeners() {
  const marcarTodosCheckbox = document.getElementById('marcar-todos');
  const btnExcluir = document.querySelector('.btn-excluir');
  const inputBusca = document.getElementById('busca');

  // ✅ MARCA/DESMARCA TODOS - CORRIGIDO
  if (marcarTodosCheckbox) {
    marcarTodosCheckbox.addEventListener('change', (e) => {
      marcarTodos(e.target.checked);
    });
  }

  // ✅ BUSCA EM TEMPO REAL
  if (inputBusca) {
    inputBusca.addEventListener('input', debounce((e) => {
      filtrarTabela(e.target.value);
    }, 300));
  }

  // ✅ EXCLUIR SELECIONADOS - CHAMA API
  if (btnExcluir) {
    btnExcluir.addEventListener('click', excluirSelecionados);
  }

  // ✅ DELEGATE EVENTOS PARA CHECKBOXES (funciona com linhas dinâmicas)
  document.getElementById('tabela-historico').addEventListener('change', (e) => {
    if (e.target.classList.contains('linha-check')) {
      atualizarMarcarTodos();
      atualizarEstadoBotaoExcluir();
    }
  });
}

function marcarTodos(marcar) {
  const checkboxes = document.querySelectorAll('.linha-check');
  checkboxes.forEach(cb => cb.checked = marcar);
  atualizarEstadoBotaoExcluir();
}

function atualizarMarcarTodos() {
  const checkboxes = document.querySelectorAll('.linha-check');
  const marcarTodos = document.getElementById('marcar-todos');
  const todosMarcados = Array.from(checkboxes).every(cb => cb.checked);
  const nenhumMarcado = Array.from(checkboxes).every(cb => !cb.checked);
  
  if (marcarTodos) {
    marcarTodos.checked = todosMarcados;
    marcarTodos.indeterminate = !todosMarcados && !nenhumMarcado;
  }
}

async function carregarHistorico() {
  try {
    showToast('Carregando histórico...', 'info');
    historicoData = await APIClient.getHistorico();

    if (historicoData?.error) {
      showToast('Erro ao carregar histórico', 'error');
      return;
    }

    renderizarHistorico(Array.isArray(historicoData) ? historicoData : []);
    atualizarTotal();
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    showToast('Erro de conexão', 'error');
  }
}

function renderizarHistorico(dados) {
  const tbody = document.querySelector('#tabela-historico tbody');
  if (!tbody) return;

  // Limpa tudo
  tbody.innerHTML = '';

  if (dados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-400);">
          Nenhum registro encontrado
        </td>
      </tr>
    `;
    return;
  }

  // Renderiza cada item
  dados.forEach(item => {
    const row = tbody.insertRow();
    const dataFormatada = new Date(item.data_criacao || item.criado_em || Date.now())
      .toLocaleDateString('pt-BR');
    
    const statusClass = item.status === 'aprovado' ? 'badge-aprovado' : 
                       (item.status === 'pendente' || item.status === 'avaliacao') ? 'badge-avaliacao' : 
                       'badge-rejeitado';
    
    const statusTexto = item.status === 'aprovado' ? 'Aprovado' :
                       (item.status === 'pendente' || item.status === 'avaliacao') ? 'Em avaliação' :
                       'Rejeitado';

    row.innerHTML = `
      <td><input type="checkbox" class="linha-check" data-id="${item.id}" aria-label="Selecionar linha"></td>
      <td class="td-id">#${item.id || 'N/A'}</td>
      <td class="td-nome">${item.nome_usuario || item.nome || 'N/A'}</td>
      <td class="td-curso">${item.nome_curso || item.curso || 'N/A'}</td>
      <td>
        <a href="#" class="cert-link" data-id="${item.certificado_id || item.id}">
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
  });
}

async function excluirSelecionados() {
  const selecionados = document.querySelectorAll('.linha-check:checked');
  
  if (selecionados.length === 0) {
    showToast('Selecione pelo menos um registro', 'warning');
    return;
  }

  if (!confirm(`❌ Excluir ${selecionados.length} registro(s) do histórico?`)) return;

  const ids = Array.from(selecionados).map(cb => cb.dataset.id).filter(Boolean);

  try {
    const response = await APIClient.excluirHistorico(ids);

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast(`${selecionados.length} registro(s) excluído(s)!`, 'success');
      
      // Remove visualmente
      selecionados.forEach(cb => {
        const row = cb.closest('tr');
        if (row) row.remove();
      });
      
      atualizarTotal();
      atualizarMarcarTodos();
    }
  } catch (error) {
    showToast('Erro ao excluir registros', 'error');
    console.error(error);
  }
}

function atualizarTotal() {
  const totalBar = document.querySelector('.total-bar');
  const total = document.querySelectorAll('#tabela-historico tbody tr').length;
  if (totalBar) {
    totalBar.innerHTML = `Total: <strong>${total} registro${total !== 1 ? 's' : ''}</strong>`;
  }
}

function atualizarEstadoBotaoExcluir() {
  const btnExcluir = document.querySelector('.btn-excluir');
  const selecionados = document.querySelectorAll('.linha-check:checked').length;
  
  if (btnExcluir) {
    btnExcluir.disabled = selecionados === 0;
    btnExcluir.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
      Excluir selecionados (${selecionados})
    `;
  }
}

function filtrarTabela(termo) {
  const linhas = document.querySelectorAll('#tabela-historico tbody tr');
  let visiveis = 0;

  linhas.forEach(linha => {
    const nome = linha.querySelector('.td-nome')?.textContent || '';
    const matricula = linha.querySelector('.td-id')?.textContent || '';
    const curso = linha.querySelector('.td-curso')?.textContent || '';
    
    const match = nome.toLowerCase().includes(termo.toLowerCase()) ||
                  matricula.toLowerCase().includes(termo.toLowerCase()) ||
                  curso.toLowerCase().includes(termo.toLowerCase());
    
    linha.style.display = match ? '' : 'none';
    if (match) visiveis++;
  });

  atualizarTotalVisiveis(visiveis);
}

function atualizarTotalVisiveis(visiveis) {
  const tfoot = document.querySelector('#tabela-historico tfoot td');
  if (tfoot && historicoData.length > 0) {
    tfoot.textContent = `Exibindo ${visiveis} de ${historicoData.length} registros`;
  }
}

// ✅ UTILITÁRIOS
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}