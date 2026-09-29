const Incident = require('./models/Incident');
const Resolution = require('./models/Resolution');
const hindsight = require('./services/hindsight');
const incidentAgent = require('./services/incidentAgent');

const historicalMemories = [
  {
    incidentId: 'INC-101',
    service: 'payment-service',
    symptoms: ['HTTP 500', 'Database timeout', 'MongoWaitQueueTimeoutError', 'Connections 100/100'],
    rootCause: 'Database connection leak in payment checkout retry handler after deployment v2.1.0',
    fix: 'Wrapped DB session in try-finally block to enforce release, increased connection pool limit to 150, deployed patch v2.1.1',
    verification: 'Monitored connection pool utilization: active connections dropped from 100 to 14. Error rate returned to 0%.',
    retainedAt: new Date(Date.now() - 86400000 * 21).toISOString(),
  },
  {
    incidentId: 'INC-084',
    service: 'auth-service',
    symptoms: ['HTTP 504 Gateway Timeout', 'Redis pool exhausted', 'Token validation latency'],
    rootCause: 'Redis connection handle leak during high-concurrency JWT verification',
    fix: 'Replaced singleton connection with thread-safe client pool and configured maxIdleTime of 5000ms',
    verification: 'P99 latency decreased from 4,200ms to 42ms under 10k request/sec load test.',
    retainedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    incidentId: 'INC-055',
    service: 'inventory-api',
    symptoms: ['Pessimistic lock wait timeout', 'Database deadlock', 'Inventory reserve failure'],
    rootCause: 'Unordered row locking during multi-item shopping cart inventory deduction',
    fix: 'Implemented deterministic ascending sort on SKU IDs before executing batch SQL SELECT FOR UPDATE',
    verification: 'Zero database deadlocks reported across 50,000 automated checkout load cycles.',
    retainedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
];

const seedIncidents = [
  {
    incidentId: 'INC-101',
    title: 'Database connection pool exhausted after deployment',
    service: 'payment-service',
    environment: 'production',
    severity: 'SEV-1',
    status: 'Resolved',
    errorLogs: `2026-09-08T14:22:01.402Z [ERROR] payment-service: MongoWaitQueueTimeoutError: Timed out waiting for a connection from the pool after 30000ms
at ConnectionPool.checkOut (/app/node_modules/mongodb/lib/cmap/connection_pool.js:520:15)
at PaymentHandler.processCheckout (/app/src/handlers/payment.js:84:12)`,
    symptoms: ['HTTP 500', 'Database timeout', 'MongoWaitQueueTimeoutError', 'Connections 100/100'],
    trigger: 'v2.1.0 release with payment retry logic',
  },
  {
    incidentId: 'INC-084',
    title: 'Auth API latency spike under peak traffic',
    service: 'auth-service',
    environment: 'production',
    severity: 'SEV-2',
    status: 'Resolved',
    errorLogs: `2026-07-30T09:15:22.100Z [ERROR] auth-service: RedisConnectionPoolError: Connection limit of 50 exceeded.
at RedisPool.acquire (/app/src/utils/redis.js:45:10)`,
    symptoms: ['HTTP 504 Gateway Timeout', 'Redis pool exhausted', 'Token validation latency'],
    trigger: 'Morning traffic surge',
  },
  {
    incidentId: 'INC-2026-001',
    title: 'Payment API returning HTTP 500 & database connection timeout',
    service: 'payment-service',
    environment: 'production',
    severity: 'SEV-1',
    status: 'Investigating',
    errorLogs: `2026-09-29T08:42:11.102Z [ERROR] payment-service: MongoWaitQueueTimeoutError: Timed out waiting for a connection from the pool after 30000ms
at Topology.selectServer (node_modules/mongodb/lib/sdam/topology.js:312:26)
at ConnectionPool.checkOut (node_modules/mongodb/lib/cmap/connection_pool.js:520:15)
at PaymentHandler.processCheckout (/app/src/handlers/payment.js:84:12)
at async Server.handleRequest (/app/src/server.js:42:5)`,
    symptoms: ['HTTP 500 responses', 'Slow payment processing', 'Database connections exhausted (100/100)', 'Failed transactions'],
    trigger: 'Deployment of v2.4.0 payment gateway handler',
  },
];

async function seedDatabase() {
  console.log('[Seed] Seeding RecallOps database and Hindsight memories...');

  // 1. Seed Hindsight Memories
  hindsight.seedMemories(historicalMemories);

  // 2. Also attempt live Hindsight retain calls for historical memories
  for (const mem of historicalMemories) {
    await hindsight.retain(mem);
  }

  // 3. Clear existing Mongo collection
  await Incident.deleteMany({});
  await Resolution.deleteMany({});

  // 4. Insert historical resolved incidents and resolutions
  for (const incData of seedIncidents) {
    const inc = new Incident(incData);
    await inc.save();

    if (incData.status === 'Resolved') {
      const matchingMem = historicalMemories.find((m) => m.incidentId === incData.incidentId);
      if (matchingMem) {
        await Resolution.create({
          incidentId: incData.incidentId,
          rootCause: matchingMem.rootCause,
          fix: matchingMem.fix,
          verification: matchingMem.verification,
          outcomeVerified: true,
          retainedToHindsight: true,
        });
      }
    }
  }

  // 5. Run initial AI analysis on active incident INC-2026-001
  try {
    await incidentAgent.analyzeIncident('INC-2026-001');
  } catch (e) {
    console.warn('[Seed] Could not run initial analysis on INC-2026-001:', e.message);
  }

  console.log('[Seed] Database & Hindsight Memory seed completed successfully.');
}

module.exports = { seedDatabase, historicalMemories };
