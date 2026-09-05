import mongoose from 'mongoose';
import { env } from './env.js';

const readyStateLabels: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export function getDatabaseState() {
  return readyStateLabels[mongoose.connection.readyState] ?? 'unknown';
}

export function formatMongoConnectionTarget(uri: string) {
  try {
    const parsedUri = new URL(uri);
    const databaseName = parsedUri.pathname && parsedUri.pathname !== '/' ? parsedUri.pathname : '/<database>';

    return `${parsedUri.protocol}//${parsedUri.host}${databaseName}`;
  } catch {
    return '<invalid MongoDB URI>';
  }
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
  });

  console.info(`[api] MongoDB connected: ${formatMongoConnectionTarget(env.MONGODB_URI)}`);
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  console.info('[api] MongoDB disconnected');
}
