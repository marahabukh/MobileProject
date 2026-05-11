import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { saveSecurely, deleteSecurely } from "../lib/SecureStorage";

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

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: name || user.displayName || "",
  };

  await saveSecurely("user_session", userData);

  return userData;
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

  const userData = userSnap.exists() 
    ? { uid: user.uid, email: user.email, ...userSnap.data() }
    : { uid: user.uid, email: user.email, displayName: user.displayName || "", name: user.displayName || "" };

  await saveSecurely("user_session", userData);

  return userData;
};

export const logoutUser = async () => {
  try {
    await auth.signOut();
    await deleteSecurely("user_session");
    return true;
  } catch (error) {
    console.error("Logout Error:", error);
    return false;
  }
};