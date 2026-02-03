import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Zap, ArrowLeft } from 'lucide-react';

export default function AuthForm({ onBack }) {
  const [loading, setLoading] = useState(false);
  // ... reste du code ...
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Vérifiez votre email pour confirmer l\'inscription !');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-twilight-950 flex flex-col items-center justify-center p-4">
      {onBack && (
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-twilight-500 hover:text-white uppercase font-black text-[10px] tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Retour au Pokédex
        </button>
      )}
      <div className="w-full max-w-md bg-twilight-900 border border-twilight-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
            <Zap size={32} className="text-twilight-950 fill-current" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            SHINY<span className="text-gold-champagne">DEX</span>
          </h1>
          <p className="text-twilight-400 font-bold text-xs uppercase tracking-widest mt-2">
            {isSignUp ? 'Créer un compte dresseur' : 'Connexion au centre Pokémon'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-twilight-300 text-[10px] uppercase font-black mb-1 ml-1 tracking-widest">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-gold-champagne transition-all font-bold placeholder:text-twilight-700"
              placeholder="dresseur@kanto.com"
            />
          </div>

          <div>
            <label className="block text-twilight-300 text-[10px] uppercase font-black mb-1 ml-1 tracking-widest">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-gold-champagne transition-all font-bold"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold-champagne text-twilight-950 rounded-xl font-black uppercase italic tracking-tighter hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Traitement...' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-twilight-400 hover:text-gold-champagne text-xs font-bold uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Nouveau dresseur ? S\'inscrire'}
          </button>
        </div>
      </div>
    </div>
  );
}
