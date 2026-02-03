import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY-yTAOfh2HHlQHEXb_hBaykVmsXE2AeE",
  authDomain: "trusty-pixel-379821.firebaseapp.com",
  projectId: "trusty-pixel-379821",
  storageBucket: "trusty-pixel-379821.firebasestorage.app",
  messagingSenderId: "683993869050",
  appId: "1:683993869050:web:53f859360fbaef753af743"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
