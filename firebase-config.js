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
      } else if (collectionName === 'blog') {
        for (const item of dataList) {
          const existSnap = await db.collection('blog').where('slug', '==', item.slug).get();
          if (existSnap.empty) {
            await db.collection('blog').add(item);
            console.log(`[JoshFolio Seed] Seeding missing blog to cloud: ${item.title}`);
          }
        }
      }
    } catch (err) {
      console.error(`[JoshFolio Seed] Failed to seed ${collectionName}:`, err);
    }
  };

  // 1. Projects
  const demoProjects = [
    {
      title: "Kudiflow",
      slug: "kudiflow",
      category: "dev",
      categoryLabel: "Software Development",
      description: "A smart finance and operations manager simplifying wallet tracking, balance alerts, and transaction records for creative builders.",
      longDescription: "Kudiflow is a comprehensive fintech and productivity tool designed for builders, creators, and student entrepreneurs in Africa. It bridges ledger tracking with clean, beautiful UI components and automated analytics tools.",
      projectUrl: "https://kudiflow.com",
      repoUrl: "https://github.com/JOSHMECH/kudiflow",
      technologies: ["React", "Next.js", "Tailwind CSS", "Firebase"],
      coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      featured: true,
      status: "published",
      order: 0,
      createdAt: new Date().toISOString(),
      emoji: "💰"
    },
    {
      title: "ScholarLens AI",
      slug: "scholarlens",
      category: "dev",
      categoryLabel: "Software Development",
      description: "An AI-powered academic sandbox accelerating research extraction, automated citations compiling, and grade predictions.",
      longDescription: "ScholarLens integrates advanced AI models (like Gemini API) with robust client interfaces to assist students and researchers in compiling research papers, analyzing analytical data, and visualizing study paths.",
      projectUrl: "https://scholarlens.com",
      repoUrl: "https://github.com/JOSHMECH/scholarlens",
      technologies: ["React", "TypeScript", "Node.js", "Gemini API"],
      coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
      featured: true,
      status: "published",
      order: 1,
      createdAt: new Date().toISOString(),
      emoji: "📚"
    },
    {
      title: "SPSS Analytics Suite",
      slug: "spss-analytics",
      category: "data",
      categoryLabel: "Data Science",
      description: "A web-based analytical visualization dashboard mapping complex statistical linear regression and ANOVA models.",
      longDescription: "Developed for academic research at Olabisi Onabanjo University, this interactive statistics sandbox helps visualize data distributions, run Pearson correlation tests, and execute KNN classification streams.",
      projectUrl: "#stats-lab",
      repoUrl: "https://github.com/JOSHMECH/stats-sandbox",
      technologies: ["Python", "SPSS", "HTML5 Canvas", "R Programming"],
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      featured: true,
      status: "published",
      order: 2,
      createdAt: new Date().toISOString(),
      emoji: "📊"
    },
    {
      title: "GuruLabs Brand Identity",
      slug: "gurulabs-branding",
      category: "design",
      categoryLabel: "Creative Design",
      description: "Complete brand guidelines, design tokens, logos, typography postures, and digital assets designed for GuruLabs.",
      longDescription: "A comprehensive design system comprising dark-mode glassmorphic styling, custom HSL color systems, vector logo variations, and premium UI kit elements used across Kudiflow and ScholarLens.",
      projectUrl: "#startup",
      repoUrl: "",
      technologies: ["CorelDraw", "Figma", "Illustrator", "Adobe XD"],
      coverImage: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80",
      featured: true,
      status: "published",
      order: 3,
      createdAt: new Date().toISOString(),
      emoji: "✦"
    }
  ];
  await seedIfEmpty('projects', demoProjects);

  // 2. Services
  const demoServices = [
    { name: 'Frontend Engineering', icon: '⚙', description: 'Responsive, performant, accessible web apps with modern JavaScript, React, and CSS.', price: '₦150k+', features: ['React/Next.js integration', 'Semantic & responsive HTML', 'Dynamic micro-animations'], order: 1 },
    { name: 'Creative Design', icon: '✦', description: 'Brand identities, UI/UX design, print media, and motion graphics with industry tools.', price: '₦100k+', features: ['Figma design source file', 'Harmonious design tokens', 'Logo configurator setups'], order: 2 },
    { name: 'Data Science', icon: '◈', description: 'Statistical modelling, predictive analytics, and visualisation using Python, R, and SPSS.', price: '₦200k+', features: ['Statistical tests (ANOVA/Regression)', 'Python notebook reports', 'Data visualization charts'], order: 3 }
  ];
  await seedIfEmpty('services', demoServices);

  // 3. Plans
  const demoPlans = [
    { name: 'Basic Curated Page', price: '₦50k', ctaText: 'Get Started', features: ['Single landing page', 'Responsive clean layout', 'Contact form setup', 'Self-hosting options'], popular: false, order: 1 },
    { name: 'Standard Portfolio CMS', price: '₦150k', ctaText: 'Recommended', features: ['Full CMS portfolio panel', 'Cloud database integration', 'Security audit protections', 'Custom glassmorphic overlays'], popular: true, order: 2 },
    { name: 'Advanced AI Suite', price: '₦300k', ctaText: 'Partner With Us', features: ['Next.js/React infrastructure', 'Gemini AI API tools', 'Interactive data models', 'Live telemetry configurations'], popular: false, order: 3 }
  ];
  await seedIfEmpty('plans', demoPlans);

  // 4. Testimonials
  const demoTestimonials = [
    { clientName: 'Chinedu Okeke', position: 'Director of Product', company: 'Apex Solutions', review: "Joshua's ability to turn complex statistical data models into highly polished, responsive front-end views is absolutely unique. Our client dashboard has never looked better.", rating: 5, profileImage: '', createdAt: new Date().toISOString() },
    { clientName: 'Amina Yusuf', position: 'Founder', company: 'EduVibe Africa', review: 'An exceptional software developer and creative designer. He redesigned our brand identity and implemented the platform on time. Highly recommended for any serious web project!', rating: 5, profileImage: '', createdAt: new Date().toISOString() },
    { clientName: 'Sarah Jenkins', position: 'Head of Engineering', company: 'Vanguard Analytics', review: 'The SPSS analytics dashboard Joshua built for us is both robust and visually striking. His clean code, use of design tokens, and automation workflow transformed our operations.', rating: 5, profileImage: '', createdAt: new Date().toISOString() }
  ];
  await seedIfEmpty('testimonials', demoTestimonials);

  // 5. Blog
  const demoBlogs = [
    {
      title: 'Bridging Creative Design with Front-End Code',
      slug: 'bridging-design-with-code',
      author: 'Idowu Joshua Victor',
      tags: ['Design', 'Development'],
      content: 'In modern web design, having a division between design and code slows down product creation. By using design systems directly mapped to CSS custom tokens, creative developers can create live web projects that feel organic, dynamic, and beautiful at first render.\n\n### The Design System Hierarchy\n- Predefined HSL Color Tokens\n- Strict Typography Postures\n- Uniform spacing matrices\n- Fluid micro-animations.',
      publishDate: new Date().toISOString(),
      featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    },
    {
      title: 'Introducing Kudiflow: Smart Finance for Creators',
      slug: 'introducing-kudiflow-smart-finance',
      author: 'Idowu Joshua Victor',
      tags: ['Fintech', 'Productivity'],
      content: 'Managing operations and transaction tracking as a student builder or digital creator shouldn\'t feel like a chore. Kudiflow was engineered under the GuruLabs parent ecosystem to automate bookkeeping, expense logging, and cash flow visualizations.\n\n### Streamlined Financial Operations\nBy integrating intelligent ledger controls and predictive analytics, Kudiflow helps you:\n- Maintain real-time balance sheets\n- Set automated savings targets\n- Generate interactive expense reports instantly.',
      publishDate: new Date(Date.now() - 3600000).toISOString(),
      featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    },
    {
      title: 'ScholarLens: Elevating Student Research with AI',
      slug: 'scholarlens-ai-research-sandbox',
      author: 'Idowu Joshua Victor',
      tags: ['Edtech', 'AI'],
      content: 'Academic research is often hindered by fragmented tools. ScholarLens bridges the gap by offering a unified sandbox where students can extract key text insights, compile citations, and analyze grade predictions.\n\n### The Academic Sandbox Model\nDesigned to empower youth innovation, ScholarLens provides:\n- Automated AI summaries for PDFs\n- Citations mapping\n- Linear regression models for GPA predictions.',
      publishDate: new Date(Date.now() - 7200000).toISOString(),
      featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    }
  ];
  await seedIfEmpty('blog', demoBlogs);

  // 6. Settings - about
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

  // 7. Settings - socials
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

  // 8. Settings - email
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
