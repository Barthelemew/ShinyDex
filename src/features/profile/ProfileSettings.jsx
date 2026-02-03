import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { User, Camera, Save, ArrowLeft } from 'lucide-react';
import { sanitizeInput, isValidUsername } from '../../logic/security';

export default function ProfileSettings({ userId, onBack }) {
  const { profile, updateProfile, loading } = useUserStore();
  
  // Initialisation directe. Si le profil n'est pas encore chargé, ce sera vide.
  // Pour gérer le chargement asynchrone, le composant parent devrait gérer la clé (key)
  // ou on accepte que l'utilisateur doive attendre un peu avant d'éditer si sa connexion est lente.
  // Mais ici, comme on a déjà chargé le profil dans App.jsx, il y a de grandes chances qu'il soit là.
  const [username, setUsername] = useState(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [message, setMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Sécurité & Validation
    const cleanUsername = sanitizeInput(username).trim();
    if (!isValidUsername(cleanUsername)) {
      setMessage({ type: 'error', text: 'Pseudo invalide (3-20 caractères alphanumériques).' });
      return;
    }

    const result = await updateProfile(userId, { 
      username: cleanUsername, 
      avatar_url: sanitizeInput(avatarUrl).trim() 
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Profil mis à jour !' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    }
  };

  return (
    <div className="min-h-screen bg-twilight-950 p-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-twilight-400 hover:text-gold-champagne transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} /> Retour au Pokédex
        </button>

        <div className="bg-twilight-900 border border-twilight-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gold-champagne rounded-xl flex items-center justify-center">
              <User size={24} className="text-twilight-950" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Profil <span className="text-gold-champagne">Dresseur</span>
            </h1>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-twilight-800 rounded-full border-2 border-twilight-700 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-twilight-600" />
                  )}
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-gold-champagne text-twilight-950 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera size={16} />
                </button>
              </div>
              <p className="text-twilight-500 text-[10px] uppercase font-bold mt-2 tracking-widest">ID: {userId.slice(0, 8)}...</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-twilight-300 text-[10px] uppercase font-black mb-1 ml-1 tracking-widest">Pseudo Dresseur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-gold-champagne transition-all font-bold placeholder:text-twilight-700"
                  placeholder="Ex: Red, Blue, etc."
                />
              </div>

              <div>
                <label className="block text-twilight-300 text-[10px] uppercase font-black mb-1 ml-1 tracking-widest">URL de l&apos;Avatar</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-gold-champagne transition-all font-bold placeholder:text-twilight-700"
                  placeholder="https://images.com/mon-avatar.png"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center border ${
                message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold-champagne text-twilight-950 rounded-xl font-black uppercase italic tracking-tighter hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} /> {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
