-- SCRIPT DE CONFIGURATION (VERSION ULTRA-STABLE - ANTI-RÉCURSION TOTALE)
-- Ce script supprime TOUTES les anciennes politiques pour repartir sur une base saine.

-- 1. EXTENSIONS & TABLES (Inchangé, mais on s'assure qu'elles existent)
create extension if not exists unaccent;

-- [Sections 1 à 6: Profiles, Teams, Members, Collection, Achievements, Invitations - Inchangées]

-- 7. RESET TOTAL DES POLITIQUES (Pour supprimer les boucles cachées)
-- On drop TOUS les noms de politiques utilisés précédemment
do $$ 
begin
    -- Teams
    drop policy if exists "Membres et proprios voient leur équipe" on teams;
    drop policy if exists "Utilisateurs connectés peuvent créer une équipe" on teams;
    drop policy if exists "Owners can select teams" on teams;
    drop policy if exists "Members can select teams" on teams;
    drop policy if exists "Owners can update teams" on teams;
    
    -- Team Members
    drop policy if exists "Membres voient la liste des membres" on team_members;
    drop policy if exists "Propriétaires gèrent les membres" on team_members;
    drop policy if exists "Utilisateurs peuvent rejoindre" on team_members;
    drop policy if exists "See own membership" on team_members;
    drop policy if exists "See team members" on team_members;
    drop policy if exists "Owners manage members" on team_members;
    drop policy if exists "Public read for members" on team_members;
    drop policy if exists "Users can join teams" on team_members;
end $$;

-- 8. NOUVELLES POLITIQUES "PLATES" (Zéro récursion)

-- --- TABLE: TEAMS ---
-- Politique de lecture : On utilise une sous-requête simple. 
-- Pour éviter la récursion, la table team_members ne doit JAMAIS pointer vers teams en SELECT.
create policy "teams_select_policy" on teams for select 
using (auth.uid() = owner_id or id in (select team_id from team_members where user_id = auth.uid()));

create policy "teams_insert_policy" on teams for insert 
with check (auth.uid() = owner_id);

create policy "teams_update_policy" on teams for update 
using (auth.uid() = owner_id);

-- --- TABLE: TEAM_MEMBERS ---
-- CRITIQUE : Cette table ne doit JAMAIS interroger la table 'teams' dans son SELECT.
-- On autorise tout utilisateur connecté à voir les membres (la confidentialité est gérée par la table teams).
create policy "members_select_policy" on team_members for select 
using (auth.uid() is not null);

-- Pour l'insertion (rejoindre), on vérifie juste que c'est soi-même.
create policy "members_insert_policy" on team_members for insert 
with check (auth.uid() = user_id);

-- Pour la suppression (quitter ou virer), on autorise si c'est soi-même.
-- (Note: Virer un membre nécessiterait de checker teams.owner_id, ce qui créerait une boucle.
-- On simplifie : chacun peut se retirer, ou l'admin gère via l'app logic).
create policy "members_delete_policy" on team_members for delete 
using (auth.uid() = user_id);


-- --- TABLE: TEAM_INVITATIONS ---
drop policy if exists "Voir invitations équipe" on team_invitations;
drop policy if exists "Envoyer invitations" on team_invitations;
drop policy if exists "Gerer invitations" on team_invitations;

create policy "invites_select_policy" on team_invitations for select 
using (invited_user_id = auth.uid() or inviter_user_id = auth.uid());

create policy "invites_insert_policy" on team_invitations for insert 
with check (inviter_user_id = auth.uid());

create policy "invites_update_policy" on team_invitations for update 
using (invited_user_id = auth.uid() or inviter_user_id = auth.uid());

create policy "invites_delete_policy" on team_invitations for delete 
using (invited_user_id = auth.uid() or inviter_user_id = auth.uid());


-- [Sections 9 à 11: Triggers et Fonctions de recherche - Inchangées]





-- --- TABLE: COLLECTION (AJOUT POLITIQUES ÉQUIPE) ---


-- Autoriser la lecture des Pokémons si l'utilisateur appartient à la même équipe que le propriétaire du Pokémon.


create policy "team_read_collection_policy" on collection for select 


using (


  user_id in (


    select tm2.user_id 


    from team_members tm1


    join team_members tm2 on tm1.team_id = tm2.team_id


    where tm1.user_id = auth.uid()


  )


);

