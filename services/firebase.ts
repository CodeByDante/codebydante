import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { DataItem } from '../types';

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyAH3jvbe0_QLzIuuv5kTMK8246HNvohvfE",
  authDomain: "twistedbrody-9d163.firebaseapp.com",
  projectId: "twistedbrody-9d163",
  storageBucket: "twistedbrody-9d163.firebasestorage.app",
  messagingSenderId: "733213514129",
  appId: "1:733213514129:web:e9694684f5c3994ed06230",
  measurementId: "G-N8TQ7MY42W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = 'neonvault_items';

/**
 * Helper function to remove fields with 'undefined' values from an object.
 * Firestore throws an error if a field is set to undefined.
 */
const cleanData = (data: any) => {
  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
};

export const subscribeToItems = (callback: (items: DataItem[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => {
      const data = doc.data();

      // Migrate old blocks without type to have 'text' type
      let blocks = data.blocks;
      if (blocks && Array.isArray(blocks)) {
        blocks = blocks.map((block: any) => ({
          ...block,
          type: block.type || 'text' // Default to 'text' if type is missing
        }));
      }

      return {
        id: doc.id,
        ...data,
        blocks,
        // Convert Firestore Timestamp to number (milliseconds) if necessary
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      } as DataItem;
    });
    callback(items);
  }, (error) => {
    console.error("Error reading from Firestore:", error);
  });
};

export const addItem = async (item: Omit<DataItem, 'id' | 'createdAt'>) => {
  try {
    // Sanitize the item to ensure no undefined values are sent
    const itemToSave = cleanData(item);

    await addDoc(collection(db, COLLECTION_NAME), {
      ...itemToSave,
      createdAt: serverTimestamp() // Use server timestamp for consistency
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const updateItem = async (id: string, item: Partial<DataItem>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    // Remove id and createdAt from the update payload to prevent overwriting logic
    const { id: _, createdAt: __, ...updateData } = item; 
    
    // Sanitize the data
    const sanitizedUpdateData = cleanData(updateData);

    await updateDoc(docRef, sanitizedUpdateData);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

export const deleteItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};