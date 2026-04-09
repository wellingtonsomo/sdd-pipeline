import React, { useState, useRef } from 'react';

const QUICK_COMMANDS = [
  { label: '/status', desc: 'Ver estado' },
  { label: '/features', desc: 'Listar features' },
  { label: '/proxima', desc: 'Próxima feature' },
  { label: '/resumo', desc: 'Ver artefatos' },
];

export default function InputBar({ onSend, isLoading, onCancel, onReset }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = '48px';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div style={styles.container}>
      {/* Quick commands */}
      <div style={styles.commands}>
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.label}
            style={styles.commandBtn}
            onClick={() => onSend(cmd.label)}
            disabled={isLoading}
            title={cmd.desc}
          >
            {cmd.label}
          </button>
        ))}
        <button
          style={{ ...styles.commandBtn, ...styles.resetBtn }}
          onClick={onReset}
          title="Reiniciar pipeline"
        >
          ↻ Reset
        </button>
      </div>

      {/* Input area */}
      <div style={styles.inputRow}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Cole seu PRD ou digite uma mensagem..."
          style={styles.textarea}
          rows={1}
          disabled={isLoading}
        />
        {isLoading ? (
          <button style={styles.cancelBtn} onClick={onCancel}>
            ■
          </button>
        ) : (
          <button
            style={{
              ...styles.sendBtn,
              opacity: text.trim() ? 1 : 0.3,
            }}
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            ➤
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    borderTop: '1px solid #1e1e2e',
    padding: '12px 32px 20px',
    backgroundColor: '#0a0a14',
  },
  commands: {
    display: 'flex',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  commandBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #252540',
    backgroundColor: '#13132a',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  resetBtn: {
    marginLeft: 'auto',
    borderColor: '#3b2020',
    color: '#cc6666',
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14,
    lineHeight: 1.5,
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid #252540',
    backgroundColor: '#13132a',
    color: '#e0e0e0',
    resize: 'none',
    outline: 'none',
    height: 48,
    maxHeight: 200,
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
  cancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
