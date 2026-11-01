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
  if (!err) return false;
  const msg = err.message || "";
  const code = err.code || "";
  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EPIPE" ||
    code === "57P01" ||
    code === "08006" ||
    code === "08001" ||
    code === "08004" ||
    msg.includes("ECONNRESET") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("Connection terminated") ||
    msg.includes("socket has been closed") ||
    msg.includes("closed unexpectedly") ||
    msg.includes("Client was closed") ||
    msg.includes("read ECONNRESET")
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
export async function withClient(fn, maxRetries = 4) {
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
        const delay = Math.min(300 * Math.pow(1.5, attempt), 2000);
        console.warn(`[DB Client] Transient error in withClient (${err.message}). Retrying ${attempt}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    } finally {
      if (client) client.release();
    }
  }
}

/**
 * Executes an atomic transaction (BEGIN ... COMMIT) with automatic rollback on error.
 */
export async function withTransaction(fn, maxRetries = 3) {
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (txErr) {
      try {
        await client.query("ROLLBACK");
      } catch (rbErr) {
        console.warn("[DB Tx] Rollback failed:", rbErr.message);
      }
      throw txErr;
    }
  }, maxRetries);
}