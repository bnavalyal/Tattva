import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { ThinkForgeUser } from '../types/thinkforge';

/**
 * Clean optional Supabase authentication seam.
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are omitted,
 * all sign-in / profile actions stay purely inside frontend localStorage state.
 * No schemas, policies, or backend endpoints are invented here.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const SESSION_STORAGE_KEY = 'thinkforge_learner_session';
const LOCAL_USERS_STORAGE_KEY = 'thinkforge_learner_accounts';

interface StoredLocalAccount {
  user: ThinkForgeUser;
  password: string;
}

export const DEMO_LEARNER_ACCOUNT: { user: ThinkForgeUser; password: string } = {
  password: 'thinkforge2026',
  user: {
    id: 'curiominds-learner-1',
    name: 'Ananya Rao',
    handle: '@ananya.curious',
    email: 'ananya@thinkforge.dev',
    team: 'CurioMinds // CS & Curiosity Explorer',
    bio: 'Exploring how distributed systems, AI interpretability, and security proofs connect from first principles.',
    focusSubjects: ['AI & Machine Learning', 'Systems & Architecture', 'Cybersecurity & Privacy'],
    authSource: 'local',
  },
};

export const DEMO_GUEST_ACCOUNT: { user: ThinkForgeUser; password: string } = {
  password: 'thinkforge2026',
  user: {
    id: 'curiominds-guest-1',
    name: 'Arjun Kulkarni',
    handle: '@arjun.curiominds',
    email: 'arjun@thinkforge.dev',
    team: 'CurioMinds Hackathon Squad',
    bio: 'Asking better questions across operating systems, cryptography, and design.',
    focusSubjects: ['Systems & Architecture', 'Software Engineering', 'Algorithms & Logic'],
    authSource: 'local',
  },
};

function sanitizeHandle(raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9_.]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
  return `@${slug || 'curious_learner'}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readLocalUsers(): StoredLocalAccount[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(accounts: StoredLocalAccount[]): void {
  try {
    window.localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors
  }
}

function mapSupabaseUser(authUser: User): ThinkForgeUser {
  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const email = authUser.email ?? 'learner@thinkforge.dev';
  const name =
    typeof meta.name === 'string' && meta.name.trim()
      ? meta.name.trim()
      : email.split('@')[0];
  const handle =
    typeof meta.handle === 'string' && meta.handle.trim()
      ? meta.handle.trim()
      : sanitizeHandle(name);
  const team =
    typeof meta.team === 'string' && meta.team.trim()
      ? meta.team.trim()
      : 'CurioMinds Learning Network';

  return {
    id: authUser.id,
    name,
    handle,
    email,
    team,
    bio: 'Curious learner exploring connected inquiry graphs on ThinkForge.',
    focusSubjects: ['AI & Machine Learning', 'Systems & Architecture'],
    authSource: 'supabase',
  };
}

export function readLocalSessionUser(): ThinkForgeUser | null {
  try {
    const raw =
      window.localStorage.getItem(SESSION_STORAGE_KEY) ??
      window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ThinkForgeUser;
    return parsed && typeof parsed.email === 'string' && typeof parsed.handle === 'string'
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function saveSessionUser(user: ThinkForgeUser | null, remember: boolean): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    if (!user) return;
    const serialized = JSON.stringify(user);
    if (remember) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    } else {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    }
  } catch {
    // Ignore storage errors
  }
}

export async function getSavedSessionUser(): Promise<ThinkForgeUser | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        return mapSupabaseUser(data.session.user);
      }
    } catch {
      // Fall back cleanly to local demo storage
    }
  }
  return readLocalSessionUser();
}

export async function signInLearner(payload: {
  email: string;
  password: string;
}): Promise<{ user?: ThinkForgeUser; error?: string }> {
  const email = payload.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address (for example, ananya@thinkforge.dev).' };
  }
  if (!payload.password) {
    return { error: 'Please enter your password to continue.' };
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: payload.password,
    });
    if (error || !data.user) {
      return { error: error?.message ?? 'Unable to sign in right now.' };
    }
    return { user: mapSupabaseUser(data.user) };
  }

  const allAccounts = [...readLocalUsers(), DEMO_LEARNER_ACCOUNT, DEMO_GUEST_ACCOUNT];
  const match = allAccounts.find((entry) => entry.user.email.toLowerCase() === email);
  if (!match) {
    return {
      error: 'No learner account found for that email. Create an account or use 1-Click Demo Entry below.',
    };
  }
  if (match.password !== payload.password) {
    return {
      error: 'Incorrect password. Demo password is "thinkforge2026" or click 1-Click Demo Entry.',
    };
  }

  return { user: match.user };
}

export async function signUpLearner(payload: {
  name: string;
  email: string;
  password: string;
  team: string;
}): Promise<{ user?: ThinkForgeUser; error?: string; notice?: string }> {
  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();
  const team = payload.team.trim() || 'CurioMinds Explorer';

  if (name.length < 2) {
    return { error: 'Enter your full name (at least 2 characters).' };
  }
  if (!isValidEmail(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (payload.password.length < 6) {
    return { error: 'Choose a password with at least 6 characters.' };
  }

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          name,
          handle: sanitizeHandle(name),
          team,
        },
      },
    });
    if (error) return { error: error.message };
    if (data.user && data.session) {
      return { user: mapSupabaseUser(data.user) };
    }
    return {
      notice: 'Account created! Check your email to confirm, or sign in via 1-Click Demo Entry.',
    };
  }

  const existing = [...readLocalUsers(), DEMO_LEARNER_ACCOUNT, DEMO_GUEST_ACCOUNT].some(
    (entry) => entry.user.email.toLowerCase() === email
  );
  if (existing) {
    return { error: 'An account with this email already exists. Switch to Sign In.' };
  }

  const newUser: ThinkForgeUser = {
    id: `learner-${Date.now().toString(36)}`,
    name,
    handle: sanitizeHandle(name),
    email,
    team,
    bio: 'Exploring curiosity graphs on ThinkForge.',
    focusSubjects: ['AI & Machine Learning', 'Systems & Architecture'],
    authSource: 'local',
  };

  writeLocalUsers([{ user: newUser, password: payload.password }, ...readLocalUsers()]);
  return { user: newUser };
}

export async function signOutLearner(): Promise<void> {
  saveSessionUser(null, true);
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out errors
    }
  }
}
