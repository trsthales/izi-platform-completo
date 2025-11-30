# 🎓 IZI Platform

Uma plataforma educacional moderna e completa desenvolvida com React (frontend) e Node.js/Express (backend), focada em fornecer uma experiência de aprendizado excepcional.

## ✨ **Características Principais**

### 🎯 **Funcionalidades Educacionais**
- **Cursos Interativos**: Sistema completo de cursos com módulos organizados
- **Progresso do Estudante**: Acompanhamento detalhado do progresso com indicadores visuais
- **Matrícula em Cursos**: Sistema de matrícula simples e intuitivo
- **Exercícios Práticos**: Implementação de exercícios no frontend
- **Certificados**: Sistema de conclusão de cursos (implementação futura)

### 🏗️ **Arquitetura Técnica**
- **Frontend**: React 18 + Vite + TailwindCSS + Zustand
- **Backend**: Node.js + Express + PostgreSQL
- **Autenticação**: JWT com bcryptjs
- **Banco de Dados**: PostgreSQL com consultas otimizadas
- **Validação**: Express-validator para segurança
- **API REST**: Endpoints bem estruturados e documentados

### 🎨 **Interface do Usuário**
- **Design Responsivo**: Mobile-first com TailwindCSS
- **Componentes Modulares**: Arquitetura componentizada
- **Experiência Fluida**: Animações e transições suaves
- **Dashboard Intuitivo**: Navegação clara e eficiente

## 📁 **Estrutura do Projeto**

```
izi-platform/
├── 📁 frontend/              # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── store/           # Gerenciamento de estado (Zustand)
│   │   ├── services/        # Serviços de API (Axios)
│   │   └── utils/           # Utilitários
│   ├── package.json
│   └── vite.config.js
│
├── 📁 backend/               # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica dos controladores
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Middlewares personalizados
│   │   ├── config/          # Configurações
│   │   └── utils/           # Utilitários
│   ├── package.json
│   └── .env
│
├── 📁 database/              # Banco de Dados
│   ├── schema.sql           # Schema do banco
│   └── seeds/               # Dados de exemplo
│
└── README.md                # Este arquivo
```

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**
- Node.js (v18 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou pnpm

### **1. Clonar o Repositório**
```bash
git clone <repository-url>
cd izi-platform
```

### **2. Configurar o Banco de Dados**

#### **PostgreSQL**
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE izi_platform;
CREATE USER izi_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE izi_platform TO izi_user;
\q
```

#### **Executar Schema**
```bash
# Navegar para o diretório do projeto
cd izi-platform

# Executar schema SQL
psql -U izi_user -d izi_platform -f database/schema.sql
```

### **3. Instalar Dependências**

#### **Backend**
```bash
cd backend
npm install

# OU usando pnpm
pnpm install
```

#### **Frontend**
```bash
cd frontend
npm install

# OU usando pnpm
pnpm install
```

### **4. Configurar Variáveis de Ambiente**

#### **Backend** (arquivo `backend/.env`)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=izi_platform
DB_USER=izi_user
DB_PASSWORD=password

JWT_SECRET=izi-development-secret-key
JWT_EXPIRES_IN=7d
```

#### **Frontend** (arquivo `frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=IZI Platform
```

### **5. Popular Banco de Dados (Opcional)**
```bash
cd backend
npm run seed
```

## 🏃‍♂️ **Executar a Aplicação**

### **Backend** (Porta 5000)
```bash
cd backend

# Desenvolvimento (com reload automático)
npm run dev

# Produção
npm start
```

### **Frontend** (Porta 3000)
```bash
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🔧 **Scripts Disponíveis**

### **Backend**
```bash
npm run dev          # Desenvolvimento com nodemon
npm start           # Produção
npm test            # Executar testes
npm run seed        # Popular banco com dados de exemplo
```

### **Frontend**
```bash
npm run dev         # Servidor de desenvolvimento
npm run build       # Build de produção
npm run preview     # Preview do build
npm run lint        # Verificar linting
```

## 📚 **API Endpoints**

### **Autenticação**
```
POST /api/auth/register    # Registrar usuário
POST /api/auth/login       # Fazer login
GET  /api/auth/profile     # Obter perfil do usuário
PUT  /api/auth/profile     # Atualizar perfil
```

### **Cursos**
```
GET  /api/courses          # Listar cursos
GET  /api/courses/:id      # Obter curso específico
GET  /api/courses/:id/modules  # Módulos do curso
```

### **Matrículas**
```
GET  /api/enrollments/my-courses    # Cursos do usuário
POST /api/enrollments/:courseId/enroll  # Matricular-se
DEL  /api/enrollments/:courseId/unenroll # Cancelar matrícula
```

### **Progresso**
```
PUT  /api/progress         # Atualizar progresso
GET  /api/progress/course/:courseId  # Progresso do curso
GET  /api/progress/overall # Progresso geral
```

## 🔐 **Contas de Demonstração**

Após executar o seed, você terá as seguintes contas de teste:

**Administrador:**
- Email: `admin@izi.com`
- Senha: `admin123`

**Usuários Demo:**
- Email: `joao@example.com` / Senha: `demo123`
- Email: `maria@example.com` / Senha: `demo123`
- Email: `pedro@example.com` / Senha: `demo123`

## 🎯 **Funcionalidades Implementadas**

### ✅ **Frontend (React + Vite + TailwindCSS)**
- [x] **Landing Page** com seções hero, features e testimonials
- [x] **Sistema de Autenticação** (login/registro) com validação
- [x] **Dashboard de Cursos** com filtros e busca
- [x] **Página de Curso** com navegação de módulos
- [x] **Sistema de Progresso** visual e interativo
- [x] **Navegação Responsiva** para mobile e desktop
- [x] **Gerenciamento de Estado** com Zustand
- [x] **Componentes Modulares** e reutilizáveis
- [x] **Roteamento** com React Router
- [x] **Axios** para consumo de API

### ✅ **Backend (Node.js + Express + PostgreSQL)**
- [x] **API REST** completa e documentada
- [x] **Autenticação JWT** com bcryptjs
- [x] **Validação** com express-validator
- [x] **Migração de Banco** PostgreSQL
- [x] **Arquitetura Modular** (controllers/routes/middleware)
- [x] **Tratamento de Erros** robusto
- [x] **Queries Otimizadas** com índices
- [x] **Seed de Dados** para demonstração

### ✅ **Banco de Dados (PostgreSQL)**
- [x] **Schema Completo** com todas as tabelas necessárias
- [x] **Relações** bem definidas com foreign keys
- [x] **Índices** para performance
- [x] **Triggers** para timestamps automáticos
- [x] **Views** para consultas complexas
- [x] **Funções** para cálculos de progresso

## 🔮 **Próximos Passos**

### **Funcionalidades Futuras**
- [ ] **Sistema de Pagamentos** (Stripe/PayPal)
- [ ] **Chat em Tempo Real** (Socket.io)
- [ ] **Upload de Arquivos** (Multer + S3)
- [ ] **Notificações Push**
- [ ] **Sistema de Comentários**
- [ ] **Avaliações e Reviews**
- [ ] **Certificados PDF**
- [ ] **API para Mobile Apps**

### **Melhorias Técnicas**
- [ ] **Testes Automatizados** (Jest + Supertest)
- [ ] **Documentação OpenAPI/Swagger**
- [ ] **CI/CD Pipeline** (GitHub Actions)
- [ ] **Docker** para containerização
- [ ] **Redis** para cache
- [ ] **Elasticsearch** para busca avançada
- [ ] **CDN** para arquivos estáticos

## 🐛 **Deploy em Produção**

### **Opção 1: VPS com PM2**
```bash
# Instalar PM2
npm install -g pm2

# Build do frontend
cd frontend && npm run build

# Configurar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Opção 2: Heroku**
```bash
# Backend
heroku create izi-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret
git push heroku main

# Frontend (Netlify/Vercel)
# Conectar repositório e deploy automático
```

### **Opção 3: Docker**
```bash
# Build e executar containers
docker-compose up --build
```

## 🤝 **Contribuição**

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 **Equipe**

Desenvolvido com ❤️ pela **Equipe IZI Platform**

---

## 🆘 **Suporte**

Para suporte e dúvidas:

- 📧 **Email**: suporte@izi.com
- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/izi-platform)
- 📖 **Documentação**: [docs.izi-platform.com](https://docs.izi-platform.com)

---

**🎉 Muito obrigado por usar a IZI Platform! esperamos que você tenha uma experiência fantástica! 🚀**