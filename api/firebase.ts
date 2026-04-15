
// @/api/firebase.ts   أو src/api/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDSWeq_sm64xOfiVL6QfCuVwvZEb4iUww",
  authDomain: "electrowebapp-6bf19.firebaseapp.com",
  projectId: "electrowebapp-6bf19",
  storageBucket: "electrowebapp-6bf19.firebasestorage.app",
  messagingSenderId: "906632949293",
  appId: "1:906632949293:web:22973a088bc139ed1fd2a4",
  measurementId: "G-FMEC9TKZ0G"
};

// Initialize
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
console.log("✅ Firebase initialized successfully - db is ready");