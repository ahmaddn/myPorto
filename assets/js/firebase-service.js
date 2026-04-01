// ═══════════════════════════════════════════
//  FIREBASE SERVICE — firebase-service.js
//  Menangani semua operasi Firebase & Firestore
// ═══════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ─────────────────────────────────────────
//  FIREBASE CONFIGURATION
// ─────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDPwJRi8ouDCF_utc-0PmEiZAgoybrOUmE",
  authDomain: "my-portofolio-43930.firebaseapp.com",
  projectId: "my-portofolio-43930",
  storageBucket: "my-portofolio-43930.firebasestorage.app",
  messagingSenderId: "682248097429",
  appId: "1:682248097429:web:2b0a6fec8c16b6ba25559c",
  measurementId: "G-ZGG309VPCC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("Firebase initialized", analytics);

// ─────────────────────────────────────────
//  FIRESTORE OPERATIONS
// ─────────────────────────────────────────

/**
 * Get data dari Firestore collection
 * @param {string} collectionName - Nama collection
 * @returns {Promise<Array>} - Array of documents
 */
export async function getData(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ ...doc.data(), _docId: doc.id });
    });
    return data;
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    return [];
  }
}

/**
 * Get single document by ID
 * @param {string} collectionName - Nama collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} - Document data atau null
 */
export async function getDocumentById(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), _docId: docSnap.id };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${docId}:`, error);
    return null;
  }
}

/**
 * Add document ke Firestore collection
 * @param {string} collectionName - Nama collection
 * @param {Object} data - Data yang akan ditambahkan
 * @returns {Promise<Object>} - Document reference
 */
export async function addData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    return { success: false, error };
  }
}

/**
 * Update document di Firestore
 * @param {string} collectionName - Nama collection
 * @param {number} itemId - ID item yang akan diupdate
 * @param {Object} data - Data yang akan diupdate
 * @returns {Promise<Object>} - Result object
 */
export async function updateData(collectionName, itemId, data) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    let docId = null;

    querySnapshot.forEach((doc) => {
      if (doc.data().id === itemId) {
        docId = doc.id;
      }
    });

    if (docId) {
      await updateDoc(doc(db, collectionName, docId), data);
      return { success: true, docId };
    }
    return { success: false, error: "Document not found" };
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
    return { success: false, error };
  }
}

/**
 * Delete document dari Firestore
 * @param {string} collectionName - Nama collection
 * @param {number} itemId - ID item yang akan dihapus
 * @returns {Promise<Object>} - Result object
 */
export async function deleteData(collectionName, itemId) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    let docToDelete = null;

    querySnapshot.forEach((document) => {
      if (document.data().id === itemId) {
        docToDelete = document.id;
      }
    });

    if (docToDelete) {
      await deleteDoc(doc(db, collectionName, docToDelete));
      return { success: true, docId: docToDelete };
    }
    return { success: false, error: "Document not found" };
  } catch (error) {
    console.error(`Error deleting from ${collectionName}:`, error);
    return { success: false, error };
  }
}

/**
 * Set document dengan ID spesifik (untuk profile)
 * @param {string} collectionName - Nama collection
 * @param {string} docId - Document ID
 * @param {Object} data - Data yang akan disimpan
 * @returns {Promise<Object>} - Result object
 */
export async function setData(collectionName, docId, data) {
  try {
    await setDoc(doc(db, collectionName, docId), data);
    return { success: true, docId };
  } catch (error) {
    console.error(`Error setting ${collectionName}/${docId}:`, error);
    return { success: false, error };
  }
}

/**
 * Delete seluruh collection (untuk reset)
 * @param {string} collectionName - Nama collection
 * @returns {Promise<Object>} - Result object
 */
export async function clearCollection(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = [];

    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });

    await Promise.all(deletePromises);
    return { success: true, count: deletePromises.length };
  } catch (error) {
    console.error(`Error clearing ${collectionName}:`, error);
    return { success: false, error };
  }
}

/**
 * Batch add data ke collection
 * @param {string} collectionName - Nama collection
 * @param {Array} dataArray - Array of data objects
 * @returns {Promise<Object>} - Result object
 */
export async function batchAddData(collectionName, dataArray) {
  try {
    const promises = dataArray.map((item) =>
      addDoc(collection(db, collectionName), item),
    );
    await Promise.all(promises);
    return { success: true, count: dataArray.length };
  } catch (error) {
    console.error(`Error batch adding to ${collectionName}:`, error);
    return { success: false, error };
  }
}

// Export db untuk digunakan di tempat lain jika diperlukan
export { db };
