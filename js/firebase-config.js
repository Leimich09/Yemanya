// ============================================
// FIREBASE CONFIGURATION
// Archivo: js/firebase-config.js
// ============================================

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLEqoskoSuC02beqis5ko7NnLs58fznUU",
  authDomain: "yemanya-web.firebaseapp.com",
  projectId: "yemanya-web",
  storageBucket: "yemanya-web.firebasestorage.app",
  messagingSenderId: "501321351374",
  appId: "1:501321351374:web:f41f5bc460549e13a2109f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export para usar en otros archivos
export { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, getDoc, setDoc, collection, getDocs };