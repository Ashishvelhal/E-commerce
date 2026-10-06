import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingPrice: () => number;
  getTaxPrice: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  let initialItems: CartItem[] = [];
  const stored = localStorage.getItem('ecommerce_cart');
  if (stored) {
    try {
      initialItems = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  const saveItems = (items: CartItem[]) => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(items));
  };

  return {
    items: initialItems,
    isOpen: false,

    setIsOpen: (isOpen) => set({ isOpen }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

    addItem: (product, quantity = 1, selectedColor = '') => {
      set((state) => {
        const existingIndex = state.items.findIndex(
          (item) => item.product._id === product._id && item.selectedColor === selectedColor
        );

        let newItems: CartItem[];
        if (existingIndex > -1) {
          newItems = [...state.items];
          newItems[existingIndex].quantity += quantity;
        } else {
          newItems = [...state.items, { product, quantity, selectedColor }];
        }

        saveItems(newItems);
        return { items: newItems, isOpen: true };
      });
    },

    removeItem: (productId, selectedColor = '') => {
      set((state) => {
        const newItems = state.items.filter(
          (item) => !(item.product._id === productId && item.selectedColor === selectedColor)
        );
        saveItems(newItems);
        return { items: newItems };
      });
    },

    updateQuantity: (productId, quantity, selectedColor = '') => {
      set((state) => {
        if (quantity <= 0) {
          const newItems = state.items.filter(
            (item) => !(item.product._id === productId && item.selectedColor === selectedColor)
          );
          saveItems(newItems);
          return { items: newItems };
        }

        const newItems = state.items.map((item) => {
          if (item.product._id === productId && item.selectedColor === selectedColor) {
            return { ...item, quantity };
          }
          return item;
        });

        saveItems(newItems);
        return { items: newItems };
      });
    },

    clearCart: () => {
      localStorage.removeItem('ecommerce_cart');
      set({ items: [] });
    },

    getItemCount: () => {
      return get().items.reduce((total, item) => total + item.quantity, 0);
    },

    getSubtotal: () => {
      return get().items.reduce((total, item) => {
        const price = item.product.discountPrice || item.product.price;
        return total + price * item.quantity;
      }, 0);
    },

    getShippingPrice: () => {
      const subtotal = get().getSubtotal();
      return subtotal > 150 || subtotal === 0 ? 0 : 15;
    },

    getTaxPrice: () => {
      const subtotal = get().getSubtotal();
      return Math.round(subtotal * 0.08 * 100) / 100;
    },

    getTotalPrice: () => {
      return get().getSubtotal() + get().getShippingPrice() + get().getTaxPrice();
    },
  };
});
