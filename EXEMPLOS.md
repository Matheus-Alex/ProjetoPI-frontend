# 📚 Exemplos de Uso da API

## Login

### HTML (login.html)
```html
<form id="loginForm">
  <input type="email" id="email" placeholder="seu@email.com" required>
  <input type="password" id="senha" placeholder="Sua senha" required>
  <button type="submit">Login</button>
</form>

<script type="module">
  import APIClient from '../public/js/api-client.js';
  
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    const response = await APIClient.login(email, senha);
    
    if (response.error) {
      alert('Erro: ' + response.error);
    } else {
      window.location.href = '/Dashboard/daskboard.html';
    }
  });
</script>
```

---

## Listar Usuários

```javascript
import APIClient from './api-client.js';

async function listarUsuarios() {
  const usuarios = await APIClient.getUsuarios();
  
  if (usuarios.error) {
    console.error('Erro:', usuarios.error);
    return;
  }
  
  usuarios.forEach(usuario => {
    console.log(`${usuario.nome} (${usuario.email})`);
  });
}
```

---

## Criar Novo Usuário

```javascript
const novoUsuario = {
  nome: 'João Silva',
  email: 'joao@email.com',
  role: 'aluno', // aluno, coordenador, super_admin
  ativo: true
};

const response = await APIClient.createUsuario(novoUsuario);

if (response.error) {
  showToast(`Erro: ${response.error}`, 'error');
} else {
  showToast('Usuário criado com sucesso!', 'success');
}
```

---

## Atualizar Usuário

```javascript
const usuarioId = 123;
const dadosAtualizados = {
  nome: 'João Silva Santos',
  role: 'coordenador'
};

const response = await APIClient.updateUsuario(usuarioId, dadosAtualizados);

if (!response.error) {
  showToast('Usuário atualizado com sucesso!', 'success');
}
```

---

## Upload de Certificado

```javascript
async function enviarCertificado() {
  const fileInput = document.getElementById('certificate-file');
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('Selecione um arquivo', 'warning');
    return;
  }
  
  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('descricao', 'Certificado de conclusão');
  
  const response = await APIClient.uploadCertificado(formData);
  
  if (response.error) {
    showToast(`Erro: ${response.error}`, 'error');
  } else {
    showToast('Certificado enviado com sucesso!', 'success');
  }
}
```

---

## Validar (Aprovar) Certificado

```javascript
async function aprovarCertificado() {
  const certificadoId = 42;
  
  const response = await APIClient.aceitarCertificado(certificadoId);
  
  if (!response.error) {
    showToast('Certificado aprovado!', 'success');
  }
}
```

---

## Rejeitar Certificado

```javascript
async function rejeitarCertificado() {
  const certificadoId = 42;
  const motivo = 'Documento ilegível - favor reenviar com melhor qualidade';
  
  const response = await APIClient.rejeitarCertificado(certificadoId, motivo);
  
  if (!response.error) {
    showToast('Certificado recusado', 'warning');
  }
}
```

---

## Obter Dados do Dashboard

```javascript
async function carregarDashboard() {
  const dashboard = await APIClient.getDashboard();
  
  if (dashboard.error) {
    console.error('Erro:', dashboard.error);
    return;
  }
  
  // Exemplo de estrutura esperada:
  // {
  //   metricas: {
  //     totalAlunos: 150,
  //     certificadosAguardando: 12,
  //     certificadosAprovados: 234,
  //     certificadosRejeitados: 8
  //   },
  //   graficos: {
  //     barras: [...],
  //     pizza: [...],
  //     linhas: [...]
  //   }
  // }
  
  console.log('Total de alunos:', dashboard.metricas.totalAlunos);
  console.log('Certificados aguardando:', dashboard.metricas.certificadosAguardando);
}
```

---

## Proteção de Rota (Redirect automático)

```javascript
// Adicione isto no início de cada página que precisa autenticação

checkUserLogin();

// Esta função está em main.js e faz redirect automático para login
// se o usuário não estiver autenticado
```

---

## Usar Dados do Usuário Logado

```javascript
import APIClient from './api-client.js';

const user = APIClient.getCurrentUser();

console.log('Email:', user.email);
console.log('Nome:', user.nome);
console.log('ID:', user.id);
console.log('Role:', user.role);

// Exemplo: Mostrar nome na sidebar
document.querySelector('.user-name').textContent = user.nome;
```

---

## Fazer Logout

```javascript
function logoutUsuario() {
  if (confirm('Tem certeza que deseja sair?')) {
    logout(); // Função global em main.js
    // Redireciona automaticamente para /Login/login.html
  }
}
```

---

## Verificar Autenticação

```javascript
import APIClient from './api-client.js';

if (APIClient.isAuthenticated()) {
  console.log('Usuário autenticado');
} else {
  console.log('Usuário NÃO autenticado');
}

// Obter token atual
const token = APIClient.getAccessToken();
```

---

## Máscaras de Entrada

```html
<!-- CPF -->
<input type="text" oninput="maskCPF(this)" placeholder="000.000.000-00" maxlength="14">

<!-- Telefone -->
<input type="text" oninput="maskPhone(this)" placeholder="(00) 00000-0000" maxlength="15">

<!-- CEP -->
<input type="text" oninput="maskCEP(this)" placeholder="00000-000" maxlength="9">
```

---

## Notificações (Toast)

```javascript
// Sucesso
showToast('Operação realizada com sucesso!', 'success');

// Erro
showToast('Erro ao processar operação', 'error');

// Aviso
showToast('Atenção: verifique os dados', 'warning');

// Informação
showToast('Aqui está uma informação importante', 'info');

// Com duração customizada (5 segundos)
showToast('Mensagem customizada', 'success', 5000);
```

---

## Headers das Requisições

O `APIClient` adiciona automaticamente o token no header:

```
GET /api/usuarios HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Tratamento de Erros

```javascript
try {
  const response = await APIClient.getUsuarios();
  
  if (response.error) {
    // Erro da API
    console.error('Erro da API:', response.error);
    showToast(response.error, 'error');
  } else {
    // Sucesso
    console.log('Usuários:', response);
  }
} catch (error) {
  // Erro de rede
  console.error('Erro de rede:', error);
  showToast('Erro de conexão com servidor', 'error');
}
```

---

## Renovação de Token Automática

O `APIClient` trata automaticamente a renovação de token quando ele expira:

1. Detecta resposta 401 (não autorizado)
2. Tenta usar o `refreshToken` para obter um novo `accessToken`
3. Se renovado com sucesso, repete a requisição original
4. Se falhar, redireciona para login

```javascript
// Você não precisa fazer nada! Funciona automaticamente.

// Exemplo:
const usuarios = await APIClient.getUsuarios(); // Funciona mesmo se token expirou
```

---

## Request Customizado

Se precisar fazer uma requisição não coberta pelo APIClient:

```javascript
const response = await APIClient.request('/certificados/123', {
  method: 'GET'
});

// Com POST
const response = await APIClient.request('/certificados', {
  method: 'POST',
  body: JSON.stringify({
    titulo: 'Novo certificado',
    descricao: 'Descrição'
  })
});
```

---

## Dicas de Boas Práticas

✅ **Sempre importar APIClient como módulo**
```javascript
import APIClient from './api-client.js';
```

✅ **Sempre verificar erros**
```javascript
if (response.error) { /* tratar erro */ }
```

✅ **Usar showToast para feedback do usuário**
```javascript
showToast('Mensagem para o usuário', 'success');
```

✅ **Proteger rotas com checkUserLogin()**
```javascript
checkUserLogin(); // No início do script
```

✅ **Usar try-catch para requisições**
```javascript
try {
  const data = await APIClient.method();
} catch (error) {
  showToast('Erro: ' + error.message, 'error');
}
```

---

## Estrutura de Resposta

### Sucesso (2xx)
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "role": "aluno",
  "ativo": true
}
```

### Erro (4xx, 5xx)
```json
{
  "error": "Email já cadastrado"
}
```

---

**Última atualização**: Maio 2026  
**Versão**: 1.0.0
