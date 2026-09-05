export const LOW_STOCK_THRESHOLD = 3;

export function getStockState(stock: number) {
  if (stock === 0) {
    return 'out';
  }

  return stock <= LOW_STOCK_THRESHOLD ? 'low' : 'available';
}