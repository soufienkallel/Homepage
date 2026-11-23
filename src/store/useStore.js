import { create } from 'zustand';
import { supabase } from '../lib/supabase';

let authSubscriptionInitialized = false;
// Mirrors the server rule (server/adminAuth.js + public.homepage_admins): this only
// decides whether to show the admin UI — the API and RLS enforce access themselves.
const ADMIN_ROLE_SELECTOR_EMAILS = new Set(['admin@mallouliauto.com']);

const hasAdminClaim = (session) => {
  const user = session?.user;
  const email = user?.email?.trim().toLowerCase();

  if (email && ADMIN_ROLE_SELECTOR_EMAILS.has(email)) {
    return true;
  }

  // app_metadata only: user_metadata is editable by the user themself, so it can
  // never grant admin (the server applies the same rule).
  const meta = user?.app_metadata ?? {};
  const roles = Array.isArray(meta.roles) ? meta.roles.map((r) => String(r).toLowerCase()) : [];
  return String(meta.role ?? '').toLowerCase() === 'admin' || roles.includes('admin');
};

export const useStore = create((set) => ({
  // Language state
  language: 'fr',
  setLanguage: (lang) => set({ language: lang }),
  // Supabase-backed authentication state
  session: null,
  user: null,
  isAdmin: false,
  authReady: false,

  initializeAuth: async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      set({ session: null, user: null, isAdmin: false, authReady: true });
      return;
    }

    const session = data?.session ?? null;
    set({
      session,
      user: session?.user ?? null,
      isAdmin: hasAdminClaim(session),
      authReady: true,
    });

    if (!authSubscriptionInitialized) {
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        set({
          session: nextSession ?? null,
          user: nextSession?.user ?? null,
          isAdmin: hasAdminClaim(nextSession),
          authReady: true,
        });
      });
      authSubscriptionInitialized = true;
    }
  },
}));
