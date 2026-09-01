/* ════════════════════════════════════════════════════════════════
   JoshFolio — Supabase Configuration
   ────────────────────────────────────────────────────────────────
   Replaces firebase-config.js. Exposes the same window.joshFirebase
   interface so admin.js and script.js need near-zero changes.

   Compatibility shim: db.collection(name).get() / .doc(id).set() /
                       .add() / .delete() / .where() / .orderBy() / .limit()

   ┌─────────────────────────────────────────────────────────────┐
   │  SETUP — paste your values from:                           │
   │  Supabase Dashboard → Project Settings → API              │
   └─────────────────────────────────────────────────────────────┘
════════════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://iusgdwkjkjenddpsllsj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1c2dkd2tqa2plbmRkcHNsbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDE4NDcsImV4cCI6MjEwMzU3Nzg0N30.zP4NPWckuWcdnbItSDtt-l6CbGOI9QNkdWqHqPLxYQw';

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
    throw new Error('Invalid email or password.');
  }
  async signOut() {
    this.user = null;
    sessionStorage.removeItem('josh_mock_logged_in');
    this.callbacks.forEach(cb => cb(null));
  }
}
window.HardcodedAuth = HardcodedAuth;

/* ─────────────────────────────────────────────────────────────── */
/*  Firestore Shims — keep admin.js / script.js FieldValue calls  */
/* ─────────────────────────────────────────────────────────────── */
window.firebase = window.firebase || {};
window.firebase.firestore = window.firebase.firestore || {};
window.firebase.firestore.FieldValue = {
  serverTimestamp: () => new Date().toISOString()
};
window.firebase.firestore.Timestamp = {
  fromDate: (d) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString())
};

/* ─────────────────────────────────────────────────────────────── */
/*  Supabase Firestore-Compatible Shim                            */
/* ─────────────────────────────────────────────────────────────── */

/**
 * Normalises a Supabase row so timestamp strings are wrapped with a .toDate()
 * method — identical to Firestore Timestamp behaviour used in admin.js.
 */
function normaliseRow(row) {
  if (!row) return row;
  const timestampFields = ['createdAt', 'updatedAt', 'publishDate', 'sentAt', 'hiddenAt', 'timestamp'];
  const copy = { ...row };
  for (const field of timestampFields) {
    if (copy[field] && typeof copy[field] === 'string') {
      const d = new Date(copy[field]);
      copy[field] = {
        toDate: () => d,
        seconds: Math.floor(d.getTime() / 1000),
        nanoseconds: 0,
        toString: () => d.toString()
      };
    }
  }
  return copy;
}

function generateSbId(prefix = 'sb') {
  return prefix + '-' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/** Convert a Firestore-style doc snapshot to Supabase-friendly payload */
function cleanPayload(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (v === null) {
      out[k] = null;
      continue;
    }
    // FieldValue.serverTimestamp() produces an ISO string already
    if (typeof v === 'string' && v === '__MOCK_SERVER_TIMESTAMP__') {
      out[k] = new Date().toISOString();
    } else if (v && typeof v === 'object' && typeof v.toDate === 'function') {
      // Firestore Timestamp → ISO string
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === 'object' && v.date instanceof Date) {
      // MockTimestamp → ISO string
      out[k] = v.date.toISOString();
    } else {
      out[k] = v;
    }
  }
  return out;
}

class SupabaseDocRef {
  constructor(tableName, docId, supabase) {
    this.tableName = tableName;
    const finalId = (docId !== undefined && docId !== null && docId !== '' && String(docId) !== 'undefined')
      ? String(docId)
      : generateSbId(tableName ? tableName.substring(0, 4) : 'sb');
    this.docId = finalId;
    this._sb = supabase;
    this.id = finalId;
  }

  async get() {
    const { data, error } = await this._sb
      .from(this.tableName)
      .select('*')
      .eq('id', this.docId)
      .maybeSingle();
    if (error) throw error;
    return {
      exists: !!data,
      id: this.docId,
      data: () => data ? normaliseRow(data) : null
    };
  }

  async set(payload, options = {}) {
    const clean = cleanPayload(payload);
    let row = { ...clean, id: this.docId };
    let { error } = await this._sb
      .from(this.tableName)
      .upsert(row, { onConflict: 'id' });
    if (error && error.message && (error.message.includes('does not exist') || error.message.includes('Could not find') || error.code === 'PGRST204')) {
      const match = error.message.match(/column "?([^"'\s]+)"? /i) || error.message.match(/'([^']+)' column/i);
      if (match && match[1] && match[1] in row) {
        console.warn(`[JoshFolio DB] Column '${match[1]}' missing in '${this.tableName}'. Retrying without it.`);
        delete row[match[1]];
        const retry = await this._sb.from(this.tableName).upsert(row, { onConflict: 'id' });
        error = retry.error;
      }
    }
    if (error) throw error;
    return true;
  }

  async update(payload) {
    const clean = cleanPayload(payload);
    let { data, error } = await this._sb
      .from(this.tableName)
      .update(clean)
      .eq('id', this.docId)
      .select('id');
    if (error && error.message && (error.message.includes('does not exist') || error.message.includes('Could not find') || error.code === 'PGRST204')) {
      const match = error.message.match(/column "?([^"'\s]+)"? /i) || error.message.match(/'([^']+)' column/i);
      if (match && match[1] && match[1] in clean) {
        console.warn(`[JoshFolio DB] Column '${match[1]}' missing in '${this.tableName}'. Retrying without it.`);
        delete clean[match[1]];
        const retry = await this._sb.from(this.tableName).update(clean).eq('id', this.docId).select('id');
        data = retry.data;
        error = retry.error;
      }
    }
    if (error) throw error;
    if (!data || data.length === 0) {
      // Row didn't exist in Supabase yet; upsert to prevent data loss
      const row = { ...clean, id: this.docId };
      const { error: upsertErr } = await this._sb
        .from(this.tableName)
        .upsert(row, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;
    }
    return true;
  }

  async delete() {
    const { error } = await this._sb
      .from(this.tableName)
      .delete()
      .eq('id', this.docId);
    if (error) throw error;
    return true;
  }
}

class SupabaseQuery {
  constructor(tableName, supabase) {
    this.tableName = tableName;
    this._sb = supabase;
    this._filters = [];       // [{ field, op, value }]
    this._orderField = null;
    this._orderDir = 'asc';
    this._limitN = null;
  }

  where(field, op, value) {
    this._filters.push({ field, op, value });
    return this;
  }

  orderBy(field, direction = 'asc') {
    this._orderField = field;
    this._orderDir = direction;
    return this;
  }

  limit(n) {
    this._limitN = n;
    return this;
  }

  doc(id) {
    const finalId = (id !== undefined && id !== null && id !== '' && String(id) !== 'undefined')
      ? String(id)
      : generateSbId(this.tableName ? this.tableName.substring(0, 4) : 'sb');
    return new SupabaseDocRef(this.tableName, finalId, this._sb);
  }

  async add(payload) {
    const clean = cleanPayload(payload);
    if (!clean.id) {
      clean.id = generateSbId(this.tableName ? this.tableName.substring(0, 4) : 'sb');
    }
    let { data, error } = await this._sb
      .from(this.tableName)
      .insert(clean)
      .select('id')
      .single();
    if (error && error.message && (error.message.includes('does not exist') || error.message.includes('Could not find') || error.code === 'PGRST204')) {
      const match = error.message.match(/column "?([^"'\s]+)"? /i) || error.message.match(/'([^']+)' column/i);
      if (match && match[1] && match[1] in clean) {
        console.warn(`[JoshFolio DB] Column '${match[1]}' missing in '${this.tableName}'. Retrying without it.`);
        delete clean[match[1]];
        const retry = await this._sb.from(this.tableName).insert(clean).select('id').single();
        data = retry.data;
        error = retry.error;
      }
    }
    if (error) throw error;
    return { id: data ? data.id : clean.id };
  }

  async get() {
    let query = this._sb.from(this.tableName).select('*');

    // Apply filters
    for (const { field, op, value } of this._filters) {
      if (op === '==') query = query.eq(field, value);
      else if (op === '!=') query = query.neq(field, value);
      else if (op === '<')  query = query.lt(field, value);
      else if (op === '<=') query = query.lte(field, value);
      else if (op === '>')  query = query.gt(field, value);
      else if (op === '>=') query = query.gte(field, value);
      else if (op === 'array-contains') query = query.contains(field, [value]);
    }

    if (this._orderField) {
      query = query.order(this._orderField, { ascending: this._orderDir === 'asc' });
    }

    if (this._limitN) {
      query = query.limit(this._limitN);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const docs = rows.map(row => ({
      id: row.id,
      data: () => normaliseRow(row)
    }));

    return {
      empty: docs.length === 0,
      docs,
      forEach: (callback) => docs.forEach(callback)
    };
  }
}

/**
 * Special handling for the `settings` table which uses a key-value pattern
 * (id = 'about' | 'socials' | 'email') and is queried as a doc, not a list.
 */
class SupabaseSettingsRef {
  constructor(docId, supabase) {
    this.docId = docId;
    this.id = docId;
    this._sb = supabase;
  }

  async get() {
    const { data, error } = await this._sb
      .from('settings')
      .select('*')
      .eq('id', this.docId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { exists: false, id: this.docId, data: () => null };
    const payload = data.value ? data.value : { ...data };
    return { exists: true, id: this.docId, data: () => normaliseRow(payload) };
  }

  async set(payload, options = {}) {
    const clean = cleanPayload(payload);
    const row = { id: this.docId, value: clean, ...clean };
    const { error } = await this._sb
      .from('settings')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }

  async update(payload) {
    const clean = cleanPayload(payload);
    const row = { id: this.docId, value: clean, ...clean };
    const { error } = await this._sb
      .from('settings')
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return true;
  }
}

class SupabaseSettingsCollection {
  constructor(supabase) {
    this._sb = supabase;
  }

  doc(id) {
    return new SupabaseSettingsRef(id, this._sb);
  }

  async get() {
    const { data, error } = await this._sb.from('settings').select('*');
    if (error) throw error;
    const rows = data || [];
    const docs = rows.map(row => ({
      id: row.id,
      data: () => normaliseRow(row.value ? row.value : row)
    }));
    return {
      empty: docs.length === 0,
      docs,
      forEach: (cb) => docs.forEach(cb)
    };
  }
}

class SupabaseFirestoreShim {
  constructor(supabase) {
    this._sb = supabase;
  }

  collection(name) {
    if (name === 'settings') {
      return new SupabaseSettingsCollection(this._sb);
    }
    const q = new SupabaseQuery(name, this._sb);
    return q;
  }
}

/* ─────────────────────────────────────────────────────────────── */
/*  Supabase Storage Shim                                          */
/* ─────────────────────────────────────────────────────────────── */
class SupabaseStorageShim {
  constructor(supabase) {
    this._sb = supabase;
    this._bucket = 'portfolio-media';
    this._path = '';
  }

  ref(subpath = '') {
    const shim = new SupabaseStorageShim(this._sb);
    shim._path = subpath || '';
    return shim;
  }

  child(subpath) {
    const shim = new SupabaseStorageShim(this._sb);
    shim._sb = this._sb;
    shim._bucket = this._bucket;
    shim._path = this._path ? `${this._path}/${subpath}` : subpath;
    return shim;
  }

  async put(blob) {
    const path = this._path;
    const contentType = (blob && blob.type) ? blob.type : 'image/jpeg';
    const { error } = await this._sb.storage
      .from(this._bucket)
      .upload(path, blob, { contentType, upsert: true });
    if (error) throw error;
    const ref = new SupabaseStorageShim(this._sb);
    ref._bucket = this._bucket;
    ref._path = path;
    return { ref };
  }

  async getDownloadURL() {
    const { data } = this._sb.storage
      .from(this._bucket)
      .getPublicUrl(this._path);
    return data.publicUrl;
  }
}

/* ─────────────────────────────────────────────────────────────── */
/*  Seed helper — seeds default settings rows if missing          */
/* ─────────────────────────────────────────────────────────────── */
async function seedSettingsIfEmpty(db) {
  const defaults = {
    about: {
      bio: "I'm a Lagos-based creative technologist who started with CorelDraw and ended up writing code, wrangling data, and automating workflows with AI.\nMy journey began in 2018 as a self-taught graphic designer, driven by curiosity and a hunger to turn ideas into visual experiences. By 2020 I was taking on real client work — brand identities, print media, flyers — out of local studios across Lagos.\nIn 2023 I made the leap into front-end development and it clicked immediately. My design background meant I wasn't just writing functional code — I was building things that feel good. Today I bridge three worlds: interactive UI engineering, brand design, and data analytics — all under one creative roof.\nCurrently pursuing a BSc in Statistics at Olabisi Onabanjo University, deepening my analytical edge with SPSS, R, and predictive modelling to complement my engineering and design toolkit.",
      skills: ["Next.js", "TypeScript", "TailwindCSS", "REST APIs", "Node.js", "Supabase", "SCSS"],
      certifications: [],
      experience: [
        { period: "2024 - Present", company: "GuruLabs", role: "Frontend Developer", description: "Details of job role..." }
      ],
      resumeUrl: "docs/IDOWU JOSHUA VICTOR RESUME.pdf",
      profileImage: "josh.png"
    },
    socials: {
      github: "https://github.com/JOSHMECH",
      linkedin: "https://linkedin.com",
      twitter: "https://x.com",
      behance: "https://behance.net",
      instagram: "https://instagram.com",
      email: "joshmech851@gmail.com",
      phone: "+234 816 1523 407"
    },
    email: {
      enabled: false,
      publicJSKey: "",
      serviceID: "",
      templateID: "",
      autoReplyEnabled: false,
      autoReplyTemplateID: ""
    },
    certifications_store: {
      items: [
        {
          title: "Meta Front-End Developer Professional Certificate",
          issuer: "Meta",
          issueDate: "2024",
          credentialUrl: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
          skills: ["React.js", "JavaScript (ES6+)", "UI/UX Architecture", "HTML5 & CSS3"],
          imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Google Data Analytics Professional Certificate",
          issuer: "Google",
          issueDate: "2024",
          credentialUrl: "https://www.coursera.org/professional-certificates/google-data-analytics",
          skills: ["R Programming", "SQL", "Statistical Modeling", "Tableau & Spreadsheets"],
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
        },
        {
          title: "Responsive Web Design & Algorithms",
          issuer: "freeCodeCamp",
          issueDate: "2023",
          credentialUrl: "https://www.freecodecamp.org/certification/fcc-responsive-web-design",
          skills: ["CSS Flexbox & Grid", "Accessibility", "Design Systems", "Web Performance"],
          imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"
        }
      ]
    }
  };

  for (const [key, data] of Object.entries(defaults)) {
    const ref = db.collection('settings').doc(key);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set(data);
      console.log(`[JoshFolio Seed] settings/${key} seeded ✓`);
    }
  }
}

/* ─────────────────────────────────────────────────────────────── */
/*  Initialise                                                     */
/* ─────────────────────────────────────────────────────────────── */
(function init() {
  const isPlaceholder = SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON === 'YOUR_SUPABASE_ANON_KEY';
  const auth = new HardcodedAuth();

  if (isPlaceholder) {
    console.warn(
      '%c[JoshFolio] Supabase not configured — running in Local Sandbox mode.',
      'color:#FBBF24; font-weight:bold;'
    );
    window.joshFirebase = { db: null, auth, storage: null, firebaseReady: false, isMock: true };
    return;
  }

  try {
    const { createClient } = window.supabase || {};
    if (!createClient) {
      console.warn('[JoshFolio] Supabase SDK not loaded on window. Falling back to local sandbox.');
      window.joshFirebase = { db: null, auth, storage: null, firebaseReady: false, isMock: true };
      return;
    }
    const client = createClient(SUPABASE_URL, SUPABASE_ANON);

    const db      = new SupabaseFirestoreShim(client);
    const storage = new SupabaseStorageShim(client);

    window.joshFirebase = {
      db,
      auth,
      storage,
      firebaseReady: true,
      isMock: false
    };

    console.log(
      '%c[JoshFolio] Supabase connected ✓',
      'color:#C8A96E; font-weight:bold;'
    );

    // Seed default settings rows on first run
    seedSettingsIfEmpty(db).catch(err =>
      console.warn('[JoshFolio Seed] Settings seed error:', err)
    );

  } catch (err) {
    console.error('[JoshFolio] Supabase init error:', err);
    window.joshFirebase = { db: null, auth, storage: null, firebaseReady: false, isMock: true };
  }
})();
