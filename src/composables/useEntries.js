import { onMounted, ref } from "vue";
import { onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, entryFirebaseCollectionRef } from "./firebase.js";

export function useEntries() {
  const entries = ref([]);

  const newEntryTitle = ref("");
  const newEntryStartTime = ref("");
  const newEntryEndTime = ref("");

  console.log("Entry added:" + entries.value);

  onMounted(() => {
    // Fetches entreis from firebase on mount
    const entryCollection = entryFirebaseCollectionRef;
    onSnapshot(entryCollection, (snapshot) => {
      entries.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
  });

  const addEntry = async () => {
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

