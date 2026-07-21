import { initializeApp } from "firebase/app"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBCIa473lD-wIkD45QfnBH4METSJHAPfVU",
  authDomain: "whitesnow237-8023a.firebaseapp.com",
  projectId: "whitesnow237-8023a",
  storageBucket: "whitesnow237-8023a.firebasestorage.app",
  messagingSenderId: "153269816330",
  appId: "1:153269816330:web:8e37ca0e99f1bd72d863f3",
  measurementId: "G-Q8MPP6D8QY"
};
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

enableIndexedDbPersistence(db)
  .then(() => console.log("🔥 Offline activé"))
  .catch(() => console.log("Offline non supporté"))

  window.addEventListener("offline", ()=> alert("Mode hors ligne activé"))
window.addEventListener("online", ()=> alert("Connexion rétablie"))
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/