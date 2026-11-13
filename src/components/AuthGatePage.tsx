import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  GitBranch,
  Lock,
  Mail,
  Network,
  Sparkles,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import type { ThinkForgeUser } from '../types/thinkforge';
import {
  DEMO_GUEST_ACCOUNT,
  DEMO_LEARNER_ACCOUNT,
  isSupabaseConfigured,
  signInLearner,
  signUpLearner,
} from '../services/supabaseClient';

interface AuthGatePageProps {
  onAuthenticated: (user: ThinkForgeUser, remember: boolean) => void;
}

type AuthTab = 'signin' | 'signup';

export const AuthGatePage: React.FC<AuthGatePageProps> = ({ onAuthenticated }) => {
  const [authTab, setAuthTab] = useState<AuthTab>('signin');
  const [name, setName] = useState('');
  const [team, setTeam] = useState('CurioMinds');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const switchTab = (next: AuthTab) => {
    setAuthTab(next);
    setErrorMsg(null);
    setNoticeMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);
    setIsSubmitting(true);

    try {
      if (authTab === 'signin') {
        const result = await signInLearner({ email, password });
        if (result.error) {
          setErrorMsg(result.error);
          return;
        }
        if (result.user) {
          onAuthenticated(result.user, remember);
        }
      } else {
        const result = await signUpLearner({ name, email, password, team });
        if (result.error) {
          setErrorMsg(result.error);
          return;
        }
        if (result.notice) {
          setNoticeMsg(result.notice);
        }
        if (result.user) {
          onAuthenticated(result.user, remember);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (account: typeof DEMO_LEARNER_ACCOUNT) => {
    setErrorMsg(null);
    setNoticeMsg(null);
    setIsSubmitting(true);
    try {
      const result = await signInLearner({
        email: account.user.email,
        password: account.password,
      });
      if (result.user) {
        onAuthenticated(result.user, true);
      } else {
        setErrorMsg(result.error ?? 'Unable to launch demo workspace.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        {/* Top Wordmark */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37] text-black text-white shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">ThinkForge</span>
                <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2 py-0.5 text-[11px] font-semibold text-[#d4af37]">
                  Team CurioMinds
                </span>
              </div>
              <p className="text-xs text-slate-500">Build with Sarvam · Curiosity Knowledge Network</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              isSupabaseConfigured
                ? 'border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSupabaseConfigured ? 'bg-[#f59e0b]' : 'bg-[#d4af37]/100'
              }`}
            />
            {isSupabaseConfigured ? 'Supabase Auth Ready' : 'Interactive Demo Mode'}
          </span>
        </div>

        {/* Main 2-column Welcome Gate */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Left Hero Summary */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm lg:col-span-6">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                <Sparkles className="h-3.5 w-3.5" />
                Curiosity-Driven Learning Workspace
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Don&apos;t just find answers.{' '}
                  <span className="text-[#d4af37]">Discover better questions.</span>
                </h1>
                <p className="text-base leading-relaxed text-slate-600">
                  ThinkForge transforms linear AI chat into visual knowledge trees. Choose your
                  learning lens, explore structured explanations, and branch deeper into concepts
                  with peers.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 pt-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <Compass className="h-5 w-5 text-[#d4af37]" />
                  <h3 className="mt-2.5 text-sm font-semibold text-slate-900">
                    5 Learning Objectives
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Switch between First-Principles, Deep Research, Backstory, Cross-Topic, and
                    Exam Prep.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <GitBranch className="h-5 w-5 text-[#d4af37]" />
                  <h3 className="mt-2.5 text-sm font-semibold text-slate-900">
                    Living Knowledge Graphs
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Every follow-up branches an interactive graph node you can zoom, inspect, and
                    revisit anytime.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <Users className="h-5 w-5 text-[#c87d55]" />
                  <h3 className="mt-2.5 text-sm font-semibold text-slate-900">
                    Community Extensions
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Browse public learner journeys and contribute new follow-up branches to shared
                    graphs.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="mt-2.5 text-sm font-semibold text-slate-900">
                    Curiosity Credits
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Earn milestones for asking thoughtful questions, exploring paths, and helping
                    peers learn.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <span>CurioMinds · Hackathon Prototype</span>
              <span>React Flow + TypeScript Workspace</span>
            </div>
          </div>

          {/* Right Auth + Quick Demo Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm lg:col-span-6">
            <div>
              {/* Tabs */}
              <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    authTab === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    authTab === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {authTab === 'signin' ? 'Welcome back to ThinkForge' : 'Start your curiosity space'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {authTab === 'signin'
                  ? 'Sign in with your email or jump right in using a 1-click demo profile below.'
                  : 'Create a learner profile to save inquiries and earn curiosity milestones.'}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {authTab === 'signup' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ananya Rao"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Team / Cohort
                      </label>
                      <input
                        type="text"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        placeholder="CurioMinds"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ananya@thinkforge.dev"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 6 chars)"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    Remember me on this browser
                  </label>
                  <span className="text-slate-400">Demo pass: thinkforge2026</span>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                    {errorMsg}
                  </div>
                )}

                {noticeMsg && (
                  <div className="rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3.5 py-2.5 text-xs font-medium text-[#f59e0b]">
                    {noticeMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] text-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e5c158] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Entering ThinkForge...'
                    : authTab === 'signin'
                    ? 'Sign In to Dashboard'
                    : 'Create Learner Account'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* 1-Click Demo Section */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  1-Click Hackathon Demo Access
                </span>
                <span className="text-[11px] text-slate-400">No backend setup required</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo(DEMO_LEARNER_ACCOUNT)}
                  className="flex items-center justify-between rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-2.5 text-left transition hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f3efea]">
                      <UserCheck className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span className="truncate">{DEMO_LEARNER_ACCOUNT.user.name}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#d4af37]">
                      Team {DEMO_LEARNER_ACCOUNT.user.team} · Active Learner
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#d4af37]" />
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo(DEMO_GUEST_ACCOUNT)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-100/70 disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <UserCheck className="h-3.5 w-3.5 text-slate-600" />
                      <span className="truncate">{DEMO_GUEST_ACCOUNT.user.name}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-600">
                      Guest Explorer Profile
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
