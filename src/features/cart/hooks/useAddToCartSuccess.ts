import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '../../../types/catalog';
import { useCart } from '../CartContext';

export const ADD_TO_CART_SUCCESS_TEXT = 'تمت الإضافة!';
export const ADD_TO_CART_SUCCESS_MS = 1700;

export const addToCartSuccessStyle: CSSProperties = {
  backgroundColor: '#1f8f5f',
  borderColor: '#2fbf71',
  color: '#f5f3ee',
};

export function useAddToCartSuccess(product: Product | undefined, quantity = 1) {
  const { addItem } = useCart();
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

    const wasAdded = addItem(product, quantity);

    if (!wasAdded) {
      return;
    }

    setIsSuccess(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsSuccess(false);
      timeoutRef.current = null;
    }, ADD_TO_CART_SUCCESS_MS);
  }, [addItem, isSuccess, product, quantity]);

  return {
    handleAddToCart,
    isSuccess,
  };
}
