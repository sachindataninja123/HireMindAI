import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-be5f2.firebaseapp.com",
  projectId: "interviewiq-be5f2",
  storageBucket: "interviewiq-be5f2.firebasestorage.app",
  messagingSenderId: "523806753256",
  appId: "1:523806753256:web:160d4d4c447276d106245d",
  measurementId: "G-N4SB13WM2G",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };
