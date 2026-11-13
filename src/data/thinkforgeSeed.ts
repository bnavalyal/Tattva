import type { Edge, Node } from '@xyflow/react';
import type {
  AchievementBadge,
  CommunityJourney,
  CuriosityTransaction,
  ExploreSubject,
  ExploreTopic,
  InquiryNodeData,
  InquirySession,
  LearningObjectiveId,
} from '../types/thinkforge';

export const OBJECTIVE_STARTER_PROMPTS: Record<
  LearningObjectiveId,
  Array<{ subject: string; question: string; label: string }>
> = {
  'first-principles': [
    {
      subject: 'Operating Systems',
      label: 'Memory arenas',
      question: 'Why do custom memory arenas outperform malloc/free in high-throughput systems?',
    },
    {
      subject: 'Artificial Intelligence',
      label: 'Attention scaling',
      question: 'Why did scaled dot-product attention replace recurrent layers in sequence modeling?',
    },
  ],
  'deep-research': [
    {
      subject: 'Cybersecurity',
      label: 'Zero-trust attestation',
      question: 'How does cryptographic workload attestation eliminate implicit network trust?',
    },
    {
      subject: 'Distributed Systems',
      label: 'Consensus safety',
      question: 'Under what network partitions do Raft and Paxos trade availability for safety?',
    },
  ],
  'topic-backstory': [
    {
      subject: 'Computer Science',
      label: 'Public-key revolution',
      question: 'What practical bottleneck led Diffie, Hellman, and Merkle to invent public-key exchange?',
    },
    {
      subject: 'Compiler Design',
      label: 'SSA form origin',
      question: 'Why was Static Single Assignment (SSA) invented for optimizing compilers in the 1980s?',
    },
  ],
  'cross-topic': [
    {
      subject: 'Bioinformatics & CS',
      label: 'Graphs in genomics',
      question: 'How do De Bruijn graphs connect assembly algorithms to string compression and networking?',
    },
    {
      subject: 'Physics & Computing',
      label: 'Thermodynamics of bits',
      question: 'How does Landauer’s principle connect information entropy to hardware energy dissipation?',
    },
  ],
  'exam-prep': [
    {
      subject: 'Computer Networks',
      label: 'TCP congestion control',
      question: 'Walk through AIMD, slow start, and fast recovery with concrete exam edge cases.',
    },
    {
      subject: 'Databases',
      label: 'MVCC & snapshots',
      question: 'How does Snapshot Isolation prevent dirty reads while still permitting write skew?',
    },
  ],
};

export const EXPLORE_SUBJECTS: ExploreSubject[] = [
  {
    id: 'subj-cs',
    name: 'Computer Science & Systems',
    tagline: 'OS internals, compilers, distributed consensus, and storage engines.',
    topicCount: 18,
    variant: 'indigo',
  },
  {
    id: 'subj-cyber',
    name: 'Cybersecurity & Cryptography',
    tagline: 'Threat modeling, zero-knowledge proofs, memory safety, and protocol defense.',
    topicCount: 14,
    variant: 'monograph',
  },
  {
    id: 'subj-ai',
    name: 'AI & Machine Intelligence',
    tagline: 'Transformers, representation learning, reasoning evaluation, and alignment.',
    topicCount: 16,
    variant: 'emerald',
  },
  {
    id: 'subj-interdisciplinary',
    name: 'Interdisciplinary Inquiry',
    tagline: 'Where information theory meets biology, economics, and history of ideas.',
    topicCount: 11,
    variant: 'amber',
  },
];

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    id: 'topic-transformers',
    subject: 'AI & Machine Intelligence',
    title: 'How Self-Attention Forms Conceptual Geometry',
    promptQuestion: 'Why does scaled dot-product self-attention capture long-range meaning better than RNNs?',
    defaultObjective: 'first-principles',
    summary:
      'Trace the math and intuition behind Q/K/V projections, vanishing gradients in recurrence, and parallel context routing.',
    estimatedDepth: '4-6 branches',
    variant: 'indigo',
  },
  {
    id: 'topic-zero-trust',
    subject: 'Cybersecurity & Cryptography',
    title: 'Zero-Knowledge Proofs Without Revealing Secrets',
    promptQuestion: 'How can a prover convince a verifier they know a secret without leaking a single bit of it?',
    defaultObjective: 'deep-research',
    summary:
      'Explore completeness, soundness, zero-knowledge simulators, and how SNARKs power verifiable privacy.',
    estimatedDepth: '5 branches',
    variant: 'monograph',
  },
  {
    id: 'topic-raft',
    subject: 'Computer Science & Systems',
    title: 'Raft Consensus & Split-Brain Prevention',
    promptQuestion: 'How do randomized election timeouts and term numbers stop split-brain clusters?',
    defaultObjective: 'first-principles',
    summary:
      'Follow leader election, log matching invariants, and committed entry safety during asymmetric partitions.',
    estimatedDepth: '4 branches',
    variant: 'journal',
  },
  {
    id: 'topic-tls-history',
    subject: 'Cybersecurity & Cryptography',
    title: 'From Diffie-Hellman to TLS 1.3',
    promptQuestion: 'What historical eavesdropping problems shaped forward secrecy in modern TLS 1.3?',
    defaultObjective: 'topic-backstory',
    summary:
      'Connect 1970s key distribution dilemmas to ephemeral ECDHE handshakes and 1-RTT latency guarantees.',
    estimatedDepth: '4 branches',
    variant: 'amber',
  },
  {
    id: 'topic-bplus-trees',
    subject: 'Computer Science & Systems',
    title: 'B+ Trees vs LSM-Trees in Modern Storage',
    promptQuestion: 'Why do read-heavy databases favor B+ trees while write-heavy telemetry stores use LSM-trees?',
    defaultObjective: 'exam-prep',
    summary:
      'Compare page splits, write amplification, Bloom filters, and compaction tradeoffs with interview checks.',
    estimatedDepth: '5 branches',
    variant: 'emerald',
  },
  {
    id: 'topic-entropy-bio',
    subject: 'Interdisciplinary Inquiry',
    title: 'Shannon Entropy Across Networks & Genetics',
    promptQuestion: 'How does the same entropy equation bound cellular signalling and fiber-optic channel capacity?',
    defaultObjective: 'cross-topic',
    summary:
      'Bridge noisy-channel coding theorems, genetic redundancy, and error-correcting biological codes.',
    estimatedDepth: '4 branches',
    variant: 'monograph',
  },
];

function makeEdge(source: string, target: string, label?: string): Edge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
    label,
    animated: false,
    style: { stroke: '#52796f', strokeWidth: 2 },
    labelStyle: { fontSize: 11, fontWeight: 600, fill: '#2f3e46' },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
  };
}

const rootAttentionNodes: Node<InquiryNodeData>[] = [
  {
    id: 'attn-root',
    type: 'inquiryNode',
    position: { x: 260, y: 20 },
    data: {
      nodeId: 'attn-root',
      parentId: null,
      kind: 'root',
      depth: 0,
      question: 'Why does scaled dot-product self-attention capture long-range meaning better than RNNs?',
      title: 'Direct Token-to-Token Routing',
      explanation:
        'In recurrent neural networks, distant tokens communicate only through O(n) sequential hidden-state hops, compressing early context into a fixed vector and attenuating gradients. Self-attention builds an all-to-all compatibility map in a single matrix step so every token attends directly to relevant context regardless of distance.',
      takeaways: [
        'Maximum path length between any two tokens drops from O(n) in RNNs to O(1) in self-attention.',
        'Dividing dot products by sqrt(d_k) keeps softmax logits out of saturated zero-gradient regions.',
        'Positional encodings restore word order once recurrence is removed.',
      ],
      references: [
        'Vaswani et al. (2017) — Attention Is All You Need',
        'Stanford CS224N Lecture Notes on Sequence Transformers',
      ],
      followUps: [
        'Why is dividing by sqrt(d_k) essential for stable softmax gradients?',
        'What is the quadratic memory bottleneck of self-attention on long documents?',
        'How do causal masks prevent future-token leakage during autoregressive training?',
      ],
      usedFollowUps: [0, 1],
      authorName: 'Ananya Rao',
      authorHandle: '@ananya_curiominds',
      creditsEarned: 25,
      createdAt: '2026-11-10T10:15:00Z',
    },
  },
  {
    id: 'attn-scale',
    type: 'inquiryNode',
    position: { x: 20, y: 390 },
    data: {
      nodeId: 'attn-scale',
      parentId: 'attn-root',
      kind: 'branch',
      depth: 1,
      question: 'Why is dividing by sqrt(d_k) essential for stable softmax gradients?',
      title: 'Controlling Variance of Dot Products',
      explanation:
        'When query and key components have zero mean and unit variance, their dot product sums d_k independent terms—so its variance grows linearly to d_k. For d_k = 64, raw logits frequently exceed +15 or -15, collapsing softmax into near one-hot peaks where gradients vanish.',
      takeaways: [
        'Scaling by 1 / sqrt(d_k) restores unit variance (Var = 1) regardless of head dimension.',
        'Healthy softmax entropy preserves informative gradients across multiple candidate keys.',
      ],
      references: ['Linear Algebra of Attention Scaling Derivations'],
      followUps: [
        'How does multi-head attention split d_model without hurting expressiveness?',
        'When does FlashAttention fuse scaling with tiled SRAM passes?',
        'How does temperature scaling in decoding mirror 1 / sqrt(d_k)?',
      ],
      usedFollowUps: [],
      authorName: 'Ananya Rao',
      authorHandle: '@ananya_curiominds',
      creditsEarned: 15,
      createdAt: '2026-11-10T10:21:00Z',
    },
  },
  {
    id: 'attn-quadratic',
    type: 'inquiryNode',
    position: { x: 500, y: 390 },
    data: {
      nodeId: 'attn-quadratic',
      parentId: 'attn-root',
      kind: 'branch',
      depth: 1,
      question: 'What is the quadratic memory bottleneck of self-attention on long documents?',
      title: 'The O(n²) Attention Matrix Wall',
      explanation:
        'Materializing the full n × n score matrix consumes memory that grows quadratically with sequence length n. Moving from 2k to 128k tokens increases raw attention matrix footprint by 4,096x, making naive HBM reads the primary runtime bottleneck.',
      takeaways: [
        'IO-aware tiling (FlashAttention) computes exact softmax online without writing the n × n matrix to HBM.',
        'Grouped-Query Attention (GQA) shrinks the inference KV cache across decoding steps.',
      ],
      references: ['Dao et al. — FlashAttention: Fast and Memory-Efficient Exact Attention'],
      followUps: [
        'How does online softmax compute exact normalization in a streaming loop?',
        'What are the accuracy tradeoffs of sliding-window sparse attention?',
        'Why does KV cache dominate autoregressive serving memory more than compute?',
      ],
      usedFollowUps: [],
      authorName: 'Ananya Rao',
      authorHandle: '@ananya_curiominds',
      creditsEarned: 15,
      createdAt: '2026-11-10T10:29:00Z',
    },
  },
];

const rootZeroTrustNodes: Node<InquiryNodeData>[] = [
  {
    id: 'zk-root',
    type: 'inquiryNode',
    position: { x: 260, y: 20 },
    data: {
      nodeId: 'zk-root',
      parentId: null,
      kind: 'root',
      depth: 0,
      question: 'How does cryptographic workload attestation eliminate implicit network trust?',
      title: 'Identity Bound to Execution State',
      explanation:
        'Perimeter firewalls equate IP addresses inside a VPC with trustworthiness. Cryptographic workload attestation reverses this: every service receives a short-lived X.509 or JWT identity minted only after hardware/runtime measurements (TPM quote or container digest) match an audited policy.',
      takeaways: [
        'Identity moves from mutable network location to signed cryptographic runtime claims.',
        'Short-lived mTLS certificates rotate automatically every few minutes to shrink blast radius.',
      ],
      references: ['SPIFFE / SPIRE Workload Identity Architecture', 'NIST SP 800-207 Zero Trust'],
      followUps: [
        'How does a SPIFFE Verifiable Identity Document (SVID) prevent SSRF credential theft?',
        'What happens when attestation servers experience a brief control-plane partition?',
        'How do mutual TLS session tickets interact with rapid certificate rotation?',
      ],
      usedFollowUps: [0],
      authorName: 'Ananya Rao',
      authorHandle: '@ananya_curiominds',
      creditsEarned: 25,
      createdAt: '2026-11-11T14:05:00Z',
    },
  },
  {
    id: 'zk-svid',
    type: 'inquiryNode',
    position: { x: 260, y: 390 },
    data: {
      nodeId: 'zk-svid',
      parentId: 'zk-root',
      kind: 'branch',
      depth: 1,
      question: 'How does a SPIFFE Verifiable Identity Document (SVID) prevent SSRF credential theft?',
      title: 'Node-Local Unix Socket Proof',
      explanation:
        'Instead of fetching static API keys over link-local HTTP metadata endpoints—which SSRF bugs frequently exploit—workloads talk to a local agent over a Unix domain socket. The kernel verifies process UID/cgroup claims directly, and mTLS handshakes require proof-of-possession of the private key.',
      takeaways: [
        'Captured bearer URLs cannot forge the kernel-verified cgroup/PID attestation check.',
        'Even if a response leaks, private keys stay bound inside mTLS proof-of-possession.',
      ],
      references: ['SPIFFE Workload API Specification'],
      followUps: [
        'How does Kubernetes CSI driver projection harden Unix socket mount boundaries?',
        'Compare JWT-SVID vs X.509-SVID replay risks across HTTP proxies.',
        'Can eBPF enforce SPIFFE identities directly inside Layer-7 service meshes?',
      ],
      usedFollowUps: [],
      authorName: 'Ananya Rao',
      authorHandle: '@ananya_curiominds',
      creditsEarned: 15,
      createdAt: '2026-11-11T14:16:00Z',
    },
  },
];

export const INITIAL_INQUIRIES: InquirySession[] = [
  {
    id: 'inq-attention',
    title: 'Self-Attention & Conceptual Routing',
    initialQuestion: 'Why does scaled dot-product self-attention capture long-range meaning better than RNNs?',
    subject: 'AI & Machine Intelligence',
    objective: 'first-principles',
    createdAt: '2026-11-10T10:15:00Z',
    updatedAt: '2026-11-10T10:29:00Z',
    authorName: 'Ananya Rao',
    authorHandle: '@ananya_curiominds',
    nodes: rootAttentionNodes,
    edges: [
      makeEdge('attn-root', 'attn-scale', 'Branch 01'),
      makeEdge('attn-root', 'attn-quadratic', 'Branch 02'),
    ],
  },
  {
    id: 'inq-zerotrust',
    title: 'Workload Attestation & Zero Trust',
    initialQuestion: 'How does cryptographic workload attestation eliminate implicit network trust?',
    subject: 'Cybersecurity & Cryptography',
    objective: 'deep-research',
    createdAt: '2026-11-11T14:05:00Z',
    updatedAt: '2026-11-11T14:16:00Z',
    authorName: 'Ananya Rao',
    authorHandle: '@ananya_curiominds',
    nodes: rootZeroTrustNodes,
    edges: [makeEdge('zk-root', 'zk-svid', 'Branch 01')],
  },
];

function buildCommunityNodesA(): { nodes: Node<InquiryNodeData>[]; edges: Edge[] } {
  const nodes: Node<InquiryNodeData>[] = [
    {
      id: 'comm-tls-root',
      type: 'inquiryNode',
      position: { x: 260, y: 20 },
      data: {
        nodeId: 'comm-tls-root',
        parentId: null,
        kind: 'root',
        depth: 0,
        question: 'Why did TLS 1.3 remove static RSA key exchange in favor of ephemeral ECDHE?',
        title: 'Achieving Mandatory Forward Secrecy',
        explanation:
          'Under static RSA key exchange, attackers could record encrypted traffic today and decrypt years of archives if a server private key leaked later. TLS 1.3 requires fresh ephemeral Diffie-Hellman parameters per session so past sessions stay unreadable even after long-term key compromise.',
        takeaways: [
          'Every handshake mixes fresh client and server ephemeral shares that are wiped right after.',
          'Removes legacy downgrade vectors like FREAK, Logjam, and ROBOT padding oracles.',
        ],
        references: ['RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3'],
        followUps: [
          'Why does 0-RTT early data reintroduce replay attack surfaces in TLS 1.3?',
          'How do hybrid post-quantum KEMs like X25519+ML-KEM fit into TLS 1.3 KeyShare?',
          'Why are ServerHello certificates encrypted in TLS 1.3?',
        ],
        usedFollowUps: [0, 1],
        authorName: 'Vikram Nair',
        authorHandle: '@vikram_sec',
        creditsEarned: 25,
        createdAt: '2026-11-08T09:10:00Z',
      },
    },
    {
      id: 'comm-tls-0rtt',
      type: 'inquiryNode',
      position: { x: 20, y: 390 },
      data: {
        nodeId: 'comm-tls-0rtt',
        parentId: 'comm-tls-root',
        kind: 'branch',
        depth: 1,
        question: 'Why does 0-RTT early data reintroduce replay attack surfaces in TLS 1.3?',
        title: 'Idempotency & Replay Windows in 0-RTT',
        explanation:
          'Because 0-RTT early data uses keys derived from an earlier resumption ticket before receiving fresh server randomness, an active network attacker can duplicate that first TCP flight toward edge load balancers.',
        takeaways: [
          'Only idempotent GET queries should ever accept 0-RTT without anti-replay strike registers.',
          'RFC 8446 warns servers never to execute state-mutating payments on 0-RTT packets.',
        ],
        references: ['RFC 8446 Section 8 — 0-RTT and Anti-Replay'],
        followUps: [
          'How do CDN edge POPs synchronize single-use ticket caches at low latency?',
          'Compare QUIC 0-RTT handling with TCP + TLS 1.3.',
          'Which HTTP status codes signal a client to safely retry rejected 0-RTT requests?',
        ],
        usedFollowUps: [],
        authorName: 'Vikram Nair',
        authorHandle: '@vikram_sec',
        creditsEarned: 15,
        createdAt: '2026-11-08T09:24:00Z',
      },
    },
    {
      id: 'comm-tls-pq',
      type: 'inquiryNode',
      position: { x: 500, y: 390 },
      data: {
        nodeId: 'comm-tls-pq',
        parentId: 'comm-tls-root',
        kind: 'peer',
        depth: 1,
        isPeerContribution: true,
        question: 'How do hybrid post-quantum KEMs like X25519+ML-KEM fit into TLS 1.3 KeyShare?',
        title: 'Store-Now-Decrypt-Later Defense',
        explanation:
          'Hybrid KeyShare concatenates a classical Curve25519 share with a lattice-based ML-KEM-768 encapsulation inside the initial ClientHello. Security holds as long as either primitive remains unbroken—blocking quantum harvest attacks without trusting brand-new math alone.',
        takeaways: [
          'ML-KEM adds ~1.1 KB to ClientHello while keeping round-trips at 1-RTT.',
          'Larger handshakes must respect initial TCP congestion windows to avoid extra stalls.',
        ],
        references: ['NIST FIPS 203 (ML-KEM)', 'IETF Hybrid Key Exchange in TLS 1.3'],
        followUps: [
          'Why do larger ClientHello sizes interact critically with TCP IW10?',
          'Does TLS 1.3 signature authentication also need ML-DSA migration urgently?',
          'How do enterprise middleboxes fail on larger TLS 1.3 extensions?',
        ],
        usedFollowUps: [],
        authorName: 'Meera Iyer',
        authorHandle: '@meera_crypto',
        creditsEarned: 35,
        createdAt: '2026-11-09T11:40:00Z',
      },
    },
  ];
  return {
    nodes,
    edges: [
      makeEdge('comm-tls-root', 'comm-tls-0rtt', 'Branch 01'),
      makeEdge('comm-tls-root', 'comm-tls-pq', 'Peer Branch'),
    ],
  };
}

function buildCommunityNodesB(): { nodes: Node<InquiryNodeData>[]; edges: Edge[] } {
  const nodes: Node<InquiryNodeData>[] = [
    {
      id: 'comm-raft-root',
      type: 'inquiryNode',
      position: { x: 260, y: 20 },
      data: {
        nodeId: 'comm-raft-root',
        parentId: null,
        kind: 'root',
        depth: 0,
        question: 'How does Raft guarantee only up-to-date followers can win leadership?',
        title: 'Election Restriction & Majority Quorums',
        explanation:
          'During RequestVote RPCs, a voter denies its vote if the candidate’s last log term is lower—or equal term with a shorter log. Combined with strict majority quorums, every newly elected leader is guaranteed to hold all previously committed entries.',
        takeaways: [
          'Two majorities in a cluster of N nodes always intersect in at least one node.',
          'Leader Completeness removes the need to stream old committed entries backwards after election.',
        ],
        references: ['Ongaro & Ousterhout (2014) — In Search of an Understandable Consensus Algorithm'],
        followUps: [
          'Why can’t a Raft leader immediately commit entries from a previous term by counting replicas?',
          'How does the PreVote phase protect healthy clusters from partitioned zombie nodes?',
          'Why does LeaseRead risk linearizability violations when OS clocks drift?',
        ],
        usedFollowUps: [0],
        authorName: 'Kabir Menon',
        authorHandle: '@kabir_systems',
        creditsEarned: 25,
        createdAt: '2026-11-07T16:12:00Z',
      },
    },
    {
      id: 'comm-raft-term',
      type: 'inquiryNode',
      position: { x: 260, y: 390 },
      data: {
        nodeId: 'comm-raft-term',
        parentId: 'comm-raft-root',
        kind: 'branch',
        depth: 1,
        question: 'Why can’t a Raft leader immediately commit entries from a previous term by counting replicas?',
        title: 'The Figure-8 Overwrite Subtlety',
        explanation:
          'Even if an entry from an older term exists on a majority of servers, a future leader with a higher-term entry at the same index could overwrite it. Raft therefore commits old-term entries indirectly by committing at least one new entry from its current term first.',
        takeaways: [
          'Indirect commit ties durability strictly to current-term quorum consensus.',
          'No-op heartbeat entries at leadership start unblock pending reads quickly.',
        ],
        references: ['Raft Paper Section 5.4.2 & Figure 8'],
        followUps: [
          'How does a ReadIndex barrier satisfy linearizable reads without disk fsync?',
          'What happens during dynamic joint-consensus cluster membership changes?',
          'Compare Raft log compaction via snapshots with Multi-Paxos gaps.',
        ],
        usedFollowUps: [],
        authorName: 'Kabir Menon',
        authorHandle: '@kabir_systems',
        creditsEarned: 15,
        createdAt: '2026-11-07T16:30:00Z',
      },
    },
  ];
  return {
    nodes,
    edges: [makeEdge('comm-raft-root', 'comm-raft-term', 'Branch 01')],
  };
}

function buildCommunityNodesC(): { nodes: Node<InquiryNodeData>[]; edges: Edge[] } {
  const nodes: Node<InquiryNodeData>[] = [
    {
      id: 'comm-bio-root',
      type: 'inquiryNode',
      position: { x: 260, y: 20 },
      data: {
        nodeId: 'comm-bio-root',
        parentId: null,
        kind: 'root',
        depth: 0,
        question: 'How do De Bruijn graphs bridge genome assembly and network switch routing?',
        title: 'Eulerian Paths Across Disparate Domains',
        explanation:
          'Rather than solving NP-hard Hamiltonian paths over individual overlaps, De Bruijn graphs treat k-mers as edges and (k-1)-mers as nodes so chromosome assembly reduces to a linear-time Eulerian walk. The exact same regular graph topology maximizes bisection bandwidth in low-latency switch interconnects.',
        takeaways: [
          'Transforming overlaps into Eulerian trails defeats quadratic read-comparison scaling.',
          'Bounded node degree and small diameter make De Bruijn topologies resilient to broken links.',
        ],
        references: ['Pevzner et al. (2001) — An Eulerian Path Approach to DNA Fragment Assembly'],
        followUps: [
          'How do sequencing errors create artificial "tips" and "bubbles" in assembly graphs?',
          'What makes Kautz graphs marginally denser than De Bruijn digraphs?',
          'How can probabilistic Bloom filters compress billion-k-mer graphs into RAM?',
        ],
        usedFollowUps: [],
        authorName: 'Drishti Patel',
        authorHandle: '@drishti_curiominds',
        creditsEarned: 25,
        createdAt: '2026-11-09T18:45:00Z',
      },
    },
  ];
  return {
    nodes,
    edges: [],
  };
}

const graphA = buildCommunityNodesA();
const graphB = buildCommunityNodesB();
const graphC = buildCommunityNodesC();

export const INITIAL_COMMUNITY_JOURNEYS: CommunityJourney[] = [
  {
    id: 'journey-tls13',
    title: 'Forward Secrecy & Post-Quantum TLS 1.3',
    initialQuestion: 'Why did TLS 1.3 remove static RSA key exchange in favor of ephemeral ECDHE?',
    subject: 'Cybersecurity & Cryptography',
    objective: 'deep-research',
    summary:
      'Traces how forward secrecy closed archival harvesting risks, with peer analysis on 0-RTT replay traps and hybrid ML-KEM.',
    authorName: 'Vikram Nair',
    authorHandle: '@vikram_sec',
    authorRole: 'Security Fellow',
    updatedAt: '2026-11-09T11:40:00Z',
    extensionsCount: 4,
    curiositySparks: 38,
    starredByUser: true,
    nodes: graphA.nodes,
    edges: graphA.edges,
    contributions: [
      {
        id: 'contrib-1',
        journeyId: 'journey-tls13',
        targetNodeId: 'comm-tls-root',
        targetNodeTitle: 'Achieving Mandatory Forward Secrecy',
        authorName: 'Meera Iyer',
        authorHandle: '@meera_crypto',
        question: 'How do hybrid post-quantum KEMs like X25519+ML-KEM fit into TLS 1.3 KeyShare?',
        explanation:
          'Added KeyShare hybridization details showing why classical + lattice combination defends against Store-Now-Decrypt-Later.',
        createdAt: '2026-11-09T11:40:00Z',
      },
    ],
  },
  {
    id: 'journey-raft',
    title: 'Why Raft Election Rules Eliminate Split-Brain',
    initialQuestion: 'How does Raft guarantee only up-to-date followers can win leadership?',
    subject: 'Computer Science & Systems',
    objective: 'first-principles',
    summary:
      'Breaks down quorum intersection invariants and the infamous Figure-8 indirect commit rule for distributed consensus.',
    authorName: 'Kabir Menon',
    authorHandle: '@kabir_systems',
    authorRole: 'Systems Learner',
    updatedAt: '2026-11-07T16:30:00Z',
    extensionsCount: 3,
    curiositySparks: 29,
    starredByUser: false,
    nodes: graphB.nodes,
    edges: graphB.edges,
    contributions: [],
  },
  {
    id: 'journey-debruijn',
    title: 'De Bruijn Graphs From DNA Assembly to Switch Fabrics',
    initialQuestion: 'How do De Bruijn graphs bridge genome assembly and network switch routing?',
    subject: 'Interdisciplinary Inquiry',
    objective: 'cross-topic',
    summary:
      'Connects Eulerian bioinformatics pipelines with classical interconnection topologies through shared graph invariants.',
    authorName: 'Drishti Patel',
    authorHandle: '@drishti_curiominds',
    authorRole: 'CurioMinds Researcher',
    updatedAt: '2026-11-09T18:45:00Z',
    extensionsCount: 2,
    curiositySparks: 24,
    starredByUser: false,
    nodes: graphC.nodes,
    edges: graphC.edges,
    contributions: [],
  },
];

export const INITIAL_CURIOSITY_TRANSACTIONS: CuriosityTransaction[] = [
  {
    id: 'tx-101',
    createdAt: '2026-11-10T10:15:00Z',
    inquiryId: 'inq-attention',
    inquiryTitle: 'Self-Attention & Conceptual Routing',
    subject: 'AI & Machine Intelligence',
    eventType: 'INQUIRY_CREATED',
    credits: 25,
    description: 'Started a First-Principles inquiry root on self-attention vs recurrence.',
  },
  {
    id: 'tx-102',
    createdAt: '2026-11-10T10:21:00Z',
    inquiryId: 'inq-attention',
    inquiryTitle: 'Self-Attention & Conceptual Routing',
    subject: 'AI & Machine Intelligence',
    eventType: 'FOLLOWUP_EXPLORED',
    credits: 15,
    description: 'Followed up on dot-product variance scaling (sqrt(d_k)).',
  },
  {
    id: 'tx-103',
    createdAt: '2026-11-10T10:29:00Z',
    inquiryId: 'inq-attention',
    inquiryTitle: 'Self-Attention & Conceptual Routing',
    subject: 'AI & Machine Intelligence',
    eventType: 'MILESTONE_UNLOCKED',
    credits: 20,
    description: 'Built multi-branch synthesis comparing O(n²) attention memory bottlenecks.',
  },
  {
    id: 'tx-104',
    createdAt: '2026-11-11T14:05:00Z',
    inquiryId: 'inq-zerotrust',
    inquiryTitle: 'Workload Attestation & Zero Trust',
    subject: 'Cybersecurity & Cryptography',
    eventType: 'INQUIRY_CREATED',
    credits: 25,
    description: 'Created a Deep Research graph on cryptographic workload attestation.',
  },
  {
    id: 'tx-105',
    createdAt: '2026-11-11T14:16:00Z',
    inquiryId: 'inq-zerotrust',
    inquiryTitle: 'Workload Attestation & Zero Trust',
    subject: 'Cybersecurity & Cryptography',
    eventType: 'FOLLOWUP_EXPLORED',
    credits: 15,
    description: 'Extended branch exploring SPIFFE SVIDs and SSRF credential isolation.',
  },
];

export function computeAchievementBadges(params: {
  totalInquiries: number;
  totalNodesExplored: number;
  peerContributionsCount: number;
  distinctObjectivesUsed: number;
  curiosityCredits: number;
}): AchievementBadge[] {
  const pct = (current: number, target: number) =>
    Math.min(100, Math.round((current / Math.max(1, target)) * 100));

  return [
    {
      id: 'badge-first-spark',
      title: 'Question Architect',
      description: 'Create 2 independent curiosity inquiries across subjects.',
      milestoneTarget: `${Math.min(params.totalInquiries, 2)} / 2 inquiries`,
      unlocked: params.totalInquiries >= 2,
      progressPct: pct(params.totalInquiries, 2),
      creditBonus: 25,
    },
    {
      id: 'badge-branch-mapper',
      title: 'Branch Explorer',
      description: 'Explore at least 6 connected question nodes across your graphs.',
      milestoneTarget: `${Math.min(params.totalNodesExplored, 6)} / 6 nodes`,
      unlocked: params.totalNodesExplored >= 6,
      progressPct: pct(params.totalNodesExplored, 6),
      creditBonus: 35,
    },
    {
      id: 'badge-lens-polymath',
      title: 'Multi-Lens Thinker',
      description: 'Use at least 3 different learning objectives (First-Principles, Backstory, Cross-Topic...).',
      milestoneTarget: `${Math.min(params.distinctObjectivesUsed, 3)} / 3 lenses`,
      unlocked: params.distinctObjectivesUsed >= 3,
      progressPct: pct(params.distinctObjectivesUsed, 3),
      creditBonus: 40,
    },
    {
      id: 'badge-peer-builder',
      title: 'Community Weaver',
      description: 'Extend a peer’s public inquiry branch with a new question or insight.',
      milestoneTarget: `${Math.min(params.peerContributionsCount, 1)} / 1 contribution`,
      unlocked: params.peerContributionsCount >= 1,
      progressPct: pct(params.peerContributionsCount, 1),
      creditBonus: 50,
    },
    {
      id: 'badge-curiosity-milestone',
      title: 'Centurion of Curiosity',
      description: 'Reach 150 Curiosity Credits through sustained inquiry and peer sharing.',
      milestoneTarget: `${Math.min(params.curiosityCredits, 150)} / 150 credits`,
      unlocked: params.curiosityCredits >= 150,
      progressPct: pct(params.curiosityCredits, 150),
      creditBonus: 60,
    },
  ];
}
