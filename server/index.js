// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SDD Pipeline — Express Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { SessionStore } from './pipelineState.js';
import { initClient, sendMessage, streamMessage } from './claudeService.js';

const app = express();
const PORT = process.env.PORT || 3000;
const store = new SessionStore();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── Health check ────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', sessions: store.list().length });
});

// ─── Create new pipeline session ─────────────────
app.post('/api/sessions', (req, res) => {
  const session = store.create();
  res.json(session.getInfo());
});

// ─── List sessions ───────────────────────────────
app.get('/api/sessions', (req, res) => {
  res.json(store.list());
});

// ─── Get session info ────────────────────────────
app.get('/api/sessions/:id', (req, res) => {
  const session = store.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session.getInfo());
});

// ─── Delete session ──────────────────────────────
app.delete('/api/sessions/:id', (req, res) => {
  const deleted = store.delete(req.params.id);
  res.json({ deleted });
});

// ─── Send message (non-streaming) ────────────────
app.post('/api/sessions/:id/message', async (req, res) => {
  const session = store.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const result = await sendMessage(session, message);
    res.json(result);
  } catch (error) {
    console.error('Message error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Send message (SSE streaming) ────────────────
app.post('/api/sessions/:id/stream', async (req, res) => {
  const session = store.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const result = await streamMessage(session, message, (chunk) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
    });

    // Send final state
    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        state: result.state,
        usage: result.usage,
      })}\n\n`
    );
    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`
    );
    res.end();
  }
});

// ─── Get conversation history ────────────────────
app.get('/api/sessions/:id/messages', (req, res) => {
  const session = store.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const messages = session.getConversationHistory().map((msg) => ({
    role: msg.role,
    content:
      msg.role === 'assistant' ? session.getCleanResponse(msg.content) : msg.content,
  }));

  res.json(messages);
});

// ─── Start server ────────────────────────────────
initClient();

app.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SDD Pipeline Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   API:    http://localhost:${PORT}/api
   Health: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
