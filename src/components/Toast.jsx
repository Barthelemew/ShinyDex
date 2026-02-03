import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Trophy } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, onAction, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
    achievement: <Trophy className="text-twilight-950" size={24} />,
  };

  const colors = {
    success: 'border-green-500/30 bg-green-500/10 text-green-200',
    error: 'border-red-500/30 bg-red-500/10 text-red-200',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
    achievement: 'border-gold-champagne bg-gradient-to-r from-amber-400 to-orange-600 text-twilight-950 shadow-[0_0_30px_rgba(245,158,11,0.4)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, x: '-50%', scale: 0.8 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, x: '-50%', transition: { duration: 0.2 } }}
      onClick={() => {
        if (onAction) {
          onAction();
          onClose();
        }
      }}
      className={`fixed bottom-12 left-1/2 z-[100] flex items-center gap-4 px-8 py-5 rounded-[2rem] border-2 backdrop-blur-md shadow-2xl min-w-[320px] cursor-pointer hover:scale-[1.02] transition-transform ${colors[type]}`}
    >
      <div className={`flex-shrink-0 ${type === 'achievement' ? 'bg-white/20 p-2 rounded-xl' : ''}`}>
        {icons[type]}
      </div>
      <div className="flex-1">
        {type === 'achievement' && <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-80 leading-none">Succès Débloqué</p>}
        <p className={`font-black uppercase italic tracking-tight ${type === 'achievement' ? 'text-lg leading-tight' : 'text-sm'}`}>{message}</p>
        {onAction && <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">Cliquer pour voir</p>}
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
        className={`transition-colors ${type === 'achievement' ? 'text-twilight-950/40 hover:text-twilight-950' : 'text-white/20 hover:text-white'}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
