import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "Mailing a form to a government office instead of handing it to a clerk across the counter. In person, you know instantly whether your form was received and processed. By mail, if you don't hear back, you genuinely can't tell whether the letter got lost, whether it arrived but sat in a backlog, or whether it was processed and the reply got lost on the way back to you. RPC is the mail-in form: it looks like handing someone a form, but it inherits every uncertainty of the postal system in between.",
  howItWorks: [
    'The core idea: a client stub presents a normal-looking function signature. Calling it marshals the arguments (serializes them into bytes), sends them over the network, and on the server side a skeleton unmarshals the bytes, invokes the real function, and marshals the result back. From the calling code\'s point of view, `getUser(id)` looks identical whether `id` lives in the next stack frame or on a server three data centers away — that\'s the entire point of the abstraction.',
    'The abstraction leaks precisely at failure. A local function call has exactly two outcomes: it returns, or it throws/crashes the whole process — there\'s no in-between. A remote call has a third outcome a local call can never have: the request or the response gets lost in transit, and the caller times out with genuinely no way to know whether the callee ever ran. This is not a minor edge case — it\'s the single fact that makes distributed systems categorically harder than single-process programming, and it\'s why "detailed design" for almost any RPC-based system spends real time on this exact question.',
    'Concretely, a timeout after calling a remote function is consistent with three different realities: the request never reached the server (safe to retry), the request reached the server and it crashed before doing anything (safe to retry), or the request reached the server, was fully processed, and only the *response* was lost on the way back (retrying would re-execute an already-completed operation). The caller cannot distinguish these three from where it sits — the network gives no delivery receipt.',
    'Synchronous RPC blocks the caller until a response arrives (or the call times out) — simple to reason about, but it ties up the caller\'s resources (a thread, a connection) for the callee\'s entire processing time, and a slow callee directly becomes the caller\'s latency. Asynchronous RPC returns immediately with a future/promise or delivers the result later via callback or message — it decouples caller latency from callee latency, at the cost of a more complex programming model (the caller has to handle "not done yet" as a first-class state).',
    'Idempotency is the practical answer to the three-outcome problem above: design the remote operation so that executing it twice has the same effect as executing it once (e.g. "set balance to $50," or "charge card using idempotency-key X" where the server deduplicates by key), then retry blindly on any timeout. Since the caller can never distinguish "never ran," "ran but response lost," and "crashed mid-run," making the *operation itself* safe to repeat is the only strategy that covers all three cases without needing to know which one happened.',
    'RPC is the general pattern; REST is one specific, opinionated style of it — REST constrains calls to a resource-oriented vocabulary (GET/POST/PUT/DELETE on nouns), while frameworks like gRPC or Thrift expose arbitrary function names with no such constraint, favoring compact binary serialization and code-generated stubs instead. See `api-paradigms` for how REST, GraphQL, and gRPC compare as concrete implementations of this abstraction, and `abstractions-in-system-design` for how the network abstraction fits alongside the storage, consistency, and failure abstractions.',
  ],
  keyPoints: [
    'RPC makes a remote call look like a local function call — client stub marshals args, server skeleton unmarshals + invokes + marshals the result back',
    'The one thing a local call can never do that a remote call always can: fail silently partway through. This single difference is the root of most distributed-systems complexity',
    'A timeout is ambiguous by nature: request never arrived, arrived but server crashed, or arrived and fully succeeded but the response was lost — the caller cannot tell which',
    'Idempotency is the practical fix: make the operation safe to execute more than once (dedupe by idempotency key), then retry blindly on any timeout rather than trying to determine what actually happened',
    'Synchronous RPC blocks and ties the caller\'s latency to the callee\'s; asynchronous RPC decouples them at the cost of a "result not ready yet" state the caller must handle',
    'REST is RPC constrained to a resource/verb vocabulary over HTTP; gRPC/Thrift are RPC without that constraint, favoring compact binary serialization — see `api-paradigms` for the full comparison',
  ],
  components: [
    {
      id:            'stubs',
      title:         'Stubs & Marshalling',
      icon:          '📦',
      color:         '#3b82f6',
      animationType: 'rpc',
      summary: 'Making a remote call look exactly like a local one',
      detail:  'A client stub presents a normal function signature; calling it serializes ("marshals") the arguments and ships them to a server-side skeleton, which deserializes, invokes the real function, and marshals the result back. This is the entire illusion RPC is built on.',
      stats: [
        { label: 'Client side', value: 'Stub (marshal args)' },
        { label: 'Server side', value: 'Skeleton (unmarshal + invoke)' },
      ],
    },
    {
      id:            'partial-failure',
      title:         'Partial Failure',
      icon:          '❓',
      color:         '#f43f5e',
      animationType: 'rpc',
      summary: 'The one failure mode a local call can never have',
      detail:  'A timeout is consistent with three different realities: never arrived, arrived but crashed before running, or ran fully and only the response was lost. The caller has no way to distinguish them — there\'s no network delivery receipt.',
      stats: [
        { label: 'Possible outcomes', value: '3, indistinguishable' },
        { label: 'Root cause of',     value: 'Most distributed complexity' },
      ],
    },
    {
      id:            'sync-async',
      title:         'Sync vs. Async RPC',
      icon:          '⏳',
      color:         '#f59e0b',
      animationType: 'rpc',
      summary: 'Block and wait, or decouple caller latency from callee latency',
      detail:  'Synchronous RPC blocks the caller for the full duration of the call — simple, but a slow callee becomes the caller\'s latency directly. Asynchronous RPC returns a future/promise or delivers via callback, decoupling the two at the cost of an explicit "not done yet" state.',
      stats: [
        { label: 'Sync',  value: 'Blocks caller' },
        { label: 'Async', value: 'Caller continues' },
      ],
    },
    {
      id:            'idempotency',
      title:         'Idempotent Retries',
      icon:          '🔁',
      color:         '#10b981',
      animationType: 'rpc',
      summary: 'The practical fix: make re-execution safe, then retry blindly',
      detail:  'Since the caller can never tell which of the three timeout outcomes occurred, the only strategy that covers all of them is making the operation itself safe to run twice — e.g. dedupe by an idempotency key — then retry on any timeout without trying to diagnose what happened.',
      stats: [
        { label: 'Strategy',  value: 'Dedupe by key' },
        { label: 'Enables',   value: 'Blind, safe retries' },
      ],
    },
  ],
}
