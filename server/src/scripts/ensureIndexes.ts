import type { IndexDefinition, IndexOptions } from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  AdminModel,
  AnalyticsEventModel,
  CategoryModel,
  OrderModel,
  ProductModel,
  StoreSettingsModel,
} from '../models/index.js';

type SchemaIndexDefinition = [IndexDefinition, IndexOptions];

const indexedModels = [
  { label: 'Admin', model: AdminModel },
  { label: 'AnalyticsEvent', model: AnalyticsEventModel },
  { label: 'Category', model: CategoryModel },
  { label: 'Order', model: OrderModel },
  { label: 'Product', model: ProductModel },
  { label: 'StoreSettings', model: StoreSettingsModel },
] as const;

function formatIndexDefinition([fields, options]: SchemaIndexDefinition) {
  const optionSummary = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(', ');

  return `${JSON.stringify(fields)}${optionSummary ? ` (${optionSummary})` : ''}`;
}

async function ensureIndexes() {
  await connectDatabase();

  try {
    for (const { label, model } of indexedModels) {
      const indexDefinitions = model.schema.indexes();

      console.info(`[indexes] ${label}: ${indexDefinitions.length} schema index(es)`);
      indexDefinitions.forEach((definition) => {
        console.info(`[indexes] ${label}: ${formatIndexDefinition(definition)}`);
      });

      await model.createIndexes();
      console.info(`[indexes] ${label}: ensured`);
    }

    console.info('[indexes] all configured indexes were ensured');
  } finally {
    await disconnectDatabase();
  }
}

ensureIndexes().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[indexes] failed: ${message}`);
  process.exit(1);
});
