import { db } from "./config";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc
} from "firebase/firestore";

/**
 * Save or overwrite a user in Firestore with a specific UID
 * @param {string} uid - The UID of the user
 * @param {Object} data - User data to save
 */
export const setUserWithId = async (uid, data) => {
  try {
    await setDoc(doc(db, "users", uid), data);
  } catch (error) {
    console.error(`Error saving user ${uid}:`, error);
    throw error;
  }
};

// Utility function to get a collection reference
const getCollectionRef = (collectionName) => collection(db, collectionName);

/**
 * Add a document with a random ID to any collection.
 * @param {string} collectionName
 * @param {Object} data
 * @returns {Promise<string>} - Auto-generated document ID
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
 * Get a document from any collection.
 * @param {string} collectionName
 * @param {string} docId
 * @returns {Promise<Object|null>} - Document data or null if not found
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docSnap = await getDoc(doc(getCollectionRef(collectionName), docId));
    return docSnap.exists() ? { id: docId, ...docSnap.data() } : null;
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get all documents from a collection.
 * @param {string} collectionName
 * @returns {Promise<Array>} - Array of documents
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const snapshot = await getDocs(getCollectionRef(collectionName));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update a document in any collection.
 * @param {string} collectionName
 * @param {string} docId
 * @param {Object} data
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(getCollectionRef(collectionName), docId), data);
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document from any collection.
 * @param {string} collectionName
 * @param {string} docId
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(getCollectionRef(collectionName), docId));
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// --- Specific Collection Handlers ---

// Product Collection
export const addProduct = (data) => addDocument("Product", data);
export const getProduct = (docId) => getDocument("Product", docId);
export const getProducts = () => getAllDocuments("Product");
export const updateProduct = (docId, data) => updateDocument("Product", docId, data);
export const deleteProduct = (docId) => deleteDocument("Product", docId);

// Order Collection
export const addOrder = (data) => addDocument("Order", data);
export const getOrders = () => getAllDocuments("Order");
export const deleteOrder = (docId) => deleteDocument("Order", docId);

// Projects Collection
export const addProject = (data) => addDocument("Projects", data);
export const getProject = (docId) => getDocument("Projects", docId);
export const getProjects = () => getAllDocuments("Projects");
export const updateProject = (docId, data) => updateDocument("Projects", docId, data);

// Users Collection
export const addUser = (data) => addDocument("users", data);
export const getUser = (docId) => getDocument("users", docId);
export const getUsers = () => getAllDocuments("users");
export const updateUser = (docId, data) => updateDocument("users", docId, data);
export const deleteUser = (docId) => deleteDocument("users", docId);