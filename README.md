# ✨ ShinyDex

**ShinyDex** est une application web moderne (PWA) conçue spécifiquement pour les chasseurs de Pokémon chromatiques. Elle centralise le suivi de collection, la gestion des compteurs de rencontres et la collaboration en temps réel au sein d'une interface élégante et optimisée.

[![Version](https://img.shields.io/badge/version-1.3.0-amber.svg)](https://github.com/Barthelemew/ShinyDex)
[![Built with Supabase](https://img.shields.io/badge/Backend-Supabase-green.svg)](https://supabase.com)
[![Framework](https://img.shields.io/badge/Framework-React-blue.svg)](https://reactjs.org/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

---

## 🚀 Fonctionnalités Clés

### 📊 Suivi de Collection Avancé
- **Pokédex Intelligent** : Vue grille ou liste avec filtrage par génération et recherche instantanée via Fuse.js.
- **Gestion Multi-Spécimens** : Enregistrez plusieurs exemplaires d'un même Pokémon avec leurs détails propres (version, méthode, rencontres).
- **Import/Export CSV** : Ne perdez jamais vos données. Importez vos anciennes collections ou sauvegardez la vôtre localement.
- **Multi-sélection** : Ajoutez ou modifiez plusieurs Pokémon simultanément.

### ⏱️ Compteur de Chasse Intelligent
- **Calculateur de Probabilités** : Estimation des chances en temps réel selon le jeu, la méthode et les objets (Charme Chroma, Aura Brillance).
- **Multi-compteurs** : Gérez plusieurs chasses en parallèle et basculez de l'une à l'autre d'un clic.
- **Feedback Haptique** : Sensations tactiles lors des incrémentations (sur mobile).

### 🤝 Collaboration & Équipe
- **Pokédex Commun** : Partagez votre progression avec votre équipe.
- **Chasse de Groupe** : Synchronisation des compteurs en temps réel via WebSockets (Supabase Realtime).
- **Flux d'Activité** : Soyez prévenu instantanément quand un membre de l'équipe trouve un chromatique.

### 📱 Expérience Mobile (PWA)
- **Installable** : Ajoutez ShinyDex à votre écran d'accueil comme une application native.
- **Offline-First** : Continuez vos chasses même sans connexion, les données se synchroniseront automatiquement à votre retour en ligne.
- **Interface Optimisée** : Navigation à une main via la barre basse et interface dense pour smartphone.

---

## 🛠️ Stack Technique

- **Frontend** : [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) avec un système de Design Tokens personnalisé (*Twilight & Gold Champagne*).
- **Backend & Auth** : [Supabase](https://supabase.com/) (PostgreSQL + Realtime).
- **Animations** : [Framer Motion](https://www.framer.com/motion/).
- **Gestion d'État** : [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction).
- **PWA** : [Vite PWA Plugin](https://vite-pwa-org.netlify.app/).

---

## 📦 Installation & Configuration

### Pré-requis
- Node.js (v18+)
- Un projet Supabase actif

### Installation locale
1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Barthelemew/ShinyDex.git
   cd ShinyDex
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Variables d'environnement**
   Créez un fichier `.env` à la racine et ajoutez vos clés Supabase :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anon
   ```

4. **Lancer le projet**
   ```bash
   npm run dev
   ```

---

## 📄 Licence
Projet réalisé par **Nico** dans le cadre du projet ShinyDex. Tous droits réservés.

---

*Fait avec ❤️ pour la communauté des Shasseurs.*
