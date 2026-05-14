import { useCartContext } from "@/context/CartContext";

export const useCart = () => {
  const { 
    cartItems, 
    count, 
    subtotal, 
    isLoading, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCartContext();

  return {
    cartItems,
    count,
    subtotal,
    isLoading,
    refetch: async () => {}, 
    updateQuantity: (id: string, quantity: number) => updateQuantity(id, quantity),
    removeItem: (id: string) => removeFromCart(id),
    addItem: addToCart,
    clearCart
  };
};
