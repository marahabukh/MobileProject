import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const CART_STORAGE_KEY = 'SHOPPING_CART_ITEMS';

export type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  size?: string;
};

interface CartContextType {
  cartItems: CartItem[];
  count: number;
  subtotal: number;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Failed to load cart from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to storage:", error);
      }
    };
    if (!isLoading) {
      saveCart();
    }
  }, [cartItems, isLoading]);

  const count = useMemo(() => 
    cartItems.reduce((total, item) => total + (item.quantity || 0), 0), 
    [cartItems]
  );
  
  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0),
    [cartItems]
  );

  const addToCart = useCallback(async (newItem: Omit<CartItem, 'id'>) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.productId === newItem.productId && item.size === newItem.size
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prev];
        const currentQty = updatedCart[existingItemIndex].quantity;
        const availableStock = updatedCart[existingItemIndex].stock;
        
        if (currentQty + newItem.quantity > availableStock) {
          Alert.alert("عذراً", `لقد وصلت للحد الأقصى للمتوفر من هذا المنتج (${availableStock})`);
          return prev;
        }

        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      }

      if (newItem.quantity > newItem.stock) {
        Alert.alert("عذراً", `المتوفر فقط ${newItem.stock} قطع`);
        return prev;
      }

      const itemWithId = { ...newItem, id: Date.now().toString() };
      return [...prev, itemWithId];
    });
  }, []);

  const removeFromCart = useCallback(async (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          if (quantity > item.stock) {
            Alert.alert("عذراً", `المتوفر فقط ${item.stock} قطع من هذا المنتج`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ 
    cartItems, 
    count, 
    subtotal, 
    isLoading, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  }), [cartItems, count, subtotal, isLoading, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
