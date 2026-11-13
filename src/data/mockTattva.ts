import type { Inquiry, InquiryDetail, MeResponse } from '../types/tattva';

export const MOCK_ME_USER: MeResponse['user'] = {
  id: 'usr-tattva-learner-01',
  isAnonymous: true,
};

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-arena-allocators',
    userId: 'usr-tattva-learner-01',
    learningSourceId: 'src-arena-allocators',
    title: 'Memory Arena Allocators: Design and Trade-offs',
    createdAt: '2026-11-12T10:15:00.000Z',
    updatedAt: '2026-11-12T11:42:00.000Z',
  },
  {
    id: 'inq-transformers-attention',
    userId: 'usr-tattva-learner-01',
    learningSourceId: 'src-transformers-attention',
    title: 'Transformers & Self-Attention Architecture',
    createdAt: '2026-11-11T16:20:00.000Z',
    updatedAt: '2026-11-11T17:05:00.000Z',
  },
  {
    id: 'inq-tls-forward-secrecy',
    userId: 'usr-tattva-learner-01',
    learningSourceId: 'src-tls-forward-secrecy',
    title: 'TLS 1.3 Ephemeral Diffie-Hellman & Forward Secrecy',
    createdAt: '2026-11-10T09:00:00.000Z',
    updatedAt: '2026-11-10T10:30:00.000Z',
  },
];

export const MOCK_INQUIRY_DETAIL: InquiryDetail = {
  id: 'inq-arena-allocators',
  learningSource: {
    id: 'src-arena-allocators',
    title: 'Memory Arena Allocators: Design and Trade-offs',
    sourceType: 'transcript',
    sourceReference: 'https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018',
    durationMinutes: 38,
  },
  nodes: [
    {
      id: 'node-arena-root',
      parentNodeId: null,
      userQuestion: 'What would escape analysis need to prove for an allocation to be arena-eligible?',
      aiExplanation:
        'Escape analysis must prove that neither the pointer itself nor any pointer derived from it survives beyond the bounded scope of the allocator arena. Specifically, it must guarantee no pointer escapes to heap globals, no pointer is returned to a caller outliving the arena frame, and no pointer is passed asynchronously to concurrently running threads with unbounded lifetimes.',
      researchMode: true,
      isTrap: false,
      trapMetadata: null,
      trapResolvedAt: null,
      followUps: [
        {
          id: 'fu-arena-01',
          position: 1,
          questionText: 'How does arena reset behave when nested arenas are allocated across recursion?',
          isSelected: true,
          childNodeId: 'node-arena-trap',
        },
        {
          id: 'fu-arena-02',
          position: 2,
          questionText: 'Can compile-time lifetime annotations replace runtime arena boundary checks?',
          isSelected: true,
          childNodeId: 'node-arena-lifetimes',
        },
        {
          id: 'fu-arena-03',
          position: 3,
          questionText: 'What is the fragmentation penalty of variable-sized allocation inside fixed chunk arenas?',
          isSelected: false,
          childNodeId: null,
        },
      ],
      createdAt: '2026-11-12T10:15:30.000Z',
    },
    {
      id: 'node-arena-trap',
      parentNodeId: 'node-arena-root',
      userQuestion: 'How does arena reset behave when nested arenas are allocated across recursion?',
      aiExplanation:
        'With nested scopes, each frame maintains an offset mark into the contiguous arena block. When unwinding from recursion, the arena pointer simply reverts to the previous high-water mark, instantaneously freeing all frame allocations in O(1) without touching individual object headers.',
      researchMode: true,
      isTrap: true,
      trapMetadata: {
        misconceptionType: 'Destructor Omission Pitfall',
        scenario:
          'Assuming that resetting the arena high-water mark automatically invokes object destructors (e.g. closing OS sockets or file descriptors) allocated within that frame.',
        resolutionRequired: true,
      },
      trapResolvedAt: null, // Unresolved to demonstrate adversarial trap UI banner & input lock
      followUps: [
        {
          id: 'fu-trap-01',
          position: 1,
          questionText: 'How can linear types enforce manual destructor dispatch before bulk arena reset?',
          isSelected: false,
          childNodeId: null,
        },
        {
          id: 'fu-trap-02',
          position: 2,
          questionText: 'What is the cache-locality penalty of interleaving multiple arena blocks?',
          isSelected: false,
          childNodeId: null,
        },
        {
          id: 'fu-trap-03',
          position: 3,
          questionText: 'Why do high-frequency trading systems forbid non-trivial destructors in per-tick scratch allocators?',
          isSelected: false,
          childNodeId: null,
        },
      ],
      createdAt: '2026-11-12T10:24:15.000Z',
    },
    {
      id: 'node-arena-lifetimes',
      parentNodeId: 'node-arena-root',
      userQuestion: 'Can compile-time lifetime annotations replace runtime arena boundary checks?',
      aiExplanation:
        'Yes. Systems utilizing affine type systems (like Rust\'s borrow checker with explicit lifetime parameters) prove statically that references cannot outlive the arena storage. This provides complete spatial and temporal safety with zero runtime boundary checking overhead.',
      researchMode: false,
      isTrap: false,
      trapMetadata: null,
      trapResolvedAt: null,
      followUps: [
        {
          id: 'fu-life-01',
          position: 1,
          questionText: 'How do region-based memory management systems formalize this soundness proof?',
          isSelected: false,
          childNodeId: null,
        },
        {
          id: 'fu-life-02',
          position: 2,
          questionText: 'Does monomorphization lead to code bloat with multiple arena lifetimes?',
          isSelected: false,
          childNodeId: null,
        },
        {
          id: 'fu-life-03',
          position: 3,
          questionText: 'How does Cyclone C compare to modern Rust in arena lifetime modeling?',
          isSelected: false,
          childNodeId: null,
        },
      ],
      createdAt: '2026-11-12T10:35:00.000Z',
    },
  ],
};
