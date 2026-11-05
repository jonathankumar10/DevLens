// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'rpc',
  type:        'concept',
  title:       'Network Abstractions: RPC',
  category:    'framework',
  tags:        ['rpc', 'remote-procedure-call', 'stub', 'marshalling', 'idempotency', 'partial-failure', 'sync-vs-async', 'grpc'],
  description: 'Remote Procedure Call is the abstraction that lets you write `result = getUser(id)` and have it execute on a machine you\'ve never touched, as if it were a local function call. The abstraction is powerful and also fundamentally leaky: a local call can\'t silently fail halfway through, but a network call always can. Everything interesting about RPC as a concept is about that one difference.',
}
