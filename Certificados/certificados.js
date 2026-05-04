// ────────────────────────────────────────────────────────────
// Certificados Script - Sistema de Certificados Senac
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

// Verifica autenticação ao carregar a página
checkUserLogin();

let certificadoAtualId = null;

// Inicializa os listeners quando DOM está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCertificados);
} else {
  initCertificados();
}

function initCertificados() {
  // Setup upload drag & drop
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const btnValidar = document.getElementById('btn-validar');
  const btnAprovar = document.getElementById('btn-aprovar');
  const btnRecusar = document.getElementById('btn-recusar');

  if (uploadArea) {
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#F08A01';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '#ddd';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#ddd';
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadArea.querySelector('p').textContent = `Arquivo: ${file.name}`;
      }
    });
  }

  if (btnValidar) {
    btnValidar.addEventListener('click', validarCertificado);
  }

  if (btnAprovar) {
    btnAprovar.addEventListener('click', aprovarCertificado);
  }

  if (btnRecusar) {
    btnRecusar.addEventListener('click', recusarCertificado);
  }

  // Carrega certificados pendentes
  carregarCertificados();
}

// Valida e faz upload do certificado
async function validarCertificado() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (!file) {
    showToast('Selecione um arquivo para validar', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('arquivo', file);

  try {
    const response = await APIClient.uploadCertificado(formData);

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      certificadoAtualId = response.id || response.certificado_id;
      showToast('Certificado validado com sucesso!', 'success');
      
      // Mostra detalhes do certificado se disponíveis
      if (response.usuario_nome) {
        document.querySelector('.card-desc').textContent = 
          `Certificado de ${response.usuario_nome} - ${response.curso_nome}`;
      }
    }
  } catch (error) {
    showToast('Erro ao fazer upload do certificado', 'error');
  }
}

// Aprova o certificado
async function aprovarCertificado() {
  if (!certificadoAtualId) {
    showToast('Nenhum certificado para aprovar', 'warning');
    return;
  }

  if (!confirm('Tem certeza que deseja aprovar este certificado?')) {
    return;
  }

  try {
    const response = await APIClient.aceitarCertificado(certificadoAtualId);

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast('Certificado aprovado com sucesso!', 'success');
      // Limpa o formulário
      document.getElementById('file-input').value = '';
      certificadoAtualId = null;
      carregarCertificados();
    }
  } catch (error) {
    showToast('Erro ao aprovar certificado', 'error');
  }
}

// Recusa o certificado
async function recusarCertificado() {
  if (!certificadoAtualId) {
    showToast('Nenhum certificado para recusar', 'warning');
    return;
  }

  const motivo = document.getElementById('motivo-recusa').value;
  const observacao = document.getElementById('obs-recusa').value;

  if (!motivo) {
    showToast('Selecione um motivo para recusar', 'warning');
    return;
  }

  if (!confirm('Tem certeza que deseja recusar este certificado?')) {
    return;
  }

  try {
    const response = await APIClient.rejeitarCertificado(
      certificadoAtualId,
      `${motivo}: ${observacao}`
    );

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast('Certificado recusado com sucesso!', 'success');
      // Limpa o formulário
      document.getElementById('file-input').value = '';
      document.getElementById('motivo-recusa').value = '';
      document.getElementById('obs-recusa').value = '';
      certificadoAtualId = null;
      carregarCertificados();
    }
  } catch (error) {
    showToast('Erro ao recusar certificado', 'error');
  }
}

// Carrega certificados pendentes
async function carregarCertificados() {
  try {
    const certificados = await APIClient.getCertificados();

    if (Array.isArray(certificados)) {
      // Filtra certificados pendentes
      const pendentes = certificados.filter(c => c.status === 'pendente');
      
      if (pendentes.length === 0) {
        showToast('Nenhum certificado pendente', 'info');
      }
    }
  } catch (error) {
    console.error('Erro ao carregar certificados:', error);
  }
}

// Exporta para uso global
window.APIClient = APIClient;
