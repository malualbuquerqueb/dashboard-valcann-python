# Dashboard Executivo Valcann

Dashboard executivo integrado ao Jira Cloud para acompanhamento de projetos, tarefas e impedimentos.

## Stack

**Frontend:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + Recharts + React Query  
**Backend:** Python 3.12+ + FastAPI + httpx + python-dotenv

---

## Pré-requisitos

- Python 3.12+
- Node.js 18+
- Token de API do Jira Cloud

## Configuração

### 1. Credenciais do Jira

Gere seu API Token em: https://id.atlassian.com/manage-profile/security/api-tokens

### 2. Backend

Edite o arquivo `backend/.env`:

```env
JIRA_BASE_URL=https://valcann-project.atlassian.net/rest/api/3
JIRA_EMAIL=seu-email@valcann.com
JIRA_API_TOKEN=seu-api-token-aqui
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Frontend (opcional)

O `.env` do frontend já vem configurado para usar o proxy do Vite (sem necessidade de alterar em desenvolvimento).

---

## Rodando localmente

**Terminal 1 — Backend:**
```powershell
cd backend
pip install -r requirements.txt
python main.py
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

---

## Estrutura do projeto

```
dashboard-valcann/
├── backend/
│   ├── main.py              # Entry point + rotas FastAPI
│   ├── jira_client.py       # Cliente HTTP (httpx)
│   ├── jira_service.py      # Chamadas à API do Jira
│   ├── dashboard_service.py # Lógica de negócio
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/           # Chamadas à API do backend
    │   ├── components/
    │   │   ├── charts/    # Gráficos Recharts
    │   │   ├── dashboard/ # Cards, tabelas
    │   │   ├── filters/   # Filtros globais
    │   │   └── ui/        # Componentes base
    │   ├── hooks/         # React Query hooks
    │   ├── pages/         # Páginas
    │   ├── types/         # Tipos TypeScript
    │   └── utils/         # Utilitários
    ├── .env.example
    └── package.json
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/stats` | Estatísticas gerais |
| GET | `/api/dashboard/projects` | Lista de projetos com épicos |
| GET | `/api/dashboard/clients` | Resumo por clientes |
| GET | `/api/dashboard/blocked` | Tasks bloqueadas |
| GET | `/api/dashboard/tasks` | Todas as tasks |
| GET | `/api/dashboard/status-distribution` | Distribuição de status |
| GET | `/api/dashboard/projects-progress` | Progresso por projeto |
| GET | `/api/dashboard/filter-options` | Opções de filtro |
| GET | `/api/dashboard/health` | Health check |
| GET | `/api/health` | Health check geral |

### Parâmetros de filtro (query string)

- `projectKey` — Filtrar por projeto (ex: `VAL`)
- `status` — Filtrar por status
- `sprintId` — Filtrar por sprint
- `assigneeId` — Filtrar por responsável
- `epicKey` — Filtrar por épico

---

## Funcionalidades

- **Dashboard com auto-refresh a cada 30s**
- **Cards de KPIs:** Total, Concluídas, Andamento, Abertas, Bloqueadas, Progresso %
- **Tabela de projetos** expandível com épicos
- **Tabela de impedimentos** com link direto para o Jira
- **Gráfico pizza** de distribuição de status
- **Gráfico de barras** por projeto
- **Barras de progresso** por projeto
- **Filtros globais:** Projeto, Sprint, Status, Responsável
- **Tema dark corporativo**

---

## Deploy

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Fazer upload da pasta dist/
```

Variável de ambiente no deploy:
```
VITE_API_URL=https://sua-api.com/api
```

### Backend (Railway/Render/Heroku)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Variáveis de ambiente necessárias: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `CORS_ORIGIN`

---

## Customizações

### Labels de bloqueio personalizadas

Em `backend/jira_service.py`, ajuste a lista:
```python
BLOCKED_LABELS = ['blocked', 'impedimento', 'bloqueado', 'impediment', 'block']
```

### Campos customizados do Jira

Em `backend/jira_service.py`, mapeie os campos:
```python
# customfield_10016 = Story Points (padrão Jira Software)
# customfield_10020 = Sprint (padrão Jira Software)
# customfield_10014 = Epic Link (legado)
```
