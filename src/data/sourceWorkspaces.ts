import type { StudySource } from '../types/thinkforge';

export const INITIAL_STUDY_SOURCES: StudySource[] = [
  {
    id: 'source-transformers',
    title: 'Transformers & Self-Attention Architecture',
    category: 'AIML',
    sourceType: 'youtube',
    sourceTypeLabel: 'YouTube Masterclass + Paper',
    thumbnail: '/thumbnails/thumb_aiml_03.jpg',
    youtubeId: 'eMlx5fFNoYc',
    duration: '32:50',
    views: '2.1M views',
    channelName: 'takeUforward · Engineering AI',
    masteryScore: 84,
    masteryLevel: 'Advanced',
    lastStudied: 'Today, 10:15 AM',
    summary:
      'Complete first-principles breakdown of Query, Key, and Value projections, scaled dot-product matrix multiplication, and multi-head attention.',
    quizzes: [
      {
        id: 'quiz-tf-01',
        question: 'Why is the dot product of Query and Key scaled by 1 / sqrt(d_k) before applying Softmax?',
        options: [
          'To reduce floating-point hardware operations by 50%',
          'To prevent dot products from growing excessively large in high dimensions, which pushes softmax into vanishing gradient regions',
          'To enforce orthogonal unit vectors across attention heads',
          'To guarantee the attention matrix is strictly symmetric'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: 1,
        isAnsweredCorrectly: true,
        explanation:
          'When d_k is large, the variance of the dot product sum equals d_k. Scaling by 1/sqrt(d_k) normalizes variance back to 1.0, keeping softmax gradients steep and stable.',
        relatedConceptNodeId: 'node-softmax-scaling'
      },
      {
        id: 'quiz-tf-02',
        question: 'What is the theoretical space and time complexity of standard self-attention over sequence length N?',
        options: [
          'O(N) linear complexity',
          'O(N log N) quasilinear complexity',
          'O(N^2) quadratic space and time complexity',
          'O(N^3) cubic tensor complexity'
        ],
        correctOptionIndex: 2,
        userSelectedIndex: 2,
        isAnsweredCorrectly: true,
        explanation:
          'The attention score matrix Q * K^T requires computing pairwise affinities between all N tokens, producing an N x N matrix that consumes O(N^2) memory and FLOPs.',
        relatedConceptNodeId: 'node-quadratic-complexity'
      },
      {
        id: 'quiz-tf-03',
        question: 'How does FlashAttention avoid the quadratic memory bottleneck on GPU High Bandwidth Memory (HBM)?',
        options: [
          'By pruning 90% of token pairs using nearest neighbor clustering',
          'By tiling Query, Key, and Value blocks into SRAM and computing online softmax without materializing the full N x N matrix in HBM',
          'By converting all 32-bit floats into 1-bit binary representations',
          'By running attention exclusively on CPU cache lines'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: 1,
        isAnsweredCorrectly: true,
        explanation:
          'FlashAttention uses GPU SRAM tiling with an online softmax recomputation technique, reducing memory reads and writes from quadratic O(N^2) to sub-quadratic IO operations.',
        relatedConceptNodeId: 'node-flash-attention'
      },
      {
        id: 'quiz-tf-04',
        question: 'Why are Positional Encodings strictly necessary in Transformer architectures?',
        options: [
          'Because self-attention is permutation-equivariant and inherently possesses zero sense of token sequence order',
          'Because matrix multiplication requires input vectors of ascending numerical values',
          'Because Adam optimization cannot converge without position-dependent bias terms',
          'To prevent token embeddings from overflowing 16-bit precision'
        ],
        correctOptionIndex: 0,
        userSelectedIndex: null,
        isAnsweredCorrectly: false,
        explanation:
          'Unlike RNNs that process tokens sequentially step-by-step, attention treats all tokens in parallel as an unordered set. Adding positional encodings injects relative or absolute token positions.',
        relatedConceptNodeId: 'node-positional-encoding'
      }
    ],
    notes: [
      {
        id: 'note-tf-01',
        title: 'Attention Formula & Dimension Mechanics',
        category: 'Key Formulas',
        content: `**Scaled Dot-Product Attention Equation:**
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

- **Q (Queries)**: Matrix of dimensions $(N, d_k)$
- **K (Keys)**: Matrix of dimensions $(N, d_k)$
- **V (Values)**: Matrix of dimensions $(N, d_v)$
- **$QK^T$**: Matrix of pairwise affinities of size $(N, N)$
- **Softmax**: Applied row-wise so each row sums to $1.0$, producing a probability distribution over input tokens.`,
        updatedAt: '2 hours ago'
      },
      {
        id: 'note-tf-02',
        title: 'Multi-Head Attention vs Single Head',
        category: 'Core Mechanics',
        content: `- Instead of performing a single attention function with $d_{\\text{model}}$-dimensional queries, keys, and values, we linearly project the queries, keys, and values $h$ times with learned projections.
- Each head can focus on different positional or semantic subspaces (e.g. head 1 tracks syntactic dependencies, head 2 tracks pronoun reference).
- Heads are concatenated and projected:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O$$`,
        updatedAt: 'Yesterday'
      },
      {
        id: 'note-tf-03',
        title: 'Crucial Interview Pitfall: Softmax Vanishing Gradient',
        category: 'Common Pitfalls',
        content: `**Why scale by $\\sqrt{d_k}$?**
Assume $q$ and $k$ are independent random variables with mean $0$ and variance $1$.
Their dot product:
$$q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$$
Has mean $0$ and variance $d_k$.
If $d_k = 64$, standard deviation is $8$. If $d_k = 512$, standard deviation is $\\approx 22.6$.
Large values in the vector push softmax outputs into regions where gradients are near $0$ (vanishing gradient during backprop). Dividing by $\\sqrt{d_k}$ pulls variance back to $1.0$!`,
        updatedAt: '3 days ago'
      }
    ],
    researchPaper: {
      title: 'Attention Is All You Need',
      authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
      conference: 'NeurIPS 2017 (31st Conference on Neural Information Processing Systems)',
      year: 2017,
      arxivUrl: 'https://arxiv.org/abs/1706.03762',
      doiUrl: 'https://doi.org/10.48550/arXiv.1706.03762',
      abstract:
        'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
      keyContributions: [
        'Complete removal of recurrence (RNN/LSTM) and convolution, enabling full matrix parallelization on GPUs.',
        'Scaled dot-product attention formulation paired with multi-head attention mechanisms.',
        'Introduction of sinusoidal positional encodings to supply sequence order without recurrence.',
        'Empirical SOTA on WMT 2014 English-to-German (28.4 BLEU) with over 3x training speedup.'
      ],
      methodologicalBreakdown:
        'The Transformer architecture replaces sequential hidden state recurrence with multi-head self-attention, layer normalization (Pre-LN/Post-LN), and point-wise feed-forward networks, reducing sequential operation depth from O(N) to O(1).'
    },
    knowledgeGraph: {
      rootNodeId: 'node-root-attention',
      nodes: [
        {
          id: 'node-root-attention',
          label: 'Scaled Dot-Product Attention',
          category: 'Core Architecture',
          depth: 0,
          tier: 'macro',
          status: 'mastered',
          importance: 'critical',
          shortLine: 'Computes pairwise token similarities via dot-products',
          summary: 'The primary mathematical engine computing pairwise similarity weights across sequence representations.',
          keyFormula: 'Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V',
          failureMode: 'Without attention, models cannot capture context-dependent token relationships across variable sequence lengths.',
          prerequisites: ['Matrix Multiplication', 'Vector Embeddings'],
          successors: ['Q, K, V Linear Projections', 'Softmax Variance Scaling'],
          x: 320,
          y: 40
        },
        {
          id: 'node-qkv-projection',
          label: 'Q, K, V Linear Projections',
          category: 'Projections',
          depth: 1,
          tier: 'macro',
          status: 'mastered',
          importance: 'foundational',
          shortLine: 'Maps token embeddings into specialized query, key, value spaces',
          summary: 'Linear weights W_Q, W_K, W_V map input token embeddings into specialized query, key, and value vectors.',
          keyFormula: 'Q = X * W_Q, K = X * W_K, V = X * W_V',
          failureMode: 'Without distinct projection matrices, queries and keys collapse into symmetric self-affinity, losing directional context.',
          prerequisites: ['Scaled Dot-Product Attention'],
          successors: ['Sinusoidal Positional Encoding'],
          x: 120,
          y: 160
        },
        {
          id: 'node-softmax-scaling',
          label: 'Softmax Variance Scaling (1/√d_k)',
          category: 'Mathematical Stability',
          depth: 1,
          tier: 'macro',
          status: 'mastered',
          importance: 'critical',
          shortLine: 'Scales dot products by 1/√d_k to prevent vanishing gradients',
          summary: 'Prevents large dot-product variance from saturating softmax gradients in high dimensional embedding spaces.',
          keyFormula: 'Var(q * k) = d_k => Normalizer = 1/sqrt(d_k)',
          failureMode: 'Large dot products push softmax into saturated exponential regions with near-zero gradients, stalling backpropagation.',
          prerequisites: ['Scaled Dot-Product Attention'],
          successors: ['O(N^2) Quadratic Memory Bottleneck'],
          x: 320,
          y: 160
        },
        {
          id: 'node-multihead',
          label: 'Multi-Head Attention Splitting',
          category: 'Representation',
          depth: 1,
          tier: 'macro',
          status: 'mastered',
          importance: 'foundational',
          shortLine: 'Attends to multiple representation subspaces simultaneously',
          summary: 'Permits model to jointly attend to information from different representation subspaces at different positions.',
          keyFormula: 'MultiHead = Concat(head_1, ..., head_h) * W_O',
          failureMode: 'Single-head attention averages across disparate semantic relationships, suppressing nuanced grammatical or factual linkages.',
          prerequisites: ['Scaled Dot-Product Attention'],
          successors: ['Causal Autoregressive Masking'],
          x: 520,
          y: 160
        },
        {
          id: 'node-positional-encoding',
          label: 'Sinusoidal Positional Encoding',
          category: 'Order Invariance',
          depth: 2,
          tier: 'standard',
          status: 'in_progress',
          importance: 'foundational',
          shortLine: 'Injects sequence order into permutation-invariant attention',
          summary: 'Since attention is permutation-invariant, positional trigonometric functions are added to token embeddings.',
          keyFormula: 'PE(pos, 2i) = sin(pos / 10000^(2i/d_model))',
          failureMode: 'Without positional encodings, "dog bites man" and "man bites dog" yield identical representations.',
          prerequisites: ['Q, K, V Linear Projections'],
          successors: ['Rotary Position Embeddings (RoPE)'],
          x: 70,
          y: 280
        },
        {
          id: 'node-quadratic-complexity',
          label: 'O(N²) Quadratic Memory Bottleneck',
          category: 'Complexity Analysis',
          depth: 2,
          tier: 'standard',
          status: 'mastered',
          importance: 'critical',
          shortLine: 'O(N²) pairwise matrix causes memory explosion on long sequences',
          summary: 'Materializing the N x N pairwise matrix creates quadratic space and compute constraints for long contexts.',
          keyFormula: 'Space = O(N^2 * h), Time = O(N^2 * d)',
          failureMode: 'O(N²) space exceeds GPU High Bandwidth Memory (HBM) beyond 4k–8k sequence lengths.',
          prerequisites: ['Softmax Variance Scaling (1/√d_k)'],
          successors: ['FlashAttention IO Tiling'],
          x: 270,
          y: 280
        },
        {
          id: 'node-flash-attention',
          label: 'FlashAttention IO Tiling',
          category: 'Hardware Acceleration',
          depth: 2,
          tier: 'standard',
          status: 'mastered',
          importance: 'advanced',
          shortLine: 'GPU SRAM tiling computes online softmax without N×N HBM IO',
          summary: 'Fuses softmax and matrix multiplication into GPU SRAM blocks using online softmax update equations.',
          keyFormula: 'm_new = max(m_prev, row_max), l_new = l_prev * exp(m_prev - m_new) + exp(row - m_new)',
          failureMode: 'Standard attention repeatedly moves N×N tensors between slow HBM and compute cores, causing severe memory bandwidth stalls.',
          prerequisites: ['O(N²) Quadratic Memory Bottleneck'],
          successors: ['Online Softmax Running Stats', 'GPU On-Chip SRAM Tiling'],
          x: 450,
          y: 280
        },
        {
          id: 'node-causal-masking',
          label: 'Causal Autoregressive Masking',
          category: 'Generative Decoding',
          depth: 2,
          tier: 'standard',
          status: 'unexplored',
          importance: 'critical',
          shortLine: 'Triangular masking prevents autoregressive future token leakage',
          summary: 'Upper triangular masking with -infinity ensures generated tokens cannot peek at future tokens.',
          keyFormula: 'Mask[i, j] = -inf if j > i else 0',
          failureMode: 'Without -infinity causal mask, generative models peek at future tokens during training, collapsing autoregressive inference.',
          prerequisites: ['Multi-Head Attention Splitting'],
          successors: [],
          x: 620,
          y: 280
        },
        // MICRO NODES (Deep Invariant Sub-Graph)
        {
          id: 'node-online-softmax',
          label: 'Online Softmax Running Stats',
          category: 'Hardware Acceleration',
          depth: 3,
          tier: 'micro',
          clusterId: 'cluster-hardware',
          status: 'mastered',
          importance: 'advanced',
          shortLine: 'Running max & sum computes softmax row-wise in single pass',
          summary: 'Maintains running local maximum (m) and accumulated normalization sum (l) across tiles to compute exact softmax without full rows in memory.',
          keyFormula: 'm_new = max(m_old, x), l_new = l_old * e^(m_old - m_new) + e^(x - m_new)',
          failureMode: 'Without online running stats, 2-pass softmax requires loading all intermediate attention weights back into HBM.',
          prerequisites: ['FlashAttention IO Tiling'],
          x: 370,
          y: 400
        },
        {
          id: 'node-sram-tiling',
          label: 'GPU On-Chip SRAM Tiling',
          category: 'Hardware Acceleration',
          depth: 3,
          tier: 'micro',
          clusterId: 'cluster-hardware',
          status: 'mastered',
          importance: 'advanced',
          shortLine: 'Tiles Q, K, V blocks into fast 20TB/s GPU on-chip SRAM',
          summary: 'Splits Q and K into blocks that fit within the 192KB per SM shared memory, achieving 5x-10x speedup over standard attention.',
          keyFormula: 'SRAM Bandwidth: ~19 TB/s vs HBM Bandwidth: ~2 TB/s',
          failureMode: 'Un-tiled attention suffers from low arithmetic intensity (compute bound by DRAM IO latency).',
          prerequisites: ['FlashAttention IO Tiling'],
          x: 520,
          y: 400
        },
        {
          id: 'node-rope-encoding',
          label: 'Rotary Position Embeddings (RoPE)',
          category: 'Order Invariance',
          depth: 3,
          tier: 'micro',
          clusterId: 'cluster-order',
          status: 'in_progress',
          importance: 'advanced',
          shortLine: 'Rotates Query & Key vectors in 2D slices by position angle',
          summary: 'Encodes relative position by multiplying complex coordinates of Query and Key vectors by orthogonal rotation matrices R_theta,m.',
          keyFormula: '⟨R_m q, R_n k⟩ = g(q, k, m - n)',
          failureMode: 'Absolute positional encodings cannot generalize to sequence lengths beyond the training distribution without decay.',
          prerequisites: ['Sinusoidal Positional Encoding'],
          x: 70,
          y: 400
        },
        {
          id: 'node-gradient-variance',
          label: 'Variance Conservation Proof',
          category: 'Mathematical Stability',
          depth: 3,
          tier: 'micro',
          clusterId: 'cluster-math',
          status: 'mastered',
          importance: 'foundational',
          shortLine: 'Var(∑ q_i * k_i) = d_k under zero-mean components',
          summary: 'Strict statistical proof showing why dividing by √d_k standardizes variance to 1.0, preserving gradient flow.',
          keyFormula: 'E[q·k] = 0, Var(∑ q_i k_i) = ∑ Var(q_i)Var(k_i) = d_k',
          failureMode: 'In dimensions d_k = 128, dot products reach magnitudes > 35, where softmax derivatives underflow 32-bit floats.',
          prerequisites: ['Softmax Variance Scaling (1/√d_k)'],
          x: 220,
          y: 400
        }
      ],
      edges: [
        { id: 'e-root-qkv', source: 'node-root-attention', target: 'node-qkv-projection', tier: 'macro', strength: 'critical' },
        { id: 'e-root-scale', source: 'node-root-attention', target: 'node-softmax-scaling', tier: 'macro', strength: 'critical' },
        { id: 'e-root-head', source: 'node-root-attention', target: 'node-multihead', tier: 'macro', strength: 'critical' },
        { id: 'e-qkv-pos', source: 'node-qkv-projection', target: 'node-positional-encoding', tier: 'standard', strength: 'strong' },
        { id: 'e-scale-quad', source: 'node-softmax-scaling', target: 'node-quadratic-complexity', tier: 'standard', strength: 'critical' },
        { id: 'e-quad-flash', source: 'node-quadratic-complexity', target: 'node-flash-attention', tier: 'standard', strength: 'critical' },
        { id: 'e-head-mask', source: 'node-multihead', target: 'node-causal-masking', tier: 'standard', strength: 'strong' },
        // DENSE SUB-GRAPH EDGES & CROSS-LINKS (Reveals strong interconnectivity on deep zoom)
        { id: 'e-flash-online', source: 'node-flash-attention', target: 'node-online-softmax', tier: 'micro', strength: 'critical' },
        { id: 'e-flash-sram', source: 'node-flash-attention', target: 'node-sram-tiling', tier: 'micro', strength: 'critical' },
        { id: 'e-pos-rope', source: 'node-positional-encoding', target: 'node-rope-encoding', tier: 'micro', strength: 'strong' },
        { id: 'e-scale-gradvar', source: 'node-softmax-scaling', target: 'node-gradient-variance', tier: 'micro', strength: 'critical' },
        { id: 'e-dense-rope-qkv', source: 'node-rope-encoding', target: 'node-qkv-projection', tier: 'micro', isDenseCrosslink: true, strength: 'strong', label: 'Rotates Q/K' },
        { id: 'e-dense-online-scale', source: 'node-online-softmax', target: 'node-softmax-scaling', tier: 'micro', isDenseCrosslink: true, strength: 'critical', label: 'Online scaling' },
        { id: 'e-dense-sram-quad', source: 'node-sram-tiling', target: 'node-quadratic-complexity', tier: 'micro', isDenseCrosslink: true, strength: 'strong', label: 'Bypasses O(N²) IO' }
      ]
    }
  },

  {
    id: 'source-celebrity-problem',
    title: 'L17. The Celebrity Problem & Stack Elimination',
    category: 'Computer Science',
    sourceType: 'algorithm_lab',
    sourceTypeLabel: 'DSA Striver Series · Stack & Graph',
    thumbnail: '/thumbnails/thumb_celebrity.jpg',
    youtubeId: 'cEadsbTeze4',
    duration: '32:15',
    views: '170K views',
    channelName: 'takeUforward · Striver',
    masteryScore: 92,
    masteryLevel: 'Mastered',
    lastStudied: 'Yesterday, 4:30 PM',
    summary:
      'Complete 32-minute intuition solving the celebrity problem in linear O(N) time using pairwise elimination property and validation matrix.',
    quizzes: [
      {
        id: 'quiz-cel-01',
        question: 'What are the two mathematical invariants that define a Celebrity in an N-person party?',
        options: [
          'Celebrity knows at least half the people and has highest rank',
          'Everyone knows the celebrity (In-degree = N-1) and the celebrity knows nobody (Out-degree = 0)',
          'Celebrity has an edge to every person in the party matrix',
          'Celebrity has equal in-degree and out-degree'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: 1,
        isAnsweredCorrectly: true,
        explanation:
          'By definition: A celebrity knows zero people (Row sum = 0) and everyone else knows the celebrity (Column sum = N - 1, ignoring diagonal).',
        relatedConceptNodeId: 'node-cel-invariants'
      },
      {
        id: 'quiz-cel-02',
        question: 'When comparing two candidates A and B using knows(A, B), how does elimination guarantee dropping exactly one person?',
        options: [
          'If knows(A, B) is true, A cannot be celebrity; if false, B cannot be celebrity',
          'Both A and B are eliminated simultaneously if they have spoken before',
          'Only candidates with higher ID indices are preserved',
          'It requires a binary search lookup in an adjacency list'
        ],
        correctOptionIndex: 0,
        userSelectedIndex: 0,
        isAnsweredCorrectly: true,
        explanation:
          'If A knows B, A is not a celebrity (celebrities know nobody). If A does not know B, B is not a celebrity (everyone knows a celebrity). In one query, exactly one candidate is eliminated!',
        relatedConceptNodeId: 'node-cel-elimination'
      },
      {
        id: 'quiz-cel-03',
        question: 'Why is a final O(N) verification loop strictly required after finding the last remaining candidate C?',
        options: [
          'To sort the adjacency list in ascending order',
          'Because the elimination phase only guarantees C is the ONLY potential candidate, but a party might contain NO celebrity at all',
          'To calculate curiosity credit points',
          'To clean up stack memory from the heap'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: 1,
        isAnsweredCorrectly: true,
        explanation:
          'Elimination proves that IF a celebrity exists, it MUST be candidate C. We still must verify that row(C) contains all 0s and col(C) contains N-1 ones (excluding diagonal).',
        relatedConceptNodeId: 'node-cel-verification'
      }
    ],
    notes: [
      {
        id: 'note-cel-01',
        title: 'Two Pointer O(1) Space Optimization',
        category: 'Core Mechanics',
        content: `Instead of using an explicit \`std::stack\` of size $O(N)$, we can use two pointers:
\`\`\`cpp
int top = 0, down = n - 1;
while (top < down) {
    if (knows(top, down)) {
        top++; // top cannot be celebrity
    } else {
        down--; // down cannot be celebrity
    }
}
// Candidate is 'top'
\`\`\`
**Time Complexity:** $O(N)$ comparisons.  
**Space Complexity:** $O(1)$ auxiliary memory.`,
        updatedAt: 'Yesterday'
      },
      {
        id: 'note-cel-02',
        title: 'Graph Adjacency Representation',
        category: 'Key Formulas',
        content: `- Directed Graph $G = (V, E)$ where an edge $u \\to v$ means $u$ knows $v$.
- In-degree of Celebrity = $N - 1$
- Out-degree of Celebrity = $0$
- At most **one** celebrity can exist in any group! (Proof: If two celebrities $C_1$ and $C_2$ existed, $C_1$ must know $C_2$, violating $C_1$'s out-degree of 0).`,
        updatedAt: '2 days ago'
      }
    ],
    researchPaper: {
      title: 'Efficient Vertex Elimination and Single-Candidate Identification in Directed Graphs',
      authors: 'A. Aho, J. Hopcroft, J. Ullman',
      conference: 'ACM Journal of Computer and System Sciences',
      year: 1983,
      arxivUrl: 'https://doi.org/10.1145/322374.322379',
      abstract:
        'We examine the problem of identifying a universal sink vertex (in-degree N-1, out-degree 0) in an arbitrary directed graph. We prove that 3N - [log N] edge probe queries are necessary and sufficient in the worst case to determine the existence of a universal sink.',
      keyContributions: [
        'Proved 3(N-1) query lower bound for the universal sink identification problem.',
        'Demonstrated that two-element comparison yields a strict monotonicity elimination reduction.',
        'Formalized linear matrix verification algorithms for adjacency matrices.'
      ],
      methodologicalBreakdown:
        'The query complexity is bounded by showing that every comparison knows(A, B) yields a directed tournament outcome that eliminates one element from the sink-candidate pool.'
    },
    knowledgeGraph: {
      rootNodeId: 'node-root-cel',
      nodes: [
        {
          id: 'node-root-cel',
          label: 'The Celebrity Problem',
          category: 'Algorithm Problem',
          depth: 0,
          status: 'mastered',
          importance: 'critical',
          summary: 'Find the person known by everyone who knows no one at a party of N individuals.',
          keyFormula: 'In-Degree(C) = N - 1, Out-Degree(C) = 0',
          x: 280,
          y: 50
        },
        {
          id: 'node-cel-invariants',
          label: 'Degree Invariants & Uniqueness',
          category: 'Graph Invariants',
          depth: 1,
          status: 'mastered',
          importance: 'foundational',
          summary: 'Mathematical proof that at most one celebrity can exist in any directed tournament graph.',
          keyFormula: 'Max Celebrities <= 1',
          x: 100,
          y: 160
        },
        {
          id: 'node-cel-elimination',
          label: 'Pairwise Elimination Property',
          category: 'Reduction',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Single query knows(A, B) guarantees the elimination of either A or B from candidate pool.',
          keyFormula: 'knows(A, B) ? drop(A) : drop(B)',
          x: 280,
          y: 160
        },
        {
          id: 'node-cel-verification',
          label: 'Final Row & Column Verification',
          category: 'Edge Case Safety',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Validates that the last remaining candidate actually satisfies all celebrity constraints.',
          keyFormula: 'Sum(Row[C]) == 0 && Sum(Col[C]) == N - 1',
          x: 460,
          y: 160
        },
        {
          id: 'node-cel-stack',
          label: 'O(N) Stack-Based Algorithm',
          category: 'Implementation',
          depth: 2,
          status: 'mastered',
          importance: 'foundational',
          summary: 'Push all IDs to stack, pop 2 candidates repeatedly until single candidate remains.',
          keyFormula: 'T(N) = O(N), S(N) = O(N)',
          x: 180,
          y: 280
        },
        {
          id: 'node-cel-twopointer',
          label: 'O(1) Space Two-Pointer Technique',
          category: 'Optimization',
          depth: 2,
          status: 'mastered',
          importance: 'advanced',
          summary: 'Uses top = 0 and down = n-1 pointers to achieve optimal constant auxiliary memory.',
          keyFormula: 'T(N) = O(N), S(N) = O(1)',
          x: 380,
          y: 280
        }
      ],
      edges: [
        { id: 'e-cel-inv', source: 'node-root-cel', target: 'node-cel-invariants' },
        { id: 'e-cel-elim', source: 'node-root-cel', target: 'node-cel-elimination' },
        { id: 'e-cel-ver', source: 'node-root-cel', target: 'node-cel-verification' },
        { id: 'e-elim-stk', source: 'node-cel-elimination', target: 'node-cel-stack' },
        { id: 'e-elim-ptr', source: 'node-cel-elimination', target: 'node-cel-twopointer' }
      ]
    }
  },

  {
    id: 'source-rsa-crypto',
    title: 'Public Key Cryptography & Diffie-Hellman Key Exchange',
    category: 'Cybersecurity',
    sourceType: 'paper',
    sourceTypeLabel: 'Applied Cryptography & TLS',
    thumbnail: '/thumbnails/thumb_cyber_02.jpg',
    youtubeId: 'GSIDS_lvRv4',
    duration: '35:12',
    views: '2.6M views',
    channelName: 'takeUforward · CyberDefense',
    masteryScore: 78,
    masteryLevel: 'Proficient',
    lastStudied: 'Nov 11, 2:10 PM',
    summary:
      '35-minute mathematical intuition exploring modular arithmetic, discrete logarithms, and forward secrecy in modern TLS.',
    quizzes: [
      {
        id: 'quiz-rsa-01',
        question: 'What computational hardness assumption underpins the Diffie-Hellman key exchange?',
        options: [
          'Integer factorization in polynomial time',
          'The Discrete Logarithm Problem (DLP) over a finite cyclic group',
          'Finding collisions in SHA-256',
          'Inverting matrix multiplications in O(1)'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: 1,
        isAnsweredCorrectly: true,
        explanation:
          'Given g^a mod p and g^b mod p, it is computationally intractable for an eavesdropper to compute the shared secret g^(ab) mod p without knowing either private exponent a or b.',
        relatedConceptNodeId: 'node-dlp-hardness'
      },
      {
        id: 'quiz-rsa-02',
        question: 'Why does Ephemeral Diffie-Hellman (ECDHE) guarantee Perfect Forward Secrecy (PFS)?',
        options: [
          'Because keys are stored on physical hardware smartcards',
          'Because a fresh, unique private key pair is generated for each individual session and discarded immediately after handshake completion',
          'Because ECDHE encrypts packets with 4096-bit AES block ciphers',
          'Because the server private key is renewed daily'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: null,
        isAnsweredCorrectly: false,
        explanation:
          'Even if an attacker records encrypted network traffic for years and later steals the server long-term private key, past sessions cannot be decrypted because ephemeral session keys were destroyed.',
        relatedConceptNodeId: 'node-forward-secrecy'
      }
    ],
    notes: [
      {
        id: 'note-rsa-01',
        title: 'Diffie-Hellman Exchange Steps',
        category: 'Core Mechanics',
        content: `1. **Public Agreement:** Alice and Bob agree on prime $p$ and generator $g$.
2. **Private Secrets:** Alice picks secret $a$, Bob picks secret $b$.
3. **Public Values:**
   - Alice sends $A = g^a \\pmod p$
   - Bob sends $B = g^b \\pmod p$
4. **Shared Key Calculation:**
   - Alice computes $K = B^a = (g^b)^a = g^{ab} \\pmod p$
   - Bob computes $K = A^b = (g^a)^b = g^{ab} \\pmod p$
Eavesdropper Eve sees $p, g, A, B$ but cannot compute $g^{ab} \\pmod p$ without solving DLP.`,
        updatedAt: '3 days ago'
      }
    ],
    researchPaper: {
      title: 'New Directions in Cryptography',
      authors: 'Whitfield Diffie and Martin E. Hellman',
      conference: 'IEEE Transactions on Information Theory',
      year: 1976,
      arxivUrl: 'https://doi.org/10.1109/TIT.1976.1055638',
      abstract:
        'Two kinds of contemporary developments in cryptography are examined. Widening applications of teleprocessing have given rise to a need for new types of cryptographic systems, which minimize the need for secure key distribution channels and supply the equivalent of a written signature. We suggest that key distribution over an insecure channel is possible without any prior secret communication.',
      keyContributions: [
        'Introduced the revolutionary concept of Public Key Cryptography and asymmetric key pairs.',
        'Created the Diffie-Hellman Key Exchange algorithm based on one-way trapdoor permutations.',
        'Conceptualized digital signatures for non-repudiation and authentication in network communications.'
      ],
      methodologicalBreakdown:
        'Demonstrates how modular exponentiation provides an asymmetric complexity gap: computing (g^a) mod p is fast O(log a), while finding a from (g^a) mod p requires sub-exponential index calculus.'
    },
    knowledgeGraph: {
      rootNodeId: 'node-root-dh',
      nodes: [
        {
          id: 'node-root-dh',
          label: 'Diffie-Hellman Key Exchange',
          category: 'Asymmetric Cryptography',
          depth: 0,
          status: 'mastered',
          importance: 'critical',
          summary: 'Method allowing two parties to establish a shared secret over an untrusted public channel.',
          keyFormula: 'Shared K = (g^a)^b = g^(ab) mod p',
          x: 280,
          y: 50
        },
        {
          id: 'node-dlp-hardness',
          label: 'Discrete Logarithm Problem (DLP)',
          category: 'Hardness Assumption',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Computational barrier preventing adversary from inverting modular exponentiation.',
          keyFormula: 'Find x such that g^x = h mod p',
          x: 120,
          y: 160
        },
        {
          id: 'node-mitm-flaw',
          label: 'Unauthenticated MitM Attack',
          category: 'Security Vulnerability',
          depth: 1,
          status: 'in_progress',
          importance: 'foundational',
          summary: 'Without digital signatures, an active adversary can negotiate independent keys with both endpoints.',
          keyFormula: 'Alice <-> Eve(K1), Eve(K2) <-> Bob',
          x: 440,
          y: 160
        },
        {
          id: 'node-forward-secrecy',
          label: 'Perfect Forward Secrecy (ECDHE)',
          category: 'Modern TLS Standard',
          depth: 2,
          status: 'in_progress',
          importance: 'advanced',
          summary: 'Unique per-session ephemeral keys protect historical traffic against future private key compromise.',
          keyFormula: 'TLS 1.3 RFC 8446 Mandate',
          x: 280,
          y: 280
        }
      ],
      edges: [
        { id: 'e-dh-dlp', source: 'node-root-dh', target: 'node-dlp-hardness' },
        { id: 'e-dh-mitm', source: 'node-root-dh', target: 'node-mitm-flaw' },
        { id: 'e-dh-pfs', source: 'node-root-dh', target: 'node-forward-secrecy' }
      ]
    }
  },

  {
    id: 'source-pca',
    title: 'Principal Component Analysis (PCA) & Covariance Projections',
    category: 'AIDS',
    sourceType: 'youtube',
    sourceTypeLabel: 'Linear Algebra for Data Science',
    thumbnail: '/thumbnails/thumb_aids_02.jpg',
    youtubeId: 'FgakZw6K1QQ',
    duration: '26:45',
    views: '2.9M views',
    channelName: 'takeUforward · DataScience Hub',
    masteryScore: 88,
    masteryLevel: 'Advanced',
    lastStudied: 'Nov 10, 8:40 PM',
    summary:
      '26-minute step-by-step geometric walkthrough of covariance matrices, eigenvalues, eigenvectors, and variance projection in high-dimensional datasets.',
    quizzes: [
      {
        id: 'quiz-pca-01',
        question: 'Why must dataset features be standardized (mean=0, variance=1) prior to calculating the covariance matrix in PCA?',
        options: [
          'Because numpy matrix multiplication throws an overflow exception otherwise',
          'To prevent features measured in larger absolute units from artificially dominating the principal component directions',
          'To force eigenvalues to be strictly integers',
          'To make the covariance matrix asymmetric'
        ],
        correctOptionIndex: 1,
        userSelectedIndex: 1,
        isAnsweredCorrectly: true,
        explanation:
          'PCA maximizes variance. A feature like salary (in thousands) would dominate a feature like age (18-65) solely due to scale differences rather than true variance structure.',
        relatedConceptNodeId: 'node-standardization'
      }
    ],
    notes: [
      {
        id: 'note-pca-01',
        title: 'Covariance Matrix Formulation',
        category: 'Key Formulas',
        content: `Given zero-centered data matrix $X$ of size $(N, D)$:
$$\\Sigma = \\frac{1}{N - 1} X^T X$$
- Size of $\\Sigma$: $D \\times D$ symmetric positive semi-definite matrix.
- Diagonal entries $\\Sigma_{ii}$: Variance of feature $i$.
- Off-diagonal entries $\\Sigma_{ij}$: Covariance between feature $i$ and $j$.`,
        updatedAt: '4 days ago'
      }
    ],
    researchPaper: {
      title: 'On Lines and Planes of Closest Fit to Systems of Points in Space',
      authors: 'Karl Pearson, F.R.S.',
      conference: 'Philosophical Magazine',
      year: 1901,
      arxivUrl: 'https://doi.org/10.1080/14786440109462720',
      abstract:
        'In many investigations it is desirable to represent a system of points in space by a line or plane of closest fit. We investigate the principle of least squares applied to finding principal axis systems and orthogonal projections of maximal variability.',
      keyContributions: [
        'Founded the mathematics of principal axes decomposition in multivariate analysis.',
        'Formulated orthogonal projection minimizing sum of squared perpendicular distances.',
        'Established link between eigenvalues of dispersion matrices and axes of maximal variation.'
      ],
      methodologicalBreakdown:
        'Proves that minimizing perpendicular Euclidean residuals to an orthogonal hyperplane is identical to maximizing the projected sample variance along the normal eigenvectors.'
    },
    knowledgeGraph: {
      rootNodeId: 'node-root-pca',
      nodes: [
        {
          id: 'node-root-pca',
          label: 'Principal Component Analysis (PCA)',
          category: 'Dimensionality Reduction',
          depth: 0,
          status: 'mastered',
          importance: 'critical',
          summary: 'Unsupervised linear technique projecting data onto orthogonal axes of maximal variance.',
          keyFormula: 'X_projected = X * V_k',
          x: 280,
          y: 50
        },
        {
          id: 'node-standardization',
          label: 'Feature Standardization (Z-score)',
          category: 'Data Preprocessing',
          depth: 1,
          status: 'mastered',
          importance: 'foundational',
          summary: 'Subtract mean and divide by standard deviation to prevent unit bias.',
          keyFormula: 'z = (x - mu) / sigma',
          x: 120,
          y: 160
        },
        {
          id: 'node-covariance',
          label: 'Covariance Matrix Decomposition',
          category: 'Linear Algebra',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Compute symmetric matrix Sigma = (X^T * X) / (N - 1).',
          keyFormula: 'Sigma * v = lambda * v',
          x: 440,
          y: 160
        },
        {
          id: 'node-eigen-vectors',
          label: 'Eigenvectors & Explained Variance',
          category: 'Projection Axes',
          depth: 2,
          status: 'mastered',
          importance: 'advanced',
          summary: 'Sort eigenvectors in descending order of eigenvalue to select top-k principal components.',
          keyFormula: 'Explained Ratio = lambda_i / sum(lambda)',
          x: 280,
          y: 280
        }
      ],
      edges: [
        { id: 'e-pca-std', source: 'node-root-pca', target: 'node-standardization' },
        { id: 'e-pca-cov', source: 'node-root-pca', target: 'node-covariance' },
        { id: 'e-cov-eig', source: 'node-covariance', target: 'node-eigen-vectors' }
      ]
    }
  },

  {
    id: 'source-os-sync',
    title: 'Operating Systems: Semaphores, Mutex & Deadlocks',
    category: 'Computer Science',
    sourceType: 'system_design',
    sourceTypeLabel: 'Systems Core & Concurrency',
    thumbnail: '/thumbnails/thumb_cs_01.jpg',
    youtubeId: 'rNW_m3k20K8',
    duration: '44:10',
    views: '1.5M views',
    channelName: 'takeUforward · Systems Core',
    masteryScore: 82,
    masteryLevel: 'Proficient',
    lastStudied: 'Nov 9, 6:00 PM',
    summary:
      '44-minute rigorous breakdown of critical section conditions, counting semaphores, and Coffman deadlock conditions.',
    quizzes: [
      {
        id: 'quiz-os-01',
        question: 'Which of the following is NOT one of the 4 Coffman conditions required for a deadlock to occur?',
        options: [
          'Mutual Exclusion',
          'Hold and Wait',
          'Preemptive Scheduling',
          'Circular Wait'
        ],
        correctOptionIndex: 2,
        userSelectedIndex: 2,
        isAnsweredCorrectly: true,
        explanation:
          'The 4 Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption (resources CANNOT be preempted), and Circular Wait. Preemptive scheduling actually PREVENTS deadlocks!',
        relatedConceptNodeId: 'node-coffman'
      }
    ],
    notes: [
      {
        id: 'note-os-01',
        title: 'Semaphore Primitive Operations',
        category: 'Core Mechanics',
        content: `**Wait() [P operation / down]:**
\`\`\`c
void wait(Semaphore S) {
    S.value--;
    if (S.value < 0) {
        // add process to S.queue
        block();
    }
}
\`\`\`
**Signal() [V operation / up]:**
\`\`\`c
void signal(Semaphore S) {
    S.value++;
    if (S.value <= 0) {
        // remove process P from S.queue
        wakeup(P);
    }
}
\`\`\``,
        updatedAt: '5 days ago'
      }
    ],
    researchPaper: {
      title: 'Cooperating Sequential Processes',
      authors: 'Edsger W. Dijkstra',
      conference: 'Technological University Eindhoven Manuscript',
      year: 1965,
      arxivUrl: 'https://www.cs.utexas.edu/users/EWD/ewd01xx/EWD123.PDF',
      abstract:
        'This paper addresses the synchronization problem among concurrent processes sharing common resources. We introduce the concept of semaphores with atomic P and V operations, proving safety and mutual exclusion invariants for multi-core computer systems.',
      keyContributions: [
        'Invented the Semaphore data structure and atomic test-and-decrement semantics.',
        'Formulated the Critical Section Problem with mutual exclusion, progress, and bounded waiting criteria.',
        'Created the Producer-Consumer and Dining Philosophers concurrency paradigms.'
      ],
      methodologicalBreakdown:
        'Proves that without atomic hardware support or indivisible test-and-set operations, purely software-based mutual exclusion requires complex flags like Peterson or Dekker algorithms.'
    },
    knowledgeGraph: {
      rootNodeId: 'node-root-sync',
      nodes: [
        {
          id: 'node-root-sync',
          label: 'Process Synchronization & Concurrency',
          category: 'Operating Systems',
          depth: 0,
          status: 'mastered',
          importance: 'critical',
          summary: 'Techniques ensuring shared memory integrity among asynchronously executing threads.',
          keyFormula: 'Mutual Exclusion + Progress + Bounded Waiting',
          x: 280,
          y: 50
        },
        {
          id: 'node-semaphores',
          label: 'Dijkstra Semaphores (P & V)',
          category: 'Synchronization Primitives',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Integer variables accessed strictly via atomic wait() and signal() operations.',
          keyFormula: 'P() : S--, V() : S++',
          x: 120,
          y: 160
        },
        {
          id: 'node-coffman',
          label: 'Coffman Deadlock Conditions',
          category: 'Failure Modes',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Four simultaneous conditions that produce irrecoverable system deadlocks.',
          keyFormula: 'Mutex & HoldAndWait & NoPreempt & CircularWait',
          x: 440,
          y: 160
        },
        {
          id: 'node-banker',
          label: 'Banker Algorithm for Avoidance',
          category: 'Deadlock Avoidance',
          depth: 2,
          status: 'in_progress',
          importance: 'advanced',
          summary: 'Tests for safe states by simulating resource allocation before granting requests.',
          keyFormula: 'Need <= Available ? Grant : Wait',
          x: 280,
          y: 280
        }
      ],
      edges: [
        { id: 'e-sync-sem', source: 'node-root-sync', target: 'node-semaphores' },
        { id: 'e-sync-cof', source: 'node-root-sync', target: 'node-coffman' },
        { id: 'e-cof-bnk', source: 'node-coffman', target: 'node-banker' }
      ]
    }
  },

  {
    id: 'source-sliding-window',
    title: 'L16. Sliding Window Maximum (Monotonic Deque)',
    category: 'Computer Science',
    sourceType: 'algorithm_lab',
    sourceTypeLabel: 'DSA Striver Series · Hard Deque',
    thumbnail: '/thumbnails/thumb_sliding_window.jpg',
    youtubeId: 'CZQGRp93K4k',
    duration: '35:40',
    views: '284K views',
    channelName: 'takeUforward · Striver',
    masteryScore: 90,
    masteryLevel: 'Mastered',
    lastStudied: 'Nov 8, 11:20 AM',
    summary:
      '35-minute masterclass solving sliding window maximum with a monotonic deque in amortized O(N) linear time.',
    quizzes: [
      {
        id: 'quiz-sw-01',
        question: 'Why does the monotonic deque maintain indices in strictly decreasing order of element values?',
        options: [
          'Because the front of the deque will always store the maximum element for the current window in O(1) time',
          'To minimize binary search tree rotations',
          'Because the problem statement forbids ascending order',
          'To ensure all indices are prime numbers'
        ],
        correctOptionIndex: 0,
        userSelectedIndex: 0,
        isAnsweredCorrectly: true,
        explanation:
          'When element A appears after element B and A >= B, element B can never be the maximum in any future window. B is popped from the back, ensuring the front is always the maximum.',
        relatedConceptNodeId: 'node-sw-deque'
      }
    ],
    notes: [
      {
        id: 'note-sw-01',
        title: 'Monotonic Deque Algorithm Template',
        category: 'Core Mechanics',
        content: `\`\`\`cpp
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq; // stores indices
    vector<int> res;
    for (int i = 0; i < nums.size(); i++) {
        // 1. Remove indices outside current window
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        // 2. Maintain decreasing order
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        // 3. Add to result once first window of size k is formed
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    return res;
}
\`\`\`
**Time:** Amortized $O(N)$ (each element pushed and popped at most once).  
**Space:** $O(K)$ for the deque.`,
        updatedAt: '6 days ago'
      }
    ],
    researchPaper: {
      title: 'Monotone Priority Queues and Optimal Window Statistics Computation',
      authors: 'D. Lemire',
      conference: 'Nordic Journal of Computing',
      year: 2006,
      arxivUrl: 'https://arxiv.org/abs/cs/0610046',
      abstract:
        'We present an optimal algorithm for running maximum filters over discrete time series. Using a double-ended queue maintained in monotonic order, we prove that at most 3 comparisons per data item are required in the worst case.',
      keyContributions: [
        'Formulated the 3-comparison worst-case bound for sliding window extrema.',
        'Proved that monotonic deque eviction amortizes to O(1) per stream token.',
        'Provided benchmark comparisons against segment trees and heap-based approaches.'
      ],
      methodologicalBreakdown:
        'Uses an invariant where an element entered at time t1 with value x dominates any older element at t0 with value y <= x, allowing immediate cascade eviction.'
    },
    knowledgeGraph: {
      rootNodeId: 'node-root-sw',
      nodes: [
        {
          id: 'node-root-sw',
          label: 'Sliding Window Maximum',
          category: 'Algorithm Problem',
          depth: 0,
          status: 'mastered',
          importance: 'critical',
          summary: 'Find the maximum value in every contiguous window of size k moving across an array.',
          keyFormula: 'Window size = k, Output size = N - k + 1',
          x: 280,
          y: 50
        },
        {
          id: 'node-sw-deque',
          label: 'Decreasing Monotonic Deque',
          category: 'Data Structure',
          depth: 1,
          status: 'mastered',
          importance: 'critical',
          summary: 'Store indices such that array values are strictly decreasing from front to back.',
          keyFormula: 'nums[dq.front()] = max(window)',
          x: 120,
          y: 160
        },
        {
          id: 'node-sw-eviction',
          label: 'Out-of-Bounds Index Eviction',
          category: 'Window Invariant',
          depth: 1,
          status: 'mastered',
          importance: 'foundational',
          summary: 'Pop front if dq.front() <= current_index - k to ensure elements remain in the window.',
          keyFormula: 'dq.front() <= i - k => pop_front()',
          x: 440,
          y: 160
        },
        {
          id: 'node-sw-amortized',
          label: 'Amortized O(N) Analysis',
          category: 'Complexity Proof',
          depth: 2,
          status: 'mastered',
          importance: 'advanced',
          summary: 'Each of the N elements is pushed into the deque once and popped at most once.',
          keyFormula: 'Total Operations <= 2 * N => Amortized O(1)/step',
          x: 280,
          y: 280
        }
      ],
      edges: [
        { id: 'e-sw-dq', source: 'node-root-sw', target: 'node-sw-deque' },
        { id: 'e-sw-ev', source: 'node-root-sw', target: 'node-sw-eviction' },
        { id: 'e-dq-am', source: 'node-sw-deque', target: 'node-sw-amortized' }
      ]
    }
  }
];
