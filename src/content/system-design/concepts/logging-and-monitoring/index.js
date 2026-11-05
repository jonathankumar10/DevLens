import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A hospital has two parallel systems: a patient chart (logging) that records every nurse visit, medication administered, and test result in timestamped detail; and a wall of monitors (monitoring) that continuously display heart rate, blood pressure, and oxygen saturation with threshold alarms. When something goes wrong, doctors use both: the monitors tell them something is wrong right now, and the chart tells them why.",
  howItWorks: [
    'Structured logging: emit logs as JSON rather than free-text strings. Each log line includes fixed fields: timestamp, severity, service, trace ID, user ID, and an event-specific payload. Structured logs are machine-parseable — log aggregation systems (Elasticsearch, BigQuery, CloudWatch Insights) can filter, aggregate, and alert on specific fields instantly.',
    'Log aggregation: services emit logs to stdout; a sidecar or agent (Fluentd, Filebeat, Vector) ships them to a central store. The ELK stack (Elasticsearch + Logstash + Kibana) is the classic self-hosted solution. Managed alternatives: AWS CloudWatch Logs, GCP Cloud Logging, Datadog. Never query raw log files on individual servers — by the time you need them, the pod may be dead.',
    'Metrics with time-series databases: counters, gauges, and histograms are collected at regular intervals and stored in a time-series DB (Prometheus, InfluxDB). Prometheus scrapes a /metrics endpoint on each service. Metrics are aggregated across instances — unlike logs, they are not per-request but per-time-bucket.',
    'The Four Golden Signals (from Google SRE): Latency (how long requests take, split by p50/p95/p99), Traffic (requests/second, bytes/second), Errors (rate of failed requests), Saturation (how full is the system — CPU%, memory%, queue depth). Monitor all four; alert on the ones that predict user impact.',
    'Alerting: alerts fire when a metric crosses a threshold for a sustained period. Good alerts are actionable (the on-call engineer knows exactly what to do), not noisy (no alerts that can be safely ignored). Alert on symptoms (high error rate, high latency) rather than causes (high CPU). Let monitoring dashboards show the cause during investigation.',
    'Dashboards: Grafana visualizes Prometheus metrics as time-series graphs. Build dashboards for each service\'s golden signals, a cross-service dependency map, and a business KPI view. During incidents, the timeline of metric changes is the primary artifact for root cause analysis.',
  ],
  keyPoints: [
    'Structured JSON logs are mandatory at scale — free-text logs become unsearchable once you have more than a few services and millions of lines per day',
    'Log at the right level: ERROR for actionable failures, WARN for unexpected but handled cases, INFO for significant business events, DEBUG for development only (never leave debug logs on in production)',
    'Include a trace ID in every log line — without it, correlating a user\'s request across 10 microservices during an incident is nearly impossible',
    'Alert on the Four Golden Signals; instrument your SLOs as Prometheus recording rules so you can track error budget burn rate in real time',
    'Sampling matters: logging every single request at 100,000 RPS produces terabytes of data per day. Sample verbose DEBUG logs at 1%; always log errors and slow requests at 100%',
  ],
}
