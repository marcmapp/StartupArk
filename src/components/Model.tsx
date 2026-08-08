import React from "react";

interface ModalProps {
  message: string;
  onClose: () => void;
  variant?: "success" | "error";
}

const VARIANT_STYLES = {
  success: {
    ring: "ring-emerald-500/30 dark:ring-emerald-400/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    button: "bg-emerald-600 text-white hover:bg-emerald-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
  },
  error: {
    ring: "ring-red-500/30 dark:ring-red-400/30",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    button: "bg-red-600 text-white hover:bg-red-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
  },
};

const Modal: React.FC<ModalProps> = ({ message, onClose, variant = "success" }) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`glass-card w-full max-w-md p-6 ring-1 ${styles.ring}`}>
        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
          <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {styles.icon}
          </svg>
        </div>
        <p className="text-lg text-center text-zinc-900 dark:text-white mb-5">{message}</p>
        <button
          className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-colors ${styles.button}`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;