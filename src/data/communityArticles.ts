import type { CommunityArticle } from '../types/thinkforge';

export const INITIAL_COMMUNITY_ARTICLES: CommunityArticle[] = [
  {
    id: 'art-cyber-01',
    title: 'Forward Secrecy & Post-Quantum TLS 1.3: Retiring Static RSA Forever',
    subtitle: 'How ephemeral ECDHE and NIST ML-KEM lattice cryptography defend against Harvest-Now-Decrypt-Later attacks.',
    category: 'Cybersecurity',
    tags: ['TLS 1.3', 'Post-Quantum', 'ECDHE', 'ML-KEM', 'Forward Secrecy'],
    authorName: 'Vikram Nair',
    authorHandle: '@vikram_sec',
    authorRole: 'Security Researcher · Curiominds Lead',
    publishedAt: 'Nov 12, 2026',
    readTime: '6 min read',
    sparks: 48,
    starredByUser: true,
    commentsCount: 14,
    connectedGraphNodesCount: 5,
    highlights: [
      'Static RSA dropped in TLS 1.3 because stealing a server long-term private key allows retroactive decryption of decades of recorded network traffic.',
      'Ephemeral Diffie-Hellman (ECDHE) mandates ephemeral per-session key pairs that are securely wiped from RAM immediately after handshake completion.',
      'Harvest-Now-Decrypt-Later (HNDL) state-sponsored surveillance is actively mitigated by deploying hybrid X25519 + ML-KEM (Kyber) lattice key exchanges.',
      '0-RTT Early Data introduces anti-replay vulnerabilities requiring unique single-use tickets and server-side cache validation.'
    ],
    content: `## 1. The Death of Static RSA Key Exchange

For over two decades, SSL and early TLS versions relied predominantly on static RSA key transport. Under static RSA, the client generates a pre-master secret, encrypts it with the server's public RSA certificate, and sends it over the wire. The server decrypts it using its static private key.

### Why This Is An Architectural Catastrophe
If an adversary intercepts and archives encrypted ciphertexts today (a widespread practice known as **Harvest-Now-Decrypt-Later** or HNDL) and compromises the server's long-term private key 5 years later through a subpoena, memory leak (like Heartbleed), or exfiltration, **every single historical conversation is retroactively decrypted in plain text**.

In **TLS 1.3 (RFC 8446)**, the IETF took the non-negotiable architectural decision to completely remove static RSA key exchange. Every handshake is now strictly required to negotiate keys via ephemeral key exchange.

---

## 2. Ephemeral Diffie-Hellman (ECDHE) Mechanics

In **Ephemeral Elliptic-Curve Diffie-Hellman (ECDHE)**, neither Alice nor Bob uses a permanent key for symmetric secret generation:

1. **Client Ephemeral Key Generation:** Client generates random private scalar $d_c$ and public group point $Q_c = d_c \\cdot G$.
2. **Server Ephemeral Key Generation:** Server generates random private scalar $d_s$ and public group point $Q_s = d_s \\cdot G$.
3. **Point Multiplication:**
   - Client computes shared secret $Z = d_c \\cdot Q_s = d_c \\cdot (d_s \\cdot G)$
   - Server computes shared secret $Z = d_s \\cdot Q_c = d_s \\cdot (d_c \\cdot G)$
4. **Key Destruction:** Both $d_c$ and $d_s$ are wiped from memory (zeroized) immediately after deriving session keys.

\`\`\`
Client (Ephemeral: dc)                          Server (Ephemeral: ds)
      |                                                 |
      | -------- ClientHello (KeyShare: Qc) ---------> |
      |                                                 |
      | <------- ServerHello (KeyShare: Qs) ----------- |
      |                                                 |
      | [Shared Secret Z = dc * Qs]                     | [Shared Secret Z = ds * Qc]
      | [Zeroize dc]                                    | [Zeroize ds]
\`\`\`

Even if the server's long-term identity certificate is leaked tomorrow, an attacker cannot compute $Z$ without solving the **Elliptic Curve Discrete Logarithm Problem (ECDLP)** over the ephemeral points.

---

## 3. The Post-Quantum Horizon: Hybrid ML-KEM

With quantum computing advances (Shor's Algorithm factoring RSA integers and solving discrete logs in polynomial time), classical ECDH will become vulnerable. 

To future-proof modern infrastructure against retrospective quantum decryption, the industry has standardized **Hybrid Post-Quantum TLS**:
- **X25519MLKEM768:** Combines classical X25519 with **ML-KEM (formerly CRYSTALS-Kyber)**, standardized in **NIST FIPS 203**.
- A shared secret is derived from both schemes: $K = \\text{KDF}(K_{\\text{ECDHE}} \\parallel K_{\\text{ML-KEM}})$.
- An adversary must break **both** classical elliptic curves AND Module-Lattice problems to decrypt the communication.

---

## 4. Key Takeaways for Systems Architects
- Never allow fallback ciphersuites to static RSA in production TLS load balancers.
- Mandate TLS 1.3 across all internal microservice service-mesh fabrics (gRPC over mTLS).
- Audit 0-RTT early data configurations to prevent idempotency replay attacks on payment APIs.`
  },

  {
    id: 'art-aiml-01',
    title: 'Why FlashAttention-3 Slashes GPU Memory Bandwidth in Large Language Models',
    subtitle: 'From quadratic HBM IO bottlenecks to tiled SRAM online softmax matrix engines.',
    category: 'AIML',
    tags: ['FlashAttention', 'Transformers', 'GPU Architecture', 'SRAM Tiling', 'LLMs'],
    authorName: 'Dr. Rohan Kulkarni',
    authorHandle: '@rohan_ai',
    authorRole: 'Deep Learning Systems Architect',
    publishedAt: 'Nov 11, 2026',
    readTime: '7 min read',
    sparks: 62,
    starredByUser: false,
    commentsCount: 19,
    connectedGraphNodesCount: 8,
    highlights: [
      'Standard multi-head attention is IO-bound, not compute-bound: reading and writing the N x N attention matrix between GPU HBM and SRAM wastes up to 80% of execution time.',
      'FlashAttention computes exact attention without materializing intermediate N x N score matrices in HBM by using online softmax tiling.',
      'FlashAttention-3 leverages NVIDIA H100 Hopper Tensor Core FP8 asynchronous TMA (Tensor Memory Accelerator) pipelines.',
      'Context windows of 128k to 1M tokens become memory feasible with O(N) IO reads instead of quadratic O(N^2) memory footprint.'
    ],
    content: `## 1. The Attention Memory Bottleneck: Compute vs IO

In modern LLMs, calculating scaled dot-product attention follows:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

For a sequence length of $N = 32,768$ and head dimension $d = 128$:
- The matrix $QK^T$ has size $32,768 \\times 32,768 = 1.07 \\times 10^9$ elements.
- Storing this matrix in 16-bit precision requires **2 GB of High Bandwidth Memory (HBM) per head per layer**!
- Across 32 heads and 80 transformer layers, intermediate activation memory explodes into terabytes, causing Out-Of-Memory (OOM) crashes.

### The GPU Memory Hierarchy Reality
- **GPU SRAM (L1 Cache):** $\\approx 20\\text{ MB}$ per streaming multiprocessor, but operates at blistering speeds exceeding $19\\text{ TB/s}$.
- **GPU HBM (High Bandwidth Memory):** $80\\text{ GB}$, but runs at $\\approx 3.35\\text{ TB/s}$.

Standard attention spends nearly all its wall-clock time waiting on memory bus transfer delays rather than computing matrix multiplies.

---

## 2. The Algorithmic Breakthrough: Online Softmax Tiling

FlashAttention removes the need to write the $N \\times N$ matrix to HBM by computing softmax incrementally on sub-blocks loaded into fast SRAM:

### The Mathematical Invariant:
Softmax of vector $x$ requires finding $\\max(x)$ and calculating normalization factor $\\sum e^{x_i - m}$.
Given two blocks $x^{(1)}$ and $x^{(2)}$:
1. $m = \\max(m^{(1)}, m^{(2)})$
2. $l = e^{m^{(1)} - m} l^{(1)} + e^{m^{(2)} - m} l^{(2)}$
3. New output accumulator is scaled by $e^{m^{(1)} - m}$ and updated with the second block!

\`\`\`python
# Conceptual FlashAttention Tiling Loop
for j in range(0, N, Block_Size):
    # Load Kj, Vj from slow HBM into fast SRAM once
    K_block = HBM_load(K[j : j + Block_Size])
    V_block = HBM_load(V[j : j + Block_Size])
    
    for i in range(0, N, Block_Size):
        # Load Qi into SRAM
        Q_block = HBM_load(Q[i : i + Block_Size])
        # Compute local attention scores completely in SRAM
        S_tile = matmul(Q_block, K_block.T) / sqrt(d)
        # Update running max and softmax normalizer
        Output_tile = online_softmax_accumulate(S_tile, V_block)
        HBM_store(Output_tile)
\`\`\`

At no point is the full $N \\times N$ matrix ever written to slow HBM. The algorithm executes strictly in fast SRAM cache lines.

---

## 3. FlashAttention-3 on NVIDIA Hopper H100

FlashAttention-3 advances this further by targeting architectural features in NVIDIA H100 Hopper GPUs:
- **Asynchronous TMA (Tensor Memory Accelerator):** Hardware-directed DMA engine that transfers blocks between HBM and Shared Memory (SRAM) without wasting Tensor Core clock cycles.
- **Warp-Specialized Software Pipelining:** One group of warps focuses exclusively on memory staging, while compute warps execute continuous FP8 matrix multiplications without stalls.
- **FP8 Precision:** Halves memory pressure while preserving dynamic range using scaled group quantizers.

---

## 4. Architectural Summary
By shifting attention from a memory-bound algorithm to an SRAM compute-bound kernel, FlashAttention enables long-context models (Gemini 1.5, Claude 3.5, LLaMA 3.1) to scale to millions of tokens without quadratic memory crashes.`
  },

  {
    id: 'art-cs-01',
    title: 'Why Raft Consensus Election Rules Mathematically Eliminate Split-Brain',
    subtitle: 'Quorum intersections, randomized heartbeat jitter, and log matching invariants in distributed state machines.',
    category: 'Computer Science',
    tags: ['Distributed Systems', 'Raft', 'Consensus', 'Split-Brain', 'Fault Tolerance'],
    authorName: 'Aarav Patel',
    authorHandle: '@aarav_dist',
    authorRole: 'Infrastructure & Storage Engineer',
    publishedAt: 'Nov 9, 2026',
    readTime: '5 min read',
    sparks: 39,
    starredByUser: true,
    commentsCount: 8,
    connectedGraphNodesCount: 6,
    highlights: [
      'Split-Brain occurs when a network partition allows two isolated partitions to simultaneously elect leaders that accept conflicting state mutations.',
      'Raft requires a strict majority quorum (N/2 + 1) for election; two majority quorums must overlap by at least one node according to the Pigeonhole Principle.',
      'Randomized election timeouts (150ms - 300ms) break election synchronization deadlocks where split votes prevent leader emergence.',
      'The Leader Completeness Invariant ensures that any committed log entry is guaranteed to be present in all future elected leaders.'
    ],
    content: `## 1. The Anatomy of Distributed Split-Brain

In distributed systems (like Kubernetes etcd, CockroachDB, or TiKV), servers replicate a state machine across independent hardware nodes to survive machine failure.

A catastrophic failure mode is **Split-Brain**:
- Suppose a 5-node cluster is partitioned into two subnets: $\\{N_1, N_2\\}$ and $\\{N_3, N_4, N_5\\}$.
- If both partitions elect a leader, each begins committing client write transactions independently.
- When the network partition heals, the databases have diverged irrecoverably.

---

## 2. The Quorum Overlap Proof (Pigeonhole Principle)

Raft guarantees that at most **one leader can be elected per term** through the strict majority quorum rule:

$$\\text{Quorum Size} = \\left\\lfloor \\frac{N}{2} \\right\\rfloor + 1$$

In an $N = 5$ cluster, any leader must receive affirmative votes from at least $3$ nodes.

### Mathematical Proof of Mutual Exclusion:
- Let $Q_1$ be the set of nodes that voted for Candidate $A$ in Term $T$.
- Let $Q_2$ be the set of nodes that voted for Candidate $B$ in Term $T$.
- Size of $Q_1 \\ge 3$, Size of $Q_2 \\ge 3$.
- Total nodes $|Q_1 \\cup Q_2| = |Q_1| + |Q_2| - |Q_1 \\cap Q_2| \\le 5$.
- Therefore:
$$|Q_1 \\cap Q_2| = |Q_1| + |Q_2| - |Q_1 \\cup Q_2| \\ge 3 + 3 - 5 = 1$$

There must exist at least one node $V \\in (Q_1 \\cap Q_2)$ that is present in both quorums.
Since Raft specifies: **"Each node can vote for at most one candidate per term on a first-come-first-served basis"**, node $V$ cannot vote for both $A$ and $B$.
Therefore, it is mathematically impossible for two candidates to receive a majority of votes in the same term.

---

## 3. Resolving Split Votes with Randomized Heartbeats

When multiple candidates campaign at the exact same moment, votes can split evenly ($2-2-1$), causing election timeouts to expire repeatedly.

Raft solves this with **Randomized Election Timeouts**:
- Each node chooses a random timeout uniformly distributed between $[150\\text{ms}, 300\\text{ms}]$.
- One node inevitably times out first, increments the term counter, sends \`RequestVote\` RPCs, and collects majority quorum votes before competing candidates even wake up!

\`\`\`
Node 1: [--- 180ms ---] -> TIMES OUT -> Sends RequestVote -> BECOMES LEADER
Node 2: [------- 240ms -------] -> Receives heartbeat from Node 1 -> Steps down
Node 3: [--------- 290ms ---------] -> Receives heartbeat from Node 1 -> Steps down
\`\`\`

---

## 4. Leader Completeness & Log Overwrite Safety
Raft guarantees that a candidate will **only** receive a vote if its log is at least as up-to-date as the voter's log (comparing \`lastLogTerm\`, then \`lastLogIndex\`).
This ensures that uncommitted writes in a minority partition are safely truncated when the true leader re-establishes connectivity.`
  },

  {
    id: 'art-aids-01',
    title: 'Covariate Shift & Concept Drift in Production ML Pipelines',
    subtitle: 'Why static model accuracy degrades over time and how Population Stability Index (PSI) detects data distribution collapse.',
    category: 'AIDS',
    tags: ['MLOps', 'Concept Drift', 'PSI', 'Covariate Shift', 'Model Monitoring'],
    authorName: 'Sneha Sundaram',
    authorHandle: '@sneha_ds',
    authorRole: 'Lead MLOps Engineer · FinTech AI',
    publishedAt: 'Nov 8, 2026',
    readTime: '6 min read',
    sparks: 51,
    starredByUser: false,
    commentsCount: 11,
    connectedGraphNodesCount: 5,
    highlights: [
      'Covariate Shift occurs when the feature distribution P(X) changes over time while the conditional probability P(Y|X) remains static.',
      'Concept Drift occurs when the true relationship between input features and target labels P(Y|X) fundamentally alters due to external real-world shifts.',
      'Population Stability Index (PSI) computes symmetric Kullback-Leibler divergence between baseline training bins and production inference distributions.',
      'A PSI value > 0.2 signals significant distributional drift, automatically triggering model retraining pipelines.'
    ],
    content: `## 1. Why Machine Learning Models Silently Decay in Production

In academic benchmarks, datasets are partitioned into static train, validation, and test splits drawn from identical, independent distributions ($i.i.d.$).

In production systems, real-world data is non-stationary:
- Inflation changes consumer spending distributions.
- New fraud attack vectors shift network packet payload patterns.
- Regulatory changes alter credit scoring criteria.

Without automated statistical monitoring, a model with $98\\%$ validation accuracy can decay to near-random performance without throwing a single software exception.

---

## 2. Covariate Shift vs Concept Drift

| Dimension | Covariate Shift | Concept Drift |
| :--- | :--- | :--- |
| **Probability Equation** | $P_{\\text{prod}}(X) \\neq P_{\\text{train}}(X)$, while $P(Y \\mid X)$ is invariant | $P_{\\text{prod}}(Y \\mid X) \\neq P_{\\text{train}}(Y \\mid X)$ |
| **Real-World Example** | Younger demographic begins using the app ($X$ shifts), but their risk per income tier remains unchanged. | Global pandemic changes consumer behavior: previously reliable flight bookings become cancellations. |
| **Detection Method** | Real-time feature monitoring without waiting for delayed labels. | Requires ground-truth label ingestion to measure classification metric drops. |

---

## 3. Detecting Drift via Population Stability Index (PSI)

The **Population Stability Index (PSI)** is the industry standard for measuring distributional shift in categorical and continuous numerical features:

$$\\text{PSI} = \\sum_{i=1}^{k} \\left( P_i - Q_i \\right) \\times \\ln\\left( \\frac{P_i}{Q_i} \\right)$$

Where:
- $k$: Number of bins (typically 10 deciles).
- $P_i$: Percentage of production samples in bin $i$.
- $Q_i$: Percentage of baseline reference samples in bin $i$.

\`\`\`python
import numpy as np

def calculate_psi(expected, actual, num_buckets=10):
    # Determine quantile bins on expected training distribution
    percentiles = np.linspace(0, 100, num_buckets + 1)
    bins = np.percentile(expected, percentiles)
    bins[0] = -np.inf
    bins[-1] = np.inf
    
    # Calculate counts in each bucket
    expected_counts, _ = np.histogram(expected, bins=bins)
    actual_counts, _ = np.histogram(actual, bins=bins)
    
    # Convert to fractions with Laplace smoothing
    P = (actual_counts + 1e-4) / len(actual)
    Q = (expected_counts + 1e-4) / len(expected)
    
    psi_value = np.sum((P - Q) * np.log(P / Q))
    return psi_value
\`\`\`

### Interpretation Thresholds:
- **$\\text{PSI} < 0.10$:** Negligible shift; model continues serving production traffic.
- **$0.10 \\le \\text{PSI} \\le 0.20$:** Moderate shift; flag for engineering review.
- **$\\text{PSI} > 0.20$:** Significant distribution shift; trigger automated retraining or fallback to rule-based safety systems.`
  }
];
