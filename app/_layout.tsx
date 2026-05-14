import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: true,
      retryDelay: 10000,
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

//offline 
function OfflineBanner() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>No Internet Connection. Retrying every 10s...</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <AuthProvider>
        <CartProvider>
          <StatusBar barStyle="dark-content" />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }} />
        </CartProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: "#FF5252",
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 9999,
  },
  offlineText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});