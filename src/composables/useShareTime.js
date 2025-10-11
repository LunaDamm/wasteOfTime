import { ref } from "vue";
import { db } from "./firebase"; // Adjust the path to your Firebase configuration
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export function useShareTime() {
  const error = ref(null);
  const sharedExists = ref(false);
  const sharedDocId = ref(null);
  const sharedData = ref(null);

  const loadSharedTime = async (userId) => {
    error.value = null;
    sharedExists.value = false;
    sharedDocId.value = null;
    sharedData.value = null;

    if (!userId) return;

    try {
      const sharedTimeCollection = collection(db, "sharedTime");
      const q = query(sharedTimeCollection, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        sharedDocId.value = docSnap.id;
        sharedData.value = { id: docSnap.id, ...docSnap.data() };
        sharedExists.value = true;
      }
    } catch (err) {
      error.value = "Failed to load shared time: " + err.message;
    }
  };

  const shareTime = async (userId, displayName, finalTime) => {
    error.value = null;

    try {
      const sharedTimeCollection = collection(db, "sharedTime");

      if (sharedDocId.value) {
        const docRef = doc(db, "sharedTime", sharedDocId.value);
        await updateDoc(docRef, {
          userId,
          displayName,
          finalTime,
          timestamp: new Date(),
        });
      } else {
        const newDoc = await addDoc(sharedTimeCollection, {
          userId,
          displayName,
          finalTime,
          timestamp: new Date(),
        });
        sharedDocId.value = newDoc.id;
        sharedExists.value = true;
      }
    } catch (err) {
      error.value = "Failed to share time: " + err.message;
    }
  };

  return {
    shareTime,
    loadSharedTime,
    sharedExists,
    sharedData,
    error,
  };
}
