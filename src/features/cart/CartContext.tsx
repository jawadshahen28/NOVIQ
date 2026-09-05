import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useStoreCatalog } from '../store/catalog/StoreCatalogContext';
import { loadStoredCart, saveStoredCart, type StoredCartLine } from '../../services/cartStorage';
import type { CartLine, Product } from '../../types/catalog';
import { getDiscountedPrice } from '../../utils/format';

interface CartContextValue {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function hydrateCart(lines: StoredCartLine[], products: Product[]): CartLine[] {
  return lines
    .map((line) => {
      const product = products.find((candidate) => candidate.id === line.productId);

      if (!product || !product.isAvailable) {
        return null;
      }

      return {
        product,
        quantity: Math.min(line.quantity, Math.max(product.stock, 1)),
      };
    })
    .filter((line): line is CartLine => Boolean(line));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useStoreCatalog();
  const [storedLines, setStoredLines] = useState<StoredCartLine[]>(() => loadStoredCart());

  useEffect(() => {
    saveStoredCart(storedLines);
  }, [storedLines]);

  const items = useMemo(() => hydrateCart(storedLines, products), [products, storedLines]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + getDiscountedPrice(item.product) * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      addItem(product, quantity = 1) {
        if (!product.isAvailable || product.stock <= 0) {
          return false;
        }

        const currentQuantity =
          items.find((item) => item.product.id === product.id)?.quantity ?? 0;
        const quantityToAdd = Math.max(1, quantity);
        const nextQuantity = Math.min(currentQuantity + quantityToAdd, product.stock);

        if (nextQuantity <= currentQuantity) {
          return false;
        }

        setStoredLines((current) => {
          const existing = current.find((line) => line.productId === product.id);
          const nextStoredQuantity = Math.min(
            (existing?.quantity ?? 0) + quantityToAdd,
            product.stock,
          );

          if (existing) {
            return current.map((line) =>
              line.productId === product.id
                ? { ...line, quantity: nextStoredQuantity }
                : line,
            );
          }

          return [
            ...current,
            { productId: product.id, quantity: Math.max(1, nextStoredQuantity) },
          ];
        });

        return true;
      },
      removeItem(productId) {
        setStoredLines((current) => current.filter((line) => line.productId !== productId));
      },
      updateQuantity(productId, quantity) {
        const product = products.find((candidate) => candidate.id === productId);

        if (!product) {
          return;
        }

        if (quantity <= 0) {
          setStoredLines((current) => current.filter((line) => line.productId !== productId));
          return;
        }

        setStoredLines((current) =>
          current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(quantity, Math.max(product.stock, 1)) }
              : line,
          ),
        );
      },
      clearCart() {
        setStoredLines([]);
      },
    };
  }, [itemCount, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
