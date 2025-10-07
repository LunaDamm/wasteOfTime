import { ref } from "vue";
import { db } from "@/firebase"; // Adjust the path to your Firebase configuration
import { collection, addDoc } from "firebase/firestore";

export function useShareTime() {
  const error = ref(null);

  const shareTime = async (userId, displayName, finalTime) => {
    error.value = null;

    try {
      const sharedTimeCollection = collection(db, "sharedTime");
      await addDoc(sharedTimeCollection, {
        userId,
        displayName,
        finalTime,
        timestamp: new Date(),
      });
    } catch (err) {
      error.value = "Failed to share time: " + err.message;
    }
  };

  return { shareTime, error };
}