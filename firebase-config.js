/* ════════════════════════════════════════════════════════════════
   JoshFolio — Firebase Configuration
   ────────────────────────────────────────────────────────────────
   Uses the Firebase Compat SDK (v9 compat) so admin.js and
   script.js need zero changes — same window.joshFirebase interface.

   ┌─────────────────────────────────────────────────────────────┐
   │  SETUP — paste your values from:                           │
   │  Firebase Console → Project Settings → Your apps → SDK    │
   └─────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "AIzaSyB38GyX3dfh93thaYHNbHoQ_auEyFkjB3U",
  authDomain:        "joshfolio-17209.firebaseapp.com",
  projectId:         "joshfolio-17209",
  storageBucket:     "joshfolio-17209.appspot.com",
  messagingSenderId: "660965216671",
  appId:             "1:660965216671:web:dbea24522101d80c242daa",
  measurementId:     "G-5J6FRNTB7E"
};


/* ─────────────────────────────────────────────────────────────── */
/*  HardcodedAuth — admin login (unchanged from original design)   */
/* ─────────────────────────────────────────────────────────────── */
class HardcodedAuth {
  constructor() {
    this.callbacks = [];
    this.user = sessionStorage.getItem('josh_mock_logged_in') === 'true'
      ? { email: 'admin@joshfolio.com' }
      : null;
  }
  onAuthStateChanged(callback) {
    this.callbacks.push(callback);
    setTimeout(() => callback(this.user), 10);
    return () => { this.callbacks = this.callbacks.filter(c => c !== callback); };
  }
  get currentUser() { return this.user; }
  async signInWithEmailAndPassword(email, password) {
    if (email === 'admin@joshfolio.com' && password === 'admin123') {
      this.user = { email };
      sessionStorage.setItem('josh_mock_logged_in', 'true');
      this.callbacks.forEach(cb => cb(this.user));
      return { user: this.user };
    }
    throw new Error('Invalid credentials. Use admin@joshfolio.com and admin123.');
  }
  async signOut() {
    this.user = null;
    sessionStorage.removeItem('josh_mock_logged_in');
    this.callbacks.forEach(cb => cb(null));
  }
}
window.HardcodedAuth = HardcodedAuth;

/* ─────────────────────────────────────────────────────────────── */
/*  Initialize & Cloud Seeding                                      */
/* ─────────────────────────────────────────────────────────────── */
async function seedAllCollectionsIfEmpty(db) {
  const seedIfEmpty = async (collectionName, dataList, docIdSelector = null) => {
    try {
      const snap = await db.collection(collectionName).get();
      if (snap.empty) {
        console.log(`[JoshFolio Seed] Seeding ${collectionName} to cloud...`);
        for (const item of dataList) {
          if (docIdSelector) {
            const docId = docIdSelector(item);
            const dataToSet = { ...item };
            delete dataToSet.id;
            await db.collection(collectionName).doc(docId).set(dataToSet);
          } else {
            await db.collection(collectionName).add(item);
          }
        }
        console.log(`[JoshFolio Seed] Seeding ${collectionName} complete ✓`);
      }
    } catch (err) {
      console.error(`[JoshFolio Seed] Failed to seed ${collectionName}:`, err);
    }
  };

  // 1. Settings - about
  const defaultAbout = {
    bio: "I'm a Lagos-based creative technologist who started with CorelDraw and ended up writing code, wrangling data, and automating workflows with AI.\nMy journey began in 2018 as a self-taught graphic designer, driven by curiosity and a hunger to turn ideas into visual experiences. By 2020 I was taking on real client work — brand identities, print media, flyers — out of local studios across Lagos.\nIn 2023 I made the leap into front-end development and it clicked immediately. My design background meant I wasn't just writing functional code — I was building things that feel good. Today I bridge three worlds: interactive UI engineering, brand design, and data analytics — all under one creative roof.\nCurrently pursuing a BSc in Statistics at Olabisi Onabanjo University, deepening my analytical edge with SPSS, R, and predictive modelling to complement my engineering and design toolkit.",
    skills: ["Next.js", "TypeScript", "TailwindCSS", "REST APIs", "Node.js", "Firebase", "SCSS"],
    certifications: [],
    experience: [
      { period: "2024 - Present", company: "GuruLabs", role: "Frontend Developer", description: "Details of job role..." }
    ],
    resumeUrl: "docs/IDOWU JOSHUA VICTOR RESUME.pdf",
    profileImage: "josh.png"
  };
  await seedIfEmpty('settings', [ { id: 'about', ...defaultAbout } ], item => item.id);

  // 2. Settings - socials
  const defaultSocials = {
    github: "https://github.com/JOSHMECH",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    behance: "https://behance.net",
    instagram: "https://instagram.com",
    email: "joshmech851@gmail.com",
    phone: "+234 816 1523 407"
  };
  await seedIfEmpty('settings', [ { id: 'socials', ...defaultSocials } ], item => item.id);

  // 3. Settings - email
  const defaultEmail = {
    enabled: false,
    publicJSKey: "",
    serviceID: "",
    templateID: "",
    autoReplyEnabled: false,
    autoReplyTemplateID: ""
  };
  await seedIfEmpty('settings', [ { id: 'email', ...defaultEmail } ], item => item.id);
}


(function init() {
  const isPlaceholder = firebaseConfig.apiKey === 'YOUR_API_KEY';
  const auth = new HardcodedAuth();

  /* Wire up firebase.firestore shims that admin.js uses */
  window.firebase = window.firebase || {};
  window.firebase.firestore = window.firebase.firestore || {};
  window.firebase.firestore.FieldValue = window.firebase.firestore.FieldValue || {
    serverTimestamp: () => new Date().toISOString()
  };
  window.firebase.firestore.Timestamp = window.firebase.firestore.Timestamp || {
    fromDate: (d) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString())
  };

  if (isPlaceholder) {
    /* ── Firebase not yet configured — fall back to Local Sandbox ── */
    console.warn(
      '%c[JoshFolio] Firebase not configured — running in Local Sandbox mode.',
      'color:#FBBF24; font-weight:bold;'
    );
    window.joshFirebase = { db: null, auth, storage: null, firebaseReady: false };
    return;
  }

  /* ── Real Firebase connection ── */
  try {
    // Initialize the app (guard against double-init)
    const app = firebase.apps && firebase.apps.length
      ? firebase.apps[0]
      : firebase.initializeApp(firebaseConfig);

    const db      = firebase.firestore();
    const storage = firebase.storage();

    /* Override FieldValue / Timestamp with real Firebase ones */
    window.firebase.firestore.FieldValue = firebase.firestore.FieldValue;
    window.firebase.firestore.Timestamp  = firebase.firestore.Timestamp;

    window.joshFirebase = {
      db,
      auth,
      storage,
      firebaseReady: true,
      isMock:        false
    };

    console.log(
      '%c[JoshFolio] Firebase Firestore connected ✓',
      'color:#C8A96E; font-weight:bold;'
    );

    // Seed empty Firestore database collections
    seedAllCollectionsIfEmpty(db);

  } catch (err) {
    console.error('[JoshFolio] Firebase init error:', err);
    window.joshFirebase = { db: null, auth, storage: null, firebaseReady: false };
  }
})();
