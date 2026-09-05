import http from 'node:http';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

let server: http.Server | null = null;
let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.info(`[api] ${signal} received, shutting down`);

  const closeServer = new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  const forceExitTimer = setTimeout(() => {
    console.error('[api] Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);

  try {
    await closeServer;
    await disconnectDatabase();
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[api] Shutdown failed: ${message}`);
    process.exit(1);
  }
}

async function startServer() {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.info(`[api] NOVIQ API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[api] NOVIQ API failed to start: ${message}`);
  process.exit(1);
});
