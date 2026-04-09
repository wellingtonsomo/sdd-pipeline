const API_BASE = '/api';

export async function createSession() {
  const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
  return res.json();
}

export async function getSession(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`);
  return res.json();
}

export async function getMessages(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
  return res.json();
}

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

/**
 * Stream a message via SSE — calls onChunk for each text piece,
 * and returns the final state when done.
 */
export function streamMessage(sessionId, message, { onChunk, onDone, onError }) {
  const controller = new AbortController();

  fetch(`${API_BASE}/sessions/${sessionId}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  })
    .then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                onChunk?.(data.text);
              } else if (data.type === 'done') {
                onDone?.(data);
              } else if (data.type === 'error') {
                onError?.(data.error);
              }
            } catch {}
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError?.(err.message);
      }
    });

  return { cancel: () => controller.abort() };
}
