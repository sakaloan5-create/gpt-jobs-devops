/**
 * Minimal in-memory Firestore mock for local dev without emulator or credentials.
 */
class MockDocSnapshot {
  constructor(id, data) {
    this.id = id;
    this.exists = !!data;
    this._data = data || null;
  }
  data() {
    return this._data;
  }
}

class MockQuerySnapshot {
  constructor(docs) {
    this.empty = docs.length === 0;
    this.size = docs.length;
    this.docs = docs.map((d) => new MockDocSnapshot(d.id, d.data));
  }
}

class MockQuery {
  constructor(collectionRef) {
    this.collectionRef = collectionRef;
    this.filters = [];
    this.order = null;
    this.limitCount = null;
  }
  where(field, op, value) {
    this.filters.push({ field, op, value });
    return this;
  }
  orderBy(field, dir = 'asc') {
    this.order = { field, dir };
    return this;
  }
  limit(n) {
    this.limitCount = n;
    return this;
  }
  get() {
    let docs = this.collectionRef._docs.slice();
    for (const f of this.filters) {
      docs = docs.filter((d) => {
        const val = d.data[f.field];
        if (f.op === '==' || f.op === '===') return val === f.value;
        return true;
      });
    }
    if (this.order) {
      docs.sort((a, b) => {
        const av = a.data[this.order.field];
        const bv = b.data[this.order.field];
        if (av < bv) return this.order.dir === 'desc' ? 1 : -1;
        if (av > bv) return this.order.dir === 'desc' ? -1 : 1;
        return 0;
      });
    }
    if (this.limitCount) {
      docs = docs.slice(0, this.limitCount);
    }
    return Promise.resolve(new MockQuerySnapshot(docs));
  }
}

class MockDocRef {
  constructor(db, path) {
    this.db = db;
    this.path = path;
    const parts = path.split('/');
    this.collectionName = parts[0];
    this.docId = parts[1] || parts[0];
  }
  get() {
    const col = this.db._collections[this.collectionName] || { _docs: [] };
    const found = col._docs.find((d) => d.id === this.docId);
    return Promise.resolve(new MockDocSnapshot(this.docId, found ? found.data : null));
  }
  set(data) {
    if (!this.db._collections[this.collectionName]) {
      this.db._collections[this.collectionName] = { _docs: [] };
    }
    const col = this.db._collections[this.collectionName];
    const idx = col._docs.findIndex((d) => d.id === this.docId);
    if (data === null || data === undefined) {
      if (idx >= 0) col._docs.splice(idx, 1);
      return Promise.resolve();
    }
    if (idx >= 0) {
      col._docs[idx].data = { ...col._docs[idx].data, ...data };
    } else {
      col._docs.push({ id: this.docId, data });
    }
    return Promise.resolve();
  }
  delete() {
    if (!this.db._collections[this.collectionName]) return Promise.resolve();
    const col = this.db._collections[this.collectionName];
    const idx = col._docs.findIndex((d) => d.id === this.docId);
    if (idx >= 0) col._docs.splice(idx, 1);
    return Promise.resolve();
  }
  update(data) {
    return this.set(data);
  }
}

class MockCollectionRef {
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this._docs = [];
  }
  doc(id) {
    const docId = id || `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return new MockDocRef(this.db, `${this.name}/${docId}`);
  }
  add(data) {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this._docs.push({ id, data });
    return Promise.resolve({ id });
  }
  where(field, op, value) {
    return new MockQuery(this);
  }
  orderBy(field, dir) {
    return new MockQuery(this).orderBy(field, dir);
  }
  limit(n) {
    return new MockQuery(this).limit(n);
  }
  get() {
    return new MockQuery(this).get();
  }
  get size() {
    return this._docs.length;
  }
}

class MockBatch {
  constructor(db) {
    this.db = db;
    this.ops = [];
  }
  set(ref, data) {
    this.ops.push({ type: 'set', ref, data });
    return this;
  }
  delete(ref) {
    this.ops.push({ type: 'delete', ref });
    return this;
  }
  commit() {
    for (const op of this.ops) {
      if (op.type === 'set') {
        op.ref.set(op.data);
      } else if (op.type === 'delete') {
        if (typeof op.ref.delete === 'function') {
          op.ref.delete();
        } else if (typeof op.ref.set === 'function') {
          op.ref.set(null);
        }
      }
    }
    this.ops = [];
    return Promise.resolve();
  }
}

class MockFirestore {
  constructor() {
    this._collections = {};
  }
  collection(name) {
    if (!this._collections[name]) {
      this._collections[name] = new MockCollectionRef(this, name);
    }
    return this._collections[name];
  }
  doc(path) {
    return new MockDocRef(this, path);
  }
  batch() {
    return new MockBatch(this);
  }
}

module.exports = { MockFirestore };
