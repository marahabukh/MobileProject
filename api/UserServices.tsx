import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const registerUser = async (
  email: string,
  password: string,
  name?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  if (name) {
    await updateProfile(user, { displayName: name });
  }

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: name || "",
    displayName: name || "",
    email: user.email || email,
    createdAt: serverTimestamp(),
  });

  return {
    uid: user.uid,
    email: user.email,
    displayName: name || user.displayName || "",
  };
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return {
      uid: user.uid,
      email: user.email,
      ...userSnap.data(),
    };
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    name: user.displayName || "",
  };
};