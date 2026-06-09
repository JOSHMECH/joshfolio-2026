/* ════════════════════════════════════════════════════════
   Josh_d_Guru — Firebase Configuration & Initialization
   ────────────────────────────────────────────────────────
   Features:
   - App, Firestore, Auth, and Storage connection.
   - localStorage fallback status reporter.
   ════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyB38GyX3dfh93thaYHNbHoQ_auEyFkjB3U",
  authDomain: "joshfolio-17209.firebaseapp.com",
  projectId: "joshfolio-17209",
  storageBucket: "joshfolio-17209.appspot.com",
  messagingSenderId: "660965216671",
  appId: "1:660965216671:web:dbea24522101d80c242daa",
  measurementId: "G-5J6FRNTB7E"
};

let db = null;
let auth = null;
let storage = null;
let firebaseReady = false;

try {
  const isConfigured =
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

  if (isConfigured) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    firebaseReady = true;
    console.log("%c[JoshFolio] Firebase initialized successfully ✓", "color:#C8A96E;font-weight:bold;");
  } else {
    console.warn(
      "%c[JoshFolio] Firebase placeholder keys detected — falling back to local storage.",
      "color:#FF9900;"
    );
  }
} catch (err) {
  console.error("[JoshFolio] Firebase initialization error:", err);
}

window.joshFirebase = { db, auth, storage, firebaseReady };
