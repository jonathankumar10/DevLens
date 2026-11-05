// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'distributed-task-scheduler',
  type:        'design',
  title:       'Design a Distributed Task Scheduler',
  category:    'designs',
  tags:        ['task-scheduler', 'cron', 'idempotency', 'leader-election', 'priority-queue', 'distributed-lock', 'bin-packing'],
  description: 'Design a system (like Airflow, Chronos, or a distributed cron) that schedules and executes tasks — one-off, delayed, or recurring — across a fleet of workers, ensuring each task runs exactly when intended, exactly once despite retries and worker failure, and without overloading any single worker\'s CPU or memory.',
}
