// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pipeline State Manager
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { v4 as uuidv4 } from 'uuid';

const STAGE_NAMES = {
  1: 'process-mapper',
  2: 'spec-planner',
  3: 'spec-writer',
  4: 'code-reviewer',
  5: 'pentester',
};

const STAGE_LABELS = {
  1: '🗺️ Process Mapper',
  2: '📋 Spec Planner',
  3: '✍️ Spec Writer',
  4: '🔍 Code Reviewer',
  5: '🔒 Pentester',
};

export class PipelineSession {
  constructor() {
    this.id = uuidv4();
    this.messages = []; // conversation history for Claude API
    this.state = {
      current_stage: 1,
      stage_name: 'process-mapper',
      status: 'awaiting_input',
      gate_pending: false,
      current_feature_id: null,
      features_total: 0,
      features_done: 0,
      artifacts: [],
    };
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  addUserMessage(content) {
    this.messages.push({ role: 'user', content });
    this.updatedAt = new Date().toISOString();
  }

  addAssistantMessage(content) {
    this.messages.push({ role: 'assistant', content });
    this.updatedAt = new Date().toISOString();
  }

  updateStateFromResponse(responseText) {
    // Parse <pipeline_state> from the assistant response
    const match = responseText.match(
      /<pipeline_state>\s*([\s\S]*?)\s*<\/pipeline_state>/
    );
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.warn('Failed to parse pipeline_state from response:', e.message);
      }
    }
    this.updatedAt = new Date().toISOString();
  }

  getCleanResponse(responseText) {
    // Remove the <pipeline_state> block from the visible response
    return responseText
      .replace(/<pipeline_state>[\s\S]*?<\/pipeline_state>\s*/, '')
      .trim();
  }

  getConversationHistory() {
    return this.messages;
  }

  getInfo() {
    return {
      id: this.id,
      state: this.state,
      messageCount: this.messages.length,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// In-memory session store
export class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  create() {
    const session = new PipelineSession();
    this.sessions.set(session.id, session);
    return session;
  }

  get(id) {
    return this.sessions.get(id) || null;
  }

  delete(id) {
    return this.sessions.delete(id);
  }

  list() {
    return Array.from(this.sessions.values()).map((s) => s.getInfo());
  }
}

export { STAGE_NAMES, STAGE_LABELS };
