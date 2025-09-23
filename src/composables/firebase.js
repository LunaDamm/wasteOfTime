// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDjD-qe9yk4KIjwsCsBAHj9gAJ6BO6E50",
  authDomain: "wasteoftimetracker.firebaseapp.com",
  projectId: "wasteoftimetracker",
  storageBucket: "wasteoftimetracker.firebasestorage.app",
  messagingSenderId: "392641310778",
  appId: "1:392641310778:web:625c8de7f8bf10cbd48503"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const entryFirebaseCollectionRef = collection(db, "entries");

export { db, entryFirebaseCollectionRef };
export const firebaseApp = app;
