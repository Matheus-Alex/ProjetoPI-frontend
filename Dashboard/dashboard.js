// ────────────────────────────────────────────────────────────
// Dashboard Script - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

// Verifica autenticação ao carregar a página
checkUserLogin();

let chartsInstances = {
  barChart: null,
  pieChart: null,
  lineChart: null
};

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

    // Inicializa gráficos com dados padrão se não houver dados
    initCharts(dashboardData.graficos);
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
    // Mesmo com erro, inicializa os gráficos com dados padrão
    initCharts(null);
  }
}

// Atualiza informações do perfil na sidebar
function updateProfileInfo(user) {
  const nameEl = document.querySelector('.sb-profile-info .name');
  const roleEl = document.querySelector('.sb-profile-info .role');
  const avatarEl = document.querySelector('.sb-profile .avatar');
  const headerH1 = document.querySelector('.main-header h1');

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

  if (headerH1 && user.nome) {
    const primeiroNome = user.nome.split(' ')[0];
    headerH1.textContent = `Bem-vindo, ${primeiroNome}!`;
  }
}

// Atualiza as métricas do dashboard
function updateMetrics(metricas) {
  const metricValues = document.querySelectorAll('.metric-value');
  
  if (metricValues.length >= 4) {
    metricValues[0].textContent = metricas.totalAlunos || 0;
    metricValues[1].textContent = metricas.certificadosAprovados || 0;
    metricValues[2].textContent = metricas.certificadosAguardando || 0;
    metricValues[3].textContent = metricas.certificadosRejeitados || 0;
  }
}

// Inicializa os gráficos
function initCharts(graficos) {
  // Gráfico de Barras - Atividades Mensais
  const ctxBar = document.getElementById('cBar');
  if (ctxBar && !chartsInstances.barChart) {
    chartsInstances.barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Certificados',
          data: graficos?.barras || [12, 19, 8, 15, 10, 25],
          backgroundColor: [
            '#1D3E73',
            '#2d5aa3',
            '#3a6db8',
            '#F08A01',
            '#F6AE4E',
            '#4CAF50'
          ],
          borderRadius: 5,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1D3E73',
            padding: 10,
            borderRadius: 5
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            }
          }
        }
      }
    });
  }

  // Gráfico de Pizza - Rejeitados por Motivo
  const ctxPie = document.getElementById('cPie');
  if (ctxPie && !chartsInstances.pieChart) {
    chartsInstances.pieChart = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Incompleto', 'Ilegível', 'Fora do prazo', 'Outros'],
        datasets: [{
          data: graficos?.pizza || [30, 25, 20, 25],
          backgroundColor: [
            '#1D3E73',
            '#F08A01',
            '#F6AE4E',
            '#d8dce8'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: '#1D3E73',
            padding: 10,
            borderRadius: 5,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  }

  // Gráfico de Linhas - Distribuição por Área
  const ctxLine = document.getElementById('cLine');
  if (ctxLine && !chartsInstances.lineChart) {
    chartsInstances.lineChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Exatas',
            data: graficos?.linhas?.exatas || [10, 15, 12, 18, 14, 20],
            borderColor: '#1D3E73',
            backgroundColor: 'rgba(29, 62, 115, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Humanas',
            data: graficos?.linhas?.humanas || [8, 12, 10, 14, 11, 18],
            borderColor: '#F08A01',
            backgroundColor: 'rgba(240, 138, 1, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Saúde',
            data: graficos?.linhas?.saude || [12, 14, 16, 15, 17, 19],
            borderColor: '#F6AE4E',
            backgroundColor: 'rgba(246, 174, 78, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: '#1D3E73',
            padding: 10,
            borderRadius: 5
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Atualiza gráficos (para dados em tempo real)
function updateCharts(novosDados) {
  if (chartsInstances.barChart && novosDados.barras) {
    chartsInstances.barChart.data.datasets[0].data = novosDados.barras;
    chartsInstances.barChart.update();
  }

  if (chartsInstances.pieChart && novosDados.pizza) {
    chartsInstances.pieChart.data.datasets[0].data = novosDados.pizza;
    chartsInstances.pieChart.update();
  }

  if (chartsInstances.lineChart && novosDados.linhas) {
    chartsInstances.lineChart.data.datasets[0].data = novosDados.linhas.exatas;
    chartsInstances.lineChart.data.datasets[1].data = novosDados.linhas.humanas;
    chartsInstances.lineChart.data.datasets[2].data = novosDados.linhas.saude;
    chartsInstances.lineChart.update();
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
window.updateCharts = updateCharts;
