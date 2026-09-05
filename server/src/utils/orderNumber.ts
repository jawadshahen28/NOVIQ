import { Types } from 'mongoose';

const orderNumberPrefix = 'NVQ';

export function createOrderNumberFromObjectId(id: Types.ObjectId) {
  const date = id.getTimestamp();
  const datePart = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('');
  const suffix = id.toHexString().slice(-6).toUpperCase();

  return `${orderNumberPrefix}-${datePart}-${suffix}`;
}
