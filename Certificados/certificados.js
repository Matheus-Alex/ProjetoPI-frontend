// ────────────────────────────────────────────────────────────
// Certificados Script - Sistema de Certificados Senac (CORRIGIDO)
// ────────────────────────────────────────────────────────────

import APIClient from '../public/js/api-client.js';

checkUserLogin();

let certificadoAtualId = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCertificados);
} else {
  initCertificados();
}

function initCertificados() {
  setupUploadEvents();
  setupButtons();
  carregarCertificados();
}

function setupUploadEvents() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');

  if (uploadArea && fileInput) {
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
        updateUploadText(fileInput.files[0]?.name);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        updateUploadText(file.name);
      }
    });
  }
}

function updateUploadText(filename) {
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea && filename) {
    uploadArea.querySelector('p').textContent = `Arquivo: ${filename}`;
  }
}

function setupButtons() {
  document.getElementById('btn-validar')?.addEventListener('click', validarCertificado);
  document.getElementById('btn-aprovar')?.addEventListener('click', aprovarCertificado);
  document.getElementById('btn-recusar')?.addEventListener('click', recusarCertificado);
}

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
      
      if (response.usuario_nome) {
        document.querySelector('.card-desc').textContent = 
          `Certificado de ${response.usuario_nome} - ${response.curso_nome}`;
      }
    }
  } catch (error) {
    showToast('Erro ao fazer upload do certificado', 'error');
  }
}

async function aprovarCertificado() {
  if (!certificadoAtualId) {
    showToast('Nenhum certificado para aprovar', 'warning');
    return;
  }

  if (!confirm('✅ Aprovar este certificado? Ele aparecerá no histórico.')) return;

  try {
    const response = await APIClient.aceitarCertificado(certificadoAtualId);

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast('✅ Certificado APROVADO e adicionado ao histórico!', 'success');
      resetForm();
      // *** IMPORTANTE: Recarrega histórico em outra aba se estiver aberta ***
      window.dispatchEvent(new CustomEvent('historico:reload'));
    }
  } catch (error) {
    showToast('Erro ao aprovar certificado', 'error');
  }
}

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

  if (!confirm('❌ Recusar este certificado? Ele aparecerá no histórico.')) return;

  try {
    const response = await APIClient.rejeitarCertificado(
      certificadoAtualId,
      `${motivo}: ${observacao}`
    );

    if (response.error) {
      showToast(`Erro: ${response.error}`, 'error');
    } else {
      showToast('❌ Certificado RECUSADO e adicionado ao histórico!', 'success');
      resetForm();
      // *** IMPORTANTE: Recarrega histórico em outra aba se estiver aberta ***
      window.dispatchEvent(new CustomEvent('historico:reload'));
    }
  } catch (error) {
    showToast('Erro ao recusar certificado', 'error');
  }
}

function resetForm() {
  document.getElementById('file-input').value = '';
  document.getElementById('motivo-recusa').value = '';
  document.getElementById('obs-recusa').value = '';
  certificadoAtualId = null;
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.querySelector('p').textContent = 'Arraste o arquivo aqui ou clique para selecionar';
  }
}

async function carregarCertificados() {
  try {
    const certificados = await APIClient.getCertificados();
    if (Array.isArray(certificados)) {
      const pendentes = certificados.filter(c => c.status === 'pendente');
      if (pendentes.length === 0) {
        showToast('Nenhum certificado pendente', 'info');
      }
    }
  } catch (error) {
    console.error('Erro ao carregar certificados:', error);
  }
}