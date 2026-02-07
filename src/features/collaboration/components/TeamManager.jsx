import React, { useState, useEffect, useCallback } from 'react';
import { useTeam } from '../hooks/useTeam';
import { invitationService } from '../services/invitationService';
import { Users, Plus, UserPlus, Copy, LogOut, Shield, Search, Send, Mail, Sparkles } from 'lucide-react';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../../components/ConfirmModal';

export default function TeamManager({ userId, onToast }) {
  const { team, members, isLoading, createTeam, joinTeam, leaveTeam, isCreating, isJoining } = useTeam(userId);
  const { trigger } = useHapticFeedback();
  
  // États UI
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserForInvite, setSelectedUserForInvite] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const loadInvites = useCallback(async () => {
    try {
      const invites = await invitationService.getMyInvites(userId);
      setPendingInvites(invites);
    } catch (err) {
      console.error("Erreur chargement invitations", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadInvites();
  }, [userId, loadInvites]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await invitationService.searchUsers(query);
      const currentMemberIds = members ? members.map(m => m.user_id) : [];
      setSearchResults(results.filter(u => u.id !== userId && !currentMemberIds.includes(u.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInviteAction = async (invitedUser) => {
    if (!team) {
      // Pas d'équipe : on propose d'en créer une
      setSelectedUserForInvite(invitedUser);
      setShowCreateModal(true);
    } else {
      // Équipe existante : on invite directement
      await sendInvite(invitedUser, team.id);
    }
  };

  const sendInvite = async (invitedUser, targetTeamId) => {
    try {
      trigger('SUCCESS');
      await invitationService.sendInvite(targetTeamId, invitedUser.id, userId);
      onToast({ message: `Invitation envoyée à ${invitedUser.username}`, type: 'success' });
      setSearchResults(prev => prev.filter(u => u.id !== invitedUser.id));
      setSelectedUserForInvite(null);
      setShowCreateModal(false);
    } catch (err) {
      onToast({ message: err.message || "Erreur lors de l'envoi", type: 'error' });
    }
  };

  const handleCreateAndInvite = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    try {
      trigger('SUCCESS');
      const newTeam = await createTeam(teamName);
      onToast({ message: "Équipe créée !", type: 'success' });
      if (selectedUserForInvite) {
        await sendInvite(selectedUserForInvite, newTeam.id);
      } else {
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error("Erreur création équipe:", err);
      onToast({ message: "Erreur lors de la création de l'équipe.", type: 'error' });
    }
  };

  const handleInviteResponse = async (inviteId, accept) => {
    try {
      trigger(accept ? 'SUCCESS' : 'MEDIUM');
      await invitationService.respondToInvite(inviteId, accept);
      if (accept) {
        onToast({ message: "Bienvenue dans l'équipe !", type: 'success' });
        window.location.reload(); 
      } else {
        onToast({ message: "Invitation refusée.", type: 'info' });
        setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
      }
    } catch (err) {
      console.error(err);
      onToast({ message: "Erreur lors de la réponse.", type: 'error' });
    }
  };

  if (isLoading) return <div className="p-12 text-center text-twilight-500 font-black italic animate-pulse">CHARGEMENT DU HUB...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. BARRE DE RECHERCHE GLOBALE (TOUJOURS VISIBLE) */}
      <div className="bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
          <Search className="text-amber-500" /> Trouver des Coéquipiers
        </h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-twilight-500" size={20} />
          <input
            type="text"
            placeholder="Pseudo du dresseur..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 font-bold transition-all shadow-inner"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-twilight-950 border border-twilight-800 rounded-2xl hover:border-twilight-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-twilight-800 rounded-full flex items-center justify-center overflow-hidden border border-twilight-700">
                      {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <Users size={18} className="text-twilight-500" />}
                    </div>
                    <span className="font-black text-white uppercase italic text-sm">{user.username}</span>
                  </div>
                  <button 
                    onClick={() => handleInviteAction(user)}
                    className="p-3 bg-amber-500 text-twilight-950 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                    title="Inviter"
                  >
                    <Send size={18} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. INVITATIONS REÇUES */}
      {pendingInvites.length > 0 && (
        <div className="bg-twilight-900 border border-amber-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-gold-champagne"></div>
          <h2 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
            <Mail className="text-amber-500 animate-bounce" /> Invitations en attente ({pendingInvites.length})
          </h2>
          <div className="space-y-4">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-twilight-950 rounded-2xl border border-twilight-800 shadow-xl">
                <div>
                  <p className="text-twilight-400 font-bold text-xs uppercase tracking-widest mb-1">Invitation de <span className="text-amber-500">{invite.inviter?.username}</span></p>
                  <p className="text-white font-black uppercase text-2xl italic tracking-tighter">{invite.teams?.name}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => handleInviteResponse(invite.id, false)} className="flex-1 sm:flex-none py-3 px-6 bg-twilight-800 text-twilight-400 rounded-xl font-black uppercase text-[10px] hover:bg-red-500/20 hover:text-red-500 transition-all">Refuser</button>
                  <button onClick={() => handleInviteResponse(invite.id, true)} className="flex-1 sm:flex-none py-3 px-8 bg-amber-500 text-twilight-950 rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all shadow-lg">Accepter</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ÉQUIPE ACTUELLE OU OPTIONS DE CRÉATION */}
      {!team ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
              <Plus className="text-amber-500" /> Créer une Équipe
            </h2>
            <form onSubmit={handleCreateAndInvite} className="space-y-4">
              <input
                type="text"
                placeholder="Nom de l'équipe..."
                className="w-full px-5 py-4 rounded-2xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 font-bold"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <button disabled={isCreating} className="w-full py-4 bg-amber-500 text-twilight-950 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl">
                {isCreating ? 'Création...' : 'Fonder l\'équipe'}
              </button>
            </form>
          </div>

          <div className="bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
              <UserPlus className="text-gold-champagne" /> Rejoindre par code
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); joinTeam(inviteCode.toUpperCase()); }} className="space-y-4">
              <input
                type="text"
                placeholder="Code (ex: XZ8Y2...)"
                className="w-full px-5 py-4 rounded-2xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-gold-champagne font-mono font-black uppercase text-center tracking-widest"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <button disabled={isJoining} className="w-full py-4 bg-gold-champagne text-twilight-950 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl">
                {isJoining ? 'Connexion...' : 'Valider le code'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">QG DE CHASSE</span>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{team.name}</h2>
            </div>
            <button onClick={() => { trigger('MEDIUM'); setShowLeaveConfirm(true); }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={24} />
            </button>
          </div>

          <div className="bg-twilight-950 border border-twilight-800 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
            <div>
              <p className="text-twilight-500 text-[10px] font-black uppercase tracking-widest mb-1">Code d&apos;invitation</p>
              <p className="text-3xl font-mono font-black text-gold-champagne tracking-[0.2em]">{team.invite_code}</p>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(team.invite_code); onToast({message: 'Code copié !', type: 'info'}); }}
              className="px-8 py-4 bg-twilight-800 hover:bg-twilight-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all border border-twilight-700 shadow-lg"
            >
              <Copy size={20} /> Copier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <div key={member.user_id} className="flex items-center gap-4 p-5 bg-twilight-950 border border-twilight-800 rounded-[2rem] shadow-lg">
                <div className="w-12 h-12 bg-twilight-800 rounded-full border border-twilight-700 flex items-center justify-center overflow-hidden">
                  {member.profiles?.avatar_url ? <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <Shield size={24} className="text-twilight-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-sm uppercase italic truncate">{member.profiles?.username}</p>
                  <p className="text-[9px] font-bold text-twilight-500 uppercase tracking-widest">{member.role === 'admin' ? 'Leader' : 'Membre'}</p>
                </div>
                {member.role === 'admin' && <Shield size={16} className="text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALE DE CRÉATION RAPIDE */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-twilight-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-twilight-900 border border-amber-500/50 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                  <Sparkles size={40} className="text-twilight-950 fill-current" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white text-center uppercase italic tracking-tighter mb-2">Nouvelle Équipe</h2>
              <p className="text-twilight-400 text-center text-sm font-bold mb-8">Créez votre équipe pour inviter <span className="text-amber-500">{selectedUserForInvite?.username}</span> !</p>
              
              <form onSubmit={handleCreateAndInvite} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nom de l'équipe (ex: Team Rocket)"
                  className="w-full px-6 py-4 rounded-2xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 font-bold"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-twilight-800 text-twilight-400 rounded-2xl font-black uppercase text-xs tracking-widest">Annuler</button>
                  <button type="submit" disabled={isCreating} className="flex-[2] py-4 bg-amber-500 text-twilight-950 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-500/20">
                    {isCreating ? 'Création...' : "C'est parti !"}
                  </button>
                </div>
              </form>
            </motion.div>
                    </div>
                  )}
                </AnimatePresence>
          
                <ConfirmModal 
                  isOpen={showLeaveConfirm}
                  title="Quitter l'équipe ?"
                  message={`Êtes-vous sûr de vouloir quitter "${team?.name}" ? Vous ne pourrez plus voir la collection commune ni participer aux chasses de groupe.`}
                  confirmText="Quitter l'équipe"
                  onConfirm={() => { leaveTeam(team.id); setShowLeaveConfirm(false); }}
                  onCancel={() => setShowLeaveConfirm(false)}
                />
              </div>
            );
          }
          