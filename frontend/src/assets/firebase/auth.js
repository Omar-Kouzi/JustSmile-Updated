import { auth } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { setUserWithId } from "./firestore";
import SHA256 from "crypto-js/sha256";

const googleProvider = new GoogleAuthProvider();

// 🔐 Hash UID
const hashUID = (uid) => SHA256(uid).toString();

// ✅ Create Firestore doc with default fields
const createDefaultUserDoc = async (uid, email) => {
  const hashedUID = hashUID(uid);
  await setUserWithId(hashedUID, {
    id: hashedUID,
    email,           // stored only in Firestore
    phone: "",
    location: "",
    purchases: {},
    createdAt: new Date()
  });
  return { uid: hashedUID };
};

// ✅ Signup with email/password
export const signup = async (email, password) => {
  if (!email || !password) throw new Error("Email and password required");
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return createDefaultUserDoc(result.user.uid, email);
};

// ✅ Login with email/password
export const login = async (email, password) => {
  if (!email || !password) throw new Error("Email and password required");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return { uid: hashUID(result.user.uid) };
};

// ✅ Google Sign-In
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return createDefaultUserDoc(user.uid, user.email); // email stored only in Firestore
};

// ✅ Logout
export const logout = async () => {
  await signOut(auth);
};