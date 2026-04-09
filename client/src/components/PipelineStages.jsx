import React from 'react';

const STAGES = [
  { id: 1, icon: '🗺️', name: 'Process Mapper', desc: 'Mapeamento de processos' },
  { id: 2, icon: '📋', name: 'Spec Planner', desc: 'Decomposição em features' },
  { id: 3, icon: '✍️', name: 'Spec Writer', desc: 'Especificação detalhada' },
  { id: 4, icon: '🔍', name: 'Code Reviewer', desc: 'Revisão técnica' },
  { id: 5, icon: '🔒', name: 'Pentester', desc: 'Análise de segurança' },
];

export default function PipelineStages({ state }) {
  const { current_stage, status, gate_pending } = state;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>⚡</span>
        <span style={styles.headerText}>Pipeline SDD</span>
      </div>

      <div style={styles.stages}>
        {STAGES.map((stage, i) => {
          const isActive = stage.id === current_stage;
          const isDone = stage.id < current_stage;
          const isFuture = stage.id > current_stage;

          return (
            <React.Fragment key={stage.id}>
              {i > 0 && (
                <div
                  style={{
                    ...styles.connector,
                    backgroundColor: isDone ? '#22c55e' : '#2a2a3e',
                  }}
                />
              )}
              <div
                style={{
                  ...styles.stage,
                  ...(isActive ? styles.stageActive : {}),
                  ...(isDone ? styles.stageDone : {}),
                  ...(isFuture ? styles.stageFuture : {}),
                }}
              >
                <div style={styles.stageIcon}>
                  {isDone ? '✅' : stage.icon}
                </div>
                <div style={styles.stageInfo}>
                  <div
                    style={{
                      ...styles.stageName,
                      color: isFuture ? '#555' : '#e0e0e0',
                    }}
                  >
                    {stage.name}
                  </div>
                  <div style={styles.stageDesc}>{stage.desc}</div>
                </div>
                {isActive && (
                  <div
                    style={{
                      ...styles.badge,
                      backgroundColor: gate_pending ? '#f59e0b' : '#3b82f6',
                    }}
                  >
                    {gate_pending ? 'GATE' : status === 'awaiting_input' ? 'INPUT' : 'ATIVO'}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Feature tracker */}
      {state.features_total > 0 && (
        <div style={styles.featureTracker}>
          <div style={styles.featureHeader}>Features</div>
          <div style={styles.featureBar}>
            <div
              style={{
                ...styles.featureProgress,
                width: `${(state.features_done / state.features_total) * 100}%`,
              }}
            />
          </div>
          <div style={styles.featureCount}>
            {state.features_done}/{state.features_total}
            {state.current_feature_id && (
              <span style={styles.currentFeature}>
                {' '}
                → {state.current_feature_id}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Artifacts list */}
      {state.artifacts?.length > 0 && (
        <div style={styles.artifacts}>
          <div style={styles.artifactsHeader}>📦 Artefatos</div>
          {state.artifacts.map((a, i) => (
            <div key={i} style={styles.artifact}>
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: 280,
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    borderRight: '1px solid #1e1e2e',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 16,
    borderBottom: '1px solid #1e1e2e',
  },
  headerIcon: {
    fontSize: 20,
  },
  headerText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: 16,
    color: '#e0e0e0',
    letterSpacing: '0.05em',
  },
  stages: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  connector: {
    width: 2,
    height: 16,
    marginLeft: 19,
    borderRadius: 1,
    transition: 'background-color 0.3s',
  },
  stage: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    transition: 'all 0.2s',
  },
  stageActive: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #3b82f6',
    boxShadow: '0 0 20px rgba(59,130,246,0.1)',
  },
  stageDone: {
    opacity: 0.7,
  },
  stageFuture: {
    opacity: 0.35,
  },
  stageIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
    flexShrink: 0,
  },
  stageInfo: {
    flex: 1,
    minWidth: 0,
  },
  stageName: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600,
    fontSize: 13,
  },
  stageDesc: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 6,
    color: '#fff',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  featureTracker: {
    padding: '12px 14px',
    backgroundColor: '#13132a',
    borderRadius: 10,
    border: '1px solid #1e1e2e',
  },
  featureHeader: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#888',
    fontWeight: 600,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  featureBar: {
    height: 6,
    backgroundColor: '#1e1e2e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  featureProgress: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
    transition: 'width 0.5s ease',
  },
  featureCount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  currentFeature: {
    color: '#3b82f6',
  },
  artifacts: {
    padding: '12px 14px',
    backgroundColor: '#13132a',
    borderRadius: 10,
    border: '1px solid #1e1e2e',
    maxHeight: 200,
    overflowY: 'auto',
  },
  artifactsHeader: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#888',
    fontWeight: 600,
    marginBottom: 8,
  },
  artifact: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#aaa',
    padding: '3px 0',
    borderBottom: '1px solid #1a1a2e',
  },
};
