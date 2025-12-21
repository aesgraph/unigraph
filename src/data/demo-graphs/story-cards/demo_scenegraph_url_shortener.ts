import { DEFAULT_APP_CONFIG } from "../../../AppConfig";
import { PresetLayoutType } from "../../../core/layouts/layoutEngineTypes";
import { Graph } from "../../../core/model/Graph";
import { createEdgesTo } from "../../../core/model/GraphUtils";
import { SceneGraph } from "../../../core/model/SceneGraph";
import { extractPositionsFromNodes } from "../../graphs/blobMesh";

export const demo_URL_Shortener = () => {
  const graph = new Graph();

  // Root node - Overview at center
  const urlShortenerOverview = graph.createNode({
    id: "URL Shortener System Design",
    type: "storyCard",
    position: { x: 0, y: 0, z: 0 },
    userData: {
      title: "URL Shortener System Design",
      description:
        "A comprehensive system design for a URL shortener service like Bitly. This covers the redirect hot path, URL encoding, caching strategies, analytics, and all aspects needed for a senior system design interview.",
      tags: [
        "system design",
        "url shortener",
        "bitly",
        "redirect",
        "distributed systems",
      ],
    },
  });

  // ========== CORE COMPONENTS ==========
  // Core components in a ring around overview (radius 400)
  const coreRadius = 400;
  const coreComponentsData = [
    { id: "Redirect Service", angle: 0 },
    { id: "Edge/CDN", angle: (2 * Math.PI * 1) / 6 },
    { id: "Redis Cache", angle: (2 * Math.PI * 2) / 6 },
    { id: "KV Shard", angle: (2 * Math.PI * 3) / 6 },
    { id: "Event Queue", angle: (2 * Math.PI * 4) / 6 },
    { id: "URL Creation Service", angle: (2 * Math.PI * 5) / 6 },
  ];

  const redirectService = graph.createNode({
    id: "Redirect Service",
    type: "storyCard",
    position: {
      x: coreRadius * Math.cos(coreComponentsData[0].angle),
      y: coreRadius * Math.sin(coreComponentsData[0].angle),
      z: 0,
    },
    userData: {
      title: "Redirect Service",
      description:
        "The Redirect Service is the core component that handles redirect requests. It resolves short codes to long URLs, checks cache first (hot path), falls back to persistent storage on cache miss, and issues HTTP redirects (301/302). It also handles URL creation, validation, and analytics event generation.",
      tags: ["redirect", "service", "core", "hot path"],
    },
  });

  const edgeCdn = graph.createNode({
    id: "Edge/CDN",
    type: "storyCard",
    position: {
      x: coreRadius * Math.cos(coreComponentsData[1].angle),
      y: coreRadius * Math.sin(coreComponentsData[1].angle),
      z: 0,
    },
    userData: {
      title: "Edge/CDN",
      description:
        "Edge/CDN layer provides geographic distribution and caching at the edge. It can cache redirect responses to reduce latency and load on the Redirect Service. On cache miss, it forwards requests to the Redirect Service. CDN reduces global latency and improves availability.",
      tags: ["edge", "cdn", "caching", "geographic distribution"],
    },
  });

  const redisCache = graph.createNode({
    id: "Redis Cache",
    type: "storyCard",
    position: {
      x: coreRadius * Math.cos(coreComponentsData[2].angle),
      y: coreRadius * Math.sin(coreComponentsData[2].angle),
      z: 0,
    },
    userData: {
      title: "Redis Cache",
      description:
        "Redis Cache stores hot redirect mappings (short code → long URL + flags) for fast lookup. It's the first layer in the hot path, providing sub-millisecond response times. Cache-aside pattern: read on miss, write-through or write-back for updates. TTL-based eviction manages memory.",
      tags: ["redis", "cache", "hot path", "in-memory"],
    },
  });

  const kvShard = graph.createNode({
    id: "KV Shard",
    type: "storyCard",
    position: {
      x: coreRadius * Math.cos(coreComponentsData[3].angle),
      y: coreRadius * Math.sin(coreComponentsData[3].angle),
      z: 0,
    },
    userData: {
      title: "KV Shard",
      description:
        "KV Shard is the persistent key-value store that holds the authoritative mapping of short codes to long URLs and associated metadata (flags, expiration, user info). Sharded for scalability. Provides durability and serves as the source of truth when cache misses occur.",
      tags: ["database", "kv store", "sharding", "persistent storage"],
    },
  });

  const eventQueue = graph.createNode({
    id: "Event Queue",
    type: "storyCard",
    position: {
      x: coreRadius * Math.cos(coreComponentsData[4].angle),
      y: coreRadius * Math.sin(coreComponentsData[4].angle),
      z: 0,
    },
    userData: {
      title: "Event Queue",
      description:
        "Event Queue handles asynchronous processing of click events and analytics. Redirect Service publishes click events (code, timestamp, IP, user-agent) to the queue. Consumers process events for analytics, fraud detection, and reporting. Decouples redirect path from analytics processing.",
      tags: ["queue", "events", "analytics", "async processing"],
    },
  });

  const urlCreationService = graph.createNode({
    id: "URL Creation Service",
    type: "storyCard",
    position: {
      x: coreRadius * Math.cos(coreComponentsData[5].angle),
      y: coreRadius * Math.sin(coreComponentsData[5].angle),
      z: 0,
    },
    userData: {
      title: "URL Creation Service",
      description:
        "URL Creation Service handles the creation of short URLs. It generates unique short codes, validates long URLs, stores mappings in KV Shard, warms cache, and returns short URLs to users. Handles custom aliases, expiration dates, and user authentication.",
      tags: ["url creation", "short code generation", "validation"],
    },
  });

  // ========== REDIRECT HOT PATH ==========
  // Redirect Hot Path - horizontal flow (left to right)
  const redirectHotPath = graph.createNode({
    id: "Redirect Hot Path",
    type: "storyCard",
    position: { x: -600, y: -300, z: 0 },
    userData: {
      title: "Redirect Hot Path",
      description:
        "The redirect hot path is the critical performance path for handling redirect requests. Flow: Client → Edge/CDN (optional) → Redirect Service → Redis Cache (check) → KV Shard (on miss) → Response. Optimized for low latency with caching at multiple layers. Async operations (cache warming, analytics) don't block the hot path.",
      tags: ["hot path", "redirect flow", "performance", "latency"],
    },
  });

  const cacheHitPath = graph.createNode({
    id: "Cache Hit Path",
    type: "storyCard",
    position: { x: -300, y: -300, z: 0 },
    userData: {
      title: "Cache Hit Path",
      description:
        "Cache hit path is the fastest path: Client request → Edge/CDN → Redirect Service → Redis Cache (hit) → 302/301 redirect response. Sub-millisecond response times. Most requests follow this path for popular URLs. Cache hit rate is a key performance metric.",
      tags: ["cache hit", "fast path", "performance", "latency"],
    },
  });

  const cacheMissPath = graph.createNode({
    id: "Cache Miss Path",
    type: "storyCard",
    position: { x: 0, y: -300, z: 0 },
    userData: {
      title: "Cache Miss Path",
      description:
        "Cache miss path: Redis Cache miss → Redirect Service queries KV Shard → Retrieves longURL + flags → Async cache warming (set hot entry) → Return redirect. Slightly higher latency but still optimized. Cache warming ensures subsequent requests hit cache.",
      tags: ["cache miss", "fallback", "cache warming"],
    },
  });

  const redirectResponse = graph.createNode({
    id: "Redirect Response",
    type: "storyCard",
    position: { x: 300, y: -300, z: 0 },
    userData: {
      title: "Redirect Response",
      description:
        "Redirect responses use HTTP status codes: 301 (permanent) or 302 (temporary) with Location header containing the long URL. 301 is cached longer by browsers/CDNs. Response includes appropriate headers (Cache-Control, Expires). Edge/CDN can cache responses to reduce backend load.",
      tags: ["http redirect", "301", "302", "location header"],
    },
  });

  // ========== URL ENCODING & GENERATION ==========
  // URL Encoding - below redirect service
  const shortCodeGeneration = graph.createNode({
    id: "Short Code Generation",
    type: "storyCard",
    position: { x: -400, y: 600, z: 0 },
    userData: {
      title: "Short Code Generation",
      description:
        "Short code generation creates unique identifiers for URLs. Strategies: Base62 encoding of auto-incrementing IDs, hash-based (MD5/SHA with collision handling), or random generation with collision checking. Codes must be short (6-8 chars), URL-safe, and collision-free. Database ensures uniqueness.",
      tags: ["encoding", "base62", "hash", "uniqueness"],
    },
  });

  const collisionHandling = graph.createNode({
    id: "Collision Handling",
    type: "storyCard",
    position: { x: -200, y: 600, z: 0 },
    userData: {
      title: "Collision Handling",
      description:
        "Collision handling ensures unique short codes. Strategies: Database uniqueness constraints with retry on conflict, longer codes for hash-based approaches, or checking existence before assignment. For hash collisions, append sequence numbers or use different hash algorithms.",
      tags: ["collisions", "uniqueness", "conflict resolution"],
    },
  });

  const customAliases = graph.createNode({
    id: "Custom Aliases",
    type: "storyCard",
    position: { x: 0, y: 600, z: 0 },
    userData: {
      title: "Custom Aliases",
      description:
        "Custom aliases allow users to specify their own short codes (e.g., bit.ly/mycompany). Requires validation (format, length, profanity filtering), availability checking, and reservation. Premium feature that requires authentication. Must handle conflicts gracefully.",
      tags: ["custom", "aliases", "user-defined", "validation"],
    },
  });

  // ========== CACHING STRATEGIES ==========
  // Caching Strategies - top right quadrant (around Redis)
  const cacheAsidePattern = graph.createNode({
    id: "Cache-Aside Pattern",
    type: "storyCard",
    position: { x: 600, y: 200, z: 0 },
    userData: {
      title: "Cache-Aside Pattern",
      description:
        "Cache-aside (lazy loading) pattern: application checks cache first, reads from database on miss, then writes to cache. Redirect Service uses this: check Redis → read KV Shard on miss → warm cache. Simple and effective, but requires cache invalidation on updates.",
      tags: ["cache pattern", "lazy loading", "cache-aside"],
    },
  });

  const cacheWarming = graph.createNode({
    id: "Cache Warming",
    type: "storyCard",
    position: { x: 800, y: 200, z: 0 },
    userData: {
      title: "Cache Warming",
      description:
        "Cache warming proactively loads data into cache. On cache miss, after reading from KV Shard, Redirect Service asynchronously writes to Redis (set hot entry). Pre-warming popular URLs at startup or based on analytics. Improves cache hit rates and reduces latency.",
      tags: ["cache warming", "preloading", "async", "performance"],
    },
  });

  const cacheEviction = graph.createNode({
    id: "Cache Eviction",
    type: "storyCard",
    position: { x: 600, y: 400, z: 0 },
    userData: {
      title: "Cache Eviction",
      description:
        "Cache eviction manages memory by removing entries. Strategies: TTL-based (time-to-live), LRU (Least Recently Used), LFU (Least Frequently Used), or size-based. Redis uses TTL and maxmemory policies. Eviction ensures cache doesn't grow unbounded and maintains hot data.",
      tags: ["eviction", "ttl", "lru", "memory management"],
    },
  });

  const multiLevelCaching = graph.createNode({
    id: "Multi-Level Caching",
    type: "storyCard",
    position: { x: 800, y: 400, z: 0 },
    userData: {
      title: "Multi-Level Caching",
      description:
        "Multi-level caching uses multiple cache layers: Edge/CDN (geographic), Redis (application), and potentially L1 cache in Redirect Service. Each layer reduces load on the next. Edge cache handles global distribution, Redis handles application-level caching. Improves latency and reduces backend load.",
      tags: ["multi-level", "layered caching", "edge", "redis"],
    },
  });

  // ========== STORAGE DESIGN ==========
  // Storage Design - bottom right quadrant (around KV Shard)
  const shardingStrategy = graph.createNode({
    id: "Sharding Strategy",
    type: "storyCard",
    position: { x: 600, y: -200, z: 0 },
    userData: {
      title: "Sharding Strategy",
      description:
        "Sharding distributes data across multiple KV stores. Strategies: hash-based (consistent hashing on short code), range-based, or directory-based. Ensures even distribution, enables horizontal scaling, and provides fault isolation. Replication within shards provides high availability.",
      tags: ["sharding", "partitioning", "scalability", "distribution"],
    },
  });

  const dataModel = graph.createNode({
    id: "Data Model",
    type: "storyCard",
    position: { x: 800, y: -200, z: 0 },
    userData: {
      title: "Data Model",
      description:
        "Data model stores: short_code (primary key), long_url, created_at, expires_at, user_id, click_count, flags (custom, password-protected, etc.). Indexes on short_code for fast lookups, on user_id for user queries, on expires_at for cleanup. Denormalized for read performance.",
      tags: ["data model", "schema", "indexing", "denormalization"],
    },
  });

  const replication = graph.createNode({
    id: "Replication",
    type: "storyCard",
    position: { x: 700, y: -400, z: 0 },
    userData: {
      title: "Replication",
      description:
        "Replication provides high availability and read scalability. Master-replica or multi-master replication ensures data durability. Read replicas handle read traffic, reducing load on primary. Synchronous replication for consistency, asynchronous for performance. Handles replica lag and failover.",
      tags: ["replication", "high availability", "read replicas", "failover"],
    },
  });

  // ========== ANALYTICS & EVENTS ==========
  // Analytics & Events - bottom left quadrant (around Event Queue)
  const clickEventProcessing = graph.createNode({
    id: "Click Event Processing",
    type: "storyCard",
    position: { x: -600, y: -200, z: 0 },
    userData: {
      title: "Click Event Processing",
      description:
        "Click event processing captures redirect events asynchronously. Events include: short_code, timestamp, IP address, user-agent, referrer, geolocation. Published to Event Queue (Kafka, RabbitMQ) for async processing. Doesn't block redirect hot path. Enables analytics, fraud detection, and reporting.",
      tags: ["events", "analytics", "async", "click tracking"],
    },
  });

  const analyticsPipeline = graph.createNode({
    id: "Analytics Pipeline",
    type: "storyCard",
    position: { x: -800, y: -200, z: 0 },
    userData: {
      title: "Analytics Pipeline",
      description:
        "Analytics pipeline processes click events: Event Queue → Stream processing (Kafka Streams, Flink) → Aggregation (click counts, geographic distribution, time series) → Storage (data warehouse, time-series DB) → Dashboards and APIs. Real-time and batch processing for different use cases.",
      tags: ["analytics", "streaming", "aggregation", "reporting"],
    },
  });

  const fraudDetection = graph.createNode({
    id: "Fraud Detection",
    type: "storyCard",
    position: { x: -700, y: -400, z: 0 },
    userData: {
      title: "Fraud Detection",
      description:
        "Fraud detection identifies suspicious activity: bot traffic, click fraud, spam, malicious URLs. Analyzes patterns: click velocity, IP reputation, user-agent anomalies, geographic inconsistencies. Real-time detection blocks or flags suspicious redirects. Machine learning models improve detection over time.",
      tags: ["fraud", "security", "bot detection", "ml"],
    },
  });

  // ========== SCALABILITY ==========
  // Scalability - top center
  const horizontalScaling = graph.createNode({
    id: "Horizontal Scaling",
    type: "storyCard",
    position: { x: 0, y: 800, z: 0 },
    userData: {
      title: "Horizontal Scaling",
      description:
        "Horizontal scaling adds more Redirect Service instances to handle increased load. Stateless services enable easy scaling. Load balancer distributes requests. Auto-scaling based on metrics (CPU, request rate, queue depth). Sharding enables database scaling. CDN provides geographic scaling.",
      tags: ["scaling", "horizontal", "stateless", "load balancer"],
    },
  });

  const readWriteSeparation = graph.createNode({
    id: "Read-Write Separation",
    type: "storyCard",
    position: { x: -200, y: 800, z: 0 },
    userData: {
      title: "Read-Write Separation",
      description:
        "Read-write separation optimizes for different access patterns. Redirects are read-heavy (millions/sec), URL creation is write-heavy (thousands/sec). Read replicas handle redirect lookups, primary handles writes. Caching further reduces read load. Enables independent scaling of read and write capacity.",
      tags: ["read replicas", "write optimization", "scalability"],
    },
  });

  const rateLimiting = graph.createNode({
    id: "Rate Limiting",
    type: "storyCard",
    position: { x: 200, y: 800, z: 0 },
    userData: {
      title: "Rate Limiting",
      description:
        "Rate limiting protects the system from abuse and ensures fair usage. Limits: per IP, per user, per short code. Token bucket or sliding window algorithms. Enforced at Edge/CDN or Redirect Service. Returns 429 (Too Many Requests) when exceeded. Prevents DDoS and ensures service availability.",
      tags: ["rate limiting", "throttling", "ddos protection", "429"],
    },
  });

  // ========== SECURITY ==========
  // Security - top left quadrant
  const urlValidation = graph.createNode({
    id: "URL Validation",
    type: "storyCard",
    position: { x: -600, y: 200, z: 0 },
    userData: {
      title: "URL Validation",
      description:
        "URL validation ensures only legitimate URLs are shortened. Checks: valid URL format, protocol (HTTP/HTTPS), domain blacklist (malicious sites), content filtering. Prevents abuse, phishing, and malicious redirects. Real-time validation during URL creation. Periodic re-validation of existing URLs.",
      tags: ["validation", "security", "phishing", "blacklist"],
    },
  });

  const passwordProtection = graph.createNode({
    id: "Password Protection",
    type: "storyCard",
    position: { x: -800, y: 200, z: 0 },
    userData: {
      title: "Password Protection",
      description:
        "Password protection allows users to require a password before redirect. Short URL creation includes optional password (hashed). Redirect Service prompts for password, validates, then redirects. Stored securely (bcrypt/argon2). Premium feature for sensitive links.",
      tags: ["password", "security", "authentication", "hashing"],
    },
  });

  const expiration = graph.createNode({
    id: "Expiration",
    type: "storyCard",
    position: { x: -700, y: 400, z: 0 },
    userData: {
      title: "Expiration",
      description:
        "Expiration allows URLs to expire after a set time. Stored in data model (expires_at). Redirect Service checks expiration before redirecting. Expired URLs return 410 (Gone) or custom error page. Background job cleans up expired entries. Cache respects expiration TTL.",
      tags: ["expiration", "ttl", "cleanup", "410"],
    },
  });

  // ========== API & INTERFACES ==========
  // API & Interfaces - bottom center
  const restApi = graph.createNode({
    id: "REST API",
    type: "storyCard",
    position: { x: -200, y: -600, z: 0 },
    userData: {
      title: "REST API",
      description:
        "REST API provides programmatic access: POST /api/v1/shorten (create), GET /{code} (redirect), GET /api/v1/analytics/{code} (stats), DELETE /api/v1/{code} (delete). Versioned, authenticated (API keys, OAuth), rate-limited. OpenAPI documentation. Used by web UI, mobile apps, integrations.",
      tags: ["api", "rest", "programmatic", "integration"],
    },
  });

  const webUI = graph.createNode({
    id: "Web UI",
    type: "storyCard",
    position: { x: 200, y: -600, z: 0 },
    userData: {
      title: "Web UI",
      description:
        "Web UI provides user interface: URL shortening form, dashboard with analytics (click counts, geographic maps, time series), link management (edit, delete, expire), custom alias creation. Real-time updates, responsive design. Authenticated users can manage their links.",
      tags: ["ui", "web interface", "dashboard", "analytics"],
    },
  });

  // ========== CREATE EDGES ==========

  // Core components from overview
  createEdgesTo(
    graph,
    urlShortenerOverview.getId(),
    [
      redirectService,
      edgeCdn,
      redisCache,
      kvShard,
      eventQueue,
      urlCreationService,
    ].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Redirect hot path from redirect service
  createEdgesTo(
    graph,
    redirectService.getId(),
    [redirectHotPath, cacheHitPath, cacheMissPath, redirectResponse].map(
      (node) => node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // URL encoding from URL creation service
  createEdgesTo(
    graph,
    urlCreationService.getId(),
    [shortCodeGeneration, collisionHandling, customAliases].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Caching strategies from Redis cache
  createEdgesTo(
    graph,
    redisCache.getId(),
    [cacheAsidePattern, cacheWarming, cacheEviction, multiLevelCaching].map(
      (node) => node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Storage design from KV shard
  createEdgesTo(
    graph,
    kvShard.getId(),
    [shardingStrategy, dataModel, replication].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Analytics from event queue
  createEdgesTo(
    graph,
    eventQueue.getId(),
    [clickEventProcessing, analyticsPipeline, fraudDetection].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Scalability from overview
  createEdgesTo(
    graph,
    urlShortenerOverview.getId(),
    [horizontalScaling, readWriteSeparation, rateLimiting].map((node) =>
      node.getId()
    ),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Security from overview
  createEdgesTo(
    graph,
    urlShortenerOverview.getId(),
    [urlValidation, passwordProtection, expiration].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // API & Interfaces from overview
  createEdgesTo(
    graph,
    urlShortenerOverview.getId(),
    [restApi, webUI].map((node) => node.getId()),
    { type: "StoryChoice", tags: ["EntryPoint"] }
  );

  // Cross-connections for better navigation
  graph.createEdge(redirectHotPath.getId(), cacheHitPath.getId(), {
    type: "StoryChoice",
    label: "Cache Hit",
  });

  graph.createEdge(redirectHotPath.getId(), cacheMissPath.getId(), {
    type: "StoryChoice",
    label: "Cache Miss",
  });

  graph.createEdge(cacheMissPath.getId(), cacheWarming.getId(), {
    type: "StoryChoice",
    label: "Warm Cache",
  });

  graph.createEdge(shortCodeGeneration.getId(), collisionHandling.getId(), {
    type: "StoryChoice",
    label: "Handle Collisions",
  });

  graph.createEdge(clickEventProcessing.getId(), analyticsPipeline.getId(), {
    type: "StoryChoice",
    label: "Process",
  });

  graph.createEdge(analyticsPipeline.getId(), fraudDetection.getId(), {
    type: "StoryChoice",
    label: "Detect Fraud",
  });

  graph.createEdge(horizontalScaling.getId(), readWriteSeparation.getId(), {
    type: "StoryChoice",
    label: "Optimize",
  });

  graph.createEdge(urlValidation.getId(), passwordProtection.getId(), {
    type: "StoryChoice",
    label: "Secure",
  });

  const sceneGraph = new SceneGraph({
    graph,
    metadata: {
      name: "URL Shortener System Design",
      description:
        "A comprehensive system design diagram for a URL shortener service like Bitly, covering the redirect hot path, caching, storage, analytics, and all aspects needed for a senior system design interview.",
    },
    defaultAppConfig: {
      ...DEFAULT_APP_CONFIG(),
      activeLayout: PresetLayoutType.NodePositions,
      activeView: "ReactFlow",
    },
  });

  // Extract positions from nodes and set them in displayConfig.nodePositions
  // This is required for NodePositions layout to work properly
  const positions = extractPositionsFromNodes(sceneGraph);
  sceneGraph.setNodePositions(positions);

  return sceneGraph;
};
