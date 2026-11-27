import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Sprout,
  X,
  XCircle,
} from 'lucide-react';

export const DemoNotice: React.FC<{
  title: string;
  description?: string;
  tone?: 'neutral' | 'amber';
  className?: string;
}> = ({ title, description, tone = 'neutral', className = '' }) => {
  const styles =
    tone === 'amber'
      ? 'bg-[#FDF8EE] border-[#E9D7B3] text-[#6B4B16]'
      : 'bg-[#EEF3EE] border-[#D3E0D3] text-[#153F32]';

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles} ${className}`}
      role="status"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold tracking-tight">{title}</p>
        {description && <p className="mt-0.5 text-xs opacity-90">{description}</p>}
      </div>
    </div>
  );
};

export type SemanticState =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'inactive'
  | 'info';

export const StatusLabel: React.FC<{
  state: SemanticState;
  label: string;
}> = ({ state, label }) => {
  const map: Record<
    SemanticState,
    { text: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    healthy: { text: 'text-[#1E6B47]', Icon: CheckCircle2 },
    warning: { text: 'text-[#B4690E]', Icon: AlertTriangle },
    critical: { text: 'text-[#C82333]', Icon: XCircle },
    inactive: { text: 'text-[#647069]', Icon: Clock },
    info: { text: 'text-[#153F32]', Icon: Info },
  };
  const { text, Icon } = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${text}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-col gap-4 border-b border-[#E3E9E2] pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-[#202923] sm:text-[28px]">
        {title}
      </h1>
      <p className="mt-1 max-w-3xl text-sm text-[#606C65]">{subtitle}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
  </div>
);

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, maxWidthClass = 'max-w-lg', children }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101C16]/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-xl border border-[#DCE3DB] bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E8EDE7] px-6 py-4">
          <div>
            <h2 id="modal-title" className="font-display text-lg font-semibold text-[#202923]">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#606C65]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-[#606C65] transition-colors hover:bg-[#F2F5F0] hover:text-[#202923] focus-visible:outline-2 focus-visible:outline-[#153F32]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} maxWidthClass="max-w-md">
    <p className="text-sm text-[#4C5751]">{message}</p>
    <div className="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-[#D4DDD3] bg-white px-4 py-2 text-sm font-medium text-[#202923] transition-colors hover:bg-[#F7F9F5] whitespace-nowrap"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors whitespace-nowrap ${
          destructive
            ? 'bg-[#C82333] hover:bg-[#A71D2A]'
            : 'bg-[#153F32] hover:bg-[#0F2E24]'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export const SafeImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}> = ({ src, alt, className = '', fallbackTitle }) => {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#E8F0E8] text-[#153F32] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sprout className="h-8 w-8 opacity-75" aria-hidden="true" />
        {fallbackTitle && (
          <span className="mt-2 px-3 text-center text-xs font-medium text-[#153F32]/80">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D3DDD2] bg-white px-6 py-12 text-center">
    <Sprout className="h-8 w-8 text-[#287A55]" aria-hidden="true" />
    <h3 className="mt-3 font-display text-base font-semibold text-[#202923]">{title}</h3>
    <p className="mt-1 max-w-md text-sm text-[#606C65]">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0F2E24] whitespace-nowrap"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
