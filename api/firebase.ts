import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBDSWeq_sm64xOfiVL6QfCuVwvZEb4iUww",
  authDomain: "electrowebapp-6bf19.firebaseapp.com",
  projectId: "electrowebapp-6bf19",
  storageBucket: "electrowebapp-6bf19.firebasestorage.app",
  messagingSenderId: "906632949293",
  appId: "1:906632949293:web:22973a088bc139ed1fd2a4",
  measurementId: "G-FMEC9TKZ0G",
};

const app = initializeApp(firebaseConfig);

let authInstance;

try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase initialized successfully");