# 🚀 SDD Pipeline — Local App

Pipeline completo de desenvolvimento spec-driven rodando na sua máquina.

**PRD → Process Mapper → Spec Planner → Spec Writer → Code Reviewer → Pentester**

---

## Pré-requisitos

- **Node.js 18+** — [download](https://nodejs.org/)
- **API Key da Anthropic** — veja abaixo como obter

---

## 🔑 Como obter a API Key da Anthropic

1. Acesse **[console.anthropic.com](https://console.anthropic.com/)**
2. Crie uma conta (ou faça login)
3. Vá em **Settings → API Keys** ([link direto](https://console.anthropic.com/settings/keys))
4. Clique em **"Create Key"**
5. Dê um nome (ex: `sdd-pipeline`) e copie a chave
6. A chave começa com `sk-ant-api03-...`

> ⚠️ A API é paga por uso. O modelo `claude-sonnet-4-20250514` custa aproximadamente:
> - ~$3 por 1M tokens de input
> - ~$15 por 1M tokens de output
> - Uma sessão completa de pipeline gasta ~50-200k tokens (~$0.30-$2.00)

---

## Instalação

```bash
# 1. Entre na pasta do projeto
cd sdd-pipeline

# 2. Configure a API key
cp .env.example .env
# Edite o .env e cole sua chave:
# ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui

# 3. Instale as dependências
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 4. Rode a aplicação
npm start
```

Isso inicia:
- **Backend** em `http://localhost:3000` (API Express)
- **Frontend** em `http://localhost:3001` (React + Vite)

Abra **http://localhost:3001** no browser.

---

## Como usar

### 1. Cole seu PRD
Abra a interface e cole o texto do seu PRD, briefing ou documento de requisitos na caixa de texto.

### 2. Siga o pipeline
O sistema vai guiá-lo por cada etapa:

| Etapa | O que faz | Seu papel |
|-------|-----------|-----------|
| 🗺️ Process Mapper | Extrai processos do documento | Responder perguntas de clarificação |
| 📋 Spec Planner | Decompõe em épicos e features | Validar o plano e escolher primeira feature |
| ✍️ Spec Writer | Escreve spec detalhada | Responder 5 temas + aprovar Review |
| 🔍 Code Reviewer | Revisa código vs spec | Colar o código implementado |
| 🔒 Pentester | Análise de segurança | Avaliar findings e corrigir |

### 3. Gates humanos
Várias etapas pedem sua aprovação antes de avançar. Responda:
- ✅ **APROVADO** — avança
- 🔄 **AJUSTAR** — corrige e reapresenta
- ❌ **REFAZER** — volta ao início da etapa

### 4. Comandos rápidos
Use os botões na interface ou digite:
- `/status` — estado do pipeline
- `/features` — listar features
- `/proxima` — próxima feature da fila
- `/resumo` — artefatos gerados

---

## Estrutura do projeto

```
sdd-pipeline/
├── .env.example          # Template de configuração
├── .env                  # Sua config (não commitar!)
├── package.json          # Scripts raiz
├── server/
│   ├── index.js          # Express server + rotas
│   ├── claudeService.js  # Comunicação com Claude API
│   ├── pipelineState.js  # Gerenciamento de sessão
│   └── systemPrompt.js   # System prompt do pipeline
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx           # Layout principal
        ├── main.jsx          # Entry point
        ├── components/
        │   ├── PipelineStages.jsx  # Sidebar com etapas
        │   ├── ChatArea.jsx        # Área de mensagens
        │   └── InputBar.jsx        # Input + comandos
        ├── hooks/
        │   └── usePipeline.js      # Hook de estado
        └── utils/
            └── api.js              # Chamadas HTTP
```

---

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/sessions` | Criar nova sessão |
| GET | `/api/sessions` | Listar sessões |
| GET | `/api/sessions/:id` | Info da sessão |
| DELETE | `/api/sessions/:id` | Deletar sessão |
| POST | `/api/sessions/:id/message` | Enviar mensagem (sync) |
| POST | `/api/sessions/:id/stream` | Enviar mensagem (SSE stream) |
| GET | `/api/sessions/:id/messages` | Histórico de mensagens |

---

## Troubleshooting

**"API key inválida"**
→ Verifique se o `.env` tem a chave correta sem aspas

**"Falha ao criar sessão"**
→ O servidor está rodando? Verifique `npm run dev:server`

**"Rate limit atingido"**
→ Aguarde 30-60 segundos e tente novamente

**Respostas cortadas**
→ O `max_tokens` está em 8192. Para respostas mais longas, edite `claudeService.js`

---

## Licença

Projeto pessoal — use como quiser.
