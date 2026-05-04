// ────────────────────────────────────────────────────────────
// Dashboard Script - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

// Verifica autenticação ao carregar a página
checkUserLogin();

// Inicializa o dashboard
async function initDashboard() {
  try {
    const user = APIClient.getCurrentUser();
    
    // Atualiza o perfil na sidebar
    updateProfileInfo(user);

    // Carrega dados do dashboard
    const dashboardData = await APIClient.getDashboard();

    if (dashboardData.error) {
      showToast('Erro ao carregar dados do dashboard', 'error');
      return;
    }

    // Atualiza métricas
    if (dashboardData.metricas) {
      updateMetrics(dashboardData.metricas);
    }

    // Atualiza gráficos
    if (dashboardData.graficos) {
      updateCharts(dashboardData.graficos);
    }
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
    showToast('Erro ao carregar dashboard', 'error');
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
    // Gera iniciais do nome
    const initials = user.nome
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    avatarEl.textContent = initials;
  }
}

// Atualiza as métricas do dashboard
function updateMetrics(metricas) {
  const metricValues = document.querySelectorAll('.metric-value');
  
  if (metricValues.length >= 4) {
    metricValues[0].textContent = metricas.totalAlunos || '0';
    metricValues[1].textContent = metricas.certificadosAguardando || '0';
    metricValues[2].textContent = metricas.certificadosAprovados || '0';
    metricValues[3].textContent = metricas.certificadosRejeitados || '0';
  }
}

// Atualiza os gráficos
function updateCharts(graficos) {
  // Atualiza gráfico de barras (atividades mensais)
  const barChart = document.getElementById('cBar');
  if (barChart && graficos.barras) {
    // Implementar lógica de gráfico com Chart.js ou similar
    console.log('Dados do gráfico de barras:', graficos.barras);
  }

  // Atualiza gráfico de pizza (rejeitados)
  const pieChart = document.getElementById('cPie');
  if (pieChart && graficos.pizza) {
    console.log('Dados do gráfico de pizza:', graficos.pizza);
  }

  // Atualiza gráfico de linhas (distribuição por área)
  const lineChart = document.getElementById('cLine');
  if (lineChart && graficos.linhas) {
    console.log('Dados do gráfico de linhas:', graficos.linhas);
  }
}

// Inicializa quando o DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Exporta para uso global
window.APIClient = APIClient;
