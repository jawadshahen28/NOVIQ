import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  AdminModel,
  AnalyticsEventModel,
  CategoryModel,
  OrderModel,
  ProductModel,
  StoreSettingsModel,
} from '../models/index.js';

type ResetAction = 'PRESERVE' | 'RESET' | 'UNCERTAIN';

interface ManagedCollection {
  action: ResetAction;
  modelName: string;
  model: {
    collection: { name: string };
    countDocuments: (filter: Record<string, never>) => Promise<number>;
  };
  reason: string;
}

interface CollectionAuditRow {
  action: ResetAction;
  collectionName: string;
  count: number;
  exists: boolean;
  modelName?: string;
  reason: string;
}

interface CloudinaryAssetSource {
  collection: string;
  documentId: string;
  field: string;
}

interface CloudinaryAssetCandidate {
  inferredPublicId?: string;
  sources: CloudinaryAssetSource[];
  url: string;
}

const executeFlag = '--execute';
const confirmationFlag = '--confirm-clean-launch';

const managedCollections: ManagedCollection[] = [
  {
    action: 'PRESERVE',
    modelName: 'Admin',
    model: AdminModel,
    reason: 'Admin accounts and authentication data must be retained.',
  },
  {
    action: 'PRESERVE',
    modelName: 'StoreSettings',
    model: StoreSettingsModel,
    reason: 'Store settings are required for the website to function.',
  },
  {
    action: 'RESET',
    modelName: 'Product',
    model: ProductModel,
    reason: 'Catalog products are launch business data and can be re-entered manually.',
  },
  {
    action: 'RESET',
    modelName: 'Category',
    model: CategoryModel,
    reason: 'Catalog categories are launch business data and can be re-entered manually.',
  },
  {
    action: 'RESET',
    modelName: 'Order',
    model: OrderModel,
    reason: 'Existing orders are pre-launch/test business records.',
  },
  {
    action: 'RESET',
    modelName: 'AnalyticsEvent',
    model: AnalyticsEventModel,
    reason: 'Visitor/page-view analytics should start fresh for launch.',
  },
];

function getProjectRoot() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const scriptsDirectory = path.dirname(currentFilePath);
  const serverRoot = path.resolve(scriptsDirectory, '../..');

  return path.resolve(serverRoot, '..');
}

function getDatabase() {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error('MongoDB connection is not available');
  }

  return database;
}

function formatCount(count: number) {
  return `${count} document${count === 1 ? '' : 's'}`;
}

function safeFileName(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

function getDocumentId(document: Record<string, unknown>) {
  const id = document._id;

  return id === undefined || id === null ? '<unknown>' : String(id);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function addCloudinaryCandidate(
  candidates: Map<string, CloudinaryAssetCandidate>,
  url: string,
  source: CloudinaryAssetSource,
) {
  if (!url.includes('cloudinary.com')) {
    return;
  }

  const current = candidates.get(url);

  if (current) {
    current.sources.push(source);
    return;
  }

  const candidate: CloudinaryAssetCandidate = {
    sources: [source],
    url,
  };
  const inferredPublicId = inferCloudinaryPublicId(url);

  if (inferredPublicId) {
    candidate.inferredPublicId = inferredPublicId;
  }

  candidates.set(url, candidate);
}

function inferCloudinaryPublicId(value: string) {
  try {
    const url = new URL(value);
    const uploadMarker = '/image/upload/';
    const markerIndex = url.pathname.indexOf(uploadMarker);

    if (!url.hostname.endsWith('cloudinary.com') || markerIndex === -1) {
      return undefined;
    }

    const imagePath = decodeURIComponent(url.pathname.slice(markerIndex + uploadMarker.length));
    const withoutVersion = imagePath.replace(/^v\d+\//, '');
    const extensionIndex = withoutVersion.lastIndexOf('.');

    return extensionIndex === -1 ? withoutVersion : withoutVersion.slice(0, extensionIndex);
  } catch {
    return undefined;
  }
}

function collectCloudinaryCandidatesFromDocument(
  collectionName: string,
  document: Record<string, unknown>,
  candidates: Map<string, CloudinaryAssetCandidate>,
) {
  const documentId = getDocumentId(document);

  if (collectionName === ProductModel.collection.name) {
    asStringArray(document.images).forEach((url, index) => {
      addCloudinaryCandidate(candidates, url, {
        collection: collectionName,
        documentId,
        field: `images.${index}`,
      });
    });

    if (typeof document.primaryImage === 'string') {
      addCloudinaryCandidate(candidates, document.primaryImage, {
        collection: collectionName,
        documentId,
        field: 'primaryImage',
      });
    }
  }

  if (collectionName === CategoryModel.collection.name && typeof document.image === 'string') {
    addCloudinaryCandidate(candidates, document.image, {
      collection: collectionName,
      documentId,
      field: 'image',
    });
  }

  if (collectionName === OrderModel.collection.name) {
    const items = Array.isArray(document.items) ? document.items : [];

    items.forEach((item, index) => {
      const orderItem = asRecord(item);

      if (typeof orderItem?.image === 'string') {
        addCloudinaryCandidate(candidates, orderItem.image, {
          collection: collectionName,
          documentId,
          field: `items.${index}.image`,
        });
      }
    });
  }
}

async function createAuditRows() {
  const database = getDatabase();
  const liveCollections = await database.listCollections().toArray();
  const liveCollectionNames = new Set(liveCollections.map((collection) => collection.name));
  const managedByCollectionName = new Map(
    managedCollections.map((collection) => [collection.model.collection.name, collection]),
  );
  const allCollectionNames = new Set([
    ...liveCollectionNames,
    ...managedCollections.map((collection) => collection.model.collection.name),
  ]);
  const rows: CollectionAuditRow[] = [];

  for (const collectionName of Array.from(allCollectionNames).sort()) {
    const managedCollection = managedByCollectionName.get(collectionName);
    const exists = liveCollectionNames.has(collectionName);
    const count = managedCollection
      ? await managedCollection.model.countDocuments({})
      : await database.collection(collectionName).countDocuments({});

    if (managedCollection) {
      const row: CollectionAuditRow = {
        action: managedCollection.action,
        collectionName,
        count,
        exists,
        modelName: managedCollection.modelName,
        reason: managedCollection.reason,
      };
      rows.push(row);
      continue;
    }

    rows.push({
      action: 'UNCERTAIN',
      collectionName,
      count,
      exists,
      reason: 'No matching Mongoose model was found in this project, so it is preserved.',
    });
  }

  return rows;
}

function printAudit(rows: CollectionAuditRow[]) {
  console.info('[reset:audit] Collection audit');

  rows.forEach((row) => {
    const modelLabel = row.modelName ? `${row.modelName} model` : 'unmanaged';
    const existsLabel = row.exists ? 'exists' : 'model-defined; collection not present';

    console.info(
      `[reset:audit] ${row.collectionName} (${modelLabel}, ${existsLabel}): ${formatCount(
        row.count,
      )} -> ${row.action}. ${row.reason}`,
    );
  });
}

async function writeJson(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function createBackup(rows: CollectionAuditRow[]) {
  const database = getDatabase();
  const createdAt = new Date().toISOString();
  const timestamp = createdAt.replace(/[:.]/g, '-');
  const backupDirectory = path.join(getProjectRoot(), '.tmp', 'production-data-reset', timestamp);
  const resetRows = rows.filter((row) => row.action === 'RESET');
  const cloudinaryCandidates = new Map<string, CloudinaryAssetCandidate>();
  const manifestCollections: Array<{
    action: ResetAction;
    collectionName: string;
    count: number;
    file: string;
    modelName?: string;
    reason: string;
  }> = [];

  await fs.mkdir(backupDirectory, { recursive: true });

  for (const row of resetRows) {
    const documents = (await database
      .collection(row.collectionName)
      .find({})
      .toArray()) as Record<string, unknown>[];
    const fileName = `${safeFileName(row.collectionName)}.json`;
    const filePath = path.join(backupDirectory, fileName);

    documents.forEach((document) => {
      collectCloudinaryCandidatesFromDocument(row.collectionName, document, cloudinaryCandidates);
    });

    await writeJson(filePath, documents);

    const manifestCollection = {
      action: row.action,
      collectionName: row.collectionName,
      count: documents.length,
      file: fileName,
      reason: row.reason,
    };

    if (row.modelName) {
      manifestCollections.push({ ...manifestCollection, modelName: row.modelName });
    } else {
      manifestCollections.push(manifestCollection);
    }
  }

  const cloudinaryCandidatesFile = 'cloudinary-candidates.json';
  await writeJson(
    path.join(backupDirectory, cloudinaryCandidatesFile),
    Array.from(cloudinaryCandidates.values()).sort((first, second) =>
      first.url.localeCompare(second.url),
    ),
  );

  const manifest = {
    createdAt,
    collections: manifestCollections,
    cloudinary: {
      assetsDeleted: 0,
      candidates: cloudinaryCandidates.size,
      candidatesFile: cloudinaryCandidatesFile,
      reason:
        'Cloudinary assets were not deleted automatically because this project only has upload support; review candidates manually before removing media.',
    },
    preserved:
      'Admin, StoreSettings, indexes, collections, database, environment, and Cloudinary configuration were not exported or modified.',
  };

  await writeJson(path.join(backupDirectory, 'manifest.json'), manifest);

  console.info(`[reset:backup] Backup written to ${backupDirectory}`);
  console.info(
    `[reset:backup] Cloudinary deletion skipped; ${cloudinaryCandidates.size} candidate asset URL(s) written for manual review.`,
  );

  return { backupDirectory, cloudinaryCandidateCount: cloudinaryCandidates.size };
}

async function resetCollections(rows: CollectionAuditRow[]) {
  const database = getDatabase();
  const resetRows = rows.filter((row) => row.action === 'RESET');
  const deletionResults: Array<{ collectionName: string; deletedCount: number }> = [];

  for (const row of resetRows) {
    const result = await database.collection(row.collectionName).deleteMany({});
    const deletedCount = result.deletedCount ?? 0;

    deletionResults.push({ collectionName: row.collectionName, deletedCount });
    console.info(`[reset:delete] ${row.collectionName}: deleted ${formatCount(deletedCount)}`);
  }

  return deletionResults;
}

function printUsage() {
  console.info(`Usage:
  npm --prefix server run audit:production-data
  npm --prefix server run reset:production-data

Direct flags:
  tsx src/scripts/resetProductionData.ts
  tsx src/scripts/resetProductionData.ts ${executeFlag} ${confirmationFlag}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldExecute = args.has(executeFlag);

  if (args.has('--help')) {
    printUsage();
    return;
  }

  if (shouldExecute && !args.has(confirmationFlag)) {
    throw new Error(`Refusing to delete data without ${confirmationFlag}`);
  }

  await connectDatabase();

  try {
    const rows = await createAuditRows();
    printAudit(rows);

    if (!shouldExecute) {
      console.info('[reset:audit] Audit-only mode complete; no data was deleted.');
      return;
    }

    const backup = await createBackup(rows);
    const deletionResults = await resetCollections(rows);
    const postResetRows = await createAuditRows();
    const remainingResetRows = postResetRows.filter((row) => row.action === 'RESET' && row.count > 0);

    console.info('[reset:verify] Post-reset collection counts');
    postResetRows.forEach((row) => {
      console.info(
        `[reset:verify] ${row.collectionName}: ${formatCount(row.count)} -> ${row.action}`,
      );
    });

    if (remainingResetRows.length > 0) {
      throw new Error(
        `Reset verification failed; reset collection(s) still contain documents: ${remainingResetRows
          .map((row) => `${row.collectionName}=${row.count}`)
          .join(', ')}`,
      );
    }

    console.info('[reset:summary] Reset complete');
    deletionResults.forEach((result) => {
      console.info(
        `[reset:summary] ${result.collectionName}: deleted ${formatCount(result.deletedCount)}`,
      );
    });
    console.info(`[reset:summary] Backup directory: ${backup.backupDirectory}`);
    console.info(
      `[reset:summary] Cloudinary assets deleted: 0; manual-review candidates: ${backup.cloudinaryCandidateCount}`,
    );
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[reset:error] ${message}`);
  process.exit(1);
});
