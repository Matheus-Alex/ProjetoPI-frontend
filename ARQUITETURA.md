# 🏗️ Arquitetura da Integração

## Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                               │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │              Frontend (HTML/CSS/JavaScript)                │  │
│ │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│ │  │  login.html  │  │ dashboard.js │  │ certificados.js│  │  │
│ │  └──────────────┘  └──────────────┘  └────────────────┘  │  │
│ │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│ │  │ cadastro.js  │  │ usuarios.js  │  │   main.js      │  │  │
│ │  └──────────────┘  └──────────────┘  └────────────────┘  │  │
│ │                          ▲                                 │  │
│ │                          │                                 │  │
│ │                   ┌──────────────┐                         │  │
│ │                   │  APIClient   │                         │  │
│ │                   └──────────────┘                         │  │
│ │                   (api-client.js)                          │  │
│ │                          │                                 │  │
│ │                   ┌──────────────┐                         │  │
│ │                   │  config.js   │                         │  │
│ │                   └──────────────┘                         │  │
│ └────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │  HTTP Requests   │
                   │  (Fetch API)     │
                   └────────┬─────────┘
                            │
                            ▼
           ┌────────────────────────────────────┐
           │    Internet / Network             │
           │  (http://localhost:3000/api)      │
           └────────────────┬───────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────┐
        │          BACKEND (Express.js)             │
        │ ┌─────────────────────────────────────┐  │
        │ │     Middleware de Segurança         │  │
        │ │  (CORS, Helmet, Rate Limit, etc)    │  │
        │ └─────────────────────────────────────┘  │
        │                    ▼                      │
        │ ┌──────────────────────────────────────┐ │
        │ │          Rotas (Routes)              │ │
        │ │ ┌──────────────────────────────────┐ │ │
        │ │ │  POST /auth/login                │ │ │
        │ │ │  POST /auth/register             │ │ │
        │ │ │  POST /auth/logout               │ │ │
        │ │ │  GET  /usuarios                  │ │ │
        │ │ │  POST /usuarios                  │ │ │
        │ │ │  GET  /certificados              │ │ │
        │ │ │  POST /certificados              │ │ │
        │ │ └──────────────────────────────────┘ │ │
        │ └────────────────┬─────────────────────┘ │
        │                  ▼                       │
        │ ┌──────────────────────────────────────┐ │
        │ │       Controllers                    │ │
        │ │ (Lógica de negócio)                 │ │
        │ └────────────────┬─────────────────────┘ │
        │                  ▼                       │
        │ ┌──────────────────────────────────────┐ │
        │ │       Services                       │ │
        │ │ (Operações com dados)                │ │
        │ └────────────────┬─────────────────────┘ │
        └────────────────┬────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │     PostgreSQL Database                │
        │  ┌──────────────────────────────────┐ │
        │  │ usuarios                         │ │
        │  │ certificados                     │ │
        │  │ refresh_tokens                   │ │
        │  │ matriculas                       │ │
        │  │ cursos                           │ │
        │  └──────────────────────────────────┘ │
        └────────────────────────────────────────┘
```

---

## Fluxo de Autenticação

```
┌──────────────┐
│ Usuário      │
│ entra dados  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ login.html           │
│ Valida campo         │
│ Chama APIClient      │
└──────┬───────────────┘
       │
       ▼ POST /auth/login
    ┌───────────────────────────────────┐
    │ Backend AuthController            │
    │ ├─ Valida email/senha             │
    │ ├─ Compara senha com hash (bcrypt)│
    │ ├─ Gera JWT AccessToken (15min)   │
    │ └─ Gera RefreshToken (10h)        │
    └──────┬────────────────────────────┘
           │
           ▼ {accessToken, refreshToken}
    ┌──────────────────────────────┐
    │ Frontend                     │
    │ Armazena em localStorage     │
    │ ├─ accessToken               │
    │ ├─ refreshToken              │
    │ ├─ userEmail                 │
    │ └─ userName                  │
    └──────┬───────────────────────┘
           │
           ▼ Redireciona para
    ┌──────────────────────────┐
    │ Dashboard                │
    │ (Protegido)              │
    └──────────────────────────┘

---

REQUISIÇÃo SUBSEQUENTE:

┌─────────────────────────────┐
│ GET /api/usuarios           │
│ Header: Authorization:      │
│ Bearer {accessToken}        │
└──────┬──────────────────────┘
       │
       ▼ Token válido?
    ┌──────────────────────┐
    │ SIM - Autorizado     │
    │ Retorna dados        │
    └──────────────────────┘

       OR

       ▼ Token expirado?
    ┌──────────────────────┐
    │ APIClient detecta    │
    │ Usa refreshToken     │
    │ POST /auth/refresh   │
    └──────┬───────────────┘
           │
           ▼ Novo accessToken
    ┌──────────────────────────┐
    │ Armazena novo token      │
    │ Repete requisição        │
    │ Agora autorizado         │
    └──────────────────────────┘

       OR

       ▼ RefreshToken expirado?
    ┌──────────────────────────┐
    │ Redirect para login      │
    │ (Sessão expirada)        │
    └──────────────────────────┘
```

---

## Estrutura de Pasta

```
Front END senac/
├── Login/
│   ├── login.html (atualizado com módulo script)
│   └── styles.css
├── Dashboard/
│   ├── daskboard.html (atualizado com módulo script)
│   ├── styles.css
│   └── dashboard.js (NOVO - carrega dados via API)
├── Certificados/
│   ├── certificados.html (atualizado com módulo script)
│   ├── styles.css
│   └── certificados.js (NOVO - upload e validação)
├── Cadastro/
│   ├── cadastro.html (atualizado com módulo script)
│   ├── styles.css
│   └── cadastro.js (NOVO - registro de usuários)
├── Usuarios/
│   ├── usuarios.html (atualizado com módulo script)
│   ├── styles.css
│   └── usuarios.js (NOVO - CRUD de usuários)
├── Historico/
│   ├── historico.html
│   └── styles.css
├── configurações/
│   ├── configuracoes.html
│   └── styles.css
├── public/
│   ├── css/
│   │   └── global.css
│   ├── js/
│   │   ├── main.js (atualizado com APIClient)
│   │   ├── config.js (NOVO - configuração API)
│   │   └── api-client.js (NOVO - cliente HTTP)
│   └── images/
├── INTEGRACAO.md (NOVO - Guia completo)
├── EXEMPLOS.md (NOVO - Exemplos de código)
├── start.sh (NOVO - Script Linux/Mac)
└── start.bat (NOVO - Script Windows)
```

---

## Comunicação Frontend-Backend

### Request (Frontend → Backend)

```javascript
// Exemplo: Upload de certificado
const formData = new FormData();
formData.append('arquivo', file);

await fetch('http://localhost:3000/api/certificados', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: formData
});
```

### Response (Backend → Frontend)

```json
{
  "id": 42,
  "usuario_id": 15,
  "status": "pendente",
  "data_upload": "2026-05-04T10:30:00Z",
  "arquivo_url": "https://bucket.s3.amazonaws.com/cert_42.pdf"
}
```

---

## Estados da Aplicação

```
┌─────────────────────┐
│ NÃO AUTENTICADO     │
│ (localStorage vazio)│
└────────────┬────────┘
             │
   Clica em "Login"
             │
             ▼
    ┌─────────────────┐
    │ Login Page      │
    │ (public)        │
    └────────┬────────┘
             │
    Envia email/senha
             │
             ▼
    ┌─────────────────────────┐
    │ AUTENTICADO             │
    │ (tokens em localStorage)│
    │ ┌─────────────────────┐ │
    │ │ accessToken (15min) │ │
    │ │ refreshToken (10h)  │ │
    │ │ userName            │ │
    │ │ userEmail           │ │
    │ └─────────────────────┘ │
    └────────┬────────────────┘
             │
    Acesso a páginas protegidas
             │
             ▼
    ┌─────────────────────────┐
    │ Dashboard               │
    │ Certificados            │
    │ Usuários                │
    │ Cadastro                │
    └────────┬────────────────┘
             │
    Clica em "Logout"
             │
             ▼
    ┌────────────────────────┐
    │ POST /auth/logout      │
    │ ├─ Deleta refresh_tokens│
    │ └─ Limpa localStorage   │
    └────────┬───────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Redireciona para    │
    │ Login               │
    └─────────────────────┘
```

---

## Tratamento de Erros

```
Request
   │
   ▼
┌────────────────────────┐
│ Resposta 401?          │
│ (Não Autorizado)       │
└────┬───────────────────┘
     │ SIM
     ▼
┌────────────────────────┐
│ Tenta atualizar token  │
│ POST /auth/refresh     │
└────┬───────────────────┘
     │
     ├─ Sucesso? ──→ Repete requisição original
     │
     └─ Falha? ───→ Redireciona para login

Request
   │
   ▼
┌────────────────────────┐
│ Resposta 500?          │
│ (Erro do servidor)     │
└────┬───────────────────┘
     │ SIM
     ▼
┌────────────────────────┐
│ Exibe toast de erro    │
│ "Erro do servidor"     │
└────────────────────────┘

Request
   │
   ▼
┌────────────────────────┐
│ Erro de rede?          │
│ (Servidor offline)     │
└────┬───────────────────┘
     │ SIM
     ▼
┌────────────────────────┐
│ Exibe toast de erro    │
│ "Erro de conexão"      │
└────────────────────────┘
```

---

## Comparação: Antes vs Depois

### ❌ ANTES (Sem integração)
```javascript
// Dados hardcoded
const usuarios = [
  { id: 1, nome: 'João', email: 'joao@email.com' },
  { id: 2, nome: 'Maria', email: 'maria@email.com' }
];

// Simulação de salvamento
function salvar() {
  alert('Salvo localmente!'); // Mas não persiste no servidor
}

// Sem autenticação
function login() {
  localStorage.setItem('userLogged', true);
  // Sem validação de credenciais
}
```

### ✅ DEPOIS (Com integração)
```javascript
// Dados do servidor
async function listarUsuarios() {
  const usuarios = await APIClient.getUsuarios();
  return usuarios;
}

// Salvamento real
async function salvar(usuario) {
  const response = await APIClient.createUsuario(usuario);
  if (!response.error) {
    showToast('Salvo no servidor!', 'success');
  }
}

// Autenticação real com JWT
async function login(email, senha) {
  const response = await APIClient.login(email, senha);
  if (response.accessToken) {
    // Token válido, sessão iniciada
    window.location.href = '/Dashboard/daskboard.html';
  }
}
```

---

## Performance

- ⚡ **JWT Token**: ~1KB, validado em microsegundos
- ⚡ **Refresh Token Rotation**: Aumenta segurança sem impacto de performance
- ⚡ **Caching**: localStorage reduz requisições desnecessárias
- ⚡ **Requisições paralelas**: O APIClient usa fetch nativo (Promise-based)
- ⚡ **Compressão**: Backend com Gzip reduz payload em ~70%

---

## Segurança

✅ **JWT com expiração** (15 min access + 10h refresh)  
✅ **Hash bcrypt** para senhas (salt rounds: 12)  
✅ **CORS configurado** para aceitar localhost:8080  
✅ **Helmet.js** para headers de segurança  
✅ **Rate limiting** contra brute force  
✅ **Sanitização de entrada** contra XSS/SQL Injection  
✅ **Tokens rotacionados** no refresh  
✅ **HttpOnly cookies** (implementável futuramente)

---

**Versão**: 1.0.0 | **Data**: Maio 2026 | **Status**: ✅ Pronto para Produção
