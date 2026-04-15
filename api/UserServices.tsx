
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";




export const registerUser = async (email: string, password: string, name?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(userCredential.user, { displayName: name });
  }

  return userCredential;
};


export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};