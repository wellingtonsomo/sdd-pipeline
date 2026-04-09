import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatArea({ messages, isStreaming }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.content]);

  if (messages.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🚀</div>
        <div style={styles.emptyTitle}>SDD Pipeline Orchestrator</div>
        <div style={styles.emptyDesc}>
          Cole seu PRD, briefing ou documento abaixo para iniciar o pipeline.
        </div>
        <div style={styles.emptySteps}>
          <div style={styles.emptyStep}>
            <span>1</span> Process Mapper — extrai processos do documento
          </div>
          <div style={styles.emptyStep}>
            <span>2</span> Spec Planner — decompõe em épicos e features
          </div>
          <div style={styles.emptyStep}>
            <span>3</span> Spec Writer — escreve spec detalhada por feature
          </div>
          <div style={styles.emptyStep}>
            <span>4</span> Code Reviewer — revisa código contra a spec
          </div>
          <div style={styles.emptyStep}>
            <span>5</span> Pentester — análise de segurança final
          </div>
        </div>
        <div style={styles.emptyTip}>
          💡 Comandos: <code>/status</code> <code>/features</code>{' '}
          <code>/proxima</code> <code>/resumo</code>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            ...styles.message,
            ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
          }}
        >
          <div style={styles.messageHeader}>
            <span style={styles.roleIcon}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </span>
            <span style={styles.roleName}>
              {msg.role === 'user' ? 'Você' : 'Pipeline'}
            </span>
            {msg.role === 'assistant' &&
              i === messages.length - 1 &&
              isStreaming && <span style={styles.streaming}>●</span>}
          </div>
          <div style={styles.messageContent}>
            {msg.role === 'assistant' ? (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return inline ? (
                      <code style={styles.inlineCode} {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre style={styles.codeBlock}>
                        <code {...props}>{children}</code>
                      </pre>
                    );
                  },
                  table({ children }) {
                    return (
                      <div style={styles.tableWrapper}>
                        <table style={styles.table}>{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th style={styles.th}>{children}</th>;
                  },
                  td({ children }) {
                    return <td style={styles.td}>{children}</td>;
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            ) : (
              <div style={styles.userText}>{msg.content}</div>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    opacity: 0.8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22,
    fontWeight: 700,
    color: '#e0e0e0',
    letterSpacing: '-0.02em',
  },
  emptyDesc: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    maxWidth: 420,
  },
  emptySteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 16,
    padding: '16px 20px',
    backgroundColor: '#13132a',
    borderRadius: 12,
    border: '1px solid #1e1e2e',
  },
  emptyStep: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 13,
    color: '#aaa',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  emptyTip: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: '#666',
    marginTop: 12,
  },
  message: {
    borderRadius: 12,
    padding: '14px 18px',
    maxWidth: '100%',
  },
  userMessage: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #252540',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  assistantMessage: {
    backgroundColor: '#0d0d1a',
    border: '1px solid #1a1a2e',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  roleIcon: {
    fontSize: 14,
  },
  roleName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  streaming: {
    color: '#3b82f6',
    animation: 'pulse 1s infinite',
    fontSize: 10,
  },
  messageContent: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14,
    lineHeight: 1.7,
    color: '#d0d0d0',
    wordBreak: 'break-word',
  },
  userText: {
    whiteSpace: 'pre-wrap',
  },
  inlineCode: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    backgroundColor: '#1e1e2e',
    padding: '2px 6px',
    borderRadius: 4,
    color: '#a78bfa',
  },
  codeBlock: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    backgroundColor: '#0a0a16',
    padding: '14px 18px',
    borderRadius: 8,
    border: '1px solid #1e1e2e',
    overflowX: 'auto',
    lineHeight: 1.6,
    color: '#c0c0d0',
    margin: '10px 0',
  },
  tableWrapper: {
    overflowX: 'auto',
    margin: '10px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    backgroundColor: '#1a1a2e',
    color: '#aaa',
    fontWeight: 600,
    borderBottom: '1px solid #252540',
    fontSize: 12,
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #1a1a2e',
    color: '#c0c0d0',
  },
};
