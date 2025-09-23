import { onMounted, ref } from "vue";
import { onSnapshot, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, entryFirebaseCollectionRef } from "./firebase.js";
import { useAuth } from "./useAuth.js";

export function useEntries() {
  const entries = ref([]);
  const { currentUser } = useAuth();

  const newEntryTitle = ref("");
  const newEntryStartTime = ref("");
  const newEntryEndTime = ref("");

  console.log("Entry added:" + entries.value);

  onMounted(() => {
    // Fetches entries from firebase on mount for current user
    if (currentUser.value) {
      const userEntriesQuery = query(
        entryFirebaseCollectionRef,
        where("userId", "==", currentUser.value.uid)
      );
      onSnapshot(userEntriesQuery, (snapshot) => {
        entries.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      });
    }
  });

  const addEntry = async () => {
    if (!currentUser.value) {
      console.error("User must be logged in to add entries");
      return;
    }

    if (newEntryTitle.value.trim() == "" || newEntryStartTime.value.trim() == "" || newEntryEndTime.value.trim() == "") return;

    const [startHours, startMinutes] = newEntryStartTime.value.split(':').map(Number);
    const [endHours, endMinutes] = newEntryEndTime.value.split(':').map(Number);

    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes) ||
        startHours < 0 || startHours > 23 || startMinutes < 0 || startMinutes > 59 ||
        endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59) {
      console.error("Invalid time format");
      return;
    }

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    let durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Adjust for overnight entries
    }

    await addDoc(entryFirebaseCollectionRef, {
      entryName: newEntryTitle.value,
      entryStartTime: newEntryStartTime.value,
      entryEndTime: newEntryEndTime.value,
      durationMinutes: durationMinutes,
      userId: currentUser.value.uid,
    });
    newEntryTitle.value = "";
    newEntryStartTime.value = "";
    newEntryEndTime.value = "";
    console.log("Entry added");

  };

  const deleteEntry = async (id) => {
    console.log("Delete entry with id: " + id);
    const entryDoc = doc(db, "entries", id);
    await deleteDoc(entryDoc);
  };
  return { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry };
}

