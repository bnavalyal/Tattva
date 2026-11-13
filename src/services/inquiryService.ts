import {
  InquiryGenerationRequest,
  InquiryGenerationResponse,
  LearningObjectiveId,
  LearningObjectiveMeta,
} from '../types/thinkforge';

/**
 * Clean backend / Sarvam integration configuration seam.
 * Teammates implementing backend / Sarvam services can set:
 *   VITE_API_BASE_URL=http://localhost:3001
 *   VITE_USE_MOCK_ENGINE=false
 * Zero secrets or API keys should ever be stored in frontend code.
 */
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001';
const FORCE_MOCK =
  (import.meta.env.VITE_USE_MOCK_ENGINE as string | undefined) !== 'false';

export const LEARNING_OBJECTIVES: LearningObjectiveMeta[] = [
  {
    id: 'first-principles',
    label: 'First-principles understanding',
    shortLabel: 'First Principles',
    description: 'Break mechanisms down to foundational truths, invariants, and causal steps.',
    accentColor: '#52796f',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
  },
  {
    id: 'deep-research',
    label: 'Deep research',
    shortLabel: 'Deep Research',
    description: 'Surface formal tradeoffs, edge cases, benchmarks, and primary literature.',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-700',
  },
  {
    id: 'topic-backstory',
    label: 'Topic backstory',
    shortLabel: 'Backstory',
    description: 'Trace why the idea was invented, who shaped it, and what problem it solved.',
    accentColor: '#d97706',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
  },
  {
    id: 'cross-topic',
    label: 'Cross-topic connections',
    shortLabel: 'Cross-Topic',
    description: 'Bridge concepts across disciplines—from computing and math to biology and design.',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
  },
  {
    id: 'exam-prep',
    label: 'Exam preparation',
    shortLabel: 'Exam Prep',
    description: 'Clarify core definitions, common pitfalls, worked examples, and testable checks.',
    accentColor: '#7c3aed',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    badgeText: 'text-violet-700',
  },
];

export function getObjectiveMeta(id: LearningObjectiveId): LearningObjectiveMeta {
  return LEARNING_OBJECTIVES.find((o) => o.id === id) ?? LEARNING_OBJECTIVES[0];
}

function makeNodeId(prefix = 'qnode'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function shortenTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 54) return cleaned;
  return `${cleaned.slice(0, 51)}…`;
}

function buildDomainSpecificMock(req: InquiryGenerationRequest): {
  title: string;
  explanation: string;
  takeaways: string[];
  references: string[];
  followUps: [string, string, string];
} | null {
  const q = req.question.toLowerCase();
  const t = req.inquiryTitle.toLowerCase();

  if (q.includes('zero-knowledge') || q.includes('zk') || t.includes('zero-knowledge')) {
    return {
      title: 'Proving Truth Without Revealing Secrets',
      explanation:
        'A Zero-Knowledge Proof (ZKP) lets a prover convince a verifier that a mathematical statement is true while leaking zero bits of the underlying witness. Instead of sending the secret itself, the prover commits to masked randomness, responds to an unpredictable verifier challenge (or Fiat-Shamir hash), and proves the algebraic equation could not hold consistently unless the prover knew the secret.',
      takeaways: [
        'Completeness guarantees an honest prover always convinces an honest verifier.',
        'Soundness makes cheating computationally negligible across random challenges.',
        'Zero-knowledge guarantees a simulator can produce indistinguishable transcripts without the secret.',
      ],
      references: [
        'Goldwasser, Micali & Rackoff (1985) — Interactive Proof Systems',
        'Schnorr Signature & Sigma-Protocol Foundations',
      ],
      followUps: [
        'How does reusing the same random nonce across two proofs accidentally leak the secret?',
        'How does the Fiat-Shamir heuristic convert an interactive conversation into a non-interactive proof?',
        'Where are ZKPs used in privacy-preserving identity and authentication systems today?',
      ],
    };
  }

  if (q.includes('attention') || q.includes('transformer') || t.includes('transformer')) {
    return {
      title: 'Why Self-Attention Replaced Sequential Recurrence',
      explanation:
        'Recurrent networks pass information step-by-step through a single hidden state bottleneck, making long-range dependencies fade and blocking parallel training. Transformer self-attention lets every token directly compare its Query vector against every other token’s Key vector in parallel, routing weighted Value representations according to contextual relevance rather than distance alone.',
      takeaways: [
        'Attention computes dynamic pairwise affinity weights across all sequence positions at once.',
        'Scaling dot products by 1/sqrt(d_k) keeps softmax gradients from saturating at high dimensions.',
        'Multi-head projections let the model attend simultaneously to syntax, coreference, and semantics.',
      ],
      references: [
        'Vaswani et al. (2017) — Attention Is All You Need',
        'Illustrated Transformer & Matrix Intuition Guide',
      ],
      followUps: [
        'Why does attention scale quadratically with context length, and how does FlashAttention optimize memory?',
        'Without recurrence or convolution, why do transformers need positional encodings?',
        'How does causal masking turn bidirectional self-attention into an autoregressive language generator?',
      ],
    };
  }

  if (q.includes('memory') || q.includes('rust') || q.includes('ownership') || t.includes('memory')) {
    return {
      title: 'Ownership Lifetimes & Eliminating Use-After-Free at Compile Time',
      explanation:
        'Manual memory management fails when two aliases can mutate or free the same heap allocation out of order, leading to use-after-free or data races. Garbage collectors solve this dynamically at runtime with tracing pauses, whereas affine ownership systems assign every value a single owner and verify aliasing/borrowing rules statically before the binary ever executes.',
      takeaways: [
        'Every heap value has a deterministic owner whose scope exit reclaims memory.',
        'Borrow rules allow either multiple shared immutable references or one exclusive mutable reference.',
        'Lifetime elision and compile-time checks prevent dangling pointers with zero garbage collection overhead.',
      ],
      references: [
        'Pierce — Types and Programming Languages (Linear & Affine Types)',
        'Rustonomicon — Ownership & Borrowing Invariants',
      ],
      followUps: [
        'How are arena allocators related to compile-time region lifetimes in systems languages?',
        'When do safe abstractions still need interior mutability or runtime reference counting?',
        'What security vulnerabilities disappear when buffer bounds and aliasing are checked automatically?',
      ],
    };
  }

  if (q.includes('unix') || q.includes('pipe') || t.includes('unix')) {
    return {
      title: 'Composability Through Uniform Byte Streams',
      explanation:
        'Douglas McIlroy designed Unix pipes around a radical idea: every small tool should read and write plain text streams through standard file descriptors instead of bespoke binary formats. By letting the OS kernel synchronize concurrent processes through a bounded ring buffer between stdout and stdin, tiny independent tools compose into powerful workflows without knowing about each other.',
      takeaways: [
        'Standard input/output decouples each program from upstream and downstream tools.',
        'The kernel pipe buffer enforces natural backpressure when a consumer reads slower than a producer.',
        'Composable pipelines directly inspired modern CLI chains, ETL streams, and agent tool orchestration.',
      ],
      references: [
        'Bell Labs Oral History — Invention of the Unix Pipe (1973)',
        'Ritchie & Thompson — The UNIX Time-Sharing System',
      ],
      followUps: [
        'What is the biggest limitation of unstructured text pipes compared to typed streams like PowerShell objects?',
        'How does kernel backpressure prevent memory exhaustion when streaming gigabytes through pipes?',
        'How do modern AI tool pipelines mirror the Unix philosophy of small composable capabilities?',
      ],
    };
  }

  if (q.includes('consensus') || q.includes('raft') || q.includes('paxos') || t.includes('consensus')) {
    return {
      title: 'Reaching Agreement Across Unreliable Networks',
      explanation:
        'In distributed systems, nodes crash and packets arrive late or out of order, yet clusters must agree on one authoritative sequence of state transitions. Protocols like Raft solve this by electing a single time-bounded leader via quorum majorities and requiring entries to replicate to a majority before committing—ensuring any overlapping majority intersects with at least one up-to-date node.',
      takeaways: [
        'Quorum intersection ensures two competing leaders cannot both commit conflicting values.',
        'Randomized election timeouts break split-vote ties cleanly without a central coordinator.',
        'Leader election separates normal log replication from failure recovery for clarity.',
      ],
      references: [
        'Ongaro & Ousterhout (2014) — In Search of an Understandable Consensus Algorithm',
        'Lamport — The Part-Time Parliament (Paxos)',
      ],
      followUps: [
        'Why does a 3-node cluster tolerate 1 crash while a 5-node cluster tolerates 2?',
        'What happens during a network partition when an isolated old leader still tries to serve reads?',
        'How does etcd or Kubernetes rely on Raft quorums for cluster state consistency?',
      ],
    };
  }

  return null;
}

function buildObjectiveExplanation(req: InquiryGenerationRequest): {
  title: string;
  explanation: string;
  takeaways: string[];
  references: string[];
  followUps: [string, string, string];
} {
  const domainMatch = buildDomainSpecificMock(req);
  if (domainMatch && !req.parentNodeId) {
    return domainMatch;
  }

  const objectiveLabel = getObjectiveMeta(req.objective).label;
  const cleanTopic = req.inquiryTitle || shortenTitle(req.question);

  const lensByObjective: Record<LearningObjectiveId, string> = {
    'first-principles':
      `Look beneath surface terminology in ${cleanTopic}: isolate the smallest atomic rules, inputs, and state transitions that must hold true regardless of implementation framework. For "${req.question}", cause flows directly from constraint boundaries—when those constraints shift, behavior changes predictably.`,
    'deep-research':
      `From a deep research perspective on ${cleanTopic}, the critical nuances appear at boundary conditions, asymptotic scaling limits, and competing design tradeoffs. Answering "${req.question}" reveals why practitioners balance latency, correctness guarantees, and structural simplicity rather than optimizing a single metric in isolation.`,
    'topic-backstory':
      `${cleanTopic} emerged because earlier approaches buckled under real-world growth and human cognitive limits. Tracing "${req.question}" back to its original problem statement clarifies why modern designs retain certain abstractions while discarding historical workarounds.`,
    'cross-topic':
      `${cleanTopic} mirrors recurring patterns across disciplines—feedback loops in control systems, modularity in biological signaling, and information encoding in human communication. Exploring "${req.question}" highlights structural analogies you can reuse when learning unfamiliar domains.`,
    'exam-prep':
      `For structured exam readiness on ${cleanTopic}, focus on crisp definitions, necessary-vs-sufficient conditions, and high-frequency edge cases. When tackling "${req.question}", distinguish what guarantees soundness from what only improves average performance.`,
  };

  const contextualContext = req.parentQuestion
    ? `Building directly off "${shortenTitle(req.parentQuestion)}", this next inquiry sharpens your mental model through the lens of ${objectiveLabel}.`
    : `Framing your inquiry through the "${objectiveLabel}" lens uncovers both the core mechanism and the deeper questions worth exploring next.`;

  return {
    title: domainMatch ? domainMatch.title : shortenTitle(req.question),
    explanation: `${domainMatch ? domainMatch.explanation : lensByObjective[req.objective]}\n\n${contextualContext}`,
    takeaways: domainMatch
      ? domainMatch.takeaways
      : [
          `Clarifies the primary driver behind "${shortenTitle(req.question)}".`,
          `Frames ${req.subject} concepts using the ${objectiveLabel} objective.`,
          'Opens three deeper investigative branches so curiosity guides what comes next.',
        ],
    references: domainMatch
      ? domainMatch.references
      : [
          `${req.subject} Core Foundations`,
          `ThinkForge Study Lens: ${objectiveLabel}`,
        ],
    followUps: domainMatch
      ? domainMatch.followUps
      : [
          `What core assumption behind "${shortenTitle(req.question)}" breaks under extreme scale or edge cases?`,
          `How does this principle in ${cleanTopic} connect to an everyday system from another field?`,
          `What concrete mini-example or experiment best tests whether I truly grasp ${cleanTopic}?`,
        ],
  };
}

/**
 * Frontend inquiry generation service.
 * Calls the teammate's Sarvam/Node API endpoint ONLY when VITE_USE_MOCK_ENGINE="false",
 * otherwise returns instant deterministic mock data with no backend or secrets needed.
 */
export async function generateInquiryResponse(
  req: InquiryGenerationRequest
): Promise<InquiryGenerationResponse> {
  if (!FORCE_MOCK) {
    try {
      const res = await fetch(`${API_BASE}/api/inquiries/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        return (await res.json()) as InquiryGenerationResponse;
      }
    } catch {
      // Gracefully fall back to local mock exploration engine
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 260));
  const generated = buildObjectiveExplanation(req);

  return {
    node_id: makeNodeId('node'),
    title: generated.title,
    explanation: generated.explanation,
    takeaways: generated.takeaways,
    references: generated.references,
    follow_ups: generated.followUps,
    credits_awarded: req.parentNodeId ? 15 : 25,
    provider: 'local-mock',
  };
}

/**
 * Clean frontend voice input seam for teammates connecting Sarvam Speech later.
 * Uses browser Web Speech API when available, or provides a helpful starter transcript in mock mode.
 */
export function startVoiceCapture(options: {
  fallbackText: string;
  onResult: (transcript: string) => void;
  onEnd: () => void;
}): () => void {
  const SpeechRecognitionCtor =
    (
      window as unknown as {
        SpeechRecognition?: new () => unknown;
        webkitSpeechRecognition?: new () => unknown;
      }
    ).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => unknown })
      .webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    const timer = window.setTimeout(() => {
      options.onResult(options.fallbackText);
      options.onEnd();
    }, 900);
    return () => window.clearTimeout(timer);
  }

  interface BrowserRecognition {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
    onerror: () => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  }

  const recognition = new SpeechRecognitionCtor() as BrowserRecognition;
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript?.trim();
    options.onResult(transcript || options.fallbackText);
  };
  recognition.onerror = () => {
    options.onResult(options.fallbackText);
    options.onEnd();
  };
  recognition.onend = () => options.onEnd();

  try {
    recognition.start();
  } catch {
    options.onResult(options.fallbackText);
    options.onEnd();
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      // Ignore stop errors if already ended
    }
  };
}
