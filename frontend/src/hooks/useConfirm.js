import React, { useState, useCallback, useRef } from 'react';
import { AlertTriangle, Trash2, PlayCircle, StopCircle } from 'lucide-react';

// ── Variants visuelles ────────────────────────────────────────────────────────
const VARIANTS = {
  danger:  { color: '#E24B4A', bg: '#FCEBEB', border: '#F09595', Icon: Trash2       },
  warning: { color: '#BA7517', bg: '#FAEEDA', border: '#EF9F27', Icon: AlertTriangle },
  info:    { color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB', Icon: PlayCircle   },
  stop:    { color: '#993C1D', bg: '#FAECE7', border: '#F0997B', Icon: StopCircle   },
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const ConfirmModal = ({ config, onConfirm, onCancel }) => {
  const { title, message, confirmLabel, cancelLabel, variant = 'danger' } = config;
  const v = VARIANTS[variant] || VARIANTS.danger;
  const { Icon } = v;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: 'var(--color-background-primary, #fff)',
        borderRadius: 14,
        border: '0.5px solid var(--color-border-tertiary)',
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        animation: 'cfm-in 0.18s ease',
      }}>

        {/* Bande colorée en haut */}
        <div style={{ height: 4, background: v.color }} />

        {/* Corps */}
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>

          {/* Icône + titre */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: v.bg, border: `1px solid ${v.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} style={{ color: v.color }} />
            </div>
            <div>
              <p style={{
                margin: 0, fontSize: 15, fontWeight: 500,
                color: 'var(--color-text-primary)',
                lineHeight: 1.4,
              }}>{title}</p>
              {message && (
                <p style={{
                  margin: '6px 0 0', fontSize: 13, lineHeight: 1.6,
                  color: 'var(--color-text-secondary)',
                }}>{message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '0.75rem 1.5rem 1.25rem',
          borderTop: '0.5px solid var(--color-border-tertiary)',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              background: 'transparent',
              border: '0.5px solid var(--color-border-secondary)',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {cancelLabel || 'Annuler'}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              fontWeight: 500,
              background: v.color, border: 'none', color: '#fff',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {confirmLabel || 'Confirmer'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cfm-in {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </div>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useConfirm = () => {
  const [modal, setModal] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModal(config);
    });
  }, []);

  const handleConfirm = () => { setModal(null); resolveRef.current?.(true);  };
  const handleCancel  = () => { setModal(null); resolveRef.current?.(false); };

  const ConfirmDialog = modal
    ? <ConfirmModal config={modal} onConfirm={handleConfirm} onCancel={handleCancel} />
    : null;

  return { confirm, ConfirmDialog };
};
