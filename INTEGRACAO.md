# Integração Frontend - Backend

## 📋 Resumo da Integração

O frontend foi totalmente integrado com o backend Express.js/PostgreSQL. Todos os formulários e páginas agora fazem requisições reais à API.

---

## 🔧 Configuração

### 1. **Ajustar a URL Base da API**

Edite o arquivo [config.js](public/js/config.js) e altere a URL se necessário:

```javascript
API_BASE_URL: process.env.API_URL || 'http://localhost:3000/api'
```

**Exemplos:**
- **Desenvolvimento local**: `http://localhost:3000/api`
- **Produção**: `https://seu-dominio.com/api`

### 2. **Executar o Backend**

```bash
cd "Projeto PI"
npm install
npm start
```

O backend rodará em `http://localhost:3000`

### 3. **Servir o Frontend**

Use um servidor HTTP local (recomendado):

```bash
# Com Python
python -m http.server 8080

# Com Node.js (http-server)
npx http-server -p 8080

# Com VS Code Live Server
# (Extensão: ritwickdey.LiveServer)
```

Acesse: `http://localhost:8080`

---

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos**

| Arquivo | Descrição |
|---------|-----------|
| `public/js/config.js` | Configuração centralizada da API |
| `public/js/api-client.js` | Cliente HTTP para fazer requisições à API |
| `Dashboard/dashboard.js` | Script do dashboard com integração de dados |
| `Certificados/certificados.js` | Script de validação de certificados |
| `Usuarios/usuarios.js` | Script de gerenciamento de usuários |
| `Cadastro/cadastro.js` | Script de cadastro de usuários |

### **Arquivos Modificados**

| Arquivo | Alterações |
|---------|-----------|
| `Login/login.html` | Integração com API de login, validação de tokens |
| `public/js/main.js` | Importação do APIClient, verificação de autenticação |
| `Dashboard/daskboard.html` | Adição do script dashboard.js |
| `Certificados/certificados.html` | Adição do script certificados.js |
| `Usuarios/usuarios.html` | Adição do script usuarios.js |
| `Cadastro/cadastro.html` | Adição do script cadastro.js |

---

## 🔐 Autenticação (JWT + Refresh Token)

### **Fluxo de Login**

1. Usuário entra email/senha
2. Frontend faz POST para `/api/auth/login`
3. Backend retorna: `accessToken` (15min) + `refreshToken` (10h)
4. Frontend armazena tokens no `localStorage`
5. Requisições subsequentes usam o `accessToken` no header `Authorization`

### **Renovação de Token**

- Se o `accessToken` expirar, o `api-client.js` tenta renovar automaticamente
- Se a renovação falhar, usuário é redirecionado para login

### **Logout**

- Remove tokens do `localStorage`
- Faz DELETE para `/api/auth/logout`
- Redireciona para login

---

## 🌐 Endpoints Disponíveis

### **Autenticação**
```javascript
POST   /api/auth/login       // { email, senha }
POST   /api/auth/register    // { nome, email, senha }
POST   /api/auth/logout      // Auenticado
POST   /api/auth/refresh     // { refreshToken }
```

### **Usuários**
```javascript
GET    /api/usuarios                // Lista todos (admin/coordenador)
GET    /api/usuarios/:id           // Usuário específico
POST   /api/usuarios               // Criar novo (admin/coordenador)
PUT    /api/usuarios/:id           // Atualizar
DELETE /api/usuarios/:id           // Desativar (admin)
```

### **Certificados**
```javascript
GET    /api/certificados           // Listar certificados
GET    /api/certificados/:id       // Certificado específico
POST   /api/certificados           // Upload de certificado
PATCH  /api/certificados/:id/aceitar  // Aprovar
PATCH  /api/certificados/:id/rejeitar // Recusar
```

### **Dashboard**
```javascript
GET    /api/dashboard              // Dados e métricas
GET    /api/historico              // Histórico de ações
GET    /api/notificacoes           // Notificações
```

---

## 💾 Armazenamento Local

O frontend armazena dados no `localStorage`:

| Chave | Valor |
|-------|-------|
| `accessToken` | Token JWT de acesso (15 min) |
| `refreshToken` | Token de renovação (10h) |
| `userEmail` | Email do usuário logado |
| `userName` | Nome do usuário logado |
| `userId` | ID do usuário logado |
| `userRole` | Função/papel do usuário |
| `userLogged` | Flag booleana (true/false) |

---

## 🎨 Funções Globais

### **Notificações (Toast)**
```javascript
showToast('Mensagem', 'success');  // success, error, warning, info
```

### **Validação de Autenticação**
```javascript
checkUserLogin();                  // Redireciona se não autenticado
```

### **Logout**
```javascript
logout();                          // Faz logout seguro
```

### **Máscaras de Entrada**
```javascript
maskCPF(element);                  // Formata: 000.000.000-00
maskPhone(element);                // Formata: (00) 00000-0000
maskCEP(element);                  // Formata: 00000-000
```

---

## 🚀 Usando o APIClient

```javascript
import APIClient from './public/js/api-client.js';

// Login
const result = await APIClient.login('user@email.com', 'senha123');

// Verificar autenticação
if (APIClient.isAuthenticated()) {
  // Usuário autenticado
}

// Obter dados do usuário
const user = APIClient.getCurrentUser();
console.log(user.email, user.nome, user.role);

// Fazer requisição customizada
const response = await APIClient.request('/certificados', {
  method: 'GET'
});

// Logout
await APIClient.logout();
```

---

## ⚠️ Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Mensagem de erro descritiva"
}
```

O `APIClient` detecta automaticamente erros e exibe notificações (toast).

---

## 📱 Responsividade

O frontend é responsivo e funciona em:
- ✅ Desktop (1920x1080 e superiores)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🔍 Verificação de Conectividade

Para verificar se a API está acessível:

```bash
# Testar endpoint de health check (se disponível)
curl http://localhost:3000/api/health

# Ou tentar fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"test123"}'
```

---

## 🐛 Troubleshooting

### **Erro: "Sessão expirada"**
- Refresh token expirou (10h)
- Faça login novamente

### **Erro: "Não autorizado"**
- Token não foi enviado no header `Authorization`
- Token está inválido ou corrompido
- Faça login novamente

### **CORS Error**
- Verifique se o backend tem CORS habilitado
- URL base da API deve ser correta em `config.js`

### **Certificado não sendo enviado**
- Verifique tamanho máximo (10MB)
- Formatos aceitos: PDF, JPG, PNG
- Usuário precisa estar autenticado

---

## 📚 Mais Informações

- **Backend**: Ver [Projeto PI/README.md](../Projeto PI/README.md)
- **Documentação das Rotas**: Consulte os arquivos em `routes/`
- **Banco de Dados**: Ver [schema.sql](../Projeto PI/schema.sql)

---

## ✅ Checklist de Implementação

- ✅ Login e registro com JWT
- ✅ Renovação automática de tokens
- ✅ Proteção de rotas (redirecionamento para login)
- ✅ Gerenciamento de usuários
- ✅ Upload e validação de certificados
- ✅ Dashboard com dados em tempo real
- ✅ Histórico e notificações
- ✅ Máscaras e validações de entrada
- ✅ Tratamento de erros e notificações
- ✅ Responsividade mobile/tablet/desktop

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Status**: ✅ Pronto para Produção
