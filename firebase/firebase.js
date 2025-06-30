import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpxC01enB-w7OdKFs_bFVujSWQcHp4cR0",
  authDomain: "leekh-7d73b.firebaseapp.com",
  projectId: "leekh-7d73b",
  storageBucket: "leekh-7d73b.firebasestorage.app",
  messagingSenderId: "773356851274",
  appId: "1:773356851274:web:c6e136ecb7b0cff13056b3",
  measurementId: "G-QVXP9EW6E8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase 초기화 완료");
console.log("Auth:", auth);
console.log("DB:", db);
console.log("Storage:", storage);