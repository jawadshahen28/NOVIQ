import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../../../types/catalog';
import { trackAddToCart } from '../../../services/metaPixel';
import { useCart } from '../CartContext';

export const ADD_TO_CART_SUCCESS_TEXT = 'تمت الإضافة!';
export const ADD_TO_CART_SUCCESS_MS = 1700;

export const addToCartSuccessStyle: CSSProperties = {
  backgroundColor: '#1f8f5f',
  borderColor: '#2fbf71',
  color: '#f5f3ee',
};

export function useAddToCartSuccess(product: Product | undefined, quantity = 1) {
  const { addItem, items } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product || isSuccess) {
      return;
    }

    const currentQuantity =
      items.find((item) => item.product.id === product.id)?.quantity ?? 0;
    const quantityToAdd = Math.max(1, quantity);
    const addedQuantity = Math.min(quantityToAdd, product.stock - currentQuantity);
    const wasAdded = addItem(product, quantity);

    if (!wasAdded || addedQuantity <= 0) {
      return;
    }

    trackAddToCart(product, addedQuantity);
    setIsSuccess(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsSuccess(false);
      timeoutRef.current = null;
    }, ADD_TO_CART_SUCCESS_MS);
  }, [addItem, isSuccess, items, product, quantity]);

  return {
    handleAddToCart,
    isSuccess,
  };
}
