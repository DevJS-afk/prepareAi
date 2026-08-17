import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Firebase credentials from firebase-applet-config.json
import firebaseConfig from '../../firebase-applet-config.json';

export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with settings and custom databaseId as third parameter
import { getFirestore } from "firebase/firestore";
export const db = firebaseConfig.firestoreDatabaseId ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId) : getFirestore(firebaseApp);

export const auth = getAuth(firebaseApp);

export interface FirebaseSession {
  user: {
    id: string;
    email: string | null;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
  };
}

// Fluent Query Builder to match Supabase syntax perfectly
class FirestoreQueryBuilder {
  private collectionName: string;
  private filters: { field: string; operator: any; value: any }[] = [];
  private orderField?: string;
  private orderDirection?: 'asc' | 'desc';
  private limitCount?: number;
  private countMode = false;
  private orFilterString?: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  select(_fields?: string, options?: { count?: string; head?: boolean }) {
    if (options?.count === 'exact') {
      this.countMode = true;
    }
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: '==', value });
    return this;
  }

  in(field: string, values: any[]) {
    if (values && values.length > 0) {
      this.filters.push({ field, operator: 'in', value: values });
    } else {
      this.filters.push({ field, operator: '==', value: '__NONE_MATCHING_VALUE__' });
    }
    return this;
  }

  or(val: string) {
    this.orFilterString = val;
    return this;
  }

  range(_from: number, _to: number) {
    return this;
  }

  order(field: string, options?: { ascending: boolean }) {
    this.orderField = field;
    this.orderDirection = options?.ascending ? 'asc' : 'desc';
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async maybeSingle(): Promise<{ data: any; error: any }> {
    try {
      const idFilter = this.filters.find(f => f.field === 'id');
      if (idFilter && idFilter.operator === '==') {
        const docRef = doc(db, this.collectionName, idFilter.value);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
        }
        return { data: null, error: null };
      }

      const res = await this.execute();
      if (res.error) return { data: null, error: res.error };
      return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async single(): Promise<{ data: any; error: any }> {
    try {
      const idFilter = this.filters.find(f => f.field === 'id');
      if (idFilter && idFilter.operator === '==') {
        const docRef = doc(db, this.collectionName, idFilter.value);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
        }
        return { data: null, error: { message: 'Document not found', code: 'PGRST116' } };
      }

      const res = await this.execute();
      if (res.error) return { data: null, error: res.error };
      if (!res.data || res.data.length === 0) {
        return { data: null, error: { message: 'Document not found', code: 'PGRST116' } };
      }
      return { data: res.data[0], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  private async execute() {
    try {
      const colRef = collection(db, this.collectionName);
      const queryConstraints: any[] = [];
      for (const filter of this.filters) {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      }
      if (this.orderField) {
        queryConstraints.push(orderBy(this.orderField, this.orderDirection || 'desc'));
      }
      if (this.limitCount) {
        queryConstraints.push(limit(this.limitCount));
      }
      const q = query(colRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      if (this.orFilterString) {
        const match = this.orFilterString.match(/%([^%]+)%/);
        if (match) {
          const searchTerm = match[1].toLowerCase();
          data = data.filter((item: any) => {
            const email = (item.email || '').toLowerCase();
            const fullName = (item.full_name || '').toLowerCase();
            return email.includes(searchTerm) || fullName.includes(searchTerm);
          });
        }
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    try {
      if (this.countMode) {
        const res = await this.execute();
        if (res.error) {
          return onrejected ? onrejected(res.error) : { count: null, data: null, error: res.error };
        }
        const result = { count: res.data ? res.data.length : 0, data: res.data, error: null };
        return onfulfilled ? onfulfilled(result) : result;
      }
      const res = await this.execute();
      return onfulfilled ? onfulfilled(res) : res;
    } catch (err: any) {
      return onrejected ? onrejected(err) : { data: null, error: err };
    }
  }

  insert(values: any): any {
    const singleValue = Array.isArray(values) ? values[0] : values;
    const colRef = collection(db, this.collectionName);
    const docId = singleValue.id || doc(colRef).id;
    const docRef = doc(db, this.collectionName, docId);
    const dataToSave = { ...singleValue, id: docId, created_at: singleValue.created_at || new Date().toISOString() };
    
    const promise = setDoc(docRef, dataToSave).then(() => ({ data: [dataToSave], error: null }));
    const chain = {
      select: () => promise,
      then: (onfulfilled?: any) => promise.then(onfulfilled)
    };
    return Object.assign(promise, chain);
  }

  upsert(values: any): any {
    const singleValue = Array.isArray(values) ? values[0] : values;
    const colRef = collection(db, this.collectionName);
    const docId = singleValue.id || doc(colRef).id;
    const docRef = doc(db, this.collectionName, docId);
    const dataToSave = { ...singleValue, id: docId, updated_at: new Date().toISOString() };
    
    const promise = setDoc(docRef, dataToSave, { merge: true }).then(() => ({ data: [dataToSave], error: null }));
    const chain = {
      select: () => promise,
      then: (onfulfilled?: any) => promise.then(onfulfilled)
    };
    return Object.assign(promise, chain);
  }

  update(values: any) {
    return {
      eq: async (field: string, value: any) => {
        try {
          if (field === 'id') {
            const docRef = doc(db, this.collectionName, value);
            await updateDoc(docRef, values);
            return { error: null };
          } else {
            const colRef = collection(db, this.collectionName);
            const q = query(colRef, where(field, '==', value));
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(docSnap => updateDoc(docSnap.ref, values));
            await Promise.all(promises);
            return { error: null };
          }
        } catch (err: any) {
          return { error: err };
        }
      }
    };
  }

  delete() {
    return {
      eq: async (field: string, value: any) => {
        try {
          if (field === 'id') {
            const docRef = doc(db, this.collectionName, value);
            await deleteDoc(docRef);
            return { error: null };
          } else {
            const colRef = collection(db, this.collectionName);
            const q = query(colRef, where(field, '==', value));
            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
            await Promise.all(promises);
            return { error: null };
          }
        } catch (err: any) {
          return { error: err };
        }
      }
    };
  }
}

