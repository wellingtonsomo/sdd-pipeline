// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Claude API Service
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './systemPrompt.js';

let client = null;

export function initClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'sk-ant-sua-chave-aqui') {
    console.error('\n❌ ANTHROPIC_API_KEY não configurada!');
    console.error('   Copie .env.example para .env e adicione sua chave.');
    console.error('   Acesse: https://console.anthropic.com/settings/keys\n');
    process.exit(1);
  }
  client = new Anthropic({ apiKey });
  console.log('✅ Claude API client inicializado');
}

/**
 * Send a message through the pipeline.
 * Uses the full conversation history for context continuity.
 */
export async function sendMessage(session, userMessage) {
  if (!client) throw new Error('Claude client not initialized');

  // Add user message to history
  session.addUserMessage(userMessage);

  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: session.getConversationHistory(),
    });

    // Extract text from response
    const fullText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    // Update pipeline state from response
    session.updateStateFromResponse(fullText);

    // Get clean response (without state JSON)
    const cleanResponse = session.getCleanResponse(fullText);

    // Add assistant message to history (full, with state, for context)
    session.addAssistantMessage(fullText);

    return {
      response: cleanResponse,
      state: session.state,
      usage: {
        input_tokens: response.usage?.input_tokens || 0,
        output_tokens: response.usage?.output_tokens || 0,
      },
    };
  } catch (error) {
    // Remove the user message if the API call fails
    session.messages.pop();

    if (error.status === 401) {
      throw new Error('API key inválida. Verifique sua ANTHROPIC_API_KEY.');
    }
    if (error.status === 429) {
      throw new Error('Rate limit atingido. Aguarde alguns segundos.');
    }
    if (error.status === 529) {
      throw new Error('API sobrecarregada. Tente novamente em instantes.');
    }
    throw error;
  }
}

/**
 * Stream a message for real-time response display.
 */
export async function streamMessage(session, userMessage, onChunk) {
  if (!client) throw new Error('Claude client not initialized');

  session.addUserMessage(userMessage);

  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

  try {
    let fullText = '';

    const stream = client.messages.stream({
      model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: session.getConversationHistory(),
    });

    stream.on('text', (text) => {
      fullText += text;
      onChunk(text);
    });

    const finalMessage = await stream.finalMessage();

    // Update state and store full response
    session.updateStateFromResponse(fullText);
    session.addAssistantMessage(fullText);

    const cleanResponse = session.getCleanResponse(fullText);

    return {
      response: cleanResponse,
      state: session.state,
      usage: {
        input_tokens: finalMessage.usage?.input_tokens || 0,
        output_tokens: finalMessage.usage?.output_tokens || 0,
      },
    };
  } catch (error) {
    session.messages.pop();
    throw error;
  }
}
