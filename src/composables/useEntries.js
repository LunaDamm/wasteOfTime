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

    await addDoc(entryFirebaseCollectionRef, {
      entryName: newEntryTitle.value,
      entryStartTime: newEntryStartTime.value,
      entryEndTime: newEntryEndTime.value
    });
    newEntryTitle.value = "";
    newEntryStartTime.value = "";
    newEntryEndTime.value = "";
  };

  const deleteEntry = async (id) => {
    console.log("Delete entry with id: " + id);
    const entryDoc = doc(db, "entries", id);
    await deleteDoc(entryDoc);
  };
  return { entries, newEntryTitle, newEntryStartTime, newEntryEndTime, addEntry, deleteEntry };
}
