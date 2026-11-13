import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Search,
  ShieldAlert,
} from 'lucide-react';

interface ConceptNode {
  id: string;
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  status: 'conquered' | 'available' | 'locked';
  isBossFight?: boolean;
  targetSourceId?: string;
  prerequisites?: string[];
  description: string;
}

const TATTVA_200_CURRICULUM: ConceptNode[] = [
  // --- TIER 1: HARDWARE, ARCHITECTURE & LOW-LEVEL SYSTEMS ---
  {
    id: 't1-01',
    name: 'Memory Arena & Bump Allocators',
    tier: 'tier1',
    status: 'conquered',
    targetSourceId: 'source-transformers',
    description: 'O(1) allocation without per-object metadata; batch resetting for high-throughput frame/request cycles.',
  },
  {
    id: 't1-02',
    name: 'Virtual Memory & Page Table Walkers',
    tier: 'tier1',
    status: 'conquered',
    targetSourceId: 'source-os-sync',
    description: 'Multi-level page tables, TLB shootdowns, and hardware page table walks in x86-64 long mode.',
  },
  {
    id: 't1-03',
    name: 'MESI / MOESI Cache Coherence Protocols',
    tier: 'tier1',
    status: 'available',
    targetSourceId: 'source-os-sync',
    description: 'Snooping vs directory-based protocols; invalidation queues and store buffers in multicore CPUs.',
  },
  {
    id: 't1-04',
    name: 'Out-of-Order Execution & Tomasulo Algorithm',
    tier: 'tier1',
    status: 'locked',
    isBossFight: true,
    prerequisites: ['MESI Cache Coherence'],
    description: 'Reservation stations, reorder buffers (ROB), register renaming, and speculative branch resolution.',
  },
  {
    id: 't1-05',
    name: 'Memory-Mapped I/O & DMA Controllers',
    tier: 'tier1',
    status: 'locked',
    prerequisites: ['Virtual Memory'],
    description: 'Ring buffers, scatter-gather DMA descriptors, and cache-coherent device memory transfers.',
  },
  {
    id: 't1-06',
    name: 'Zero-Copy IO & Linux io_uring Ring Buffers',
    tier: 'tier1',
    status: 'locked',
    prerequisites: ['DMA Controllers'],
    description: 'Kernel submission/completion queue pair synchronization bypassing syscall context-switch overhead.',
  },

  // --- TIER 2: CONCURRENCY, OS PRIMITIVES & DISTRIBUTED SYSTEMS ---
  {
    id: 't2-01',
    name: 'Atomic Compare-And-Swap (CAS) & ABA Problem',
    tier: 'tier2',
    status: 'conquered',
    targetSourceId: 'source-os-sync',
    description: 'Hardware atomic primitives, lock-free queues, and tag-stamping to eliminate ABA state corruption.',
  },
  {
    id: 't2-02',
    name: 'Dijkstra Counting Semaphores & Circular Wait',
    tier: 'tier2',
    status: 'conquered',
    targetSourceId: 'source-os-sync',
    description: 'Atomic wait (P) and signal (V) operations; breaking Coffman conditions to prove deadlock freedom.',
  },
  {
    id: 't2-03',
    name: 'Raft Majority Quorum & Leader Election Invariant',
    tier: 'tier2',
    status: 'available',
    targetSourceId: 'source-os-sync',
    description: 'Pigeonhole principle guaranteeing (N/2 + 1) quorum intersection; log matching and Figure-8 commit rule.',
  },
  {
    id: 't2-04',
    name: 'Byzantine Fault Tolerance & PBFT 3-Phase Commit',
    tier: 'tier2',
    status: 'locked',
    isBossFight: true,
    prerequisites: ['Raft Consensus'],
    description: 'State machine replication tolerating 3f + 1 malicious/corrupted nodes with cryptographic digest voting.',
  },
  {
    id: 't2-05',
    name: 'Vector Clocks & Lamport Causality Violation',
    tier: 'tier2',
    status: 'locked',
    prerequisites: ['Raft Consensus'],
    description: 'Partial order tracking in asynchronous networks; identifying concurrent conflicting mutations without global wall clocks.',
  },

  // --- TIER 3: CRYPTOGRAPHY, PROTOCOLS & SECURITY INVARIANTS ---
  {
    id: 't3-01',
    name: 'RSA Static Key Exchange & Decryption Vulnerability',
    tier: 'tier3',
    status: 'conquered',
    targetSourceId: 'source-rsa-crypto',
    description: 'Why static RSA encryption fails forward secrecy; retrospectively harvesting ciphertext via long-term private keys.',
  },
  {
    id: 't3-02',
    name: 'Ephemeral Diffie-Hellman (ECDHE) Forward Secrecy',
    tier: 'tier3',
    status: 'available',
    targetSourceId: 'source-rsa-crypto',
    description: 'Generating and destroying ephemeral per-session elliptic curve points to guarantee forward secrecy in TLS 1.3.',
  },
  {
    id: 't3-03',
    name: 'Post-Quantum Lattice Cryptography (ML-KEM / Kyber)',
    tier: 'tier3',
    status: 'locked',
    isBossFight: true,
    prerequisites: ['ECDHE Forward Secrecy'],
    description: 'Learning With Errors (LWE) over module lattices; resistance against Shor algorithm on quantum adversaries.',
  },
  {
    id: 't3-04',
    name: 'Zero-Knowledge Proofs: zk-SNARKs & QAP Polynomials',
    tier: 'tier3',
    status: 'locked',
    isBossFight: true,
    prerequisites: ['Lattice Cryptography'],
    description: 'Quadratic Arithmetic Programs, elliptic curve pairings, and verifying computational proofs with zero leak of witness data.',
  },

  // --- TIER 4: ALGORITHMS, COMPLEXITY & FIRST-PRINCIPLES THEORY ---
  {
    id: 't4-01',
    name: 'Monotonic Stack Elimination O(N)',
    tier: 'tier4',
    status: 'conquered',
    targetSourceId: 'source-celebrity-problem',
    description: 'Two-element query elimination invariant; reducing quadratic pairwise checks to strict linear time.',
  },
  {
    id: 't4-02',
    name: 'Decreasing Monotonic Deque Sliding Window O(N)',
    tier: 'tier4',
    status: 'conquered',
    targetSourceId: 'source-celebrity-problem',
    description: 'Amortized O(1) front maximum maintenance; cascading out-of-order smaller index evictions.',
  },
  {
    id: 't4-03',
    name: 'B-Tree Rebalancing & Disk Block Locality',
    tier: 'tier4',
    status: 'available',
    targetSourceId: 'source-celebrity-problem',
    description: 'Self-balancing multiway search tree; guaranteeing minimum degree fill and bounded disk seek operations.',
  },
  {
    id: 't4-04',
    name: 'Turing Reducibility & The Halting Problem Undecidability',
    tier: 'tier4',
    status: 'locked',
    isBossFight: true,
    prerequisites: ['B-Tree Rebalancing'],
    description: 'Diagonalization argument proving no general algorithm can decide whether arbitrary programs halt.',
  },
];

interface Tattva200GauntletViewProps {
  onOpenSourceInStudio?: (sourceId: string) => void;
  onNavigateToHome?: () => void;
}

export const Tattva200GauntletView: React.FC<Tattva200GauntletViewProps> = ({
  onOpenSourceInStudio,
  onNavigateToHome,
}) => {
  const [activeTier, setActiveTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tiers = [
    { id: 'all', label: 'All 200 Concepts' },
    { id: 'tier1', label: 'Tier 1: Hardware & Low-Level Systems' },
    { id: 'tier2', label: 'Tier 2: Concurrency & Distributed Systems' },
    { id: 'tier3', label: 'Tier 3: Cryptography & Security' },
    { id: 'tier4', label: 'Tier 4: Algorithms & First-Principles Theory' },
  ];

  const filteredConcepts = TATTVA_200_CURRICULUM.filter((c) => {
    const matchTier = activeTier === 'all' || c.tier === activeTier;
    const matchQuery =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTier && matchQuery;
  });

  const conqueredCount = TATTVA_200_CURRICULUM.filter((c) => c.status === 'conquered').length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 text-slate-200">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#d4af37] uppercase tracking-wider bg-[#d4af37]/10 px-2.5 py-0.5 rounded border border-[#d4af37]/30">
              PRD §4 · The Execution Gauntlet
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-400">
              200 Brutally Non-Negotiable Engineering Concepts
            </span>
          </div>

          <h1 className="mt-2 font-serif-tattva text-3xl sm:text-4xl text-white font-normal tracking-tight">
            The Tattva 200 Gauntlet
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Inspired by the Blind 75, Tattva 200 is the standardized syllabus required by elite engineering firms (Google, Palantir, Tesla) and competitive exam aspirants (GATE CS / ISRO). Nodes unlock sequentially through rigorous proof of inquiry.
          </p>
        </div>

        {/* Live Mastery Meter */}
        <div className="rounded-2xl border border-white/10 bg-[#181512] p-5 shrink-0 text-right space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>CONQUEST PROGRESS</span>
            <span className="font-bold text-[#d4af37]">{conqueredCount} / 200</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#d4af37] transition-all"
              style={{ width: `${(conqueredCount / 200) * 100}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Recruiter Baseline: 180+ Conquered for Staff Pipeline
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTier(t.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-mono transition cursor-pointer border ${
                activeTier === t.id
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] font-bold'
                  : 'border-white/10 bg-[#181512] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concept or invariant..."
            className="w-full rounded-xl border border-white/10 bg-[#181512] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConcepts.map((concept) => {
          const isConquered = concept.status === 'conquered';
          const isAvailable = concept.status === 'available';
          const isLocked = concept.status === 'locked';

          return (
            <div
              key={concept.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition relative overflow-hidden ${
                isConquered
                  ? 'border-white/10 bg-[#181512] hover:border-[#d4af37]/40'
                  : isAvailable
                  ? 'border-[#d4af37]/50 bg-[#181512] hover:border-[#d4af37] shadow-md'
                  : 'border-white/5 bg-[#12100e] opacity-60'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">
                    ID: {concept.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {concept.isBossFight && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        BOSS FIGHT (§6)
                      </span>
                    )}

                    {isConquered && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        CONQUERED
                      </span>
                    )}

                    {isAvailable && (
                      <span className="font-mono text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-2 py-0.5 rounded">
                        AVAILABLE
                      </span>
                    )}

                    {isLocked && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-serif-tattva text-base sm:text-lg text-white font-normal leading-snug">
                  {concept.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {concept.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                {isLocked ? (
                  <span className="text-[10px] text-slate-500">
                    Prereq: {concept.prerequisites?.join(', ')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (concept.targetSourceId && onOpenSourceInStudio) {
                        onOpenSourceInStudio(concept.targetSourceId);
                      } else {
                        onNavigateToHome?.();
                      }
                    }}
                    className={`font-bold transition cursor-pointer flex items-center gap-1 ${
                      isConquered
                        ? 'text-[#d4af37] hover:underline'
                        : 'text-[#d4af37] hover:underline'
                    }`}
                  >
                    <span>{isConquered ? 'Review Knowledge Tree →' : 'Enter Crucible →'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
