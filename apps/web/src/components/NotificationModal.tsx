import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'danger' | 'warning' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const NotificationModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    info: {
      icon: 'info',
      color: 'text-primary',
      bg: 'bg-primary/10',
      btn: 'bg-primary text-on-primary shadow-primary/20',
    },
    danger: {
      icon: 'report_problem',
      color: 'text-error',
      bg: 'bg-error/10',
      btn: 'bg-error text-on-error shadow-error/20',
    },
    warning: {
      icon: 'warning',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      btn: 'bg-amber-500 text-white shadow-amber-500/20',
    },
    success: {
      icon: 'check_circle',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      btn: 'bg-emerald-500 text-white shadow-emerald-500/20',
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-surface-container-low border border-secondary-container/20 rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-[24px] ${style.bg} flex items-center justify-center mb-6 border border-${type === 'info' ? 'primary' : type === 'danger' ? 'error' : 'secondary'}/20`}>
            <span className={`material-symbols-outlined text-[40px] ${style.color}`}>{style.icon}</span>
          </div>
          
          <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-on-surface-variant font-medium leading-relaxed mb-10 italic">
            "{message}"
          </p>
          
          <div className="flex w-full gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 bg-surface-container-high border border-secondary-container/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-highest transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-95 ${style.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
