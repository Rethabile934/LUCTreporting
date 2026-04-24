import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBy-WB1Q-ECAVppX2ao1U0NHC8m3Aj68bs",
  authDomain: "luctreporting-5e1a4.firebaseapp.com",
  projectId: "luctreporting-5e1a4",
  storageBucket: "luctreporting-5e1a4.firebasestorage.app",
  messagingSenderId: "408703710343",
  appId: "1:408703710343:web:7334353a3102f39daf7422",
  measurementId: "G-K4C98CG6NG"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);