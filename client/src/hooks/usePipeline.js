import { useState, useRef, useCallback } from 'react';
import { createSession, streamMessage } from '../utils/api.js';

const INITIAL_STATE = {
  current_stage: 1,
  stage_name: 'process-mapper',
  status: 'awaiting_input',
  gate_pending: false,
  current_feature_id: null,
  features_total: 0,
  features_done: 0,
  artifacts: [],
};

export function usePipeline() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pipelineState, setPipelineState] = useState(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [totalTokens, setTotalTokens] = useState({ input: 0, output: 0 });
  const streamRef = useRef(null);

  const initSession = useCallback(async () => {
    try {
      const session = await createSession();
      setSessionId(session.id);
      setMessages([]);
      setPipelineState(INITIAL_STATE);
      setError(null);
      setTotalTokens({ input: 0, output: 0 });
      return session.id;
    } catch (err) {
      setError('Falha ao criar sessão. O servidor está rodando?');
      return null;
    }
  }, []);

  const send = useCallback(
    async (text) => {
      let sid = sessionId;
      if (!sid) {
        sid = await initSession();
        if (!sid) return;
      }

      setError(null);
      setIsLoading(true);
      setIsStreaming(true);

      // Add user message
      setMessages((prev) => [...prev, { role: 'user', content: text }]);

      // Prepare streaming assistant message
      let assistantText = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      // Remove <pipeline_state> from display in real-time
      let rawBuffer = '';
      let stateStripped = false;

      streamRef.current = streamMessage(
        sid,
        text,
        {
          onChunk: (chunk) => {
            rawBuffer += chunk;

            // Strip pipeline_state block from visible text
            let displayText = rawBuffer;
            const openTag = '<pipeline_state>';
            const closeTag = '</pipeline_state>';
            const openIdx = displayText.indexOf(openTag);
            const closeIdx = displayText.indexOf(closeTag);

            if (openIdx !== -1 && closeIdx !== -1) {
              displayText =
                displayText.slice(0, openIdx) +
                displayText.slice(closeIdx + closeTag.length);
              stateStripped = true;
            } else if (openIdx !== -1 && closeIdx === -1) {
              // Still receiving state block — show nothing from it yet
              displayText = displayText.slice(0, openIdx);
            }

            assistantText = displayText.trim();
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: 'assistant',
                content: assistantText,
              };
              return updated;
            });
          },
          onDone: (data) => {
            if (data.state) {
              setPipelineState(data.state);
            }
            if (data.usage) {
              setTotalTokens((prev) => ({
                input: prev.input + (data.usage.input_tokens || 0),
                output: prev.output + (data.usage.output_tokens || 0),
              }));
            }
            setIsLoading(false);
            setIsStreaming(false);
          },
          onError: (errMsg) => {
            setError(errMsg);
            setIsLoading(false);
            setIsStreaming(false);
          },
        }
      );
    },
    [sessionId, initSession]
  );

  const cancelStream = useCallback(() => {
    streamRef.current?.cancel();
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    streamRef.current?.cancel();
    setSessionId(null);
    setMessages([]);
    setPipelineState(INITIAL_STATE);
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
    setTotalTokens({ input: 0, output: 0 });
  }, []);

  return {
    sessionId,
    messages,
    pipelineState,
    isLoading,
    isStreaming,
    error,
    totalTokens,
    send,
    cancelStream,
    reset,
  };
}
