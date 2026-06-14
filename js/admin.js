/* ════════════════════════════════════════════════════════
   JoshFolio CMS — Admin Dashboard JavaScript
   Firebase Auth, Storage, and Firestore integrations.
   ════════════════════════════════════════════════════════ */

// Firebase References
function getDB() { return (window.joshFirebase || {}).db; }
function getAuth() { return (window.joshFirebase || {}).auth; }
function getStorage() { return (window.joshFirebase || {}).storage; }
function fbReady() { return !!(window.joshFirebase && window.joshFirebase.firebaseReady); }

// ─── MOCK FIREBASE FALLBACK SYSTEM ───────────────────────
function convertDatesToTimestamps(data) {
  if (!data) return data;
  const copy = { ...data };
  const timestampFields = ['createdAt', 'updatedAt', 'publishDate', 'sentAt', 'hiddenAt', 'timestamp'];
  for (const field of timestampFields) {
    if (copy[field]) {
      const val = copy[field];
      if (typeof val === 'string' || typeof val === 'number') {
        const d = new Date(val);
        copy[field] = {
          toDate: () => d,
          seconds: Math.floor(d.getTime() / 1000),
          nanoseconds: 0,
          toString: () => d.toString()
        };
      } else if (val && typeof val === 'object' && !val.toDate) {
        const d = val.seconds ? new Date(val.seconds * 1000) : new Date();
        copy[field] = {
          toDate: () => d,
          seconds: val.seconds || Math.floor(d.getTime() / 1000),
          nanoseconds: val.nanoseconds || 0,
          toString: () => d.toString()
        };
      }
    }
  }
  return copy;
}

class MockTimestamp {
  constructor(date = new Date()) {
    this.date = date;
  }
  toDate() {
    return this.date;
  }
  static fromDate(date) {
    return new MockTimestamp(date);
  }
}

class MockFieldValue {
  static serverTimestamp() {
    return '__MOCK_SERVER_TIMESTAMP__';
  }
}

class MockDocRef {
  constructor(collectionName, docId, firestore) {
    this.collectionName = collectionName;
    this.id = docId;
    this.firestore = firestore;
  }
  async get() {
    const data = this.firestore._getData(this.collectionName, this.id);
    return {
      exists: data !== null,
      id: this.id,
      data: () => convertDatesToTimestamps(data)
    };
  }
  async set(payload, options = {}) {
    this.firestore._setData(this.collectionName, this.id, payload, options.merge);
    return true;
  }
  async update(payload) {
    this.firestore._setData(this.collectionName, this.id, payload, true);
    return true;
  }
  async delete() {
    this.firestore._deleteData(this.collectionName, this.id);
    return true;
  }
}

class MockCollection {
  constructor(collectionName, firestore) {
    this.collectionName = collectionName;
    this.firestore = firestore;
    this._orderByField = null;
    this._orderByDirection = 'asc';
    this._limit = null;
  }
  orderBy(field, direction = 'asc') {
    this._orderByField = field;
    this._orderByDirection = direction;
    return this;
  }
  limit(n) {
    this._limit = n;
    return this;
  }
  doc(id) {
    const docId = id || Math.random().toString(36).substring(2, 15);
    return new MockDocRef(this.collectionName, String(docId), this.firestore);
  }
  async add(payload) {
    const docId = Math.random().toString(36).substring(2, 15);
    this.firestore._setData(this.collectionName, docId, payload, false);
    return { id: docId };
  }
  async get() {
    let list = this.firestore._getCollectionList(this.collectionName);
    if (this._orderByField) {
      list.sort((a, b) => {
        let valA = a[this._orderByField];
        let valB = b[this._orderByField];
        if (valA && valA.toDate) valA = valA.toDate().getTime();
        else if (valA && typeof valA === 'string') valA = new Date(valA).getTime();
        if (valB && valB.toDate) valB = valB.toDate().getTime();
        else if (valB && typeof valB === 'string') valB = new Date(valB).getTime();
        if (valA < valB) return this._orderByDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this._orderByDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    if (this._limit) {
      list = list.slice(0, this._limit);
    }
    const docs = list.map(item => ({
      id: item.id,
      data: () => convertDatesToTimestamps(item)
    }));
    return {
      empty: docs.length === 0,
      docs: docs,
      forEach: (callback) => docs.forEach(callback)
    };
  }
}

class MockFirestore {
  collection(name) {
    return new MockCollection(name, this);
  }
  _getCollectionList(name) {
    if (name === 'settings') return [];
    if (name === 'hidden_repos') {
      const arr = JSON.parse(localStorage.getItem('josh_hidden_repos') || '[]');
      return arr.map(id => ({ id, hiddenAt: new Date().toISOString() }));
    }
    if (name === 'github_overrides') {
      const obj = JSON.parse(localStorage.getItem('josh_github_overrides') || '{}');
      return Object.entries(obj).map(([id, val]) => ({ id, ...val }));
    }
    const key = this._getStorageKey(name);
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  _getStorageKey(collectionName) {
    const keys = {
      projects: 'josh_admin_projects',
      services: 'josh_services',
      plans: 'josh_plans',
      testimonials: 'josh_testimonials',
      blog: 'josh_blog',
      messages: 'josh_messages',
      activity_logs: 'josh_activity_logs'
    };
    return keys[collectionName] || `josh_mock_${collectionName}`;
  }
  _getData(collectionName, docId) {
    if (collectionName === 'settings') {
      const key = docId === 'email' ? 'josh_email_settings' : `josh_${docId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    if (collectionName === 'hidden_repos') {
      const arr = JSON.parse(localStorage.getItem('josh_hidden_repos') || '[]');
      return arr.includes(String(docId)) ? { hiddenAt: new Date().toISOString() } : null;
    }
    if (collectionName === 'github_overrides') {
      const obj = JSON.parse(localStorage.getItem('josh_github_overrides') || '{}');
      return obj[String(docId)] || null;
    }
    const list = this._getCollectionList(collectionName);
    return list.find(item => String(item.id) === String(docId)) || null;
  }
  _setData(collectionName, docId, payload, merge) {
    const cleanPayload = {};
    for (const [k, v] of Object.entries(payload)) {
      if (v === '__MOCK_SERVER_TIMESTAMP__') {
        cleanPayload[k] = new Date().toISOString();
      } else if (v && typeof v === 'object' && v.date) {
        cleanPayload[k] = v.date.toISOString();
      } else {
        cleanPayload[k] = v;
      }
    }
    if (collectionName === 'settings') {
      const key = docId === 'email' ? 'josh_email_settings' : `josh_${docId}`;
      let current = {};
      if (merge) {
        try { current = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e){}
      }
      const updated = { ...current, ...cleanPayload };
      localStorage.setItem(key, JSON.stringify(updated));
      return;
    }
    if (collectionName === 'hidden_repos') {
      const arr = JSON.parse(localStorage.getItem('josh_hidden_repos') || '[]');
      if (!arr.includes(String(docId))) {
        arr.push(String(docId));
        localStorage.setItem('josh_hidden_repos', JSON.stringify(arr));
      }
      return;
    }
    if (collectionName === 'github_overrides') {
      const obj = JSON.parse(localStorage.getItem('josh_github_overrides') || '{}');
      let current = obj[String(docId)] || {};
      if (merge) {
        current = { ...current, ...cleanPayload };
      } else {
        current = cleanPayload;
      }
      obj[String(docId)] = current;
      localStorage.setItem('josh_github_overrides', JSON.stringify(obj));
      return;
    }
    const key = this._getStorageKey(collectionName);
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const index = list.findIndex(item => String(item.id) === String(docId));
    if (index !== -1) {
      const current = list[index];
      const updated = merge ? { ...current, ...cleanPayload } : { id: docId, ...cleanPayload };
      updated.id = docId;
      list[index] = updated;
    } else {
      list.push({ id: docId, ...cleanPayload });
    }
    localStorage.setItem(key, JSON.stringify(list));
  }
  _deleteData(collectionName, docId) {
    if (collectionName === 'settings') {
      const key = docId === 'email' ? 'josh_email_settings' : `josh_${docId}`;
      localStorage.removeItem(key);
      return;
    }
    if (collectionName === 'hidden_repos') {
      let arr = JSON.parse(localStorage.getItem('josh_hidden_repos') || '[]');
      arr = arr.filter(id => String(id) !== String(docId));
      localStorage.setItem('josh_hidden_repos', JSON.stringify(arr));
      return;
    }
    if (collectionName === 'github_overrides') {
      const obj = JSON.parse(localStorage.getItem('josh_github_overrides') || '{}');
      delete obj[String(docId)];
      localStorage.setItem('josh_github_overrides', JSON.stringify(obj));
      return;
    }
    const key = this._getStorageKey(collectionName);
    let list = JSON.parse(localStorage.getItem(key) || '[]');
    list = list.filter(item => String(item.id) !== String(docId));
    localStorage.setItem(key, JSON.stringify(list));
  }
}

class MockStorageRef {
  constructor(path, dataUrl = '') {
    this.path = path;
    this.dataUrl = dataUrl;
  }
  child(subpath) {
    return new MockStorageRef(`${this.path}/${subpath}`, this.dataUrl);
  }
  async put(blob) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    return {
      ref: new MockStorageRef(this.path, dataUrl)
    };
  }
  async getDownloadURL() {
    return this.dataUrl || 'https://via.placeholder.com/960x540.png?text=Mock+Image';
  }
}

class MockStorage {
  ref() {
    return new MockStorageRef('');
  }
}

function setupMockFirebase() {
  const mockDb = new MockFirestore();
  const mockAuth = new HardcodedAuth();
  const mockStorage = new MockStorage();
  
  window.joshFirebase = {
    db: mockDb,
    auth: mockAuth,
    storage: mockStorage,
    firebaseReady: true,
    isMock: true
  };
  
  window.firebase = window.firebase || {};
  window.firebase.firestore = window.firebase.firestore || {};
  window.firebase.firestore.FieldValue = window.firebase.firestore.FieldValue || MockFieldValue;
  window.firebase.firestore.Timestamp = window.firebase.firestore.Timestamp || MockTimestamp;
}

// Global States
let activeView = 'overview';
let cachedProjects = [];
let cachedServices = [];
let cachedPlans = [];
let cachedTestimonials = [];
let cachedBlogs = [];
let cachedMessages = [];
let cachedGitHubRepos = [];
let deleteTarget = { id: null, type: null };
let currentDemoTab = 'blogs';

const DEMO_DATASETS = {
  blogs: [
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
  ],
  testimonials: [
    {
      clientName: 'Chinedu Okeke',
      position: 'Director of Product',
      company: 'Apex Solutions',
      review: "Joshua's ability to turn complex statistical data models into highly polished, responsive front-end views is absolutely unique. Our client dashboard has never looked better.",
      rating: 5,
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      clientName: 'Amina Yusuf',
      position: 'Founder',
      company: 'EduVibe Africa',
      review: 'An exceptional software developer and creative designer. He redesigned our brand identity and implemented the platform on time. Highly recommended for any serious web project!',
      rating: 5,
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      clientName: 'Sarah Jenkins',
      position: 'Head of Engineering',
      company: 'Vanguard Analytics',
      review: 'The SPSS analytics dashboard Joshua built for us is both robust and visually striking. His clean code, use of design tokens, and automation workflow transformed our operations.',
      rating: 5,
      profileImage: '',
      createdAt: new Date().toISOString()
    }
  ],
  projects: [
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
  ],
  services: [
    { name: 'Frontend Engineering', icon: '⚙', description: 'Responsive, performant, accessible web apps with modern JavaScript, React, and CSS.', price: '₦150k+', features: ['React/Next.js integration', 'Semantic & responsive HTML', 'Dynamic micro-animations'], order: 1 },
    { name: 'Creative Design', icon: '✦', description: 'Brand identities, UI/UX design, print media, and motion graphics with industry tools.', price: '₦100k+', features: ['Figma design source file', 'Harmonious design tokens', 'Logo configurator setups'], order: 2 },
    { name: 'Data Science', icon: '◈', description: 'Statistical modelling, predictive analytics, and visualisation using Python, R, and SPSS.', price: '₦200k+', features: ['Statistical tests (ANOVA/Regression)', 'Python notebook reports', 'Data visualization charts'], order: 3 }
  ],
  plans: [
    { name: 'Basic Curated Page', price: '₦50k', ctaText: 'Get Started', features: ['Single landing page', 'Responsive clean layout', 'Contact form setup', 'Self-hosting options'], popular: false, order: 1 },
    { name: 'Standard Portfolio CMS', price: '₦150k', ctaText: 'Recommended', features: ['Full CMS portfolio panel', 'Cloud database integration', 'Security audit protections', 'Custom glassmorphic overlays'], popular: true, order: 2 },
    { name: 'Advanced AI Suite', price: '₦300k', ctaText: 'Partner With Us', features: ['Next.js/React infrastructure', 'Gemini AI API tools', 'Interactive data models', 'Live telemetry configurations'], popular: false, order: 3 }
  ]
};

async function seedDemoBlogs() {
  const isOnline = fbReady();
  let count = 0;
  if (isOnline) {
    const db = getDB();
    for (const b of DEMO_DATASETS.blogs) {
      const snap = await db.collection('blog').where('slug', '==', b.slug).get();
      if (snap.empty) {
        await db.collection('blog').add(b);
        count++;
      }
    }
  } else {
    const local = JSON.parse(localStorage.getItem('josh_blog') || '[]');
    for (const b of DEMO_DATASETS.blogs) {
      if (!local.some(x => x.slug === b.slug)) {
        local.push({
          id: 'b-demo-' + Math.random().toString(36).substring(2, 9),
          ...b
        });
        count++;
      }
    }
    localStorage.setItem('josh_blog', JSON.stringify(local));
  }
  return count;
}

async function clearDemoBlogs() {
  const isOnline = fbReady();
  if (isOnline) {
    const db = getDB();
    const snap = await db.collection('blog').get();
    for (const doc of snap.docs) {
      await db.collection('blog').doc(doc.id).delete();
    }
  } else {
    localStorage.setItem('josh_blog', '[]');
  }
}

async function seedDemoTestimonials() {
  const isOnline = fbReady();
  let count = 0;
  if (isOnline) {
    const db = getDB();
    for (const t of DEMO_DATASETS.testimonials) {
      const snap = await db.collection('testimonials').where('clientName', '==', t.clientName).get();
      if (snap.empty) {
        await db.collection('testimonials').add(t);
        count++;
      }
    }
  } else {
    const local = JSON.parse(localStorage.getItem('josh_testimonials') || '[]');
    for (const t of DEMO_DATASETS.testimonials) {
      if (!local.some(x => x.clientName === t.clientName)) {
        local.push({
          id: 't-demo-' + Math.random().toString(36).substring(2, 9),
          ...t
        });
        count++;
      }
    }
    localStorage.setItem('josh_testimonials', JSON.stringify(local));
  }
  return count;
}

async function clearDemoTestimonials() {
  const isOnline = fbReady();
  if (isOnline) {
    const db = getDB();
    const snap = await db.collection('testimonials').get();
    for (const doc of snap.docs) {
      await db.collection('testimonials').doc(doc.id).delete();
    }
  } else {
    localStorage.setItem('josh_testimonials', '[]');
  }
}

async function seedDemoProjects() {
  const isOnline = fbReady();
  let count = 0;
  if (isOnline) {
    const db = getDB();
    for (const p of DEMO_DATASETS.projects) {
      const snap = await db.collection('projects').where('slug', '==', p.slug).get();
      if (snap.empty) {
        await db.collection('projects').add(p);
        count++;
      }
    }
  } else {
    const local = JSON.parse(localStorage.getItem('josh_admin_projects') || '[]');
    for (const p of DEMO_DATASETS.projects) {
      if (!local.some(x => x.slug === p.slug)) {
        local.push({
          id: 'p-demo-' + Math.random().toString(36).substring(2, 9),
          ...p
        });
        count++;
      }
    }
    localStorage.setItem('josh_admin_projects', JSON.stringify(local));
  }
  return count;
}

async function clearDemoProjects() {
  const isOnline = fbReady();
  if (isOnline) {
    const db = getDB();
    const snap = await db.collection('projects').get();
    for (const doc of snap.docs) {
      await db.collection('projects').doc(doc.id).delete();
    }
  } else {
    localStorage.setItem('josh_admin_projects', '[]');
  }
}

async function resetAllDemoData() {
  const isOnline = fbReady();
  if (isOnline) {
    const db = getDB();
    const collections = ['blog', 'testimonials', 'projects', 'services', 'plans'];
    for (const coll of collections) {
      const snap = await db.collection(coll).get();
      for (const doc of snap.docs) {
        await db.collection(coll).doc(doc.id).delete();
      }
    }
    for (const b of DEMO_DATASETS.blogs) await db.collection('blog').add(b);
    for (const t of DEMO_DATASETS.testimonials) await db.collection('testimonials').add(t);
    for (const p of DEMO_DATASETS.projects) await db.collection('projects').add(p);
    for (const s of DEMO_DATASETS.services) await db.collection('services').add(s);
    for (const pl of DEMO_DATASETS.plans) await db.collection('plans').add(pl);
  } else {
    localStorage.setItem('josh_blog', JSON.stringify(DEMO_DATASETS.blogs.map(b => ({ id: 'b-' + Math.random().toString(36).substring(2, 9), ...b }))));
    localStorage.setItem('josh_testimonials', JSON.stringify(DEMO_DATASETS.testimonials.map(t => ({ id: 't-' + Math.random().toString(36).substring(2, 9), ...t }))));
    localStorage.setItem('josh_admin_projects', JSON.stringify(DEMO_DATASETS.projects.map(p => ({ id: 'p-' + Math.random().toString(36).substring(2, 9), ...p }))));
    localStorage.setItem('josh_services', JSON.stringify(DEMO_DATASETS.services.map(s => ({ id: 's-' + Math.random().toString(36).substring(2, 9), ...s }))));
    localStorage.setItem('josh_plans', JSON.stringify(DEMO_DATASETS.plans.map(p => ({ id: 'pl-' + Math.random().toString(36).substring(2, 9), ...p }))));
  }
}

async function updateDemoCounts() {
  const isOnline = fbReady();
  let blogCount = 0;
  let testimonialCount = 0;
  let projectCount = 0;
  
  if (isOnline) {
    try {
      const db = getDB();
      const blogSnap = await db.collection('blog').get();
      const testSnap = await db.collection('testimonials').get();
      const projSnap = await db.collection('projects').get();
      
      blogCount = blogSnap.size;
      testimonialCount = testSnap.size;
      projectCount = projSnap.size;
    } catch (err) {
      console.warn('Failed to load demo counts from Firestore:', err);
    }
  } else {
    try {
      blogCount = JSON.parse(localStorage.getItem('josh_blog') || '[]').length;
      testimonialCount = JSON.parse(localStorage.getItem('josh_testimonials') || '[]').length;
      projectCount = JSON.parse(localStorage.getItem('josh_admin_projects') || '[]').length;
    } catch (e) {}
  }
  
  const bEl = document.getElementById('lblBlogCount');
  const tEl = document.getElementById('lblTestimonialCount');
  const pEl = document.getElementById('lblProjectCount');
  
  if (bEl) bEl.textContent = `${blogCount} article${blogCount !== 1 ? 's' : ''} in database.`;
  if (tEl) tEl.textContent = `${testimonialCount} review${testimonialCount !== 1 ? 's' : ''} in database.`;
  if (pEl) pEl.textContent = `${projectCount} project${projectCount !== 1 ? 's' : ''} in database.`;
}

// ─── DEMO DATA LIVE EDITOR ─────────────────────────────
function renderDemoEditorList() {
  const grid = document.getElementById('demoEditorGrid');
  const empty = document.getElementById('demoEditorEmptyMsg');
  if (!grid || !empty) return;

  grid.innerHTML = '';

  // Map tab name to cached data and metadata
  const tabConfig = {
    blogs:        { cache: cachedBlogs,        viewId: 'blog',         type: 'blog',        editFn: editBlogForm,        labelFn: b => b.title,        subFn: b => `${(b.tags||[]).join(', ')} · ${b.status || 'draft'}`,      thumbFn: b => b.featuredImage ? `<img src="${b.featuredImage}" alt="${b.title}" />` : '<div style="font-size:2.5rem">📝</div>' },
    testimonials: { cache: cachedTestimonials,  viewId: 'testimonials', type: 'testimonial', editFn: editTestimonialForm, labelFn: t => t.clientName,    subFn: t => `${t.position} · ${t.company} · ${'★'.repeat(t.rating)}`, thumbFn: () => '<div style="font-size:2.5rem">★</div>' },
    projects:     { cache: cachedProjects,      viewId: 'projects',     type: 'project',     editFn: editProjectForm,     labelFn: p => p.title,        subFn: p => `${p.categoryLabel || p.category || ''} · ${p.status || ''}`, thumbFn: p => p.coverImage ? `<img src="${p.coverImage}" alt="${p.title}" />` : `<div style="font-size:2.5rem">${p.emoji || '📁'}</div>` },
    services:     { cache: cachedServices,      viewId: 'services',     type: 'service',     editFn: editServiceForm,     labelFn: s => s.name,         subFn: s => `${s.price || ''} · ${(s.features||[]).slice(0,2).join(', ')}`, thumbFn: s => `<div style="font-size:2.5rem">${s.icon || '⚙'}</div>` },
    plans:        { cache: cachedPlans,         viewId: 'pricing',      type: 'plan',        editFn: editPlanForm,        labelFn: p => p.name,         subFn: p => `${p.price} · ${p.popular ? 'Popular' : 'Standard'}`,          thumbFn: () => '<div style="font-size:2.5rem">💵</div>' }
  };

  const cfg = tabConfig[currentDemoTab];
  if (!cfg) return;

  const items = cfg.cache || [];
  if (items.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    card.innerHTML = `
      <div class="mc-thumb">${cfg.thumbFn(item)}</div>
      <div class="mc-body">
        <p class="mc-cat">${cfg.subFn(item)}</p>
        <h3 class="mc-title">${cfg.labelFn(item)}</h3>
        <div class="mc-actions">
          <button class="btn-outline btn-sm demo-edit-btn" data-id="${item.id}" data-view="${cfg.viewId}" data-type="${cfg.type}">Edit</button>
          <button class="btn-danger btn-sm demo-del-btn" data-id="${item.id}" data-type="${cfg.type}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Bind edit buttons — switch to the proper CRUD view and open the form
  grid.querySelectorAll('.demo-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const targetView = btn.dataset.view;
      switchView(targetView);
      // Small delay to let the view render before opening the edit form
      setTimeout(() => {
        const editFn = tabConfig[currentDemoTab] && tabConfig[currentDemoTab].editFn;
        if (editFn) editFn(id);
      }, 100);
    });
  });

  // Bind delete buttons
  grid.querySelectorAll('.demo-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerDelete(btn.dataset.id, btn.dataset.type);
    });
  });
}

// Temporary upload blobs
let projectCoverBlob = null;
let aboutPhotoBlob = null;
let blogImgBlob = null;
let ghOverrideBlob = null;

// Initial Setup Check & Auth Listener
document.addEventListener('DOMContentLoaded', () => {
  if (!fbReady()) {
    setupMockFirebase();
    showToast('✓ Loaded local sandbox mode (offline).', false);
  }
  updateFirebaseStatus(true);
  
  getAuth().onAuthStateChanged(user => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });

  // Setup event triggers
  initEventTriggers();
});

function updateFirebaseStatus(ready) {
  const dot = document.getElementById('fbDot');
  const label = document.getElementById('fbLabel');
  if (!dot || !label) return;
  if (window.joshFirebase && window.joshFirebase.isMock) {
    dot.className = 'fb-dot connected local-sandbox';
    label.textContent = 'Local Sandbox ✓';
    dot.style.backgroundColor = 'var(--gold)';
    dot.style.boxShadow = '0 0 8px var(--gold)';
    return;
  }
  dot.style.backgroundColor = '';
  dot.style.boxShadow = '';
  if (ready) {
    dot.className = 'fb-dot connected';
    label.textContent = 'Firebase Connected';
  } else {
    dot.className = 'fb-dot error';
    label.textContent = 'Connection Offline';
  }
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  showToast('✓ Session verified.');
  switchView(activeView);
  await refreshDashboardData();
}

async function refreshDashboardData() {
  // Works in both real Firebase mode AND local sandbox (mock) mode
  if (!fbReady()) {
    console.warn('[JoshFolio CMS] Firebase not ready — skipping data refresh.');
    return;
  }
  try {
    await Promise.all([
      loadProjects(),
      loadServices(),
      loadPlans(),
      loadTestimonials(),
      loadBlogs(),
      loadMessages()
    ]);
    updateDashboardStats();
    loadActivityLogs();
    // Refresh the currently-visible list view after data loads
    safeRenderActiveView();
  } catch (err) {
    console.error('Error refreshing data:', err);
    showToast('⚠ Dashboard data load error. Check console.', true);
  }
}

function safeRenderActiveView() {
  try {
    if (activeView === 'projects')     renderProjectsList();
    else if (activeView === 'services')    renderServicesList();
    else if (activeView === 'pricing')     renderPlansList();
    else if (activeView === 'testimonials') renderTestimonialsList();
    else if (activeView === 'blog')        renderBlogsList();
    else if (activeView === 'messages')    renderMessagesList();
    else if (activeView === 'demodata')    renderDemoEditorList();
  } catch (e) {
    console.warn('[CMS] safeRenderActiveView error:', e);
  }
}

// ─── VIEW SWITCHING ────────────────────────────────────
function switchView(viewId) {
  activeView = viewId;
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.snav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.view === viewId);
  });

  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');

  const titles = {
    overview: 'Overview',
    projects: 'Project Showcase (CMS)',
    services: 'Services Catalog',
    pricing: 'Pricing Plans',
    testimonials: 'Client Feedback',
    about: 'About Profile Settings',
    blog: 'Blog Manager',
    messages: 'Inbox Messages',
    github: 'GitHub Repository Sync',
    email: 'Email Alert Settings',
    demodata: 'Demo Data Manager'
  };

  const subtitles = {
    overview: 'Welcome to your central portfolio control panel.',
    projects: 'Create, modify, and feature your case studies.',
    services: 'Define your design and engineering service offerings.',
    pricing: 'Configure editable plan tiers and popular options.',
    testimonials: 'Manage client quotes, ratings, and avatars.',
    about: 'Update biography text, skills tags, timeline entries, and profile photo.',
    blog: 'Write and publish editorial insights with formatting.',
    messages: 'Review user contact queries in your email/inbox.',
    github: 'Sync public repositories and overlay customization links.',
    email: 'Enable dynamic EmailJS notifications for contact submissions.',
    demodata: 'Initialize, restore, or clear default demo datasets.'
  };

  if (pageTitle) pageTitle.textContent = titles[viewId] || 'Dashboard';
  if (pageSub) pageSub.textContent = subtitles[viewId] || '';

  // View-specific loading hooks
  if (viewId === 'projects') renderProjectsList();
  if (viewId === 'services') renderServicesList();
  if (viewId === 'pricing') renderPlansList();
  if (viewId === 'testimonials') renderTestimonialsList();
  if (viewId === 'about') loadAboutForm();
  if (viewId === 'blog') renderBlogsList();
  if (viewId === 'messages') renderMessagesList();
  if (viewId === 'github') renderGitHubList();
  if (viewId === 'email') loadEmailSettingsForm();
  if (viewId === 'demodata') { updateDemoCounts(); renderDemoEditorList(); }

  closeSidebar();
}

// Mobile sidebar controls
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarToggle.classList.add('open');
  sidebarOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarToggle.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

// ─── LOGIN & LOGOUT ────────────────────────────────────
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('lemail').value.trim();
    const pass = document.getElementById('lpass').value;

    if (!email || !pass) {
      loginError.textContent = '✕ Fill in both fields.';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    loginError.textContent = '';

    try {
      await getAuth().signInWithEmailAndPassword(email, pass);
      loginBtn.textContent = 'Entering...';
    } catch (err) {
      console.error(err);
      loginError.textContent = `✕ Auth Failed: ${err.message}`;
      loginBtn.disabled = false;
      loginBtn.textContent = 'Enter Dashboard →';
    }
  });
}

const passToggle = document.getElementById('passToggle');
if (passToggle) {
  passToggle.addEventListener('click', () => {
    const inp = document.getElementById('lpass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await getAuth().signOut();
      showToast('Log out successful.');
    } catch (err) {
      showToast('Error during log out.', true);
    }
  });
}

// ─── STORAGE FILE UPLOAD HELPERS ───────────────────────
async function uploadFileToStorage(blob, folder, filename) {
  if (!blob || !fbReady()) return '';

  const fallbackToBase64 = () => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(blob);
  });

  const isMock = window.joshFirebase && window.joshFirebase.isMock;
  if (isMock) {
    return await fallbackToBase64();
  }

  try {
    const storageInstance = getStorage();
    const ref = storageInstance.ref().child(`${folder}/${filename}`);
    
    // Create the upload task
    const uploadTask = ref.put(blob);
    
    // Timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Upload timed out")), 5000)
    );
    
    // Race them
    const snapshot = await Promise.race([uploadTask, timeoutPromise]);
    return await snapshot.ref.getDownloadURL();
  } catch (err) {
    console.warn("Firebase Storage upload failed or timed out, falling back to base64 Data URL:", err);
    return await fallbackToBase64();
  }
}

function resizeImageFile(file, maxW, maxH, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
      } else {
        if (h > maxH) {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        callback(blob, canvas.toDataURL('image/jpeg', 0.8));
      }, 'image/jpeg', 0.8);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── SYSTEM LOGS ───────────────────────────────────────
async function logActivity(action, details) {
  if (!fbReady()) return;
  try {
    await getDB().collection('activity_logs').add({
      action,
      details,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      user: getAuth().currentUser.email
    });
  } catch (err) {
    console.warn('Logging activity failed:', err);
  }
}

async function loadActivityLogs() {
  const container = document.getElementById('recentActivityList');
  if (!container || !fbReady()) return;
  try {
    const snap = await getDB().collection('activity_logs')
      .orderBy('timestamp', 'desc')
      .limit(6)
      .get();
    container.innerHTML = '';
    
    if (snap.empty) {
      container.innerHTML = '<p class="empty-msg" style="padding:0;">No system logs available.</p>';
      return;
    }
    
    snap.forEach(doc => {
      const log = doc.data();
      const date = log.timestamp ? (typeof log.timestamp.toDate === 'function' ? log.timestamp.toDate() : new Date(log.timestamp)) : null;
      const time = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
      const div = document.createElement('div');
      div.className = 'activity-log';
      div.innerHTML = `<span class="act-time">[${time}]</span> <span class="act-desc">${log.action}: ${log.details}</span>`;
      container.appendChild(div);
    });
  } catch (err) {
    console.warn('Could not load activity logs:', err);
  }
}

// ─── STATS COUNTER ─────────────────────────────────────
function updateDashboardStats() {
  document.getElementById('statTotalProjects').textContent = cachedProjects.length;
  document.getElementById('statTotalServices').textContent = cachedServices.length;
  document.getElementById('statTotalTestimonials').textContent = cachedTestimonials.length;
  document.getElementById('statTotalBlog').textContent = cachedBlogs.length;
  
  const unreadMessages = cachedMessages.filter(m => !m.read).length;
  document.getElementById('statTotalMessages').textContent = unreadMessages;
}

// ─── PROJECTS CRUD IMPLEMENTATION ──────────────────────
async function loadProjects() {
  // Try ordering by 'order'; fall back to unordered if field missing
  try {
    const snap = await getDB().collection('projects').orderBy('order', 'asc').get();
    cachedProjects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[CMS] orderBy(order) failed, loading without sort:', err);
    const snap = await getDB().collection('projects').get();
    cachedProjects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

function renderProjectsList(search = '') {
  const grid = document.getElementById('projectsGrid');
  const emptyMsg = document.getElementById('projectsEmptyMsg');
  const sub = document.getElementById('projectsCountSub');
  
  grid.innerHTML = '';
  const filtered = cachedProjects.filter(p => {
    const label = (p.categoryLabel || p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return !search || title.includes(search.toLowerCase()) || label.includes(search.toLowerCase());
  });

  sub.textContent = `${filtered.length} project${filtered.length !== 1 ? 's' : ''} configured.`;

  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    const imagePreview = p.coverImage 
      ? `<img src="${p.coverImage}" alt="${p.title}" />` 
      : `<div style="font-size:2.5rem;">📁</div>`;
      
    card.innerHTML = `
      <div class="mc-thumb">${imagePreview}</div>
      <div class="mc-body">
        <p class="mc-cat">${p.categoryLabel} ${p.featured ? '<span style="color:var(--gold); font-size:0.6rem; border:1px solid var(--border); padding:0.05rem 0.2rem; border-radius:3px; margin-left:4px;">★ Featured</span>' : ''}</p>
        <h3 class="mc-title">${p.title}</h3>
        <p class="mc-desc">${p.description}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-proj-btn" data-id="${p.id}">Edit</button>
          <button class="btn-danger btn-sm del-proj-btn" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-proj-btn').forEach(btn => {
    btn.addEventListener('click', () => editProjectForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-proj-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'project'));
  });
}

function editProjectForm(id) {
  const p = cachedProjects.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('projectFormPanel').style.display = 'block';
  document.getElementById('projectFormTitle').textContent = 'Edit Project Case Study';
  
  document.getElementById('projectId').value = p.id;
  document.getElementById('projTitle').value = p.title;
  document.getElementById('projSlug').value = p.slug;
  document.getElementById('projCategory').value = p.category;
  document.getElementById('projCatLabel').value = p.categoryLabel || '';
  document.getElementById('projDesc').value = p.description;
  document.getElementById('projLongDesc').value = p.longDescription;
  document.getElementById('projClient').value = p.client || '';
  document.getElementById('projDate').value = p.completionDate || '';
  document.getElementById('projUrl').value = p.projectUrl || '';
  document.getElementById('projRepo').value = p.repoUrl || '';
  document.getElementById('projTech').value = (p.technologies || []).join(', ');
  document.getElementById('projFeatured').checked = !!p.featured;
  document.getElementById('projStatus').value = p.status || 'published';

  // Preview cover
  if (p.coverImage) {
    document.getElementById('projCoverPreview').src = p.coverImage;
    document.getElementById('projCoverPreviewWrap').style.display = 'block';
    document.getElementById('projCoverDropZone').style.display = 'none';
  } else {
    document.getElementById('projCoverPreviewWrap').style.display = 'none';
    document.getElementById('projCoverDropZone').style.display = 'block';
  }
  projectCoverBlob = null;
  document.getElementById('projectFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── SERVICES CRUD IMPLEMENTATION ──────────────────────
async function loadServices() {
  try {
    const snap = await getDB().collection('services').orderBy('order', 'asc').get();
    cachedServices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[CMS] loadServices orderBy failed, loading without sort:', err);
    const snap = await getDB().collection('services').get();
    cachedServices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

function renderServicesList() {
  const grid = document.getElementById('servicesGrid');
  const empty = document.getElementById('servicesEmptyMsg');
  
  grid.innerHTML = '';
  if (cachedServices.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  cachedServices.forEach(s => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    card.innerHTML = `
      <div class="mc-thumb" style="background:var(--surface-2); font-size:3rem;">${s.icon}</div>
      <div class="mc-body">
        <p class="mc-cat">Starting Price: ${s.price}</p>
        <h3 class="mc-title">${s.name}</h3>
        <p class="mc-desc">${s.description}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-serv-btn" data-id="${s.id}">Edit</button>
          <button class="btn-danger btn-sm del-serv-btn" data-id="${s.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-serv-btn').forEach(btn => {
    btn.addEventListener('click', () => editServiceForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-serv-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'service'));
  });
}

function editServiceForm(id) {
  const s = cachedServices.find(x => x.id === id);
  if (!s) return;

  document.getElementById('serviceFormPanel').style.display = 'block';
  document.getElementById('serviceFormTitle').textContent = 'Edit Service Offering';
  document.getElementById('serviceId').value = s.id;
  document.getElementById('servName').value = s.name;
  document.getElementById('servIcon').value = s.icon;
  document.getElementById('servPrice').value = s.price;
  document.getElementById('servFeatures').value = (s.features || []).join(', ');
  document.getElementById('servDesc').value = s.description;

  document.getElementById('serviceFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── PRICING PLANS CRUD ────────────────────────────────
async function loadPlans() {
  try {
    const snap = await getDB().collection('plans').orderBy('order', 'asc').get();
    cachedPlans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[CMS] loadPlans orderBy failed, loading without sort:', err);
    const snap = await getDB().collection('plans').get();
    cachedPlans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

function renderPlansList() {
  const grid = document.getElementById('pricingGrid');
  const empty = document.getElementById('pricingEmptyMsg');
  
  grid.innerHTML = '';
  if (cachedPlans.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  cachedPlans.forEach(p => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    card.innerHTML = `
      <div class="mc-thumb" style="font-size:2rem; background:var(--surface-2);">💵</div>
      <div class="mc-body">
        <p class="mc-cat">Tier Tier Plan ${p.popular ? '<span style="color:var(--gold); border:1px solid var(--border); border-radius:3px; padding:0 3px; font-size:0.6rem; margin-left:4px;">Popular</span>' : ''}</p>
        <h3 class="mc-title">${p.name}</h3>
        <p class="mc-desc" style="font-family:var(--font-mono); color:var(--gold); font-size:1.1rem; font-weight:700;">${p.price}</p>
        <p class="mc-desc" style="-webkit-line-clamp:3;">Features: ${(p.features || []).join(' · ')}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-plan-btn" data-id="${p.id}">Edit</button>
          <button class="btn-danger btn-sm del-plan-btn" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => editPlanForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'plan'));
  });
}

function editPlanForm(id) {
  const p = cachedPlans.find(x => x.id === id);
  if (!p) return;

  document.getElementById('planFormPanel').style.display = 'block';
  document.getElementById('planFormTitle').textContent = 'Edit Pricing Plan';
  document.getElementById('planId').value = p.id;
  document.getElementById('planName').value = p.name;
  document.getElementById('planPrice').value = p.price;
  document.getElementById('planCta').value = p.ctaText;
  document.getElementById('planFeatures').value = (p.features || []).join(', ');
  document.getElementById('planPopular').checked = !!p.popular;

  document.getElementById('planFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── TESTIMONIALS CRUD ─────────────────────────────────
async function seedTestimonialsIfEmpty() {
  const db = getDB();
  if (!db) return;
  try {
    const snap = await db.collection('testimonials').get();
    if (snap.empty) {
      const demoTestimonials = [
        {
          clientName: 'Chinedu Okeke',
          position: 'Director of Product',
          company: 'Apex Solutions',
          review: "Joshua's ability to turn complex statistical data models into highly polished, responsive front-end views is absolutely unique. Our client dashboard has never looked better.",
          rating: 5,
          profileImage: '',
          createdAt: new Date().toISOString()
        },
        {
          clientName: 'Amina Yusuf',
          position: 'Founder',
          company: 'EduVibe Africa',
          review: 'An exceptional software developer and creative designer. He redesigned our brand identity and implemented the platform on time. Highly recommended for any serious web project!',
          rating: 5,
          profileImage: '',
          createdAt: new Date().toISOString()
        },
        {
          clientName: 'Sarah Jenkins',
          position: 'Head of Engineering',
          company: 'Vanguard Analytics',
          review: 'The SPSS analytics dashboard Joshua built for us is both robust and visually striking. His clean code, use of design tokens, and automation workflow transformed our operations.',
          rating: 5,
          profileImage: '',
          createdAt: new Date().toISOString()
        }
      ];
      for (const t of demoTestimonials) {
        await db.collection('testimonials').add(t);
      }
      localStorage.setItem('josh_testimonials_seeded', 'true');
      console.log("[JoshFolio] Testimonials successfully seeded with 3 demo entries.");
    }
  } catch (err) {
    console.warn("Failed to seed testimonials:", err);
  }
}

async function loadTestimonials() {
  await seedTestimonialsIfEmpty();
  const snap = await getDB().collection('testimonials').orderBy('createdAt', 'desc').get();
  cachedTestimonials = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderTestimonialsList() {
  const grid = document.getElementById('testimonialsGrid');
  const empty = document.getElementById('testimonialsEmptyMsg');
  
  grid.innerHTML = '';
  if (cachedTestimonials.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  cachedTestimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'manage-card';
      
    card.innerHTML = `
      <div class="mc-body">
        <p class="mc-cat">${t.position} · ${t.company}</p>
        <h3 class="mc-title">${t.clientName}</h3>
        <p class="mc-desc" style="color:var(--gold); font-size:0.75rem;">${'★'.repeat(t.rating)}</p>
        <p class="mc-desc">${t.review}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-test-btn" data-id="${t.id}">Edit</button>
          <button class="btn-danger btn-sm del-test-btn" data-id="${t.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-test-btn').forEach(btn => {
    btn.addEventListener('click', () => editTestimonialForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-test-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'testimonial'));
  });
}

function editTestimonialForm(id) {
  const t = cachedTestimonials.find(x => x.id === id);
  if (!t) return;

  document.getElementById('testimonialFormPanel').style.display = 'block';
  document.getElementById('testimonialFormTitle').textContent = 'Edit Client Feedback';
  document.getElementById('testimonialId').value = t.id;
  document.getElementById('testName').value = t.clientName;
  document.getElementById('testRating').value = t.rating;
  document.getElementById('testPos').value = t.position;
  document.getElementById('testComp').value = t.company;
  document.getElementById('testReview').value = t.review;

  document.getElementById('testimonialFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── ABOUT PROFILE SETTINGS ───────────────────────────
async function loadAboutForm() {
  if (!fbReady()) return;
  try {
    const doc = await getDB().collection('settings').doc('about').get();
    const data = doc.exists ? doc.data() : { bio: '', skills: [], certifications: [], experience: [], resumeUrl: '', profileImage: '' };
    
    document.getElementById('aboutBio').value = data.bio || '';
    document.getElementById('aboutSkills').value = (data.skills || []).join(', ');
    document.getElementById('aboutCerts').value = (data.certifications || []).join(', ');
    document.getElementById('aboutResumeUrl').value = data.resumeUrl || '';

    // Experience builder
    const timelineBuilder = document.getElementById('experienceTimelineBuilder');
    timelineBuilder.innerHTML = '';
    
    const experienceList = data.experience || [];
    experienceList.forEach(exp => {
      createExperienceRow(exp.period, exp.company, exp.role, exp.description);
    });

    if (data.profileImage) {
      document.getElementById('aboutPhotoPreview').src = data.profileImage;
      document.getElementById('aboutPhotoPreviewWrap').style.display = 'block';
      document.getElementById('aboutPhotoDropZone').style.display = 'none';
    } else {
      document.getElementById('aboutPhotoPreviewWrap').style.display = 'none';
      document.getElementById('aboutPhotoDropZone').style.display = 'block';
    }
    aboutPhotoBlob = null;
  } catch (err) {
    showToast('Failed to load profile details.', true);
  }
}

function createExperienceRow(period = '', company = '', role = '', desc = '') {
  const container = document.getElementById('experienceTimelineBuilder');
  const row = document.createElement('div');
  row.className = 'exp-row-inputs';
  row.innerHTML = `
    <input type="text" class="exp-period" placeholder="2024 - Present" value="${period}" required />
    <input type="text" class="exp-company" placeholder="GuruLabs" value="${company}" required />
    <input type="text" class="exp-role" placeholder="Frontend Developer" value="${role}" required />
    <input type="text" class="exp-desc" placeholder="Details of job role..." value="${desc}" required />
    <div class="exp-remove-row-btn">✕</div>
  `;
  row.querySelector('.exp-remove-row-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

// ─── BLOG CRUD IMPLEMENTATION ─────────────────────────
async function seedBlogsIfEmpty() {
  const db = getDB();
  if (!db) return;
  try {
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

    for (const b of demoBlogs) {
      const existSnap = await db.collection('blog').where('slug', '==', b.slug).get();
      if (existSnap.empty) {
        await db.collection('blog').add(b);
        console.log(`[JoshFolio CMS] Seeded Firestore blog: ${b.title}`);
      }
    }
    localStorage.setItem('josh_blogs_seeded', 'true');
  } catch (err) {
    console.warn("Failed to seed blogs in CMS:", err);
  }
}

async function loadBlogs() {
  await seedBlogsIfEmpty();
  const snap = await getDB().collection('blog').orderBy('publishDate', 'desc').get();
  cachedBlogs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderBlogsList(search = '') {
  const grid = document.getElementById('blogGrid');
  const empty = document.getElementById('blogEmptyMsg');
  const sub = document.getElementById('blogCountSub');
  
  grid.innerHTML = '';
  const filtered = cachedBlogs.filter(b => 
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  sub.textContent = `${filtered.length} article${filtered.length !== 1 ? 's' : ''} found.`;

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach(b => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    const thumb = b.featuredImage 
      ? `<img src="${b.featuredImage}" alt="${b.title}" />` 
      : `<div style="font-size:2.5rem;">📝</div>`;
      
    const dateStr = b.publishDate
      ? (typeof b.publishDate.toDate === 'function'
          ? b.publishDate.toDate()
          : new Date(b.publishDate)
        ).toLocaleDateString()
      : '';
    
    card.innerHTML = `
      <div class="mc-thumb">${thumb}</div>
      <div class="mc-body">
        <p class="mc-cat">${dateStr} · Status: ${b.status}</p>
        <h3 class="mc-title">${b.title}</h3>
        <p class="mc-desc" style="-webkit-line-clamp: 2;">Tags: ${(b.tags || []).join(', ')}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-blog-btn" data-id="${b.id}">Edit</button>
          <button class="btn-danger btn-sm del-blog-btn" data-id="${b.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => editBlogForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'blog'));
  });
}

function editBlogForm(id) {
  const b = cachedBlogs.find(x => x.id === id);
  if (!b) return;

  document.getElementById('blogFormPanel').style.display = 'block';
  document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
  
  document.getElementById('blogId').value = b.id;
  document.getElementById('blogTitle').value = b.title;
  document.getElementById('blogSlug').value = b.slug;
  document.getElementById('blogAuthor').value = b.author;
  document.getElementById('blogTags').value = (b.tags || []).join(', ');
  document.getElementById('blogStatus').value = b.status || 'published';
  document.getElementById('blogContent').value = b.content;
  
  if (b.publishDate) {
    const d = b.publishDate.toDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    document.getElementById('blogDate').value = `${yyyy}-${mm}-${dd}`;
  }

  if (b.featuredImage) {
    document.getElementById('blogImgPreview').src = b.featuredImage;
    document.getElementById('blogImgPreviewWrap').style.display = 'block';
    document.getElementById('blogImgDropZone').style.display = 'none';
  } else {
    document.getElementById('blogImgPreviewWrap').style.display = 'none';
    document.getElementById('blogImgDropZone').style.display = 'block';
  }
  blogImgBlob = null;
  document.getElementById('blogFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── INBOX MESSAGES ────────────────────────────────────
async function loadMessages() {
  try {
    const snap = await getDB().collection('messages').orderBy('createdAt', 'desc').get();
    cachedMessages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[CMS] loadMessages orderBy failed, loading without sort:', err);
    const snap = await getDB().collection('messages').get();
    cachedMessages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

function renderMessagesList(search = '') {
  const grid = document.getElementById('messageGrid');
  const empty = document.getElementById('messagesEmpty');
  const sub = document.getElementById('messagesSub');
  
  grid.innerHTML = '';
  const filtered = cachedMessages.filter(m => {
    if (!search) return true;
    const name    = (m.name    || '').toLowerCase();
    const email   = (m.email   || '').toLowerCase();
    const message = (m.message || '').toLowerCase();
    const s = search.toLowerCase();
    return name.includes(s) || email.includes(s) || message.includes(s);
  });

  sub.textContent = `${filtered.length} message${filtered.length !== 1 ? 's' : ''} found.`;

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach(m => {
    const card = document.createElement('div');
    card.className = `message-card ${m.read ? '' : 'unread'}`;
    const dateStr = m.createdAt
      ? (typeof m.createdAt.toDate === 'function'
          ? m.createdAt.toDate()
          : new Date(m.createdAt)
        ).toLocaleString()
      : '';
    
    card.innerHTML = `
      <div class="msg-header">
        <span class="msg-title">${m.subject || 'No Subject'}</span>
        <span class="msg-date">${dateStr}</span>
      </div>
      <div class="msg-body">
        <h4 style="font-size:0.9rem; margin-bottom:0.2rem;">${m.name}</h4>
        <p class="msg-email">${m.email}</p>
        <p class="msg-text">${m.message}</p>
      </div>
      <div class="msg-footer">
        ${!m.read ? `<button class="btn-gold btn-sm mark-read-btn" data-id="${m.id}">Mark Read</button>` : ''}
        <button class="btn-danger btn-sm del-msg-btn" data-id="${m.id}">Delete</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', () => markMessageAsRead(btn.dataset.id));
  });
  grid.querySelectorAll('.del-msg-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'message'));
  });
}

async function markMessageAsRead(id) {
  if (!fbReady()) return;
  try {
    await getDB().collection('messages').doc(id).update({ read: true });
    showToast('Message status: Read.');
    await loadMessages();
    renderMessagesList();
    updateDashboardStats();
  } catch (err) {
    showToast('Failed to update message.', true);
  }
}

// ─── DELETE ACTION CONTROLLER ──────────────────────────
function triggerDelete(id, type) {
  deleteTarget = { id, type };
  document.getElementById('deleteOverlay').style.display = 'flex';
}

const deleteOverlay = document.getElementById('deleteOverlay');
const delCancel = document.getElementById('delCancel');
const delConfirm = document.getElementById('delConfirm');

if (delCancel) delCancel.addEventListener('click', () => {
  deleteOverlay.style.display = 'none';
  deleteTarget = { id: null, type: null };
});

if (delConfirm) {
  delConfirm.addEventListener('click', async () => {
    const { id, type } = deleteTarget;
    if (!id || !fbReady()) return;
    
    delConfirm.disabled = true;
    delConfirm.textContent = 'Removing...';

    try {
      if (type === 'project') {
        await getDB().collection('projects').doc(id).delete();
        await loadProjects();
        renderProjectsList();
        logActivity('Delete Project', `ID: ${id}`);
        showToast('Project deleted successfully.');
      } else if (type === 'service') {
        await getDB().collection('services').doc(id).delete();
        await loadServices();
        renderServicesList();
        logActivity('Delete Service', `ID: ${id}`);
        showToast('Service deleted.');
      } else if (type === 'plan') {
        await getDB().collection('plans').doc(id).delete();
        await loadPlans();
        renderPlansList();
        logActivity('Delete Plan', `ID: ${id}`);
        showToast('Pricing Plan deleted.');
      } else if (type === 'testimonial') {
        await getDB().collection('testimonials').doc(id).delete();
        await loadTestimonials();
        renderTestimonialsList();
        logActivity('Delete Feedback', `ID: ${id}`);
        showToast('Feedback post deleted.');
      } else if (type === 'blog') {
        await getDB().collection('blog').doc(id).delete();
        await loadBlogs();
        renderBlogsList();
        logActivity('Delete Blog', `ID: ${id}`);
        showToast('Article deleted.');
      } else if (type === 'message') {
        await getDB().collection('messages').doc(id).delete();
        await loadMessages();
        renderMessagesList();
        showToast('Message deleted.');
      }
      updateDashboardStats();
      // Keep Demo Data editor in sync if an item was deleted from there
      if (activeView === 'demodata') {
        updateDemoCounts();
        renderDemoEditorList();
      }
    } catch (err) {
      console.error(err);
      showToast(`Delete failed: ${err.message}`, true);
    } finally {
      delConfirm.disabled = false;
      delConfirm.textContent = 'Yes, Delete';
      deleteOverlay.style.display = 'none';
      deleteTarget = { id: null, type: null };
    }
  });
}

// ─── GITHUB SYNC DASHBOARD ─────────────────────────────
async function loadGitHubReposFromAPI() {
  if (cachedGitHubRepos.length > 0) return cachedGitHubRepos;
  
  const cacheKey = 'josh_admin_raw_github_repos';
  try {
    const res = await fetch('https://api.github.com/users/JOSHMECH/repos?sort=updated&per_page=100');
    if (!res.ok) throw new Error('GitHub API rate limit exceeded or connection error.');
    const repos = await res.json();
    cachedGitHubRepos = repos.filter(r => !r.fork);
    localStorage.setItem(cacheKey, JSON.stringify(cachedGitHubRepos));
    return cachedGitHubRepos;
  } catch (err) {
    console.warn('[JoshFolio] GitHub fetch failed, attempting cache fallback:', err);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        cachedGitHubRepos = JSON.parse(cached);
        return cachedGitHubRepos;
      } catch (e) {}
    }
    
    // If no cache, return hardcoded mock repositories so the admin page never breaks
    console.warn('[JoshFolio] No cache found, returning hardcoded mock repositories.');
    cachedGitHubRepos = [
      {
        id: 111111111,
        name: 'scholarlens',
        description: 'An AI-powered academic sandbox that accelerates research, organizes notes, compiles citations.',
        language: 'JavaScript',
        fork: false,
        html_url: 'https://github.com/JOSHMECH/scholarlens',
        homepage: 'https://scholarlens.example.com'
      },
      {
        id: 222222222,
        name: 'kudiflow',
        description: 'A smart finance and operations manager that simplifies payments, balances, tracking, and growth.',
        language: 'Python',
        fork: false,
        html_url: 'https://github.com/JOSHMECH/kudiflow',
        homepage: 'https://kudiflow.example.com'
      },
      {
        id: 333333333,
        name: 'joshfolio-2026',
        description: 'My personal creative developer portfolio website built using vanilla CSS and JavaScript.',
        language: 'HTML',
        fork: false,
        html_url: 'https://github.com/JOSHMECH/joshfolio-2026',
        homepage: null
      }
    ];
    return cachedGitHubRepos;
  }
}

async function getHiddenRepos() {
  const snap = await getDB().collection('hidden_repos').get();
  return snap.docs.map(d => String(d.id));
}

async function getGitHubOverrides() {
  const snap = await getDB().collection('github_overrides').get();
  const overrides = {};
  snap.forEach(doc => { overrides[doc.id] = doc.data(); });
  return overrides;
}

async function renderGitHubList(search = '') {
  const grid = document.getElementById('githubGrid');
  const loading = document.getElementById('githubLoading');
  const empty = document.getElementById('githubEmpty');
  const sub = document.getElementById('githubSub');
  
  grid.innerHTML = '';
  loading.style.display = 'block';
  empty.style.display = 'none';

  try {
    const repos = await loadGitHubReposFromAPI();
    
    let hiddenList = [];
    try {
      hiddenList = await getHiddenRepos();
    } catch (dbErr) {
      console.warn('[JoshFolio] Failed to load hidden repositories from Firestore:', dbErr);
    }
    const hiddenSet = new Set(hiddenList.map(String));

    let overrides = {};
    try {
      overrides = await getGitHubOverrides();
    } catch (dbErr) {
      console.warn('[JoshFolio] Failed to load GitHub overrides from Firestore:', dbErr);
    }

    loading.style.display = 'none';
    
    const filtered = repos.filter(r => 
      !search || r.name.toLowerCase().includes(search.toLowerCase()) || 
      (r.language || '').toLowerCase().includes(search.toLowerCase())
    );

    sub.textContent = `${filtered.length} repository${filtered.length !== 1 ? 'ies' : ''} found.`;
    if (filtered.length === 0) {
      empty.style.display = 'block';
      return;
    }

    filtered.forEach(r => {
      const isHidden = hiddenSet.has(String(r.id));
      const override = overrides[String(r.id)] || {};
      const hasOverride = !!override.liveUrl || !!override.previewUrl;
      const card = document.createElement('div');
      card.className = 'manage-card';
      const lang = r.language || 'Code';
      
      card.innerHTML = `
        <div class="mc-thumb" style="font-size:2.5rem; background:var(--surface-2);">📁</div>
        <div class="mc-body">
          <p class="mc-cat">${lang} ${hasOverride ? '<span style="color:var(--gold); border:1px solid var(--border); border-radius:3px; padding:0 3px; font-size:0.6rem; margin-left:4px;">Overrides Active</span>' : ''}</p>
          <h3 class="mc-title">${r.name}</h3>
          <p class="mc-desc">${r.description || 'Public GitHub repository.'}</p>
          <div class="mc-actions">
            ${isHidden 
              ? `<button class="btn-gold btn-sm toggle-github-btn" data-id="${r.id}" data-action="show">Include</button>`
              : `<button class="btn-outline btn-sm toggle-github-btn" data-id="${r.id}" data-action="hide">Exclude</button>`
            }
            <button class="btn-outline btn-sm edit-github-btn" data-id="${r.id}" data-name="${r.name}">Configure Overrides</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.toggle-github-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        btn.disabled = true;
        try {
          if (action === 'hide') {
            await getDB().collection('hidden_repos').doc(String(id)).set({ hiddenAt: firebase.firestore.FieldValue.serverTimestamp() });
            showToast('Repository hidden.');
          } else {
            await getDB().collection('hidden_repos').doc(String(id)).delete();
            showToast('Repository visible.');
          }
          await renderGitHubList(document.getElementById('githubSearch').value);
        } catch (err) {
          showToast('Failed to toggle repo.', true);
        }
      });
    });

    grid.querySelectorAll('.edit-github-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const override = overrides[String(id)] || {};
        
        document.getElementById('ghOverrideTitle').textContent = `Configure Overrides: ${name}`;
        document.getElementById('ghOverrideId').value = id;
        document.getElementById('ghLiveUrl').value = override.liveUrl || '';

        if (override.previewUrl) {
          document.getElementById('ghImgPreview').src = override.previewUrl;
          document.getElementById('ghImgPreviewWrap').style.display = 'block';
          document.getElementById('ghDropZone').style.display = 'none';
        } else {
          document.getElementById('ghImgPreviewWrap').style.display = 'none';
          document.getElementById('ghDropZone').style.display = 'block';
        }
        ghOverrideBlob = null;
        document.getElementById('githubOverrideOverlay').style.display = 'flex';
      });
    });

  } catch (err) {
    loading.style.display = 'none';
    showToast('Failed to load repositories.', true);
  }
}

// ─── EMAIL ALERTS CONFIGURATION ────────────────────────
async function loadEmailSettingsForm() {
  if (!fbReady()) return;
  try {
    const doc = await getDB().collection('settings').doc('email').get();
    const data = doc.exists ? doc.data() : { enabled: false, publicJSKey: '', serviceID: '', templateID: '', autoReplyEnabled: false, autoReplyTemplateID: '' };
    
    document.getElementById('emailEnabled').checked = !!data.enabled;
    document.getElementById('emailJSKey').value = data.publicJSKey || '';
    document.getElementById('emailJSService').value = data.serviceID || '';
    document.getElementById('emailJSTemplate').value = data.templateID || '';
    document.getElementById('emailAutoReplyEnabled').checked = !!data.autoReplyEnabled;
    document.getElementById('emailJSAutoReplyTemplate').value = data.autoReplyTemplateID || '';

    document.getElementById('emailJSFields').style.display = data.enabled ? 'block' : 'none';
    document.getElementById('testEmailBtn').style.display = data.enabled ? 'block' : 'none';
    document.getElementById('emailJSAutoReplyFields').style.display = (data.enabled && data.autoReplyEnabled) ? 'block' : 'none';
  } catch (err) {
    showToast('Failed to fetch mail details.', true);
  }
}

// ─── TRIGGERS AND FORM HANDLERS BINDINGS ───────────────
function initEventTriggers() {
  // Navigation sidebar switcher
  document.querySelectorAll('.snav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.goto);
    });
  });

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Forms Toggle Displays
  document.getElementById('openAddProjectBtn').addEventListener('click', () => {
    const f = document.getElementById('projectFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetProjectForm();
  });
  document.getElementById('cancelProjFormBtn').addEventListener('click', () => {
    document.getElementById('projectFormPanel').style.display = 'none';
    resetProjectForm();
  });

  document.getElementById('openAddServiceBtn').addEventListener('click', () => {
    const f = document.getElementById('serviceFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetServiceForm();
  });
  document.getElementById('cancelServFormBtn').addEventListener('click', () => {
    document.getElementById('serviceFormPanel').style.display = 'none';
    resetServiceForm();
  });

  document.getElementById('openAddPlanBtn').addEventListener('click', () => {
    const f = document.getElementById('planFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetPlanForm();
  });
  document.getElementById('cancelPlanFormBtn').addEventListener('click', () => {
    document.getElementById('planFormPanel').style.display = 'none';
    resetPlanForm();
  });

  document.getElementById('openAddTestBtn').addEventListener('click', () => {
    const f = document.getElementById('testimonialFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetTestimonialForm();
  });
  document.getElementById('cancelTestFormBtn').addEventListener('click', () => {
    document.getElementById('testimonialFormPanel').style.display = 'none';
    resetTestimonialForm();
  });

  document.getElementById('openAddBlogBtn').addEventListener('click', () => {
    const f = document.getElementById('blogFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetBlogForm();
  });
  document.getElementById('cancelBlogFormBtn').addEventListener('click', () => {
    document.getElementById('blogFormPanel').style.display = 'none';
    resetBlogForm();
  });

  // Image Upload Bindings
  setupImageDropZone('projCoverDropZone', 'projCoverFile', 'projCoverPreview', 'projCoverPreviewWrap', 'projCoverRemove', blob => {
    projectCoverBlob = blob;
  });
  setupImageDropZone('aboutPhotoDropZone', 'aboutPhotoFile', 'aboutPhotoPreview', 'aboutPhotoPreviewWrap', 'aboutPhotoRemove', blob => {
    aboutPhotoBlob = blob;
  });
  setupImageDropZone('blogImgDropZone', 'blogImgFile', 'blogImgPreview', 'blogImgPreviewWrap', 'blogImgRemove', blob => {
    blogImgBlob = blob;
  });
  setupImageDropZone('ghDropZone', 'ghImgFile', 'ghImgPreview', 'ghImgPreviewWrap', 'ghImgRemove', blob => {
    ghOverrideBlob = blob;
  });

  // Submit Operations
  document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
  document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
  document.getElementById('planForm').addEventListener('submit', handlePlanSubmit);
  document.getElementById('testimonialForm').addEventListener('submit', handleTestimonialSubmit);
  document.getElementById('aboutSettingsForm').addEventListener('submit', handleAboutSubmit);
  document.getElementById('blogForm').addEventListener('submit', handleBlogSubmit);
  document.getElementById('emailSettingsForm').addEventListener('submit', handleEmailSettingsSubmit);
  document.getElementById('githubOverrideForm').addEventListener('submit', handleGitHubOverrideSubmit);
  
  // Experience timeline row add
  document.getElementById('addExpRowBtn').addEventListener('click', () => createExperienceRow());

  // Toggle checks for inputs displays
  document.getElementById('emailEnabled').addEventListener('change', e => {
    document.getElementById('emailJSFields').style.display = e.target.checked ? 'block' : 'none';
    document.getElementById('testEmailBtn').style.display = e.target.checked ? 'block' : 'none';
  });
  document.getElementById('emailAutoReplyEnabled').addEventListener('change', e => {
    document.getElementById('emailJSAutoReplyFields').style.display = e.target.checked ? 'block' : 'none';
  });

  // Search filter key bindings
  document.getElementById('projectsSearch').addEventListener('input', e => renderProjectsList(e.target.value));
  document.getElementById('blogSearch').addEventListener('input', e => renderBlogsList(e.target.value));
  document.getElementById('messagesSearch').addEventListener('input', e => renderMessagesList(e.target.value));
  document.getElementById('githubSearch').addEventListener('input', e => renderGitHubList(e.target.value));

  // Database connection status confirmation (Read-Only)
  const fbStatusEl = document.getElementById('fbStatus');
  if (fbStatusEl) {
    fbStatusEl.addEventListener('click', () => {
      showToast('✓ Cloud Database (Firebase) is connected and active.');
    });
  }

  // Demo Data Manager Event Listeners
  document.getElementById('btnSeedBlogs').addEventListener('click', async () => {
    const btn = document.getElementById('btnSeedBlogs');
    btn.disabled = true;
    try {
      const count = await seedDemoBlogs();
      showToast(`✓ Seeded ${count} missing demo blogs.`);
      logActivity('Seed Demo Blogs', `Added ${count} items`);
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('Seeding blogs failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btnClearBlogs').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete ALL blog posts?')) return;
    const btn = document.getElementById('btnClearBlogs');
    btn.disabled = true;
    try {
      await clearDemoBlogs();
      showToast('✓ All blog posts cleared.');
      logActivity('Clear Blogs', 'Deleted all posts');
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('Clearing blogs failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btnSeedTestimonials').addEventListener('click', async () => {
    const btn = document.getElementById('btnSeedTestimonials');
    btn.disabled = true;
    try {
      const count = await seedDemoTestimonials();
      showToast(`✓ Seeded ${count} missing testimonials.`);
      logActivity('Seed Demo Testimonials', `Added ${count} items`);
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('Seeding testimonials failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btnClearTestimonials').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete ALL testimonials?')) return;
    const btn = document.getElementById('btnClearTestimonials');
    btn.disabled = true;
    try {
      await clearDemoTestimonials();
      showToast('✓ All testimonials cleared.');
      logActivity('Clear Testimonials', 'Deleted all reviews');
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('Clearing testimonials failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btnSeedProjects').addEventListener('click', async () => {
    const btn = document.getElementById('btnSeedProjects');
    btn.disabled = true;
    try {
      const count = await seedDemoProjects();
      showToast(`✓ Seeded ${count} missing projects.`);
      logActivity('Seed Demo Projects', `Added ${count} items`);
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('Seeding projects failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btnClearProjects').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete ALL projects?')) return;
    const btn = document.getElementById('btnClearProjects');
    btn.disabled = true;
    try {
      await clearDemoProjects();
      showToast('✓ All projects cleared.');
      logActivity('Clear Projects', 'Deleted all projects');
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('Clearing projects failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btnResetAllData').addEventListener('click', async () => {
    if (!confirm('WARNING: This will delete ALL existing projects, services, plans, testimonials, and blog posts and restore them to factory defaults. Proceed?')) return;
    const btn = document.getElementById('btnResetAllData');
    btn.disabled = true;
    btn.textContent = 'Resetting Database...';
    try {
      await resetAllDemoData();
      showToast('✓ System reset completed successfully!');
      logActivity('Reset Database', 'Restored all collections to factory defaults');
      await refreshDashboardData();
      updateDemoCounts();
      renderDemoEditorList();
    } catch (err) {
      showToast('System reset failed: ' + err.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Reset Entire Database to Demo';
    }
  });

  // Demo Data Editor tab switching
  document.querySelectorAll('.demo-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDemoTab = btn.dataset.tab;
      document.querySelectorAll('.demo-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDemoEditorList();
    });
  });
}

function setupImageDropZone(zoneId, fileId, previewId, wrapId, removeId, blobSetter) {
  const zone = document.getElementById(zoneId);
  const file = document.getElementById(fileId);
  const preview = document.getElementById(previewId);
  const wrap = document.getElementById(wrapId);
  const remove = document.getElementById(removeId);

  if (!zone) return;

  zone.addEventListener('click', () => file.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });
  file.addEventListener('change', () => { if (file.files[0]) processFile(file.files[0]); });

  remove.addEventListener('click', () => {
    blobSetter(null);
    wrap.style.display = 'none';
    zone.style.display = 'block';
    file.value = '';
  });

  function processFile(f) {
    if (f.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB.', true); return; }
    if (!f.type.startsWith('image/')) { showToast('File type not supported.', true); return; }
    resizeImageFile(f, 960, 540, (blob, url) => {
      blobSetter(blob);
      preview.src = url;
      wrap.style.display = 'block';
      zone.style.display = 'none';
    });
  }
}

// ─── FORM SUBMIT CONTROLLERS ───────────────────────────
async function handleProjectSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('projectId').value;
  const title = document.getElementById('projTitle').value.trim();
  const slug = document.getElementById('projSlug').value.trim();
  const category = document.getElementById('projCategory').value;
  const customLabel = document.getElementById('projCatLabel').value.trim();
  const shortDesc = document.getElementById('projDesc').value.trim();
  const longDesc = document.getElementById('projLongDesc').value.trim();
  const client = document.getElementById('projClient').value.trim();
  const dateStr = document.getElementById('projDate').value.trim();
  const liveUrl = document.getElementById('projUrl').value.trim();
  const repoUrl = document.getElementById('projRepo').value.trim();
  const techRaw = document.getElementById('projTech').value;
  const featured = document.getElementById('projFeatured').checked;
  const status = document.getElementById('projStatus').value;
  
  if (!title || !slug || !category || !shortDesc || !longDesc) {
    showToast('⚠ Please fill in all required fields.', true);
    return;
  }

  const saveBtn = document.getElementById('saveProjBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const defaultLabels = { dev: 'Development', design: 'Creative Design', data: 'Data Science' };
  const techArr = techRaw.split(',').map(t => t.trim()).filter(Boolean);

  try {
    let coverUrl = '';
    const docId = id || getDB().collection('projects').doc().id;

    if (projectCoverBlob) {
      coverUrl = await uploadFileToStorage(projectCoverBlob, 'projects', `cover_${docId}.jpg`);
    } else if (id) {
      const existing = cachedProjects.find(x => x.id === id);
      coverUrl = existing ? existing.coverImage : '';
    }

    const payload = {
      title, slug, category,
      categoryLabel: customLabel || defaultLabels[category] || category,
      description: shortDesc,
      longDescription: longDesc,
      client: client || null,
      completionDate: dateStr || null,
      projectUrl: liveUrl || null,
      repoUrl: repoUrl || null,
      technologies: techArr,
      featured,
      status,
      coverImage: coverUrl,
      galleryImages: [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!id) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      payload.order = cachedProjects.length;
      await getDB().collection('projects').doc(docId).set(payload);
      showToast('✓ Project created successfully!');
      logActivity('Create Project', title);
    } else {
      await getDB().collection('projects').doc(id).update(payload);
      showToast('✓ Project details updated!');
      logActivity('Edit Project', title);
    }

    resetProjectForm();
    document.getElementById('projectFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    console.error(err);
    showToast(`CMS Save failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Upload';
  }
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('serviceId').value;
  const name = document.getElementById('servName').value.trim();
  const icon = document.getElementById('servIcon').value.trim();
  const price = document.getElementById('servPrice').value.trim();
  const featuresRaw = document.getElementById('servFeatures').value;
  const description = document.getElementById('servDesc').value.trim();

  if (!name || !icon || !price || !featuresRaw || !description) {
    showToast('⚠ Please fill in all service fields.', true);
    return;
  }

  const saveBtn = document.getElementById('saveServBtn');
  saveBtn.disabled = true;
  
  const features = featuresRaw.split(',').map(f => f.trim()).filter(Boolean);

  try {
    const payload = {
      name, icon, price, features, description,
      order: cachedServices.length
    };

    if (!id) {
      await getDB().collection('services').add(payload);
      showToast('✓ Service added.');
      logActivity('Create Service', name);
    } else {
      await getDB().collection('services').doc(id).set(payload, { merge: true });
      showToast('✓ Service updated.');
      logActivity('Edit Service', name);
    }

    resetServiceForm();
    document.getElementById('serviceFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Service failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handlePlanSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('planId').value;
  const name = document.getElementById('planName').value.trim();
  const price = document.getElementById('planPrice').value.trim();
  const ctaText = document.getElementById('planCta').value.trim();
  const featuresRaw = document.getElementById('planFeatures').value;
  const popular = document.getElementById('planPopular').checked;

  if (!name || !price || !ctaText || !featuresRaw) {
    showToast('⚠ Missing plan fields.', true);
    return;
  }

  const saveBtn = document.getElementById('savePlanBtn');
  saveBtn.disabled = true;

  const features = featuresRaw.split(',').map(f => f.trim()).filter(Boolean);

  try {
    const payload = {
      name, price, ctaText, features, popular,
      order: cachedPlans.length
    };

    if (!id) {
      await getDB().collection('plans').add(payload);
      showToast('✓ Plan added.');
      logActivity('Create Plan', name);
    } else {
      await getDB().collection('plans').doc(id).set(payload, { merge: true });
      showToast('✓ Plan updated.');
      logActivity('Edit Plan', name);
    }

    resetPlanForm();
    document.getElementById('planFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Plan failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleTestimonialSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('testimonialId').value;
  const clientName = document.getElementById('testName').value.trim();
  const rating = parseInt(document.getElementById('testRating').value);
  const position = document.getElementById('testPos').value.trim();
  const company = document.getElementById('testComp').value.trim();
  const review = document.getElementById('testReview').value.trim();

  if (!clientName || isNaN(rating) || !position || !company || !review) {
    showToast('⚠ Please complete required fields.', true);
    return;
  }

  const saveBtn = document.getElementById('saveTestBtn');
  saveBtn.disabled = true;

  try {
    const docId = id || getDB().collection('testimonials').doc().id;

    const payload = {
      clientName, rating, position, company, review, profileImage: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!id) {
      await getDB().collection('testimonials').doc(docId).set(payload);
      showToast('✓ Feedback added.');
      logActivity('Create Testimonial', clientName);
    } else {
      await getDB().collection('testimonials').doc(id).update(payload);
      showToast('✓ Feedback updated.');
      logActivity('Edit Testimonial', clientName);
    }

    resetTestimonialForm();
    document.getElementById('testimonialFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Testimonial failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleAboutSubmit(e) {
  e.preventDefault();
  const bio = document.getElementById('aboutBio').value.trim();
  const skillsRaw = document.getElementById('aboutSkills').value;
  const certsRaw = document.getElementById('aboutCerts').value;
  const resumeUrl = document.getElementById('aboutResumeUrl').value.trim();

  if (!bio || !skillsRaw) {
    showToast('Biography and skills list are mandatory.', true);
    return;
  }

  const saveBtn = document.getElementById('saveAboutBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
  const certifications = certsRaw.split(',').map(c => c.trim()).filter(Boolean);

  // Extract experience timeline entries
  const experience = [];
  document.querySelectorAll('.exp-row-inputs').forEach(row => {
    const period = row.querySelector('.exp-period').value.trim();
    const company = row.querySelector('.exp-company').value.trim();
    const role = row.querySelector('.exp-role').value.trim();
    const description = row.querySelector('.exp-desc').value.trim();
    if (period && company && role) {
      experience.push({ period, company, role, description });
    }
  });

  try {
    let profileImage = '';
    
    // Check if new photo was uploaded
    if (aboutPhotoBlob) {
      profileImage = await uploadFileToStorage(aboutPhotoBlob, 'profile', 'profile.jpg');
    } else {
      const doc = await getDB().collection('settings').doc('about').get();
      profileImage = doc.exists ? doc.data().profileImage : '';
    }

    const payload = {
      bio, skills, certifications, experience, resumeUrl, profileImage,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await getDB().collection('settings').doc('about').set(payload, { merge: true });
    showToast('✓ Profile updated successfully!');
    logActivity('Edit About', 'Bio & experience profile modified');
  } catch (err) {
    showToast(`Profile failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save About Settings';
  }
}

async function handleBlogSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('blogId').value;
  const title = document.getElementById('blogTitle').value.trim();
  const slug = document.getElementById('blogSlug').value.trim();
  const author = document.getElementById('blogAuthor').value.trim();
  const tagsRaw = document.getElementById('blogTags').value;
  const status = document.getElementById('blogStatus').value;
  const dateInput = document.getElementById('blogDate').value;
  const content = document.getElementById('blogContent').value.trim();

  if (!title || !slug || !author || !content) {
    showToast('Please fill in required fields (*).', true);
    return;
  }

  const saveBtn = document.getElementById('saveBlogBtn');
  saveBtn.disabled = true;

  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const publishDate = dateInput ? new Date(dateInput) : new Date();

  try {
    let featuredImage = '';
    const docId = id || getDB().collection('blog').doc().id;

    if (blogImgBlob) {
      featuredImage = await uploadFileToStorage(blogImgBlob, 'blog', `cover_${docId}.jpg`);
    } else if (id) {
      const existing = cachedBlogs.find(x => x.id === id);
      featuredImage = existing ? existing.featuredImage : '';
    }

    const payload = {
      title, slug, author, tags, status, content, featuredImage,
      publishDate: firebase.firestore.Timestamp.fromDate(publishDate),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!id) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await getDB().collection('blog').doc(docId).set(payload);
      showToast('✓ Article published.');
      logActivity('Publish Blog', title);
    } else {
      await getDB().collection('blog').doc(id).update(payload);
      showToast('✓ Article updated.');
      logActivity('Edit Blog', title);
    }

    resetBlogForm();
    document.getElementById('blogFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Blog failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleEmailSettingsSubmit(e) {
  e.preventDefault();
  const enabled = document.getElementById('emailEnabled').checked;
  const publicJSKey = document.getElementById('emailJSKey').value.trim();
  const serviceID = document.getElementById('emailJSService').value.trim();
  const templateID = document.getElementById('emailJSTemplate').value.trim();
  const autoReplyEnabled = document.getElementById('emailAutoReplyEnabled').checked;
  const autoReplyTemplateID = document.getElementById('emailJSAutoReplyTemplate').value.trim();

  if (enabled && (!publicJSKey || !serviceID || !templateID)) {
    showToast('Missing EmailJS parameters.', true);
    return;
  }

  const saveBtn = document.getElementById('saveEmailSettingsBtn');
  saveBtn.disabled = true;

  try {
    const payload = { enabled, publicJSKey, serviceID, templateID, autoReplyEnabled, autoReplyTemplateID };
    await getDB().collection('settings').doc('email').set(payload);
    showToast('✓ Email alerts configurations saved.');
    logActivity('Edit SMTP', 'Email notifications modified');
  } catch (err) {
    showToast(`Email settings failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleGitHubOverrideSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('ghOverrideId').value;
  const liveUrl = document.getElementById('ghLiveUrl').value.trim();
  
  const saveBtn = document.getElementById('ghOverrideSave');
  saveBtn.disabled = true;

  try {
    let previewUrl = '';
    
    if (ghOverrideBlob) {
      previewUrl = await uploadFileToStorage(ghOverrideBlob, 'projects', `override_${id}.jpg`);
    } else {
      const snap = await getDB().collection('github_overrides').doc(String(id)).get();
      previewUrl = snap.exists ? snap.data().previewUrl : '';
    }

    await getDB().collection('github_overrides').doc(String(id)).set({
      liveUrl, previewUrl,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast('✓ GitHub overrides saved!');
    logActivity('Edit GitHub', `Overrode settings on Repo ID: ${id}`);
    document.getElementById('githubOverrideOverlay').style.display = 'none';
    await renderGitHubList(document.getElementById('githubSearch').value);
  } catch (err) {
    showToast(`Overrides failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

// ─── FORM RESET HELPERS ────────────────────────────────
function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  document.getElementById('projectFormTitle').textContent = 'Add New Project';
  document.getElementById('projCoverPreviewWrap').style.display = 'none';
  document.getElementById('projCoverDropZone').style.display = 'block';
  projectCoverBlob = null;
}

function resetServiceForm() {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('serviceFormTitle').textContent = 'Add New Service';
}

function resetPlanForm() {
  document.getElementById('planForm').reset();
  document.getElementById('planId').value = '';
  document.getElementById('planFormTitle').textContent = 'Add New Plan';
}

function resetTestimonialForm() {
  document.getElementById('testimonialForm').reset();
  document.getElementById('testimonialId').value = '';
  document.getElementById('testimonialFormTitle').textContent = 'Add New Recommendation';
}

function resetBlogForm() {
  document.getElementById('blogForm').reset();
  document.getElementById('blogId').value = '';
  document.getElementById('blogFormTitle').textContent = 'Add New Article';
  document.getElementById('blogImgPreviewWrap').style.display = 'none';
  document.getElementById('blogImgDropZone').style.display = 'block';
  blogImgBlob = null;
}

// ─── TOAST NOTIFICATION UTILITY ────────────────────────
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, isError = false) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.style.color = isError ? '#FF6B6B' : 'var(--gold)';
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
