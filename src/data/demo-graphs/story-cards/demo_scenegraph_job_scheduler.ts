import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { Graph } from "../../../core/model/Graph";
import { createEdgesTo } from "../../../core/model/GraphUtils";
import { SceneGraph } from "../../../core/model/SceneGraph";

export const demo_Job_Scheduler = () => {
  const graph = new Graph();

  // Root node
  const jobSchedulerOverview = graph.createNode({
    id: "Job Scheduler System Design",
    type: "storyCard",
    userData: {
      title: "Job Scheduler System Design",
      description:
        "A comprehensive system design for a distributed job scheduler like Apache Airflow. This covers architecture, components, scalability, fault tolerance, and all aspects needed for a senior system design interview.",
      tags: [
        "system design",
        "job scheduler",
        "airflow",
        "distributed systems",
      ],
    },
  });

  // ========== CORE COMPONENTS ==========
  const schedulerComponent = graph.createNode({
    id: "Scheduler Component",
    type: "storyCard",
    userData: {
      title: "Scheduler Component",
      description:
        "The scheduler is the master component responsible for parsing DAGs, determining task dependencies, scheduling tasks based on their dependencies and schedule intervals, and queuing tasks for execution. It runs continuously, checking for tasks that need to be scheduled and managing the overall workflow execution.",
      tags: ["scheduler", "master", "dag parsing", "task scheduling"],
    },
  });

  const executorComponent = graph.createNode({
    id: "Executor Component",
    type: "storyCard",
    userData: {
      title: "Executor Component",
      description:
        "The executor is responsible for actually running tasks. It receives tasks from the scheduler, manages task execution, handles retries, and reports task status back to the scheduler. Different executor types (LocalExecutor, CeleryExecutor, KubernetesExecutor) provide different execution models.",
      tags: ["executor", "task execution", "workers", "execution model"],
    },
  });

  const webServerComponent = graph.createNode({
    id: "Web Server Component",
    type: "storyCard",
    userData: {
      title: "Web Server Component",
      description:
        "The web server provides a user interface for monitoring and managing workflows. It displays DAG visualizations, task status, logs, and allows users to trigger, pause, and manage DAGs. It also exposes REST APIs for programmatic access.",
      tags: ["web server", "ui", "monitoring", "rest api"],
    },
  });

  const metadataDatabase = graph.createNode({
    id: "Metadata Database",
    type: "storyCard",
    userData: {
      title: "Metadata Database",
      description:
        "The metadata database stores all state information including DAG definitions, task instances, execution history, connections, variables, and XComs. It's typically a relational database (PostgreSQL, MySQL) that serves as the single source of truth for the scheduler state.",
      tags: ["database", "metadata", "state management", "postgresql"],
    },
  });

  const workerNodes = graph.createNode({
    id: "Worker Nodes",
    type: "storyCard",
    userData: {
      title: "Worker Nodes",
      description:
        "Worker nodes are the compute resources that execute tasks. They pull tasks from queues, execute them in isolated environments (containers, processes), and report results back. Workers can be scaled horizontally to handle increased load.",
      tags: ["workers", "compute", "task execution", "scalability"],
    },
  });

  // ========== KEY CONCEPTS ==========
  const dagsConcept = graph.createNode({
    id: "DAGs (Directed Acyclic Graphs)",
    type: "storyCard",
    userData: {
      title: "DAGs (Directed Acyclic Graphs)",
      description:
        "DAGs are the fundamental abstraction in job schedulers. They represent workflows as directed graphs where nodes are tasks and edges are dependencies. DAGs must be acyclic to prevent infinite loops. They define the structure, schedule, and dependencies of workflows.",
      tags: ["dag", "workflow", "graph", "dependencies"],
    },
  });

  const tasksConcept = graph.createNode({
    id: "Tasks",
    type: "storyCard",
    userData: {
      title: "Tasks",
      description:
        "Tasks are the atomic units of work in a DAG. Each task represents a single operation (e.g., running a Python script, executing a SQL query, calling an API). Tasks have states (queued, running, success, failed, skipped) and can have dependencies on other tasks.",
      tags: ["tasks", "atomic operations", "task states", "execution units"],
    },
  });

  const taskDependencies = graph.createNode({
    id: "Task Dependencies",
    type: "storyCard",
    userData: {
      title: "Task Dependencies",
      description:
        "Task dependencies define the execution order of tasks. They can be upstream (prerequisites) or downstream (dependents). The scheduler uses dependency graphs to determine which tasks are ready to run. Dependencies can be linear, branching, or complex graphs.",
      tags: ["dependencies", "execution order", "upstream", "downstream"],
    },
  });

  const schedulingAlgorithms = graph.createNode({
    id: "Scheduling Algorithms",
    type: "storyCard",
    userData: {
      title: "Scheduling Algorithms",
      description:
        "Scheduling algorithms determine when and how tasks are scheduled. Key considerations include: schedule intervals (cron expressions), backfilling (running historical tasks), catchup behavior, and priority-based scheduling. The scheduler must handle time zones, daylight saving time, and schedule conflicts.",
      tags: ["scheduling", "algorithms", "cron", "backfilling", "priority"],
    },
  });

  const executionModels = graph.createNode({
    id: "Execution Models",
    type: "storyCard",
    userData: {
      title: "Execution Models",
      description:
        "Different execution models provide different ways to run tasks: LocalExecutor (single machine), CeleryExecutor (distributed with message queue), KubernetesExecutor (containerized), SequentialExecutor (single-threaded). Each has trade-offs in scalability, isolation, and resource management.",
      tags: ["execution", "local", "celery", "kubernetes", "distributed"],
    },
  });

  // ========== ARCHITECTURE PATTERNS ==========
  const masterWorkerPattern = graph.createNode({
    id: "Master-Worker Pattern",
    type: "storyCard",
    userData: {
      title: "Master-Worker Pattern",
      description:
        "The master-worker pattern is the core architecture: the scheduler (master) coordinates work distribution, while workers execute tasks. The master maintains state, makes scheduling decisions, and monitors worker health. Workers are stateless and can be added/removed dynamically.",
      tags: ["architecture", "master-worker", "coordination", "distributed"],
    },
  });

  const queueBasedExecution = graph.createNode({
    id: "Queue-Based Execution",
    type: "storyCard",
    userData: {
      title: "Queue-Based Execution",
      description:
        "Queue-based execution decouples scheduling from execution. The scheduler enqueues tasks to queues (often organized by priority or resource type), and workers pull tasks from queues. This enables better load distribution, priority handling, and fault tolerance.",
      tags: ["queues", "message queue", "task queue", "decoupling"],
    },
  });

  const stateManagement = graph.createNode({
    id: "State Management",
    type: "storyCard",
    userData: {
      title: "State Management",
      description:
        "State management tracks task and DAG run states throughout their lifecycle. States include: queued, running, success, failed, skipped, retry, up_for_retry, up_for_reschedule. State transitions must be atomic and consistent to prevent race conditions and ensure correctness.",
      tags: ["state", "state machine", "consistency", "atomic operations"],
    },
  });

  const distributedExecution = graph.createNode({
    id: "Distributed Execution",
    type: "storyCard",
    userData: {
      title: "Distributed Execution",
      description:
        "Distributed execution allows tasks to run across multiple machines, enabling horizontal scaling and fault tolerance. It requires coordination mechanisms (message queues, distributed locks), network communication, and handling of partial failures and network partitions.",
      tags: ["distributed", "scalability", "coordination", "network"],
    },
  });

  // ========== SCALABILITY ==========
  const horizontalScaling = graph.createNode({
    id: "Horizontal Scaling",
    type: "storyCard",
    userData: {
      title: "Horizontal Scaling",
      description:
        "Horizontal scaling involves adding more worker nodes to handle increased load. Key considerations: load balancing across workers, avoiding hotspots, efficient task distribution, and maintaining consistency. Auto-scaling can dynamically adjust worker count based on queue depth and resource utilization.",
      tags: ["scaling", "horizontal", "load balancing", "auto-scaling"],
    },
  });

  const resourceManagement = graph.createNode({
    id: "Resource Management",
    type: "storyCard",
    userData: {
      title: "Resource Management",
      description:
        "Resource management ensures tasks get appropriate compute resources (CPU, memory, GPU, disk). Pools and slots limit concurrent task execution. Resource quotas prevent resource exhaustion. Resource-aware scheduling considers worker capacity and task requirements.",
      tags: ["resources", "pools", "slots", "quotas", "capacity"],
    },
  });

  const loadBalancing = graph.createNode({
    id: "Load Balancing",
    type: "storyCard",
    userData: {
      title: "Load Balancing",
      description:
        "Load balancing distributes tasks evenly across workers to maximize throughput and minimize latency. Strategies include: round-robin, least-loaded, priority-based, and resource-aware. Queue-based systems naturally provide load balancing as workers pull from shared queues.",
      tags: ["load balancing", "distribution", "throughput", "latency"],
    },
  });

  // ========== FAULT TOLERANCE ==========
  const taskRetries = graph.createNode({
    id: "Task Retries",
    type: "storyCard",
    userData: {
      title: "Task Retries",
      description:
        "Task retries handle transient failures by automatically retrying failed tasks. Configuration includes: max retries, retry delay (exponential backoff), retry conditions (which exceptions trigger retries). Retries must be idempotent and handle partial failures gracefully.",
      tags: [
        "retries",
        "fault tolerance",
        "exponential backoff",
        "idempotency",
      ],
    },
  });

  const failureHandling = graph.createNode({
    id: "Failure Handling",
    type: "storyCard",
    userData: {
      title: "Failure Handling",
      description:
        "Failure handling strategies include: task-level retries, DAG-level failure callbacks, alerting on failures, dead letter queues for permanently failed tasks, and graceful degradation. The system must distinguish between transient and permanent failures.",
      tags: ["failure", "error handling", "callbacks", "alerting"],
    },
  });

  const checkpointing = graph.createNode({
    id: "Checkpointing",
    type: "storyCard",
    userData: {
      title: "Checkpointing",
      description:
        "Checkpointing saves intermediate state to enable recovery from failures. This includes: task state persistence, XComs (cross-communication) for passing data between tasks, and periodic state snapshots. Checkpointing enables resuming workflows from failure points.",
      tags: ["checkpointing", "state persistence", "xcoms", "recovery"],
    },
  });

  const stateRecovery = graph.createNode({
    id: "State Recovery",
    type: "storyCard",
    userData: {
      title: "State Recovery",
      description:
        "State recovery restores system state after failures. This includes: database replication for metadata, task state reconstruction from logs, orphaned task detection and cleanup, and ensuring exactly-once or at-least-once semantics depending on requirements.",
      tags: ["recovery", "replication", "orphaned tasks", "semantics"],
    },
  });

  // ========== MONITORING & OBSERVABILITY ==========
  const logging = graph.createNode({
    id: "Logging",
    type: "storyCard",
    userData: {
      title: "Logging",
      description:
        "Comprehensive logging captures task execution logs, scheduler decisions, errors, and system events. Logs are stored centrally (object storage, log aggregation systems) with retention policies. Structured logging enables better searchability and analysis.",
      tags: ["logging", "logs", "debugging", "troubleshooting"],
    },
  });

  const metrics = graph.createNode({
    id: "Metrics",
    type: "storyCard",
    userData: {
      title: "Metrics",
      description:
        "Metrics track system health and performance: task execution times, success/failure rates, queue depths, worker utilization, scheduler latency, and resource usage. Metrics are collected via time-series databases (Prometheus, InfluxDB) and visualized in dashboards.",
      tags: ["metrics", "monitoring", "performance", "time-series"],
    },
  });

  const alerting = graph.createNode({
    id: "Alerting",
    type: "storyCard",
    userData: {
      title: "Alerting",
      description:
        "Alerting notifies operators of issues: task failures, SLA violations, system degradation, resource exhaustion. Alerting rules define thresholds and conditions. Integration with PagerDuty, Slack, email enables timely incident response.",
      tags: ["alerting", "notifications", "sla", "incident response"],
    },
  });

  const taskHistory = graph.createNode({
    id: "Task History",
    type: "storyCard",
    userData: {
      title: "Task History",
      description:
        "Task history maintains a record of all task executions: start/end times, duration, status, logs, and metadata. This enables auditing, debugging, performance analysis, and compliance. History is typically stored in the metadata database with archival policies.",
      tags: ["history", "auditing", "debugging", "compliance"],
    },
  });

  // ========== STORAGE ==========
  const metadataStorage = graph.createNode({
    id: "Metadata Storage",
    type: "storyCard",
    userData: {
      title: "Metadata Storage",
      description:
        "Metadata storage (relational database) stores DAG definitions, task instances, execution history, connections, variables, XComs, and user permissions. It must support ACID transactions, indexing for fast queries, and replication for high availability.",
      tags: ["storage", "database", "metadata", "acid", "replication"],
    },
  });

  const logStorage = graph.createNode({
    id: "Log Storage",
    type: "storyCard",
    userData: {
      title: "Log Storage",
      description:
        "Log storage (object storage like S3, GCS) stores task execution logs. Logs are organized by DAG, task, and execution date. Retention policies manage storage costs. Logs are accessed via APIs or web UI for debugging and auditing.",
      tags: ["logs", "object storage", "s3", "retention", "debugging"],
    },
  });

  const artifactStorage = graph.createNode({
    id: "Artifact Storage",
    type: "storyCard",
    userData: {
      title: "Artifact Storage",
      description:
        "Artifact storage stores outputs from tasks: generated files, data artifacts, model checkpoints. This enables task outputs to be shared between tasks or preserved for later use. Storage can be local filesystem, object storage, or distributed file systems.",
      tags: ["artifacts", "outputs", "files", "data sharing"],
    },
  });

  // ========== SECURITY ==========
  const authentication = graph.createNode({
    id: "Authentication",
    type: "storyCard",
    userData: {
      title: "Authentication",
      description:
        "Authentication verifies user identity. Methods include: username/password, OAuth (Google, GitHub), LDAP/Active Directory integration, and SSO. Session management handles user sessions securely. Multi-factor authentication adds additional security layers.",
      tags: ["authentication", "oauth", "ldap", "sso", "mfa"],
    },
  });

  const authorization = graph.createNode({
    id: "Authorization",
    type: "storyCard",
    userData: {
      title: "Authorization",
      description:
        "Authorization controls what users can do: RBAC (Role-Based Access Control) defines roles (Admin, User, Viewer) with permissions (read, write, delete DAGs, trigger tasks). Fine-grained permissions control access to specific DAGs, connections, and variables.",
      tags: ["authorization", "rbac", "permissions", "access control"],
    },
  });

  const secretsManagement = graph.createNode({
    id: "Secrets Management",
    type: "storyCard",
    userData: {
      title: "Secrets Management",
      description:
        "Secrets management securely stores sensitive information: API keys, database passwords, tokens. Integration with secret managers (AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets) ensures secrets are encrypted at rest and in transit, with rotation capabilities.",
      tags: ["secrets", "security", "encryption", "vault"],
    },
  });

  // ========== API & INTERFACES ==========
  const restApi = graph.createNode({
    id: "REST API",
    type: "storyCard",
    userData: {
      title: "REST API",
      description:
        "REST API provides programmatic access to scheduler functionality: trigger DAGs, query task status, retrieve logs, manage connections/variables. API endpoints are versioned, authenticated, and rate-limited. OpenAPI/Swagger documentation enables easy integration.",
      tags: ["api", "rest", "programmatic", "integration"],
    },
  });

  const cli = graph.createNode({
    id: "CLI",
    type: "storyCard",
    userData: {
      title: "CLI",
      description:
        "Command-line interface enables scripted interactions: triggering DAGs, checking status, managing connections, testing tasks locally. CLI commands are idempotent and support automation workflows. Integration with CI/CD pipelines enables automated deployments.",
      tags: ["cli", "command line", "automation", "cicd"],
    },
  });

  const webUI = graph.createNode({
    id: "Web UI",
    type: "storyCard",
    userData: {
      title: "Web UI",
      description:
        "Web UI provides visual interface for monitoring and management: DAG visualization (graph view, tree view, Gantt chart), task status dashboard, log viewer, task instance details, and workflow controls (trigger, pause, clear). Real-time updates show current system state.",
      tags: ["ui", "web interface", "visualization", "monitoring"],
    },
  });

  const programmaticApi = graph.createNode({
    id: "Programmatic API",
    type: "storyCard",
    userData: {
      title: "Programmatic API",
      description:
        "Programmatic APIs (Python SDK, Java client) enable developers to define DAGs, interact with the scheduler, and build integrations. APIs abstract complexity and provide type-safe interfaces. They support async operations and batch operations for efficiency.",
      tags: ["sdk", "programmatic", "python", "integration"],
    },
  });

  // ========== ADVANCED TOPICS ==========
  const dagVersioning = graph.createNode({
    id: "DAG Versioning",
    type: "storyCard",
    userData: {
      title: "DAG Versioning",
      description:
        "DAG versioning tracks changes to workflow definitions over time. Version control (Git) integration enables DAGs to be versioned, reviewed, and deployed through CI/CD. Versioning helps with rollback, debugging, and understanding workflow evolution.",
      tags: ["versioning", "git", "cicd", "rollback"],
    },
  });

  const dynamicDagGeneration = graph.createNode({
    id: "Dynamic DAG Generation",
    type: "storyCard",
    userData: {
      title: "Dynamic DAG Generation",
      description:
        "Dynamic DAG generation creates DAGs programmatically based on configuration, data discovery, or external sources. This enables scaling to thousands of similar workflows, reducing boilerplate, and adapting to changing requirements. Common patterns include configuration-driven and code generation.",
      tags: ["dynamic", "code generation", "scalability", "automation"],
    },
  });

  const dataLineage = graph.createNode({
    id: "Data Lineage",
    type: "storyCard",
    userData: {
      title: "Data Lineage",
      description:
        "Data lineage tracks data flow through workflows: which tasks produce/consume data, data transformations, and dependencies. This enables impact analysis (what breaks if a task changes), compliance, and understanding data provenance. Lineage is visualized as graphs.",
      tags: ["lineage", "data flow", "provenance", "impact analysis"],
    },
  });

  const slaManagement = graph.createNode({
    id: "SLA Management",
    type: "storyCard",
    userData: {
      title: "SLA Management",
      description:
        "SLA (Service Level Agreement) management tracks whether workflows complete within specified time windows. SLA misses trigger alerts and notifications. SLAs help ensure business-critical workflows meet their deadlines and enable proactive issue detection.",
      tags: ["sla", "deadlines", "alerts", "business critical"],
    },
  });

  // ========== CREATE EDGES ==========

  // Core components from overview
  createEdgesTo(
    graph,
    jobSchedulerOverview.getId(),
    [
      schedulerComponent,
      executorComponent,
      webServerComponent,
      metadataDatabase,
      workerNodes,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Key concepts from scheduler
  createEdgesTo(
    graph,
    schedulerComponent.getId(),
    [
      dagsConcept,
      tasksConcept,
      taskDependencies,
      schedulingAlgorithms,
      executionModels,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Architecture patterns from executor
  createEdgesTo(
    graph,
    executorComponent.getId(),
    [
      masterWorkerPattern,
      queueBasedExecution,
      stateManagement,
      distributedExecution,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Scalability from distributed execution
  createEdgesTo(
    graph,
    distributedExecution.getId(),
    [horizontalScaling, resourceManagement, loadBalancing].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Fault tolerance from state management
  createEdgesTo(
    graph,
    stateManagement.getId(),
    [taskRetries, failureHandling, checkpointing, stateRecovery].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Monitoring from web server
  createEdgesTo(
    graph,
    webServerComponent.getId(),
    [logging, metrics, alerting, taskHistory].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Storage from metadata database
  createEdgesTo(
    graph,
    metadataDatabase.getId(),
    [metadataStorage, logStorage, artifactStorage].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Security from overview
  createEdgesTo(
    graph,
    jobSchedulerOverview.getId(),
    [authentication, authorization, secretsManagement].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // API & Interfaces from web server
  createEdgesTo(
    graph,
    webServerComponent.getId(),
    [restApi, cli, webUI, programmaticApi].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Advanced topics from overview
  createEdgesTo(
    graph,
    jobSchedulerOverview.getId(),
    [dagVersioning, dynamicDagGeneration, dataLineage, slaManagement].map(
      (node) => node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Cross-connections for better navigation
  graph.createEdge(dagsConcept.getId(), taskDependencies.getId(), {
    type: "StoryChoice",
    label: "Dependencies",
  });

  graph.createEdge(tasksConcept.getId(), taskRetries.getId(), {
    type: "StoryChoice",
    label: "Retries",
  });

  graph.createEdge(executionModels.getId(), distributedExecution.getId(), {
    type: "StoryChoice",
    label: "Distributed",
  });

  graph.createEdge(horizontalScaling.getId(), loadBalancing.getId(), {
    type: "StoryChoice",
    label: "Load Balance",
  });

  graph.createEdge(logging.getId(), logStorage.getId(), {
    type: "StoryChoice",
    label: "Storage",
  });

  graph.createEdge(metrics.getId(), alerting.getId(), {
    type: "StoryChoice",
    label: "Alerts",
  });

  graph.createEdge(authentication.getId(), authorization.getId(), {
    type: "StoryChoice",
    label: "Authorization",
  });

  graph.createEdge(restApi.getId(), programmaticApi.getId(), {
    type: "StoryChoice",
    label: "SDK",
  });

  return new SceneGraph({
    graph,
    metadata: {
      name: "Job Scheduler System Design",
      description:
        "A comprehensive system design diagram for a distributed job scheduler like Apache Airflow, covering all aspects needed for a senior system design interview.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: "dot",
      activeView: "ReactFlow",
    },
  });
};
