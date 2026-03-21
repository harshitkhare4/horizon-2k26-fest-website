import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDceTN3Q6OVNERuFPX9fL5sXrZvSBSA0To",
  authDomain: "horizon-2k26.firebaseapp.com",
  projectId: "horizon-2k26",
  storageBucket: "horizon-2k26.firebasestorage.app",
  messagingSenderId: "813004366646",
  appId: "1:813004366646:web:e0657a244872527e194997"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);