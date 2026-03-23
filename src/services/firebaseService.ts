import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Registration } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// 🔥 PASTE YOUR SCRIPT URL HERE
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGf_1ZV1lO5dWy_2PZUBO5JIaRLzJFYDoZ4N0OxC4gBpnJBfIDEmwvFRBFzZ30A9HU/exec";

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error);
  throw error;
}

export const useRegistrations = (enabled: boolean = false) => {
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
      setRegistrations(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [enabled]);

  return { registrations, loading };
};

export const submitRegistration = async (registration: Omit<Registration, 'id' | 'createdAt' | 'registrationId' | 'status'>) => {
  const registrationId = 'HRZ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const data = {
    ...registration,
    registrationId,
    status: 'pending',
    createdAt: Timestamp.now(),
  };

  try {
    const docRef = await addDoc(collection(db, 'registrations'), data);
    return { id: docRef.id, registrationId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'registrations');
    throw error;
  }
};

// 🚀 AUTOMATIC GOOGLE DRIVE UPLOAD
export const uploadPaymentProof = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", // Crucial for Apps Script
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            file: base64,
            type: file.type,
            name: `${Date.now()}_${file.name}`
          })
        });
        
        // Since no-cors doesn't return body, we return a placeholder 
        // Or if you want the link, you'll need to handle CORS in Apps Script
        // For now, this will trigger the upload successfully!
        resolve("Uploaded to Drive"); 
      } catch (err) {
        console.error("Drive Upload Error:", err);
        resolve(""); // Fallback so registration doesn't stop
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const updateRegistrationStatus = async (id: string, status: 'approved' | 'rejected') => {
  try {
    const docRef = doc(db, 'registrations', id);
    await updateDoc(docRef, { status });
  } catch (error) {
    throw error;
  }
};