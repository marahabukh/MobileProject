import { getCartItems, removeFromCart, updateCartItem } from "@/api/AddToCart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCart = () => {
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartItems,
    staleTime: 0,
    refetchInterval: 5000,
  });

  const count = cartItems.reduce((total: number, item: any) => total + (item.quantity || 0), 0);

  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateCartItem(id, quantity),
    onMutate: async (newVar) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const prev = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: any) =>
        old?.map((item: any) =>
          item.id === newVar.id ? { ...item, quantity: newVar.quantity } : item
        )
      );
      return { prev };
    },
    onError: (err, newVar, context) => {
      queryClient.setQueryData(["cart"], context?.prev);
      Alert.alert("Error", "Failed to update quantity");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const prev = queryClient.getQueryData(["cart"]);
      queryClient.setQueryData(["cart"], (old: any) =>
        old?.filter((item: any) => item.id !== id)
      );
      return { prev };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["cart"], context?.prev);
      Alert.alert("Error", "Failed to remove item");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return {
    cartItems,
    count,
    subtotal,
    isLoading,
    refetch,
    updateQuantity: updateQuantity.mutate,
    removeItem: removeItem.mutate,
  };
};
