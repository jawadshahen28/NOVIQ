import { Types } from 'mongoose';

const orderNumberPrefix = 'NVQ';

export function createOrderNumberFromObjectId(id: Types.ObjectId) {
  return `${orderNumberPrefix}-${id.toHexString().toUpperCase()}`;
}
