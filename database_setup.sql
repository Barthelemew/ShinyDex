-- SCRIPT DE CONFIGURATION (VERSION ULTRA-STABLE - ANTI-RÉCURSION TOTALE)
-- Ce script supprime TOUTES les anciennes politiques pour repartir sur une base saine.

-- 1. EXTENSIONS & TABLES (Inchangé, mais on s'assure qu'elles existent)
create extension if not exists unaccent;

-- [Sections 1 à 6: Profiles, Teams, Members, Collection, Achievements, Invitations - Inchangées]

-- 7. RESET TOTAL DES POLITIQUES (Pour supprimer les boucles cachées)
do $$ 
begin
    -- Teams
    drop policy if exists "Membres et proprios voient leur équipe" on teams;
    drop policy if exists "Utilisateurs connectés peuvent créer une équipe" on teams;
    drop policy if exists "teams_select_policy" on teams;
    drop policy if exists "teams_insert_policy" on teams;
    drop policy if exists "teams_update_policy" on teams;
    
    -- Team Members
    drop policy if exists "Membres voient la liste des membres" on team_members;
    drop policy if exists "members_select_policy" on team_members;
    drop policy if exists "members_insert_policy" on team_members;
    drop policy if exists "members_delete_policy" on team_members;

    -- Collection & Profiles
    drop policy if exists "team_read_collection_policy" on collection;
    drop policy if exists "collection_select_policy" on collection;
    drop policy if exists "collection_insert_policy" on collection;
    drop policy if exists "collection_update_policy" on collection;
    drop policy if exists "collection_delete_policy" on collection;
    drop policy if exists "profiles_select_policy" on profiles;

    -- Team Invitations
    drop policy if exists "invites_select_policy" on team_invitations;
    drop policy if exists "invites_insert_policy" on team_invitations;
    drop policy if exists "invites_update_policy" on team_invitations;
    drop policy if exists "invites_delete_policy" on team_invitations;
end $$;

-- 8. NOUVELLES POLITIQUES "PLATES" (Zéro récursion)

-- --- TABLE: TEAMS ---
create policy "teams_select_policy" on teams for select
using (auth.uid() = owner_id or id in (select team_id from team_members where user_id = auth.uid()));    

create policy "teams_insert_policy" on teams for insert
with check (auth.uid() = owner_id);

create policy "teams_update_policy" on teams for update
using (auth.uid() = owner_id);

-- --- TABLE: TEAM_MEMBERS ---
create policy "members_select_policy" on team_members for select
using (auth.uid() is not null);

create policy "members_insert_policy" on team_members for insert
with check (auth.uid() = user_id);

create policy "members_delete_policy" on team_members for delete
using (auth.uid() = user_id);

-- --- TABLE: TEAM_INVITATIONS ---
create policy "invites_select_policy" on team_invitations for select
using (invited_user_id = auth.uid() or inviter_user_id = auth.uid());

create policy "invites_insert_policy" on team_invitations for insert
with check (inviter_user_id = auth.uid());

create policy "invites_update_policy" on team_invitations for update
using (invited_user_id = auth.uid() or inviter_user_id = auth.uid());

create policy "invites_delete_policy" on team_invitations for delete
using (invited_user_id = auth.uid() or inviter_user_id = auth.uid());

-- --- TABLE: PROFILES ---
create policy "profiles_select_policy" on profiles for select using (true);

-- --- TABLE: COLLECTION ---
alter table collection enable row level security;

-- Lecture : Soi-mÃªme OU son Ã©quipe
create policy "collection_select_policy" on collection for select
using (
  auth.uid() = user_id 
  or 
  user_id in (
    select user_id from team_members 
    where team_id in (select team_id from team_members where user_id = auth.uid())
  )
);

-- Insertion : Uniquement soi-même
create policy "collection_insert_policy" on collection for insert
with check (auth.uid() = user_id);

-- Mise à jour : Uniquement ses propres captures
create policy "collection_update_policy" on collection for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Suppression : Uniquement ses propres captures
create policy "collection_delete_policy" on collection for delete
using (auth.uid() = user_id);