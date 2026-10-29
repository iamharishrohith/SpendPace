import { Pool } from "pg";

const globalForPg = globalThis;

const rawUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");

const connectionString = rawUrl;

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 25000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
  });

// Handle idle client errors without crashing the process
pool.on("error", (err) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("[DB Pool] Idle client connection closed by server:", err.message);
  }
});

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

// Connection Warm-Up Heartbeat: Pings DB every 25 seconds to keep SSL socket alive and prevent cloud pool sleep
if (!globalForPg.pgHeartbeatStarted) {
  globalForPg.pgHeartbeatStarted = true;
  setInterval(async () => {
    try {
      await pool.query("SELECT 1");
    } catch (e) {
      // Ignored: pool error listener will handle reconnect automatically
    }
  }, 25000);
}

function isTransientError(err) {
  return (
    err.code === "ECONNRESET" ||
    err.code === "ETIMEDOUT" ||
    err.code === "EPIPE" ||
    err.code === "57P01" ||
    err.code === "08006" ||
    err.code === "08001" ||
    err.code === "08004" ||
    err.message?.includes("ECONNRESET") ||
    err.message?.includes("ETIMEDOUT") ||
    err.message?.includes("Connection terminated") ||
    err.message?.includes("socket has been closed") ||
    err.message?.includes("closed unexpectedly") ||
    err.message?.includes("Client was closed")
  );
}

export async function query(text, params, maxRetries = 3) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === "development" && duration > 500) {
        console.warn(`Slow query (${duration}ms): ${text.replace(/\s+/g, ' ').substring(0, 100)}...`);
      }
      return res;
    } catch (err) {
      attempt++;
      if (isTransientError(err) && attempt <= maxRetries) {
        console.warn(`[DB Pool] Transient connection issue (${err.message}). Retrying attempt ${attempt}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(400 * attempt, 1500)));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Executes a function using a dedicated client checked out from the pool.
 * This guarantees all queries inside fn share 1 socket connection without race conditions or pool starvation.
 */
export async function withClient(fn, maxRetries = 3) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    let client;
    try {
      client = await pool.connect();
      const result = await fn(client);
      return result;
    } catch (err) {
      attempt++;
      if (isTransientError(err) && attempt <= maxRetries) {
        console.warn(`[DB Client] Transient error in withClient (${err.message}). Retrying ${attempt}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(400 * attempt, 1500)));
        continue;
      }
      throw err;
    } finally {
      if (client) client.release();
    }
  }
}