# Sistema de Certificados - Senac

Sistema web para gerenciamento e validação de certificados de alunos da Senac.

## 📁 Estrutura do Projeto

```
├── index.html              # Página de entrada
├── public/                 # Arquivos estáticos
│   ├── css/               # Estilos globais
│   │   └── global.css
│   ├── js/                # Scripts globais
│   │   └── main.js
│   └── images/            # Imagens e ícones
├── Login/                 # Página de login
│   ├── login.html
│   └── styles.css
├── Dashboard/             # Painel principal
│   ├── daskboard.html
│   └── styles.css
├── Cadastro/              # Cadastro de usuários
│   ├── cadastro.html
│   └── styles.css
├── Certificados/          # Validação de certificados
│   ├── certificados.html
│   └── styles.css
├── Historico/             # Histórico de operações
│   ├── historico.html
│   └── styles.css
├── Usuarios/              # Gerenciamento de usuários
│   ├── usuarios.html
│   └── styles.css
├── configurações/         # Configurações do sistema
│   ├── configuracoes.html
│   └── styles.css
└── perfil_do_super_adm/   # Perfil de super administrador
    ├── superADM.html
    └── styles.css
```

## 🚀 Como Usar

1. Abra `index.html` no navegador para acessar a página de entrada
2. Clique em "Acessar Sistema" para ir à página de login
3. Faça login com suas credenciais

## 📋 Páginas

- **Login**: Autenticação de usuários
- **Dashboard**: Visão geral do sistema com gráficos
- **Cadastro**: Formulário para cadastrar novos usuários
- **Validar Certificados**: Importação e análise de certificados
- **Histórico**: Registro de todas as operações
- **Usuários**: Gerenciamento de informações de alunos
- **Configurações**: Opções e preferências do sistema
- **Super Admin**: Painel exclusivo para administradores

## 🎨 Cores do Design

- **Primária**: #1D3E73 (Azul escuro)
- **Secundária**: #F08A01 (Laranja)
- **Sucesso**: #4CAF50 (Verde)
- **Erro**: #c62828 (Vermelho)

## 📚 Recursos Utilizados

- **Google Fonts**: Poppins
- **Boxicons**: Ícones da interface
- **Chart.js**: Gráficos (usado no Dashboard)

## 🔐 Segurança

- Armazenamento de estado de login em `localStorage`
- Validação de formulários no cliente
- Redirecionamento automático para login em caso de sessão expirada

## 📝 Notas

- Cada página possui seu próprio arquivo `styles.css`
- Scripts inline em alguns arquivos (considere centralizar em `public/js/`)
- Implementar backend para autenticação real
- Adicionar validação mais robusta no servidor

## 👥 Contribuidores

- Projeto Integrador (PI) - Senac
- Desenvolvido em 2026

## 📄 Licença

Privado - Senac
