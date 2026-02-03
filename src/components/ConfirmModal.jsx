import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmer", cancelText = "Annuler", type = "danger" }) {
  if (!isOpen) return null;

  const colors = {
    danger: "from-red-500 to-rose-600 shadow-red-500/20 text-white",
    warning: "from-amber-500 to-orange-600 shadow-amber-500/20 text-twilight-950",
    info: "from-blue-500 to-indigo-600 shadow-blue-500/20 text-white"
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-twilight-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-twilight-900 border border-twilight-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full opacity-20 ${type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`}></div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${type === 'danger' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
              <AlertTriangle size={40} />
            </div>

            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">{title}</h2>
            <p className="text-twilight-400 font-bold text-sm leading-relaxed mb-10">{message}</p>

            <div className="flex gap-4 w-full">
              <button
                onClick={onCancel}
                className="flex-1 py-4 bg-twilight-800 hover:bg-twilight-700 text-twilight-400 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-[2] py-4 bg-gradient-to-br rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 ${colors[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>

          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 text-twilight-600 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
