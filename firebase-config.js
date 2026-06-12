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

class HardcodedAuth {
  constructor() {
    this.callbacks = [];
    this.user = sessionStorage.getItem('josh_mock_logged_in') === 'true' ? { email: 'admin@joshfolio.com' } : null;
  }
  onAuthStateChanged(callback) {
    this.callbacks.push(callback);
    setTimeout(() => callback(this.user), 10);
    return () => {
      this.callbacks = this.callbacks.filter(c => c !== callback);
    };
  }
  get currentUser() {
    return this.user;
  }
  async signInWithEmailAndPassword(email, password) {
    if (email === 'admin@joshfolio.com' && password === 'admin123') {
      this.user = { email };
      sessionStorage.setItem('josh_mock_logged_in', 'true');
      this.callbacks.forEach(cb => cb(this.user));
      return { user: this.user };
    } else {
      throw new Error("Invalid credentials. Use admin@joshfolio.com and admin123.");
    }
  }
  async signOut() {
    this.user = null;
    sessionStorage.removeItem('josh_mock_logged_in');
    this.callbacks.forEach(cb => cb(null));
  }
}

window.HardcodedAuth = HardcodedAuth;

let db = null;
let auth = null;
let storage = null;
let firebaseReady = false;

try {
  const isConfigured =
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    localStorage.getItem('josh_use_mock_firebase') !== 'true'; // Force local sandbox mode

  if (isConfigured) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = new HardcodedAuth();
    storage = firebase.storage();
    firebaseReady = true;
    console.log("%c[JoshFolio] Firebase initialized successfully ✓ (Hardcoded Auth)", "color:#C8A96E;font-weight:bold;");
  } else {
    auth = new HardcodedAuth();
    console.warn(
      "%c[JoshFolio] Firebase placeholder keys detected or forced bypass — falling back to local storage.",
      "color:#FF9900;"
    );
  }
} catch (err) {
  console.error("[JoshFolio] Firebase initialization error:", err);
}

window.joshFirebase = { db, auth, storage, firebaseReady };

