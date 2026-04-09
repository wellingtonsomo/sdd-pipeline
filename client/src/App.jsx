import React from 'react';
import { usePipeline } from './hooks/usePipeline.js';
import PipelineStages from './components/PipelineStages.jsx';
import ChatArea from './components/ChatArea.jsx';
import InputBar from './components/InputBar.jsx';

export default function App() {
  const {
    messages,
    pipelineState,
    isLoading,
    isStreaming,
    error,
    totalTokens,
    send,
    cancelStream,
    reset,
  } = usePipeline();

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <PipelineStages state={pipelineState} />

      {/* Main area */}
      <div style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.topTitle}>
            {getStageEmoji(pipelineState.current_stage)}{' '}
            {getStageLabel(pipelineState.stage_name)}
          </div>
          <div style={styles.topMeta}>
            {totalTokens.input + totalTokens.output > 0 && (
              <span style={styles.tokenBadge}>
                🪙 {((totalTokens.input + totalTokens.output) / 1000).toFixed(1)}k tokens
              </span>
            )}
            {pipelineState.gate_pending && (
              <span style={styles.gateBadge}>⚡ Gate pendente</span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={styles.error}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Chat area */}
        <ChatArea messages={messages} isStreaming={isStreaming} />

        {/* Input */}
        <InputBar
          onSend={send}
          isLoading={isLoading}
          onCancel={cancelStream}
          onReset={reset}
        />
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a14; overflow: hidden; }
        ::selection { background: #3b82f6; color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252540; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b3b5e; }
        textarea:focus { border-color: #3b82f6 !important; }
        button:hover:not(:disabled) { filter: brightness(1.15); }
        button:disabled { cursor: not-allowed; opacity: 0.4; }
        code { font-family: 'JetBrains Mono', monospace !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}

function getStageEmoji(stage) {
  const map = { 1: '🗺️', 2: '📋', 3: '✍️', 4: '🔍', 5: '🔒' };
  return map[stage] || '⚡';
}

function getStageLabel(name) {
  const map = {
    'process-mapper': 'Process Mapper',
    'spec-planner': 'Spec Planner',
    'spec-writer': 'Spec Writer',
    'code-reviewer': 'Code Reviewer',
    'pentester': 'Pentester',
  };
  return map[name] || 'Pipeline SDD';
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#e0e0e0',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: '#0e0e1a',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 32px',
    borderBottom: '1px solid #1e1e2e',
    backgroundColor: '#0a0a14',
    flexShrink: 0,
  },
  topTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
    color: '#c0c0d0',
  },
  topMeta: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  tokenBadge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#666',
    padding: '3px 8px',
    backgroundColor: '#13132a',
    borderRadius: 6,
  },
  gateBadge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#f59e0b',
    padding: '3px 8px',
    backgroundColor: '#2a2010',
    borderRadius: 6,
    fontWeight: 600,
  },
  error: {
    padding: '10px 32px',
    backgroundColor: '#2a1515',
    color: '#f87171',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    borderBottom: '1px solid #3b2020',
  },
};
