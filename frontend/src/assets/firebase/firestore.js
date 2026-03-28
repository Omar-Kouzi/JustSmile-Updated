import { db } from "./config";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

/**
 * -----------------------------
 * 🔧 GENERIC HELPERS
 * -----------------------------
 */

// Get collection reference
const getCollectionRef = (collectionName) => collection(db, collectionName);

// Get document reference
const getDocRef = (collectionName, docId) => doc(db, collectionName, docId);

/**
 * Add document (AUTO ID)
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(getCollectionRef(collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get single document
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docSnap = await getDoc(getDocRef(collectionName, docId));
    return docSnap.exists() ? { id: docId, ...docSnap.data() } : null;
  } catch (error) {
    console.error(
      `Error fetching document ${docId} from ${collectionName}:`,
      error,
    );
    throw error;
  }
};

/**
 * Get all documents
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const snapshot = await getDocs(getCollectionRef(collectionName));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update document (ONLY if exists)
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const existing = await getDocument(collectionName, docId);

    if (existing) {
      await updateDoc(getDocRef(collectionName, docId), data);
    } else {
      await setDoc(getDocRef(collectionName, docId), data);
    }
  } catch (error) {
    console.error(`Error updating document ${docId}:`, error);
    throw error;
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(getDocRef(collectionName, docId));
  } catch (error) {
    console.error(
      `Error deleting document ${docId} from ${collectionName}:`,
      error,
    );
    throw error;
  }
};

/**
 * Set document (CREATE or OVERWRITE)
 */
export const setDocument = async (collectionName, docId, data, merge = false) => {
  try {
    await setDoc(getDocRef(collectionName, docId), data, { merge });
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * -----------------------------
 * 👤 USERS
 * -----------------------------
 */

export const setUserWithId = (uid, data) => setDocument("users", uid, data);

export const addUser = (data) => addDocument("users", data);
export const getUser = (uid) => getDocument("users", uid);
export const getUsers = () => getAllDocuments("users");
export const updateUser = (uid, data) => updateDocument("users", uid, data);
export const deleteUser = (uid) => deleteDocument("users", uid);

/**
 * -----------------------------
 * 🛍 PRODUCTS
 * -----------------------------
 */

export const addProduct = (data) => addDocument("products", data);
export const getProduct = (id) => getDocument("products", id);
export const getProducts = () => getAllDocuments("products");
export const updateProduct = (id, data) => updateDocument("products", id, data);
export const deleteProduct = (id) => deleteDocument("products", id);

/**
 * -----------------------------
 * 🛒 CART (FIXED ✅)
 * ONE CART PER USER (UID = DOC ID)
 * -----------------------------
 */

export const setCart = (uid, data) => setDocument("carts", uid, data);
export const getCart = (uid) => getDocument("carts", uid);
export const updateCart = (uid, data) => updateDocument("carts", uid, data);
export const deleteCart = (uid) => deleteDocument("carts", uid);

/**
 * -----------------------------
 * 📦 ORDERS (FIXED NAME ✅)
 * -----------------------------
 */

export const addOrder = (data) => addDocument("orders", data);
export const getOrders = () => getAllDocuments("orders");
export const deleteOrder = (id) => deleteDocument("orders", id);
