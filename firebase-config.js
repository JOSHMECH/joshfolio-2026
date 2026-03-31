/* ════════════════════════════════════════════════════════
   Josh_d_Guru — Firebase Configuration
   ────────────────────────────────────────────────────────
   HOW TO SET UP:
   1. Go to https://console.firebase.google.com/
   2. Create a project → Add app → Web (</>)
   3. Copy your firebaseConfig object
   4. Replace the placeholder values below with your keys
   5. In Firestore → Create database (test mode to start)
      Collections auto-created:
        • "projects"  → admin portfolio projects
        • "messages"  → contact form submissions
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

/* ── Initialize ─────────────────────────────────────── */
let db = null;
let firebaseReady = false;

try {
  const isConfigured =
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

  if (isConfigured) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    firebaseReady = true;
    console.log("%c[Josh_d_Guru] Firebase connected ✓", "color:#C8A96E;font-weight:bold;");
  } else {
    console.warn(
      "%c[Josh_d_Guru] Firebase not configured — falling back to localStorage.\n" +
      "Fill in firebase-config.js with your real project credentials.",
      "color:#FF9900;"
    );
  }
} catch (err) {
  console.error("[Josh_d_Guru] Firebase init error:", err);
}

window.joshFirebase = { db, firebaseReady };
