import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const saveSecurely = async (key: string, value: any) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (Platform.OS === 'web') {
      localStorage.setItem(key, stringValue);
    } else {
      await SecureStore.setItemAsync(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error(`SecureStore Save Error (${key}):`, error);
    return false;
  }
};

export const getSecurely = async (key: string) => {
  try {
    let result;
    if (Platform.OS === 'web') {
      result = localStorage.getItem(key);
    } else {
      result = await SecureStore.getItemAsync(key);
    }
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }
    return null;
  } catch (error) {
    console.error(`SecureStore Get Error (${key}):`, error);
    return null;
  }
};

export const deleteSecurely = async (key: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
    return true;
  } catch (error) {
    console.error(`SecureStore Delete Error (${key}):`, error);
    return false;
  }
};
